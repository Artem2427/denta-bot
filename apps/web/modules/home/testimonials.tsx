'use client';

import { Star, UserCircle } from '@phosphor-icons/react/ssr';
import Image from 'next/image';

import { Container } from '@/shared/components/container';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

import { StaggerGrid, StaggerItem } from './stagger-grid';

function Stars(): React.JSX.Element {
  return (
    <div className="flex gap-1">
      <Star weight="fill" className="h-4 w-4 text-yellow-400" />
      <Star weight="fill" className="h-4 w-4 text-yellow-400" />
      <Star weight="fill" className="h-4 w-4 text-yellow-400" />
      <Star weight="fill" className="h-4 w-4 text-yellow-400" />
      <Star weight="fill" className="h-4 w-4 text-yellow-400" />
    </div>
  );
}

export function Testimonials(): React.JSX.Element {
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading title="Що кажуть клініки" />
        </Reveal>
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          <StaggerItem>
            <PremiumCard>
              <Stars />
              <p className="mt-4 text-dt-graphite italic">
                Пропущені прийоми зменшились на 70% з моменту підключення DentaBot. Пацієнти
                отримують нагадування і приходять вчасно.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Image
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                  alt="Олена Ковальчук"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-dt-heading font-semibold text-dt-navy">
                    Олена Ковальчук
                  </div>
                  <div className="text-sm text-dt-graphite">Клініка Посмішка</div>
                </div>
              </div>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Stars />
              <p className="mt-4 text-dt-graphite italic">
                Наш адміністратор більше не сидить на телефоні цілий день — тепер пацієнти
                записуються самі через бота, а вона займається клінікою.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dt-navy/10">
                  <UserCircle weight="fill" className="size-7 text-dt-navy/40" />
                </div>
                <div>
                  <div className="font-dt-heading font-semibold text-dt-navy">
                    Андрій Мельник
                  </div>
                  <div className="text-sm text-dt-graphite">Denta Plus</div>
                </div>
              </div>
            </PremiumCard>
          </StaggerItem>
          <StaggerItem>
            <PremiumCard>
              <Stars />
              <p className="mt-4 text-dt-graphite italic">
                Налаштування зайняло буквально годину. Не потрібен був жоден технічний
                спеціаліст — все запрацювало одразу.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dt-navy/10">
                  <UserCircle weight="fill" className="size-7 text-dt-navy/40" />
                </div>
                <div>
                  <div className="font-dt-heading font-semibold text-dt-navy">
                    Марія Петренко
                  </div>
                  <div className="text-sm text-dt-graphite">Стоматологія Люкс</div>
                </div>
              </div>
            </PremiumCard>
          </StaggerItem>
        </StaggerGrid>
      </Container>
    </Section>
  );
}
