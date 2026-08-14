import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface RefreshTokenPayload {
  sub: string;
  familyId: string;
  jti: string;
}

export interface RefreshTokenValidatedRequest extends RefreshTokenPayload {
  rawToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      // Cookie-only extraction — the refresh token MUST never be read from
      // the request body or a query string (D-06 / RESEARCH.md Pattern 2).
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies?.['refresh_token'] as string) ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: RefreshTokenPayload,
  ): RefreshTokenValidatedRequest {
    return { ...payload, rawToken: req.cookies['refresh_token'] as string };
  }
}
