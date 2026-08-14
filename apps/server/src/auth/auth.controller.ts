import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import type { AccessTokenPayload } from './strategies/access-token.strategy';
import type { RefreshTokenValidatedRequest } from './strategies/refresh-token.strategy';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.REFRESH_COOKIE_SAMESITE ?? 'strict') as
        | 'strict'
        | 'lax'
        | 'none',
      domain: process.env.REFRESH_COOKIE_DOMAIN || undefined,
      path: '/auth',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.REFRESH_COOKIE_SAMESITE ?? 'strict') as
        | 'strict'
        | 'lax'
        | 'none',
      domain: process.env.REFRESH_COOKIE_DOMAIN || undefined,
      path: '/auth',
    });
  }

  // Authenticates via credentials, not an access token — must opt out of
  // the global AccessTokenGuard (AUTH-04) or every login attempt would 401.
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, platformAdmin } =
      await this.authService.login(body.email, body.password);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken, platformAdmin };
  }

  // Authenticates via the refresh cookie (RefreshTokenGuard), not an access
  // token — must opt out of the global AccessTokenGuard the same way login does.
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const user = req.user as unknown as RefreshTokenValidatedRequest;

    const { accessToken, refreshToken } = await this.authService.refresh(
      { sub: user.sub, familyId: user.familyId, jti: user.jti },
      user.rawToken,
    );

    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  // Authenticates via the caller's own refresh cookie (RefreshTokenGuard) —
  // @Public() opts out of the global access-token guard the same way
  // /refresh does, since logout doesn't require an access token at all.
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const user = req.user as unknown as RefreshTokenValidatedRequest;

    await this.authService.logout({ jti: user.jti });

    this.clearRefreshCookie(res);
  }

  // No @Public() — protected by the global AccessTokenGuard by default
  // (AUTH-04). Returns a minimal DTO-shaped object, never a raw Prisma model.
  @Get('me')
  @ApiBearerAuth('access-token')
  me(@CurrentUser() user: AccessTokenPayload): { id: string; email?: string } {
    return { id: user.sub, email: user.email };
  }
}
