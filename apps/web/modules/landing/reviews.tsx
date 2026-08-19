'use client';

import { StarIcon } from '@phosphor-icons/react/ssr';
import { useTranslations } from 'next-intl';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

import { StaggerGrid, StaggerItem } from '@/modules/home/stagger-grid';

type ReviewItem = { text: string; initials: string; name: string; clinic: string };

// Same 5-star row pattern as modules/home/testimonials.tsx's Stars() helper.
function Stars(): React.JSX.Element {
  return (
    <div className="flex gap-1">
      <StarIcon weight="fill" className="h-4 w-4 text-yellow-400" />
      <StarIcon weight="fill" className="h-4 w-4 text-yellow-400" />
      <StarIcon weight="fill" className="h-4 w-4 text-yellow-400" />
      <StarIcon weight="fill" className="h-4 w-4 text-yellow-400" />
      <StarIcon weight="fill" className="h-4 w-4 text-yellow-400" />
    </div>
  );
}

export function Reviews(): React.JSX.Element {
  const t = useTranslations('reviews');
  const items = t.raw('items') as ReviewItem[];

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading title={t('title')} />
        </Reveal>
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.name}>
              <PremiumCard>
                <Stars />
                <p className="mt-4 text-dt-graphite italic">{item.text}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dt-navy/10 font-dt-heading font-semibold text-dt-navy">
                    {item.initials}
                  </div>
                  <div>
                    <div className="font-dt-heading font-semibold text-dt-navy">{item.name}</div>
                    <div className="text-sm text-dt-graphite">{item.clinic}</div>
                  </div>
                </div>
              </PremiumCard>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>
    </Section>
  );
}
