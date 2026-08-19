import { getTranslations } from 'next-intl/server';

import { Container } from './container';
import { Eyebrow } from './eyebrow';
import { Logo } from './logo';

// Server Component (getTranslations, not useTranslations) — no
// interactivity required.
export async function Footer(): Promise<React.JSX.Element> {
  const t = await getTranslations('footer');

  return (
    <footer className="bg-dt-navy">
      <Container className="py-14">
        <div className="flex flex-wrap items-start justify-between gap-10">
          {/* Logo + tagline */}
          <div className="max-w-xs space-y-3">
            <Logo variant="inverted" />
            <p className="text-sm text-dt-warm-white/70">{t('tagline')}</p>
          </div>

          {/* Product + Contacts columns */}
          <div className="flex flex-wrap gap-14">
            <div className="space-y-2.5">
              <Eyebrow tone="on-navy" className="block">
                {t('productHeading')}
              </Eyebrow>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-dt-warm-white/80 transition-colors hover:text-dt-warm-white"
                  >
                    {t('linkFeatures')}
                  </a>
                </li>
                <li>
                  <a
                    href="#demo"
                    className="text-sm text-dt-warm-white/80 transition-colors hover:text-dt-warm-white"
                  >
                    {t('linkAdmin')}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-dt-warm-white/80 transition-colors hover:text-dt-warm-white"
                  >
                    {t('linkPricing')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <Eyebrow tone="on-navy" className="block">
                {t('contactHeading')}
              </Eyebrow>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#lead"
                    className="text-sm text-dt-warm-white/80 transition-colors hover:text-dt-warm-white"
                  >
                    {t('linkLead')}
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@dentabot.ua"
                    className="text-sm text-dt-warm-white/80 transition-colors hover:text-dt-warm-white"
                  >
                    hello@dentabot.ua
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+380440000000"
                    className="text-sm text-dt-warm-white/80 transition-colors hover:text-dt-warm-white"
                  >
                    +380 44 000 00 00
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-dt-warm-white/10 pt-5">
          <p className="text-xs text-dt-warm-white/45">{t('copyright')}</p>
        </div>
      </Container>
    </footer>
  );
}
