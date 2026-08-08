import * as React from 'react';

import { cn } from '@/shared/lib/cn';

export function PremiumCard({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="premium-card"
      className={cn(
        'rounded-dt-card border border-dt-navy/10 bg-dt-warm-white p-6 shadow-[var(--shadow-dt-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-dt-hover)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
