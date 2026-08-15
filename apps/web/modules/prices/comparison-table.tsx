import { Container } from '@/shared/components/container';
import { Reveal } from '@/shared/components/reveal';
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
    <section className="bg-dt-navy/5 py-8 lg:py-12">
      <Container>
        <Reveal>
          <h2 className="mb-12 text-center text-dt-h2 font-dt-heading font-bold text-dt-navy">
            Детальне порівняння планів
          </h2>
        </Reveal>
        <div className="overflow-x-auto">
          <table className="mx-auto w-full max-w-5xl">
            <thead>
              <tr className="border-b border-dt-navy/10">
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
                <tr key={row} className="border-b border-dt-navy/10">
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
    </section>
  );
}
