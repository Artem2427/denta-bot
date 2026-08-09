import * as React from 'react';

import { cn } from '@/shared/lib/cn';

function PremiumTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="premium-textarea"
      className={cn(
        'flex min-h-[120px] w-full resize-y rounded-dt-input border border-dt-navy/20 bg-dt-warm-white px-3 py-2 text-sm text-dt-navy placeholder:text-dt-graphite/50 outline-none transition-colors focus-visible:border-dt-navy focus-visible:ring-2 focus-visible:ring-dt-navy/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { PremiumTextarea };
