'use client';

import { cn } from '@/shared/lib/cn';
import { useLocale } from 'next-intl';
import Link from 'next/link';

// Deliberately hardcoded absolute paths, not next-intl's locale-aware
// router/pathname-preservation helpers: this phase has exactly one real
// page (the landing page root) plus the untouched /blog, so hardcoded
// roots are correct in 100% of this phase's actual routes (switching
// locale while on /blog correctly lands on the equivalent-locale landing
// page root — RESEARCH.md Open Question 2's recommended option).
const locales = [
  { code: 'uk', href: '/', label: 'UA' },
  { code: 'ru', href: '/ru', label: 'RU' },
  { code: 'en', href: '/en', label: 'EN' },
] as const;

export function LocaleSwitcher(): React.JSX.Element {
  // useLocale() works everywhere including /blog, resolving to 'uk' there
  // per the root layout's getLocale() fallback.
  const activeLocale = useLocale();

  return (
    <div className="flex items-center gap-1">
      {locales.map((locale) => (
        <Link
          key={locale.code}
          href={locale.href}
          className={cn(
            'rounded-dt-input px-2 py-1 text-sm font-medium transition-colors',
            activeLocale === locale.code
              ? 'text-dt-navy font-semibold'
              : 'text-dt-graphite hover:text-dt-teal',
          )}
        >
          {locale.label}
        </Link>
      ))}
    </div>
  );
}
