import * as React from 'react';

import { cn } from '@/shared/lib/cn';

export function Container({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="container"
      className={cn('mx-auto w-full max-w-[var(--dt-container-max)] px-4 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  );
}
