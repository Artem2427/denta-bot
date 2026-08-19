import { Footer } from '@/shared/components/footer';
import { Header } from '@/shared/components/header';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale segment AND scopes
  // getMessages() below to it. The NextIntlClientProvider (and
  // Header/Footer, which consume it) live HERE — not in the root layout
  // above — because this is the segment that actually changes per
  // locale on navigation. The root layout persists across /, /ru, /en
  // navigations (same file, same segment), so anything locale-dependent
  // placed there can render a stale locale; this layout genuinely
  // re-renders with the correct `locale` every time the URL's locale
  // segment changes, which is what fixed the real bug of Header/Footer
  // showing the wrong language on a correctly-rendered page.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header />
      <main className="pt-16 lg:pt-20">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
