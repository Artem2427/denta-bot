import * as React from 'react';

import { cn } from '@/shared/lib/cn';

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
      <div className="text-dt-h2 font-dt-heading font-bold text-dt-teal tabular-nums">
        {value}
      </div>
      <Eyebrow tone="navy" className="mt-1 block">
        {label}
      </Eyebrow>
    </div>
  );
}

export { Stat };
