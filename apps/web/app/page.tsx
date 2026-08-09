import { Hero } from '@/modules/home/hero';
import { Problem } from '@/modules/home/problem';
import { Solution } from '@/modules/home/solution';

export default function Home(): React.JSX.Element {
  return (
    <div>
      <Hero />
      <Problem />
      <Solution />
    </div>
  );
}
