import { Container } from '@/shared/components/container';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';
import { Check } from '@phosphor-icons/react/ssr';

import type { PricingPlan } from './types';

function CheckCell(): React.JSX.Element {
  return <Check weight="regular" className="mx-auto h-5 w-5 text-dt-teal" />;
}

function DashCell(): React.JSX.Element {
  return <span className="text-dt-graphite">—</span>;
}

export function ComparisonTable({
  plans,
}: {
  plans: PricingPlan[];
}): React.JSX.Element {
  const featureRows = Array.from(
    new Set(plans.flatMap((plan) => plan.features)),
  );

  return (
    <Section tone="muted">
      <Container>
        <Reveal>
          <SectionHeading title="Детальне порівняння планів" />
        </Reveal>
        <div className="overflow-x-auto">
          <table className="mx-auto w-full max-w-5xl">
            <thead>
              <tr className="border-b border-[var(--dt-border)]">
                <th className="py-4 text-left text-dt-navy">Функція</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="py-4 text-center text-dt-navy">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row) => (
                <tr key={row} className="border-b border-[var(--dt-border)]">
                  <td className="py-4 text-dt-navy">{row}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 text-center">
                      {plan.features.includes(row) ? (
                        <CheckCell />
                      ) : (
                        <DashCell />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
