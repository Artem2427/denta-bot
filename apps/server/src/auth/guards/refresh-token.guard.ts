import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Always applied explicitly per-route (unlike AccessTokenGuard, which Task 2
// registers globally) — RefreshTokenGuard has no @Public()-style opt-out
// logic because it is never the default guard for arbitrary routes.
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
