'use client';

import { usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/shared/lib/cn';
import { CaretDown, Check } from '@phosphor-icons/react/ssr';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { DropdownMenu } from 'radix-ui';

// usePathname() from @/i18n/navigation returns the locale-agnostic
// pathname with dynamic segments already resolved to their concrete
// value (e.g. /blog/my-post-slug), not the route template — this is
// what preserves the CURRENT page across a locale switch.
//
// The href is built manually (plain next/link, routing.defaultLocale
// check) rather than via next-intl's own <Link locale={...}> helper:
// that helper prefixes EVERY explicit-locale target, including the
// default locale, regardless of routing.ts's `localePrefix: 'as-needed'`
// — 'as-needed' only omits the prefix for implicit/auto-detected
// navigation, not when a locale is passed explicitly. Confirmed via a
// live curl check: the uk option rendered href="/uk/blog" instead of
// the required unprefixed "/blog" (D-08).
function localeHref(locale: string, pathname: string): string {
  return locale === routing.defaultLocale ? pathname : `/${locale}${pathname}`;
}
const locales = [
  { code: 'uk', flag: '\u{1F1FA}\u{1F1E6}', label: 'Українська', short: 'UA' },
  { code: 'ru', flag: '\u{1F1F7}\u{1F1FA}', label: 'Русский', short: 'RU' },
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'English', short: 'EN' },
] as const;

export function LocaleSwitcher(): React.JSX.Element {
  // useLocale() works everywhere including redirect stubs, resolving to
  // the active [locale] route segment.
  const activeLocale = useLocale();
  const pathname = usePathname();
  const active =
    locales.find((locale) => locale.code === activeLocale) ?? locales[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Обрати мову"
          className="flex items-center gap-1.5 rounded-dt-input px-2 py-1 text-sm font-medium text-dt-graphite transition-colors hover:text-dt-teal data-[state=open]:text-dt-teal"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {active.flag}
          </span>
          <span className="text-dt-navy font-semibold">{active.short}</span>
          <CaretDown weight="bold" className="h-3 w-3" />
        </button>
      </DropdownMenu.Trigger>
      {/* Deliberately no DropdownMenu.Portal wrapper: Radix's Portal only
          renders once mounted client-side (there is no `document` during
          SSR), which would strip every locale option's Link out of the
          server-rendered HTML entirely. Rendering Content inline instead
          (a fully supported Radix usage — Portal is optional) combined
          with forceMount keeps each option's real <a href> in the initial
          markup — crawlable, and functional even before JS hydrates —
          while data-[state=closed]:hidden keeps it visually collapsed
          until DropdownMenu.Trigger opens it. */}
      <DropdownMenu.Content
        forceMount
        align="end"
        sideOffset={8}
        className="z-50 min-w-[180px] rounded-dt-card border border-[var(--dt-border)] bg-dt-warm-white p-1 shadow-[var(--shadow-dt-hover)] data-[state=closed]:hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      >
        {locales.map((locale) => (
          <DropdownMenu.Item key={locale.code} asChild>
            <Link
              href={localeHref(locale.code, pathname)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-dt-input px-3 py-2 text-sm outline-none transition-colors hover:bg-dt-teal/10',
                activeLocale === locale.code
                  ? 'text-dt-navy font-semibold'
                  : 'text-dt-graphite',
              )}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {locale.flag}
              </span>
              <span>{locale.label}</span>
              {activeLocale === locale.code ? (
                <Check weight="bold" className="ml-auto h-4 w-4 text-dt-teal" />
              ) : null}
            </Link>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
