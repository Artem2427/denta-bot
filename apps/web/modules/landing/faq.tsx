import { getTranslations } from 'next-intl/server';

import { Container } from '@/shared/components/container';
import {
  PremiumAccordion,
  PremiumAccordionContent,
  PremiumAccordionItem,
  PremiumAccordionTrigger,
} from '@/shared/components/premium-accordion';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

type FaqItem = { question: string; answer: string };

// Server Component (getTranslations) — the single consolidated FAQ for the
// landing page. Sources its 5 questions exclusively from messages.faq
// (design file's canonical faq array), NOT from either pre-existing
// modules/prices/faq-accordion.tsx (7 questions) or
// modules/contacts/faq-accordion.tsx (8 questions) — both stay untouched
// here and get removed once their pages retire (RESEARCH Pitfall 5).
export async function Faq(): Promise<React.JSX.Element> {
  const t = await getTranslations('faq');
  const items = t.raw('items') as FaqItem[];

  return (
    <Section id="faq" className="scroll-mt-16 lg:scroll-mt-20" tone="muted">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
          <Reveal>
            <SectionHeading title={t('title')} className="mb-0" />
          </Reveal>
          <PremiumAccordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => (
              <PremiumAccordionItem key={item.question} value={`item-${index}`}>
                <PremiumAccordionTrigger>{item.question}</PremiumAccordionTrigger>
                <PremiumAccordionContent>{item.answer}</PremiumAccordionContent>
              </PremiumAccordionItem>
            ))}
          </PremiumAccordion>
        </div>
      </Container>
    </Section>
  );
}
