import { ChatCircleDots } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

import { routes } from '@/shared/lib/routes';

export function Logo(): React.JSX.Element {
  return (
    <Link href={routes.home} className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-dt-card bg-dt-navy">
        <ChatCircleDots weight="regular" className="h-5 w-5 text-dt-warm-white" />
      </div>
      <span className="font-dt-heading text-xl font-bold text-dt-navy">
        DentaBot
      </span>
    </Link>
  );
}
