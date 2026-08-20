'use client';

import { Container } from '@/shared/components/container';
import { PremiumBadge } from '@/shared/components/premium-badge';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';
import { cn } from '@/shared/lib/cn';
import { Check } from '@phosphor-icons/react/ssr';
import { useTranslations } from 'next-intl';
import * as React from 'react';

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
  return 'mx-auto grid gap-6 lg:grid-cols-3';
}

// Presentational client component — `plans` is fetched server-side by Plan
// 07's app/[locale]/page.tsx (GET /public/pricing-plans) and passed down as
// a prop, matching the existing Phase 6 fetch-then-render pattern (no
// internal fetch here). Plan name/description/features render exactly as
// returned by the API — Ukrainian-only regardless of active locale (D-11);
// all surrounding chrome (heading, billing toggle, popular badge, CTA,
// per-month suffix, footnote) is translated via useTranslations('pricing').
export function PricingSection({
  plans,
}: {
  plans: PricingPlan[];
}): React.JSX.Element {
  const t = useTranslations('pricing');
  const [isYearly, setIsYearly] = React.useState(false);

  console.log(plans, 'plans');

  return (
    <Section id="pricing" className="scroll-mt-16 lg:scroll-mt-20">
      <Container>
        <div className="mb-dt-48 flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            className="mb-0 lg:mx-0"
          />
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--dt-border)] bg-dt-warm-white p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                !isYearly
                  ? 'bg-dt-navy text-dt-warm-white'
                  : 'text-dt-graphite hover:text-dt-navy',
              )}
            >
              {t('billingMonthly')}
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                isYearly
                  ? 'bg-dt-navy text-dt-warm-white'
                  : 'text-dt-graphite hover:text-dt-navy',
              )}
            >
              {t('billingYearly')} · {t('billingDiscount')}
            </button>
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
                  {t('popularBadge')}
                </PremiumBadge>
              )}
              <h3
                className={cn(
                  'text-[1.5rem] leading-[1.15] font-dt-heading font-semibold',
                  plan.isPopular ? 'text-dt-warm-white' : 'text-dt-navy',
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  'mt-1',
                  plan.isPopular ? 'text-dt-warm-white/70' : 'text-dt-graphite',
                )}
              >
                {plan.description}
              </p>
              <div className="mt-6">
                <span
                  className={cn(
                    'text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.1] tracking-[-0.03em] font-dt-heading font-bold tabular-nums',
                    plan.isPopular ? 'text-dt-warm-white' : 'text-dt-navy',
                  )}
                >
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice} ₴
                </span>
                <span
                  className={
                    plan.isPopular
                      ? 'text-dt-warm-white/70'
                      : 'text-dt-graphite'
                  }
                >
                  {t('perMonth')}
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      weight="regular"
                      className={cn(
                        'mt-0.5 h-5 w-5 shrink-0',
                        plan.isPopular ? 'text-dt-warm-white' : 'text-dt-teal',
                      )}
                    />
                    <span
                      className={
                        plan.isPopular
                          ? 'text-dt-warm-white/80'
                          : 'text-dt-graphite'
                      }
                    >
                      {feature}
                    </span>
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

        <p className="mt-8 text-center text-sm text-dt-graphite">
          {t('footnote')}
        </p>
      </Container>
    </Section>
  );
}
