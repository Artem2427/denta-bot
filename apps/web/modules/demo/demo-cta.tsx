'use client';

import {
  PremiumDialog,
  PremiumDialogContent,
  PremiumDialogTrigger,
} from '@/shared/components/premium-dialog';
import { PremiumButton } from '@/shared/components/premium-button';
import * as React from 'react';

import { DemoLeadForm } from './demo-lead-form';

// Uncontrolled — no local `open` state needed. Radix's default open/close
// (Trigger/Close/ESC/overlay-click) is sufficient, and unmounting on close
// naturally resets DemoLeadForm's internal isSubmitted state on reopen.
export function DemoCta(): React.JSX.Element {
  return (
    <PremiumDialog>
      <PremiumDialogTrigger asChild>
        <PremiumButton variant="coral">Замовити демо</PremiumButton>
      </PremiumDialogTrigger>
      <PremiumDialogContent>
        <DemoLeadForm />
      </PremiumDialogContent>
    </PremiumDialog>
  );
}
