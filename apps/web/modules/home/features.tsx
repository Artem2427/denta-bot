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

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';

import { StaggerGrid, StaggerItem } from './stagger-grid';

export function Features(): React.JSX.Element {
  return (
    <section id="features" className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">
              Все що потрібно для роботи клініки
            </h2>
          </div>
        </Reveal>
        <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <PremiumCard>
              <ChatCircleText weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Telegram бот
              </h3>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Calendar weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Розклад лікарів
              </h3>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Bell weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Автонагадування
              </h3>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <ChartBar weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">Аналітика</h3>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Star weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">Відгуки</h3>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Gear weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Адмін панель
              </h3>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Users weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Управління персоналом
              </h3>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Check weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Скасування запису
              </h3>
            </PremiumCard>
          </StaggerItem>
        </StaggerGrid>
      </Container>
    </section>
  );
}
