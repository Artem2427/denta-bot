import { cn } from '@/shared/lib/cn';
import { CaretDown } from '@phosphor-icons/react/ssr';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import * as React from 'react';

function PremiumAccordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="premium-accordion" {...props} />;
}

function PremiumAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="premium-accordion-item"
      className={cn(
        'rounded-dt-card border border-[var(--dt-border)] bg-dt-warm-white px-6',
        className,
      )}
      {...props}
    />
  );
}

function PremiumAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="premium-accordion-trigger"
        className={cn(
          'flex flex-1 items-center justify-between gap-4 py-4 text-left font-dt-heading font-semibold text-dt-navy [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <CaretDown className="h-5 w-5 shrink-0 text-dt-navy transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function PremiumAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="premium-accordion-content"
      className="overflow-hidden text-dt-graphite data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

// prettier-ignore
export { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent };
