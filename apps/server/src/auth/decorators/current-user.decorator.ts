import {
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

// Reads req.user, populated by whichever passport strategy guarded the
// current route (AccessTokenGuard -> AccessTokenPayload, RefreshTokenGuard
// -> RefreshTokenValidatedRequest).
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user;
  },
);
