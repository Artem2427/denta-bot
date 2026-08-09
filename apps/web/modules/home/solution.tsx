import Link from 'next/link';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { Reveal } from '@/shared/components/reveal';
import { routes } from '@/shared/lib/routes';

const patientSteps = [
  'Відкриває Telegram бота',
  'Обирає час і лікаря',
  'Отримує підтвердження',
];

const clinicSteps = [
  "Запис з'являється в системі",
  'Бот надсилає нагадування',
  'Аналітика та звіти',
];

function StepColumn({
  heading,
  steps,
}: {
  heading: string;
  steps: string[];
}): React.JSX.Element {
  return (
    <Reveal>
      <div>
        <h3 className="mb-6 text-dt-h3 font-dt-heading font-semibold text-dt-navy">{heading}</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dt-navy font-dt-heading font-bold text-dt-warm-white">
                {index + 1}
              </div>
              <span className="pt-2 font-medium text-dt-navy">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export function Solution(): React.JSX.Element {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2">
          <StepColumn heading="Для пацієнта" steps={patientSteps} />
          <StepColumn heading="Для клініки" steps={clinicSteps} />
        </div>
        <div className="mt-12 flex justify-center">
          <PremiumButton variant="outline" size="lg" asChild>
            <Link href={routes.demo}>Спробувати як це працює</Link>
          </PremiumButton>
        </div>
      </Container>
    </section>
  );
}
