import { getTranslations } from 'next-intl/server';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';
import { StaggerGrid, StaggerItem } from '@/shared/components/stagger-grid';

type HowItWorksStep = { n: string; title: string; text: string };

// Server Component (getTranslations): static 3-step explainer, no
// interactivity of its own. No `id` — the "#demo" anchor lives on
// admin-showcase.tsx instead (see plan key_links).
export async function HowItWorks(): Promise<React.JSX.Element> {
  const t = await getTranslations('howItWorks');
  const steps = t.raw('steps') as HowItWorksStep[];

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
        </Reveal>
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <StaggerItem key={step.n}>
              <PremiumCard>
                <div className="font-dt-mono text-3xl font-medium text-dt-navy/15">
                  {step.n}
                </div>
                <h3 className="mt-3.5 text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-dt-graphite">{step.text}</p>
              </PremiumCard>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>
    </Section>
  );
}
