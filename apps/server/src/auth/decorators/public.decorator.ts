import { SetMetadata } from '@nestjs/common';

// Route-level opt-out from the global AccessTokenGuard (fail-closed by
// default — see access-token.guard.ts). Any route without @Public() is
// implicitly protected, including future routes that forget to add a guard.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
