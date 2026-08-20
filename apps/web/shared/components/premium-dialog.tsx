'use client';

import { cn } from '@/shared/lib/cn';
import { X } from '@phosphor-icons/react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import * as React from 'react';

import { PremiumButton } from './premium-button';

const PremiumDialog = DialogPrimitive.Root;
const PremiumDialogTrigger = DialogPrimitive.Trigger;

function PremiumDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        'text-[1.5rem] leading-[1.15] font-dt-heading font-semibold text-dt-navy',
        className,
      )}
      {...props}
    />
  );
}

function PremiumDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-dt-navy/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-dt-card border border-[var(--dt-border)] bg-dt-warm-white p-6 shadow-[var(--shadow-dt-hover)] sm:p-8 max-h-[90vh] overflow-y-auto',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <PremiumButton
            variant="ghost"
            size="icon"
            aria-label="Закрити"
            className="absolute top-4 right-4"
          >
            <X weight="regular" className="h-5 w-5" />
          </PremiumButton>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export {
  PremiumDialog,
  PremiumDialogTrigger,
  PremiumDialogTitle,
  PremiumDialogContent,
};
