'use client';

import {
  Bell,
  Calendar,
  ChartBar,
  Check,
  ChatCircleText,
  Gear,
  Star,
  Users,
} from '@phosphor-icons/react/ssr';
import { useTranslations } from 'next-intl';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

import { StaggerGrid, StaggerItem } from '@/shared/components/stagger-grid';

type FeatureItem = { title: string; text: string };

// Same 8 Phosphor icons, same order, as modules/home/features.tsx — the
// design file's 8 feature items map 1:1 onto the existing icon-per-card
// grid; content is re-copied per the design's exact wording via t.raw.
const FEATURE_ICONS = [ChatCircleText, Calendar, Bell, ChartBar, Star, Gear, Users, Check];

export function Features(): React.JSX.Element {
  const t = useTranslations('features');
  const items = t.raw('items') as FeatureItem[];

  return (
    <Section id="features" className="scroll-mt-16 lg:scroll-mt-20">
      <Container>
        <Reveal>
          <SectionHeading title={t('title')} />
        </Reveal>
        <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <StaggerItem key={item.title}>
                <PremiumCard>
                  {Icon ? (
                    <Icon weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
                  ) : null}
                  <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                    {item.title}
                  </h3>
                  <p className="text-dt-graphite">{item.text}</p>
                </PremiumCard>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </Container>
    </Section>
  );
}
