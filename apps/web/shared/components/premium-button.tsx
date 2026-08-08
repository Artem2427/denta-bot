import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/shared/lib/cn';

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-dt-card text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-dt-navy focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        coral: 'bg-dt-coral text-dt-navy hover:bg-dt-coral/90 hover:-translate-y-0.5',
        outline:
          'border border-dt-navy text-dt-navy bg-transparent hover:bg-dt-navy/5 hover:-translate-y-0.5',
        ghost: 'text-dt-navy hover:bg-dt-navy/5',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'coral',
      size: 'default',
    },
  },
);

function PremiumButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof premiumButtonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="premium-button"
      className={cn(premiumButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { PremiumButton, premiumButtonVariants };
