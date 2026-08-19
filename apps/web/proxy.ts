import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
  // Standard next-intl exclusions only (api/_next/_vercel/files-with-dots).
  // Every real route — including blog and the retired prices/demo/contacts
  // redirect stubs — now lives inside the [locale] segment (260819-oyk), so
  // no per-route exclusions are needed: next-intl's locale-detection and
  // redirect logic must run on every route to resolve its [locale] param.
  matcher: ['/((?!api/|_next/|_vercel/|.*\\..*).*)'],
};
