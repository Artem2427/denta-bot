import { ComparisonTable } from '@/modules/prices/comparison-table';
import { FaqAccordion } from '@/modules/prices/faq-accordion';
import { PricingCards } from '@/modules/prices/pricing-cards';
import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { Reveal } from '@/shared/components/reveal';
import { routes } from '@/shared/lib/routes';
import Link from 'next/link';
import * as React from 'react';

export default function Prices(): React.JSX.Element {
  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <PricingCards />
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
