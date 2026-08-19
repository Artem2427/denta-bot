import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uk', 'ru', 'en'],
  defaultLocale: 'uk',
  localePrefix: 'as-needed',
  // Without this, next-intl auto-redirects "/" to the visitor's detected
  // locale (browser Accept-Language, or a previously-set NEXT_LOCALE
  // cookie) whenever it isn't the default — e.g. a Russian-language
  // browser landing on "/" got silently redirected to "/ru". D-08 wants
  // uk to be the stable default landing experience; visitors choose a
  // different locale explicitly via the LocaleSwitcher, not automatically.
  localeDetection: false,
});
