import * as React from 'react';

import { cn } from '@/shared/lib/cn';

export function SignatureMark({
  className,
  pulse = false,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-1.5 rounded-full bg-dt-coral',
        pulse && 'motion-safe:animate-pulse',
        className
      )}
    />
  );
}
