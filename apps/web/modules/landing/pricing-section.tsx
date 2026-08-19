'use client';

import { Check } from '@phosphor-icons/react/ssr';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Container } from '@/shared/components/container';
import { PremiumBadge } from '@/shared/components/premium-badge';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { PremiumSwitch } from '@/shared/components/premium-switch';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

import type { PricingPlan } from './types';

// Anchor target for every plan's CTA — the single conversion funnel (D-07).
// Kept as a named constant (not repeated inline) so there is exactly one
// place the target could ever drift.
const LEAD_ANCHOR = '#lead';

function getGridClassName(count: number): string {
  if (count === 1) {
    return 'mx-auto grid max-w-md gap-6';
  }
  if (count === 2) {
    return 'mx-auto grid max-w-4xl gap-6 lg:grid-cols-2';
  }
  return 'mx-auto grid max-w-6xl gap-6 lg:grid-cols-3';
}

// Presentational client component — `plans` is fetched server-side by Plan
// 07's app/[locale]/page.tsx (GET /public/pricing-plans) and passed down as
// a prop, matching the existing Phase 6 fetch-then-render pattern (no
// internal fetch here). Plan name/description/features render exactly as
// returned by the API — Ukrainian-only regardless of active locale (D-11);
// only the surrounding chrome (heading, billing toggle, CTA, footnote) is
// translated via useTranslations('pricing').
export function PricingSection({
  plans,
}: {
  plans: PricingPlan[];
}): React.JSX.Element {
  const t = useTranslations('pricing');
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <Section id="pricing" className="scroll-mt-16 lg:scroll-mt-20">
      <Container>
        <div className="mb-dt-48 flex flex-col items-center gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            className="mb-0 lg:mx-0"
          />
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-dt-graphite">
              {t('billingMonthly')}
            </span>
            <PremiumSwitch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className="text-sm text-dt-graphite">
              {t('billingYearly')}
            </span>
            <PremiumBadge variant="teal">{t('billingDiscount')}</PremiumBadge>
          </div>
        </div>

        <div className={getGridClassName(plans.length)}>
          {plans.map((plan) => (
            <PremiumCard
              key={plan.id}
              className="relative flex h-full flex-col"
              highlighted={plan.isPopular}
            >
              {plan.isPopular && (
                <PremiumBadge
                  variant="coral"
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  Популярний
                </PremiumBadge>
              )}
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                {plan.name}
              </h3>
              <p className="mt-1 text-dt-graphite">{plan.description}</p>
              <div className="mt-6">
                <span className="text-dt-h2 font-dt-heading font-bold tabular-nums text-dt-navy">
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice} ₴
                </span>
                <span className="text-dt-graphite">/міс</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      weight="regular"
                      className="mt-0.5 h-5 w-5 shrink-0 text-dt-teal"
                    />
                    <span className="text-dt-graphite">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <PremiumButton
                  asChild
                  variant={plan.isPopular ? 'coral' : 'navy'}
                  size="lg"
                  className="w-full"
                >
                  <a href={LEAD_ANCHOR}>{t('ctaLabel')}</a>
                </PremiumButton>
              </div>
            </PremiumCard>
          ))}
        </div>

        <p className="mt-dt-48 text-center text-sm text-dt-graphite">
          {t('footnote')}
        </p>
      </Container>
    </Section>
  );
}
