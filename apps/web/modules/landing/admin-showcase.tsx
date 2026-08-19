import { getTranslations } from 'next-intl/server';

import { DemoTabs } from '@/modules/demo/demo-tabs';
import { Container } from '@/shared/components/container';
import { Reveal } from '@/shared/components/reveal';
import { Section } from '@/shared/components/section';
import { SectionHeading } from '@/shared/components/section-heading';

// Server Component (getTranslations) at the top level — the interactivity
// lives entirely inside the already-`'use client'` <DemoTabs />, reused
// wholesale here per CONTEXT.md's "keep the interactive simulation" lean.
// The `@repo/ui`-vs-`dt-*` visual seam this introduces is a deliberate,
// accepted tradeoff (RESEARCH Pitfall 2 / Open Question 3) — DemoTabs'
// internals are intentionally not re-themed.
export async function AdminShowcase(): Promise<React.JSX.Element> {
  const t = await getTranslations('adminShowcase');

  return (
    <Section id="demo" tone="warm-white" className="scroll-mt-16 lg:scroll-mt-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </Reveal>
        <div className="overflow-hidden rounded-dt-card border border-[var(--dt-border)] shadow-[var(--shadow-dt-hover)]">
          <div className="flex items-center gap-2 border-b border-[var(--dt-border)] bg-dt-navy/[0.03] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-dt-coral" />
            <span className="h-2.5 w-2.5 rounded-full bg-dt-amber" />
            <span className="h-2.5 w-2.5 rounded-full bg-dt-sage" />
            <span className="ml-3 rounded bg-dt-warm-white px-3 py-1 font-dt-mono text-xs text-dt-graphite/60">
              {t('urlLabel')}
            </span>
          </div>
          <div className="bg-dt-warm-white p-6 lg:p-8">
            <DemoTabs />
          </div>
        </div>
      </Container>
    </Section>
  );
}
