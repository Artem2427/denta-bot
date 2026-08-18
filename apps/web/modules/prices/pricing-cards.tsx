'use client';

import { Container } from '@/shared/components/container';
import { PremiumBadge } from '@/shared/components/premium-badge';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { PremiumSwitch } from '@/shared/components/premium-switch';
import { Section } from '@/shared/components/section';
import { routes } from '@/shared/lib/routes';
import { Check } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import * as React from 'react';

import type { PricingPlan } from './types';

function getGridClassName(count: number): string {
  if (count === 1) {
    return 'mx-auto grid max-w-md gap-6';
  }
  if (count === 2) {
    return 'mx-auto grid max-w-4xl gap-6 lg:grid-cols-2';
  }
  return 'mx-auto grid max-w-6xl gap-6 lg:grid-cols-3';
}

export function PricingCards({
  plans,
}: {
  plans: PricingPlan[];
}): React.JSX.Element {
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <>
      <Section className="pb-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">
              Прості та прозорі ціни
            </h1>
            <p className="mt-4 text-dt-body text-dt-graphite">
              Починайте безкоштовно. Платіть тільки коли відчуєте цінність.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="text-sm text-dt-graphite">Щомісяця</span>
              <PremiumSwitch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className="text-sm text-dt-graphite">Щороку</span>
              <PremiumBadge variant="teal">-20%</PremiumBadge>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pb-8 lg:pb-12">
        <Container>
          <div className={getGridClassName(plans.length)}>
            {plans.map((plan) => (
              <PremiumCard
                key={plan.id}
                className="flex h-full flex-col"
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
                    variant={plan.isPopular ? 'coral' : 'outline'}
                    size="lg"
                    className="w-full"
                  >
                    <Link href={routes.contacts}>Обрати план</Link>
                  </PremiumButton>
                </div>
              </PremiumCard>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
