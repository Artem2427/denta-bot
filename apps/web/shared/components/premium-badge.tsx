import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/shared/lib/cn';

const premiumBadgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        teal: 'bg-dt-teal/10 text-dt-teal',
        coral: 'bg-dt-coral text-dt-navy',
        navy: 'bg-dt-navy text-dt-warm-white',
        outline: 'border border-dt-navy/20 text-dt-navy',
      },
    },
    defaultVariants: {
      variant: 'teal',
    },
  },
);

function PremiumBadge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof premiumBadgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="premium-badge"
      className={cn(premiumBadgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { PremiumBadge, premiumBadgeVariants };
