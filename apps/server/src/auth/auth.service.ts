import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

interface IssuedTokenPair {
  accessToken: string;
  refreshToken: string;
  familyId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Shared building block reused by Plan 04-02's refresh() with the SAME familyId.
  private async issueTokenPair(
    platformAdminId: string,
    familyId: string = crypto.randomUUID(),
  ): Promise<IssuedTokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: platformAdminId },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );

    const jti = crypto.randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: platformAdminId, familyId, jti },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        tokenHash,
        familyId,
        platformAdminId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, familyId };
  }

  async login(email: string, password: string) {
    const admin = await this.prisma.platformAdmin.findUnique({
      where: { email },
    });

    // Identical error for "not found" and "wrong password" — no user enumeration.
    const invalidCredentials = () =>
      new UnauthorizedException('Invalid credentials');

    if (!admin) {
      throw invalidCredentials();
    }

    const passwordValid = await argon2.verify(admin.passwordHash, password);
    if (!passwordValid) {
      throw invalidCredentials();
    }

    const { accessToken, refreshToken } = await this.issueTokenPair(admin.id);

    return {
      accessToken,
      refreshToken,
      platformAdmin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    };
  }

  // Rotation with reuse detection (AUTH-02, RESEARCH.md Pattern 3, hardened).
  //
  // The rotation claim is a SINGLE atomic `updateMany` conditioned on
  // `revokedAt: null` (and a tokenHash match) rather than a `findUnique`
  // followed by a separate `update` — this closes the TOCTOU race two
  // concurrent requests presenting the same refresh token would otherwise
  // hit (T-04-02-02). Whatever fails to win the atomic claim — because the
  // row is missing, already revoked, the hash doesn't match, OR a concurrent
  // request already won — is treated identically as reuse/tampering and
  // revokes the entire token family. This exception is never caught/swallowed
  // anywhere in this call chain (reuse-suppression prohibition).
  async refresh(
    payload: { sub: string; familyId: string; jti: string },
    rawToken: string,
  ): Promise<IssuedTokenPair> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const claimed = await this.prisma.refreshToken.updateMany({
      where: { id: payload.jti, revokedAt: null, tokenHash },
      data: { revokedAt: new Date() },
    });

    if (claimed.count !== 1) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: payload.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    return this.issueTokenPair(payload.sub, payload.familyId);
  }
}
