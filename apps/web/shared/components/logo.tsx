import { routes } from '@/shared/lib/routes';
import { ChatCircleDots } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

export function Logo(): React.JSX.Element {
  return (
    <Link href={routes.home} className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-dt-card bg-dt-navy">
        <span className="text-2xl">🦷</span>
      </div>
      <span className="font-dt-heading text-xl font-bold text-dt-navy">
        DentaBot
      </span>
    </Link>
  );
}
