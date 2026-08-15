import { ComparisonTable } from '@/modules/prices/comparison-table';
import { FaqAccordion } from '@/modules/prices/faq-accordion';
import { PricingCards } from '@/modules/prices/pricing-cards';
import type { PricingPlan } from '@/modules/prices/types';
import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { Reveal } from '@/shared/components/reveal';
import { getServerApiUrl } from '@/shared/lib/api-url';
import { routes } from '@/shared/lib/routes';
import Link from 'next/link';
import * as React from 'react';

export default async function Prices(): Promise<React.JSX.Element> {
  const res = await fetch(`${getServerApiUrl()}/public/pricing-plans`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pricing plans: ${res.status}`);
  }
  const plans = (await res.json()) as PricingPlan[];

  if (plans.length === 0) {
    return (
      <div className="min-h-screen pb-16 pt-24 lg:pt-32">
        <Container>
          <div className="mx-auto max-w-2xl py-16 text-center">
            <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">
              Тарифи тимчасово недоступні
            </h1>
            <p className="mt-4 text-dt-body text-dt-graphite">
              Ми оновлюємо тарифні плани. Зв&apos;яжіться з нами, щоб дізнатися
              актуальні умови.
            </p>
            <div className="mt-6">
              <PremiumButton asChild size="lg">
                <Link href={routes.contacts}>Зв&apos;язатися з нами</Link>
              </PremiumButton>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <PricingCards plans={plans} />
      <ComparisonTable />
      <section className="bg-dt-navy/5 py-8 lg:py-12">
        <Container>
          <Reveal>
            <h2 className="mb-12 text-center text-dt-h2 font-dt-heading font-bold text-dt-navy">
              Часті питання
            </h2>
          </Reveal>
          <div className="mx-auto max-w-3xl">
            <FaqAccordion />
          </div>
          <div className="mx-auto mt-12 max-w-3xl text-center">
            <p className="text-dt-graphite">Залишились питання?</p>
            <div className="mt-4">
              <PremiumButton size="lg" asChild>
                <Link href={routes.contacts}>Напишіть нам →</Link>
              </PremiumButton>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
