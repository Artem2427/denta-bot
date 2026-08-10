import * as React from 'react';

import { PricingCards } from '@/modules/prices/pricing-cards';

export default function Prices(): React.JSX.Element {
  return (
    <div className="min-h-screen pb-16 pt-24 lg:pt-32">
      <PricingCards />
    </div>
  );
}
