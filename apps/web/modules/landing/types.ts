// Canonical location for PricingPlan going forward (copied verbatim from
// modules/prices/types.ts, Plan 06.2-06). modules/prices/types.ts is
// deleted in Plan 07 once nothing imports it anymore.
export type PricingPlan = {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: string[];
  isPopular: boolean;
};
