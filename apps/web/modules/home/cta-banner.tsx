import Link from 'next/link';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { Reveal } from '@/shared/components/reveal';
import { routes } from '@/shared/lib/routes';

export function CtaBanner(): React.JSX.Element {
  return (
    <section className="bg-dt-navy py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h2 className="text-dt-h2 font-dt-heading font-bold text-dt-warm-white">
              Спробуйте як це працює прямо зараз
            </h2>
            <p className="text-dt-body text-dt-warm-white/80">
              Живий демо бот. Без реєстрації. Займає 2 хвилини.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <PremiumButton variant="coral" size="lg" asChild>
                <Link href={routes.demo}>Відкрити демо бот</Link>
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="lg"
                asChild
                className="border-dt-warm-white text-dt-warm-white hover:bg-dt-warm-white hover:text-dt-navy"
              >
                <Link href={routes.demo}>Переглянути адмін панель</Link>
              </PremiumButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
