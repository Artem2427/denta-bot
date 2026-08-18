'use client';

import { ArrowsClockwise, ChartPieSlice, UserGear } from '@phosphor-icons/react/ssr';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

import { StaggerGrid, StaggerItem } from './stagger-grid';

export function UnifiedSource(): React.JSX.Element {
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            title="Єдине джерело правди — незалежно від каналу запису"
            description="Бот і адміністратор працюють в одній системі запису — жодних розбіжностей і подвійних бронювань"
          />
        </Reveal>
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          <StaggerItem>
            <PremiumCard>
              <ArrowsClockwise weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Один спільний розклад
              </h3>
              <p className="text-dt-graphite">
                Запис через Telegram- чи WhatsApp-бота і запис, який адміністратор вніс вручну
                після дзвінка, миттєво потрапляють в один розклад. Зайнятий слот одразу зникає з
                бота — і навпаки. Подвійного бронювання просто не буває.
              </p>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <UserGear weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Доступ за ролями
              </h3>
              <p className="text-dt-graphite">
                Звичайний адміністратор бачить і веде записи свого дня. Головний лікар або
                власник клініки має повну аналітику по клініці й керує розкладами всіх лікарів.
              </p>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <ChartPieSlice weight="regular" className="mb-3 h-10 w-10 text-dt-teal" />
              <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                Аналітика по джерелах запису
              </h3>
              <p className="text-dt-graphite">
                Кожен запис зберігає канал, звідки він прийшов — бот чи ручний ввід
                адміністратора. Власник бачить реальну частку записів через бота й ухвалює
                рішення на основі цифр, а не здогадок.
              </p>
            </PremiumCard>
          </StaggerItem>
        </StaggerGrid>
      </Container>
    </Section>
  );
}
