import { Footer } from '@/shared/components/footer';
import { Header } from '@/shared/components/header';
import { Toaster } from '@repo/ui';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

import { interHeading, interBody } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'DentaBot',
  description:
    'Автоматизація запису пацієнтів у стоматологічні клініки через Telegram бот',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${interHeading.variable} ${interBody.variable} font-dt-body overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header />
          <main className="pt-16 lg:pt-20">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
