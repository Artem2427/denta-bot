import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, platformAdmin } =
      await this.authService.login(body.email, body.password);

    this.setRefreshCookie(res, refreshToken);

    return { accessToken, platformAdmin };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
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
}
