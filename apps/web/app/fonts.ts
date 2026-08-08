// Uses plain "Inter" via next/font/google for both heading and body registers
// (differentiated by weight/letter-spacing) rather than manually self-hosting
// "Inter Display" — D-08 explicitly allows plain Inter, and RESEARCH.md Open
// Question 2 recommends this simpler, zero-manual-asset-vendoring path.
import { Inter } from 'next/font/google';

export const interHeading = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700'],
  variable: '--font-dt-heading-raw',
  display: 'swap',
});

export const interBody = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-dt-body-raw',
  display: 'swap',
});
