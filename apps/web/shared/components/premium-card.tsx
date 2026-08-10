import * as React from 'react';

import { cn } from '@/shared/lib/cn';

export function PremiumCard({
  className,
  children,
  highlighted,
  ...props
}: React.ComponentProps<'div'> & { highlighted?: boolean }) {
  return (
    <div
      data-slot="premium-card"
      className={cn(
        'h-full rounded-dt-card border border-dt-navy/10 bg-dt-warm-white p-6 shadow-[var(--shadow-dt-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-dt-hover)]',
        highlighted && 'border-2 border-dt-teal relative',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
