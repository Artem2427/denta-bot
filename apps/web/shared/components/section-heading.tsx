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
    // Left-aligned by default — matches the design reference (every
    // section heading in DentaBot Landing.dc.html sits at the left edge
    // of its container, several paired with a right-side element like a
    // "Подивитись демо" link or the billing toggle). The previous
    // hardcoded text-center made every section heading site-wide look
    // generic/centered instead of this editorial left-aligned style —
    // client-reported ("виглядає тупо" vs. the reference screenshots).
    <div data-slot="section-heading" className={cn('mb-dt-48', className)}>
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
            'mt-4 max-w-2xl text-dt-body text-pretty',
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
