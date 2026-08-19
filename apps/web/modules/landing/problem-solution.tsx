'use client';

import { CheckIcon } from '@phosphor-icons/react/ssr';
import { useTranslations } from 'next-intl';

import { Container } from '@/shared/components/container';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

export function ProblemSolution(): React.JSX.Element {
  const t = useTranslations('problemSolution');
  const before = t.raw('before') as string[];
  const after = t.raw('after') as string[];

  return (
    <Section id="product" tone="navy" className="scroll-mt-16 lg:scroll-mt-20">
      <Container>
        <Reveal>
          <SectionHeading
            tone="navy"
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-dt-card border border-white/10 bg-white/5 p-8">
            <div className="font-dt-mono text-xs text-dt-warm-white/45 uppercase tracking-wide">
              {t('beforeLabel')}
            </div>
            <div className="mt-5 space-y-4">
              {before.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2.5 h-[2px] w-4 shrink-0 bg-dt-coral" />
                  <span className="leading-[1.45] text-dt-warm-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-dt-card bg-dt-warm-white p-8 text-dt-graphite shadow-[var(--shadow-dt-hover)]">
            <div className="font-dt-mono text-xs text-dt-teal uppercase tracking-wide">
              {t('afterLabel')}
            </div>
            <div className="mt-5 space-y-4">
              {after.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-dt-teal/10 text-dt-teal">
                    <CheckIcon weight="bold" className="h-3 w-3" />
                  </span>
                  <span className="leading-[1.45]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
