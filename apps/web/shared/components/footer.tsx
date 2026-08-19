import { InstagramLogo, TelegramLogo } from '@phosphor-icons/react/ssr';
import { getTranslations } from 'next-intl/server';

import { Container } from './container';
import { Logo } from './logo';

const socialIconClassName =
  'flex h-10 w-10 items-center justify-center rounded-full bg-dt-navy/5 transition-colors hover:bg-dt-coral hover:text-dt-navy';

// Server Component (getTranslations, not useTranslations) — matches
// modules/landing/hero.tsx's pattern (Task 1) and renders correctly on
// /blog via the root layout's uk-fallback locale (Task 2), with no
// interactivity required.
export async function Footer(): Promise<React.JSX.Element> {
  const t = await getTranslations('footer');

  return (
    <footer className="border-t border-[var(--dt-border)] bg-dt-warm-white">
      <Container className="py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Column 1 — Logo + description */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-dt-graphite">{t('tagline')}</p>
            <div className="flex gap-3">
              <a
                href="https://t.me/dentabot"
                target="_blank"
                rel="noopener noreferrer"
                className={socialIconClassName}
              >
                <TelegramLogo weight="bold" className="size-5" />
              </a>
              <a
                href="https://instagram.com/dentabot"
                target="_blank"
                rel="noopener noreferrer"
                className={socialIconClassName}
              >
                <InstagramLogo weight="bold" className="size-5" />
              </a>
            </div>
          </div>

          {/* Column 2 — Product anchors (retired-route content folds into
              landing-page sections, Plan 07) */}
          <div className="space-y-4">
            <h3 className="font-dt-heading font-semibold text-dt-navy">
              {t('productHeading')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-teal"
                >
                  {t('linkFeatures')}
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-teal"
                >
                  {t('linkAdmin')}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-teal"
                >
                  {t('linkPricing')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 — Contact (Компанія column dropped entirely per the
              client's "not overloaded" instruction — its About/Privacy
              links were 404 stubs anyway) */}
          <div className="space-y-4">
            <h3 className="font-dt-heading font-semibold text-dt-navy">
              {t('contactHeading')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#lead"
                  className="text-sm text-dt-graphite transition-colors hover:text-dt-teal"
                >
                  {t('linkLead')}
                </a>
              </li>
              <li className="text-sm text-dt-graphite">
                <span className="mb-1 block font-medium text-dt-navy">
                  Email
                </span>
                <a
                  href="mailto:hello@dentabot.ua"
                  className="transition-colors hover:text-dt-teal"
                >
                  hello@dentabot.ua
                </a>
              </li>
              <li className="text-sm text-dt-graphite">
                <span className="mb-1 block font-medium text-dt-navy">
                  Telegram
                </span>
                <a
                  href="https://t.me/dentabot_support"
                  className="transition-colors hover:text-dt-teal"
                >
                  @dentabot_support
                </a>
              </li>
              <li className="text-sm text-dt-graphite">
                <span className="mb-1 block font-medium text-dt-navy">
                  {t('hoursLabel')}
                </span>
                {t('hoursValue')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--dt-border)] pt-8">
          <p className="text-center text-sm text-dt-graphite">
            {t('copyright')}
          </p>
        </div>
      </Container>
    </footer>
  );
}
