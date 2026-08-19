import { Footer } from '@/shared/components/footer';
import { Header } from '@/shared/components/header';
import { Toaster } from '@repo/ui';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { interBody, interHeading, jetbrainsMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'DentaBot',
  description:
    'Автоматизація запису пацієнтів у стоматологічні клініки через Telegram бот',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  // getLocale()/getMessages() feed the single NextIntlClientProvider below,
  // which gives Header/Footer (rendered here in the root layout, outside
  // app/[locale]/layout.tsx) their translations on every route. Every real
  // route now resolves its own [locale] segment (260819-oyk), so
  // apps/web/i18n/request.ts's hasLocale fallback to routing.defaultLocale
  // is a purely defensive branch — no real route depends on it anymore.
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${interHeading.variable} ${interBody.variable} ${jetbrainsMono.variable} font-dt-body overflow-x-hidden`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Header />
            <main className="pt-16 lg:pt-20">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
