'use client';

import { ChartBar, ChatCircleDots, Phone, SmileySad } from '@phosphor-icons/react/ssr';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

import { StaggerGrid, StaggerItem } from './stagger-grid';

export function Problem(): React.JSX.Element {
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            title="Знайомо?"
            description="Як зараз виглядає запис у більшості клінік"
          />
        </Reveal>
        <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <PremiumCard>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dt-coral/10">
                <Phone weight="bold" className="size-6 text-dt-coral" />
              </div>
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Адміністратор на телефоні
              </h3>
              <p className="text-dt-graphite">
                Весь день відповідає на дзвінки, записує в блокнот або Excel
              </p>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dt-amber/10">
                <SmileySad weight="bold" className="size-6 text-dt-amber" />
              </div>
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Пацієнти забувають
              </h3>
              <p className="text-dt-graphite">
                Немає автоматичних нагадувань — люди просто не приходять
              </p>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dt-amber/10">
                <ChatCircleDots weight="bold" className="size-6 text-dt-amber" />
              </div>
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Хаос в месенджерах
              </h3>
              <p className="text-dt-graphite">
                Записи через WhatsApp, Viber, Instagram — все розкидано
              </p>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dt-teal/10">
                <ChartBar weight="bold" className="size-6 text-dt-teal" />
              </div>
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Немає статистики
              </h3>
              <p className="text-dt-graphite">
                Неможливо проаналізувати завантаженість та оптимізувати роботу
              </p>
            </PremiumCard>
          </StaggerItem>
        </StaggerGrid>
      </Container>
    </Section>
  );
}
