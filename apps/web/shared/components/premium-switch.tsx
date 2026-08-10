import { cn } from '@/shared/lib/cn';
import { Switch as SwitchPrimitive } from 'radix-ui';
import * as React from 'react';

function PremiumSwitch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="premium-switch"
      className={cn(
        'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-2 focus-visible:ring-dt-navy disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-dt-teal data-[state=unchecked]:bg-dt-navy/20',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="premium-switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-dt-warm-white ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { PremiumSwitch };
