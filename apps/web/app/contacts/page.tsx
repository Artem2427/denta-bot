import { hasLocale } from 'next-intl';
import { cookies } from 'next/headers';

import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// Retired destination route (D-01, D-03). Content now lives at the
// #lead anchor (LeadSection) on the single-page landing. This route sits
// outside the [locale] segment (proxy.ts matcher exclusion), so there is
// no locale context from the URL — instead we read the NEXT_LOCALE cookie
// next-intl's middleware sets on every request that does go through it
// (e.g. /en, /ru), falling back to the default locale when absent (WR-01:
// keeps ru/en visitors — including the demo tab's "Connect your clinic"
// CTA, which links here — on their selected locale instead of being
// silently dropped back to Ukrainian).
export default async function Contacts(): Promise<void> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = hasLocale(routing.locales, localeCookie)
    ? localeCookie
    : routing.defaultLocale;

  redirect({ href: '/#lead', locale });
}
