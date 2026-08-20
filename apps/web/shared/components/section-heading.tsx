import { cn } from '@/shared/lib/cn';
import * as React from 'react';

import { Eyebrow } from './eyebrow';

type SectionHeadingTone = 'warm-white' | 'navy';

function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'warm-white',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: SectionHeadingTone;
  className?: string;
}) {
  const isNavy = tone === 'navy';

  return (
    <div data-slot="section-heading" className={cn('mb-dt-48', className)}>
      {eyebrow ? (
        <Eyebrow tone={isNavy ? 'on-navy' : 'navy'} className="mb-2 block">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={cn(
          'text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.1] tracking-[-0.03em] font-dt-heading font-extrabold text-balance',
          isNavy ? 'text-dt-warm-white' : 'text-dt-navy',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 max-w-2xl text-[1rem] leading-[1.5] text-pretty',
            isNavy ? 'text-dt-warm-white/80' : 'text-dt-graphite',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { SectionHeading };
