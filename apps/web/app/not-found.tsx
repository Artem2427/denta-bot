import { House } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

import { PremiumButton } from '@/shared/components/premium-button';
import { routes } from '@/shared/lib/routes';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="text-8xl font-bold text-dt-navy">404</div>
        <h1 className="text-3xl font-bold">Сторінку не знайдено</h1>
        <p className="text-dt-graphite">
          Вибачте, сторінка яку ви шукаєте не існує або була переміщена.
        </p>
        <PremiumButton variant="coral" size="lg" asChild>
          <Link href={routes.home}>
            <House weight="regular" className="mr-2 h-5 w-5" />
            На головну
          </Link>
        </PremiumButton>
      </div>
    </div>
  );
}
