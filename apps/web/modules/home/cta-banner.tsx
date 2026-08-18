import Link from 'next/link';

import { Container } from '@/shared/components/container';
import { PremiumButton } from '@/shared/components/premium-button';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';
import { routes } from '@/shared/lib/routes';

export function CtaBanner(): React.JSX.Element {
  return (
    <Section tone="navy">
      <Container>
        <Reveal>
          <SectionHeading
            tone="navy"
            title="Спробуйте як це працює прямо зараз"
            description="Живий демо бот. Без реєстрації. Займає 2 хвилини."
          />
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
        </Reveal>
      </Container>
    </Section>
  );
}
