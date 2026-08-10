import { CtaBanner } from '@/modules/home/cta-banner';
import { Features } from '@/modules/home/features';
import { Hero } from '@/modules/home/hero';
import { Problem } from '@/modules/home/problem';
import { Solution } from '@/modules/home/solution';
import { Testimonials } from '@/modules/home/testimonials';
import { UnifiedSource } from '@/modules/home/unified-source';

export default function Home(): React.JSX.Element {
  return (
    <div>
      <Hero />
      <Problem />
      <Solution />
      <UnifiedSource />
      <Features />
      <CtaBanner />
      <Testimonials />
    </div>
  );
}
