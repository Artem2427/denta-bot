'use client';

import { Check } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import * as React from 'react';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { PremiumSwitch } from '@/shared/components/premium-switch';
import { routes } from '@/shared/lib/routes';

const plans = [
  {
    name: 'Старт',
    monthlyPrice: '599',
    yearlyPrice: '499',
    description: 'Для невеликих клінік',
    features: [
      'До 100 записів/місяць',
      '1 лікар',
      'Telegram бот',
      'Автонагадування',
      'Базова аналітика',
      'Email підтримка',
    ],
  },
  {
    name: 'Бізнес',
    monthlyPrice: '1199',
    yearlyPrice: '999',
    description: 'Для середніх клінік',
    popular: true,
    features: [
      'До 500 записів/місяць',
      'До 5 лікарів',
      'Telegram бот',
      'Автонагадування',
      'Розширена аналітика',
      'Збір відгуків',
      'Інтеграції',
      'Пріоритетна підтримка',
    ],
  },
  {
    name: 'Клініка',
    monthlyPrice: '2499',
    yearlyPrice: '1999',
    description: 'Для великих клінік',
    features: [
      'Необмежено записів',
      'Необмежено лікарів',
      'Telegram бот',
      'Автонагадування',
      'Повна аналітика',
      'Збір відгуків',
      'Всі інтеграції',
      'API доступ',
      'Декілька локацій',
      'Персональний менеджер',
    ],
  },
];

export function PricingCards(): React.JSX.Element {
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <>
      <section className="pb-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">
              Прості та прозорі ціни
            </h1>
            <p className="mt-4 text-dt-body text-dt-graphite">
              Починайте безкоштовно. Платіть тільки коли відчуєте цінність.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="text-sm text-dt-graphite">Щомісяця</span>
              <PremiumSwitch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className="text-sm text-dt-graphite">Щороку</span>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-8 lg:pb-12">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <PremiumCard key={plan.name}>
                <h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">
                  {plan.name}
                </h3>
                <p className="mt-1 text-dt-graphite">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-dt-h2 font-dt-heading font-bold text-dt-navy">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice} ₴
                  </span>
                  <span className="text-dt-graphite">/міс</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        weight="regular"
                        className="mt-0.5 h-5 w-5 shrink-0 text-green-500"
                      />
                      <span className="text-dt-graphite">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <PremiumButton
                    asChild
                    variant={plan.popular ? 'coral' : 'outline'}
                    size="lg"
                    className="w-full"
                  >
                    <Link href={routes.contacts}>Обрати план</Link>
                  </PremiumButton>
                </div>
              </PremiumCard>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
