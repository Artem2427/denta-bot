import * as React from 'react';

import { Container } from '@/shared/components/container';
import { DemoTabs } from '@/modules/demo/demo-tabs';

export default function Demo(): React.JSX.Element {
  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <section className="pb-12">
        <Container>
          <div className="mb-8 text-center">
            <span className="dt-caption mb-4 inline-block rounded-full bg-dt-coral/10 px-3 py-1 text-dt-coral">
              DEMO MODE
            </span>
            <h1 className="mb-4 text-dt-h1 font-dt-heading font-bold text-dt-navy">
              Живе демо — спробуйте DentaBot прямо зараз
            </h1>
            <p className="mx-auto max-w-3xl text-dt-body text-dt-graphite">
              Це тестове середовище клініки &quot;Посмішка&quot;. Всі дані
              фейкові. Реєстрація не потрібна.
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <DemoTabs />
        </Container>
      </section>
    </div>
  );
}
