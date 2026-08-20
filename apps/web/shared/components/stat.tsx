import { cn } from '@/shared/lib/cn';
import * as React from 'react';

import { Eyebrow } from './eyebrow';

function Stat({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div data-slot="stat" className={cn('space-y-1', className)}>
      <div className="text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.1] tracking-[-0.03em] font-dt-heading font-bold text-dt-teal tabular-nums">
        {value}
      </div>
      <Eyebrow tone="navy" className="mt-1 block">
        {label}
      </Eyebrow>
    </div>
  );
}

export { Stat };
