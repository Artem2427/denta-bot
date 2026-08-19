import { Footer } from '@/shared/components/footer';
import { Header } from '@/shared/components/header';
import { Toaster } from '@repo/ui';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { interHeading, interBody, jetbrainsMono } from './fonts';
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
  // Resolves via apps/web/i18n/request.ts's hasLocale fallback to
  // routing.defaultLocale ('uk') whenever no [locale] segment is present in
  // the request (i.e. on /blog, which proxy.ts's matcher excludes) — this
  // is what gives Header/Footer working uk translations on /blog for free,
  // with no second NextIntlClientProvider needed in app/[locale]/layout.tsx.
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
