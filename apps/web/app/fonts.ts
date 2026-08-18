// Uses Manrope via next/font/google for both heading and body registers
// (differentiated by weight/letter-spacing), plus JetBrains Mono as a third,
// monospace register for eyebrow labels / KPI numbers / prices. D-01 swaps
// the site off Inter (excluded by the client's premium-redesign brief) onto
// Manrope; D-02 adds the mono register. All three subsets include 'cyrillic'
// so Ukrainian copy renders with no fallback-font flash.
import { JetBrains_Mono, Manrope } from 'next/font/google';

export const interHeading = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['700', '800'],
  variable: '--font-dt-heading-raw',
  display: 'swap',
});

export const interBody = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-dt-body-raw',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['500'],
  variable: '--font-dt-mono-raw',
  display: 'swap',
});
