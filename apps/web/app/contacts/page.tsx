import { ContactForm } from '@/modules/contacts/contact-form';
import { ContactInfo } from '@/modules/contacts/contact-info';
import { FaqAccordion } from '@/modules/contacts/faq-accordion';
import { Container } from '@/shared/components/container';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

export default function Contacts(): React.JSX.Element {
  return (
    <div>
      <Section className="pb-12 pt-24 lg:pb-16 lg:pt-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">
              Зв&apos;яжіться з нами
            </h1>
            <p className="mt-4 text-dt-body text-dt-graphite">
              Відповімо протягом 2 годин у робочий час. Або напишіть нам у
              Telegram — там швидше.
            </p>
          </div>
        </Container>
      </Section>
      <Section className="pb-8 lg:pb-12">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            <ContactForm />
            <ContactInfo />
          </div>
        </Container>
      </Section>
      <Section tone="muted">
        <Container>
          <Reveal>
            <SectionHeading title="Часті питання" />
          </Reveal>
          <div className="mx-auto max-w-3xl">
            <FaqAccordion />
          </div>
        </Container>
      </Section>
    </div>
  );
}
