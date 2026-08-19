import { AdminShowcase } from '@/modules/landing/admin-showcase';
import { ChannelMarquee } from '@/modules/landing/channel-marquee';
import { Faq } from '@/modules/landing/faq';
import { Features } from '@/modules/landing/features';
import { Hero } from '@/modules/landing/hero';
import { HowItWorks } from '@/modules/landing/how-it-works';
import { LeadSection } from '@/modules/landing/lead-section';
import { PricingSection } from '@/modules/landing/pricing-section';
import { ProblemSolution } from '@/modules/landing/problem-solution';
import { Reviews } from '@/modules/landing/reviews';
import type { PricingPlan } from '@/modules/landing/types';
import { getServerApiUrl } from '@/shared/lib/api-url';

// Full single-page landing composition (D-01). Pricing data is fetched
// here — same GET /public/pricing-plans + revalidate:60 pattern the old
// app/prices/page.tsx used — and passed down into <PricingSection />. An
// empty `plans` array is NOT a reason to hide the rest of the landing page
// (unlike the old dedicated-page empty-state branch): it renders through as
// a Plan-02-reseed-failure signal instead, since Plan 02 already guarantees
// 3 published rows exist under normal operation. A fetch/backend failure
// must not take down the whole consolidated page (CR-01) — Hero, Header,
// Footer, and every other section now share this render pass, so a
// transient pricing-API blip degrades to an empty pricing section instead
// of a full-site outage.
export default async function LandingPage(): Promise<React.JSX.Element> {
  let plans: PricingPlan[] = [];
  try {
    const res = await fetch(`${getServerApiUrl()}/public/pricing-plans`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      plans = (await res.json()) as PricingPlan[];
    }
  } catch {
    // network/backend failure — render the rest of the landing page with an
    // empty pricing section rather than throwing and crashing the page.
  }

  return (
    <div>
      <Hero />
      <ChannelMarquee />
      <ProblemSolution />
      <HowItWorks />
      <AdminShowcase />
      <Features />
      <PricingSection plans={plans} />
      <Reviews />
      <LeadSection />
      <Faq />
    </div>
  );
}
