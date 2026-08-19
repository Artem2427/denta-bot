import { redirect } from '@/i18n/navigation';

// Retired destination route (D-01, D-03). Content now lives at the
// #lead anchor (LeadSection) on the single-page landing. This route lives
// inside the [locale] segment, so the visitor's locale comes directly from
// the route param — already validated upstream by app/[locale]/layout.tsx's
// hasLocale()/notFound() guard, so no re-validation is needed here.
export default async function Contacts({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<void> {
  const { locale } = await params;

  redirect({ href: '/#lead', locale });
}
