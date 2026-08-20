import { cn } from '@/shared/lib/cn';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const eyebrowVariants = cva('uppercase text-dt-eyebrow font-dt-mono', {
  variants: {
    tone: {
      navy: 'text-dt-navy',
      'on-navy': 'text-dt-coral',
    },
  },
  defaultVariants: {
    tone: 'navy',
  },
});

function Eyebrow({
  className,
  tone,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof eyebrowVariants>) {
  return (
    <span
      data-slot="eyebrow"
      className={cn(eyebrowVariants({ tone, className }))}
      {...props}
    />
  );
}

export { Eyebrow, eyebrowVariants };
