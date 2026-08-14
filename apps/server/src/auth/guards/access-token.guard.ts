import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Registered globally via APP_GUARD (see auth.module.ts) — this is the
// mechanism that makes every route fail-closed by default. A route only
// skips authentication if it explicitly carries @Public(); a forgotten
// guard on a future route stays protected with zero extra code (T-04-02-05).
@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
