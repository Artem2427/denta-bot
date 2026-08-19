import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
  // Standard next-intl exclusions (api/_next/_vercel/files-with-dots) plus
  // /blog (D-09) — blog stays permanently outside the locale system, so
  // next-intl's locale-detection/redirect logic must never touch it.
  matcher: ['/((?!api|_next|_vercel|blog|.*\\..*).*)'],
};
