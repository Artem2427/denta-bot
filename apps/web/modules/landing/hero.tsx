import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { Reveal } from '@/shared/components/reveal';
import { BellIcon } from '@phosphor-icons/react/ssr';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { HeroNotificationBadge } from './hero-notification-badge';
import { HeroStats } from './hero-stats';

type HeroStat = { value: string; label: string };

// Server Component (no 'use client'): renders translated chrome via
// getTranslations, so it works without a NextIntlClientProvider ancestor.
// Only the interactive bits (count-up animation, idle-bounce card) are
// small client subcomponents.
export async function Hero(): Promise<React.JSX.Element> {
  const t = await getTranslations('hero');
  const stats = t.raw('stats') as HeroStat[];

  return (
    <section className="pt-24 pb-8 lg:pt-32 lg:pb-12">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--dt-border)] bg-dt-navy/5 px-4 py-1.5 text-sm font-medium text-dt-navy">
                <span className="relative flex h-2 w-2">
                  <span className="motion-safe:animate-ping absolute h-full w-full rounded-full bg-dt-teal opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-dt-teal" />
                </span>
                {t('badge')}
              </div>
              <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">
                {t('titleLine1')}
                <br />
                {t('titleLine2')}
                <br />
                <span className="text-dt-teal">{t('titleHighlight')}</span>
              </h1>
              <p className="text-dt-body text-dt-graphite">{t('subtitle')}</p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <PremiumButton variant="navy" size="lg" asChild>
                  <a href="#demo">{t('ctaPrimary')}</a>
                </PremiumButton>
                <PremiumButton variant="outline" size="lg" asChild>
                  <a href="#lead">{t('ctaSecondary')}</a>
                </PremiumButton>
              </div>
              <HeroStats stats={stats} />
            </div>
          </Reveal>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="DentaBot Dashboard"
              width={800}
              height={600}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full rounded-dt-card shadow-[var(--shadow-dt-card)]"
            />
            <HeroNotificationBadge />
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-dt-card bg-dt-warm-white p-4 shadow-[var(--shadow-dt-hover)]">
              <BellIcon weight="regular" className="h-5 w-5 text-dt-teal" />
              <span className="text-sm font-medium text-dt-navy">
                Нагадування відправлено 24 пацієнтам
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
