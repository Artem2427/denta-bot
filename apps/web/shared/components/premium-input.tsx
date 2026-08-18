import { cn } from '@/shared/lib/cn';
import * as React from 'react';

function PremiumInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="premium-input"
      className={cn(
        'flex h-11 w-full rounded-dt-input border border-dt-navy/20 bg-dt-warm-white px-3 py-2 text-sm text-dt-navy placeholder:text-dt-graphite/50 outline-none transition-colors focus-visible:border-dt-navy focus-visible:ring-2 focus-visible:ring-[var(--dt-ring)]/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { PremiumInput };
