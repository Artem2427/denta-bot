'use client';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { Reveal } from '@/shared/components/reveal';
import { SignatureMark } from '@/shared/components/signature-mark';
import { idleBounceAnimate, idleBounceTransition } from '@/shared/lib/motion';
import { routes } from '@/shared/lib/routes';
import { ArrowRightIcon, BellIcon, CheckIcon } from '@phosphor-icons/react/ssr';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

const stats = [
  { value: '500+', label: 'клінік' },
  { value: '15 000+', label: 'записів/місяць' },
  { value: '98%', label: 'задоволених' },
];

export function Hero(): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-dt-navy/10 bg-dt-navy/5 px-4 py-1.5 text-sm font-medium text-dt-navy">
                <span className="relative flex h-2 w-2">
                  <span className="motion-safe:animate-ping absolute h-full w-full rounded-full bg-dt-teal opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-dt-teal" />
                </span>
                Нова платформа для стоматологій
              </div>
              <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">
                Автоматичний запис пацієнтів через Telegram
              </h1>
              <p className="text-dt-body text-dt-graphite">
                Підключіть бота за 1 день — пацієнти записуються самі, отримують
                нагадування і не забувають про прийом.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <PremiumButton variant="coral" size="lg" asChild>
                  <Link href={routes.demo}>
                    Спробувати демо
                    <ArrowRightIcon weight="regular" className="ml-2 h-5 w-5" />
                  </Link>
                </PremiumButton>
                <PremiumButton variant="outline" size="lg" asChild>
                  <a href="#features">Дізнатись більше</a>
                </PremiumButton>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="text-dt-h2 font-dt-heading font-bold text-dt-teal">
                      {stat.value}
                    </div>
                    <div className="text-sm text-dt-graphite">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="DentaBot Dashboard"
              width={800}
              height={600}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full rounded-dt-card shadow-[var(--shadow-dt-card)]"
            />
            <motion.div
              className="absolute -top-4 -right-4 flex items-center gap-2 rounded-dt-card bg-dt-warm-white p-4 shadow-[var(--shadow-dt-hover)]"
              animate={prefersReducedMotion ? undefined : idleBounceAnimate}
              transition={
                prefersReducedMotion ? undefined : idleBounceTransition
              }
            >
              <CheckIcon weight="bold" className="h-5 w-5 text-dt-teal" />
              <span className="text-sm font-medium text-dt-navy">
                Новий запис від Олени Коваль
              </span>
            </motion.div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-dt-card bg-dt-warm-white p-4 shadow-[var(--shadow-dt-hover)]">
              <BellIcon weight="regular" className="h-5 w-5 text-dt-teal" />
              <span className="text-sm font-medium text-dt-navy">
                Нагадування відправлено 24 пацієнтам
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
