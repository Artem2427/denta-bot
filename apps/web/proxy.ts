import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
  // Standard next-intl exclusions (api/_next/_vercel/files-with-dots) plus
  // /blog (D-09) — blog stays permanently outside the locale system, so
  // next-intl's locale-detection/redirect logic must never touch it. Also
  // excludes /prices, /demo, /contacts (06.2-07 Task 2) — these retired
  // routes are thin redirect stubs living outside the [locale] segment,
  // same tree position as /blog; without this exclusion the locale
  // middleware rewrites them to a nonexistent /uk/prices etc. and they
  // 404 instead of redirecting to their landing-page anchors.
  matcher: [
    '/((?!api|_next|_vercel|blog|prices|demo|contacts|.*\\..*).*)',
  ],
};
