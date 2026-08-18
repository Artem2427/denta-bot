import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/lib/cn';

const sectionVariants = cva(
  'py-[clamp(var(--spacing-dt-64),8vw,var(--dt-section-y))]',
  {
    variants: {
      tone: {
        'warm-white': 'bg-dt-warm-white',
        navy: 'bg-dt-navy',
        muted: 'bg-dt-navy/5',
      },
    },
    defaultVariants: {
      tone: 'warm-white',
    },
  },
);

function Section({
  className,
  tone,
  ...props
}: React.ComponentProps<'section'> & VariantProps<typeof sectionVariants>) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ tone, className }))}
      {...props}
    />
  );
}

export { Section, sectionVariants };
