'use client';

import { ArrowsClockwise, ChartPieSlice, UserGear } from '@phosphor-icons/react/ssr';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';

import { StaggerGrid, StaggerItem } from './stagger-grid';

export function UnifiedSource(): React.JSX.Element {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">
              Єдине джерело правди — незалежно від каналу запису
            </h2>
            <p className="mx-auto max-w-2xl text-dt-body text-dt-graphite">
              Бот і адміністратор працюють в одній системі запису — жодних розбіжностей і
              подвійних бронювань
            </p>
          </div>
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
    </section>
  );
}
