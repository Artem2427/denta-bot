import { Toaster } from '@repo/ui';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

import { interBody, interHeading, jetbrainsMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'DentaBot',
  description:
    'Автоматизація запису пацієнтів у стоматологічні клініки через Telegram бот',
};

// This is the ONE Next.js layout allowed to declare <html>/<body>, so it
// sits ABOVE app/[locale]/layout.tsx in the file tree — which means it
// can NEVER reliably read the [locale] dynamic segment: Next.js only
// threads a segment's params down to layouts nested inside it, not up to
// ancestors above it (confirmed live: params.locale was undefined here
// even on a fresh SSR request, no client-nav caching involved). Locale-
// dependent UI (Header/Footer/NextIntlClientProvider) therefore lives in
// app/[locale]/layout.tsx instead, where it correctly reflects the URL
// and re-renders on every locale-segment navigation — this file used to
// own that provider directly, which produced a real bug: Header/Footer
// showing a stale/wrong locale (e.g. English chrome on a /ru page) since
// this layout's request-scoped locale resolution isn't guaranteed to
// track the actual route. <html lang> here is a static best-effort
// default, not the source of truth for any visible content.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${interHeading.variable} ${interBody.variable} ${jetbrainsMono.variable} font-dt-body overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
