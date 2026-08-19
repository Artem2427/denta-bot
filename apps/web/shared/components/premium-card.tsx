import { cn } from '@/shared/lib/cn';
import * as React from 'react';

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
        'h-full rounded-dt-card border border-[var(--dt-border)] bg-dt-warm-white p-6 shadow-[var(--shadow-dt-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-dt-hover)]',
        highlighted &&
          'relative border-dt-navy bg-dt-navy text-dt-warm-white shadow-[var(--shadow-dt-hover)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
