import * as React from 'react';

import { cn } from '@/shared/lib/cn';

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
    <div data-slot="section-heading" className={cn('mb-dt-48 text-center', className)}>
      {eyebrow ? (
        <Eyebrow tone={isNavy ? 'on-navy' : 'navy'} className="mb-2 block">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={cn(
          'text-dt-h2 font-dt-heading font-bold text-balance',
          isNavy ? 'text-dt-warm-white' : 'text-dt-navy',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mx-auto mt-4 max-w-2xl text-dt-body text-pretty',
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
