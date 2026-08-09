import { ArrowRight } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { Reveal } from '@/shared/components/reveal';
import { routes } from '@/shared/lib/routes';

const patientSteps = [
  {
    title: 'Відкриває Telegram бота',
    description: 'Один клік — бот вітається і показує вільні часи',
  },
  {
    title: 'Обирає час і лікаря',
    description: 'Зручний календар з реальними вільними слотами',
  },
  {
    title: 'Отримує підтвердження',
    description: 'Автоматичне нагадування за день і годину до прийому',
  },
];

const clinicSteps = [
  {
    title: "Запис з'являється в системі",
    description: 'Миттєво видно в адмін панелі та календарі лікаря',
  },
  {
    title: 'Бот надсилає нагадування',
    description: 'Автоматично, без участі адміністратора',
  },
  {
    title: 'Аналітика та звіти',
    description: 'Бачите статистику, завантаженість, можете оптимізувати роботу',
  },
];

function StepColumn({
  heading,
  steps,
}: {
  heading: string;
  steps: { title: string; description: string }[];
}): React.JSX.Element {
  return (
    <Reveal>
      <PremiumCard>
        <h3 className="mb-6 text-dt-h3 font-dt-heading font-semibold text-dt-navy">{heading}</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dt-navy font-dt-heading font-bold text-dt-warm-white">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-dt-navy">{step.title}</p>
                <p className="text-sm text-dt-graphite">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>
    </Reveal>
  );
}

export function Solution(): React.JSX.Element {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">
              DentaBot бере це на себе
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-12 lg:grid-cols-2">
          <StepColumn heading="Для пацієнта" steps={patientSteps} />
          <StepColumn heading="Для клініки" steps={clinicSteps} />
        </div>
        <div className="mt-12 flex justify-center">
          <PremiumButton variant="outline" size="lg" asChild>
            <Link href={routes.demo}>
              Спробувати як це працює
              <ArrowRight weight="regular" className="ml-2 h-5 w-5" />
            </Link>
          </PremiumButton>
        </div>
      </Container>
    </section>
  );
}
