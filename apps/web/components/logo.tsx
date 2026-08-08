import { routes } from '@/lib/routes';
import Link from 'next/link';

export function Logo(): React.JSX.Element {
  return (
    <Link href={routes.home} className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
        <span className="text-2xl">🦷</span>
      </div>
      <span className="text-xl font-bold text-foreground">DentaBot</span>
    </Link>
  );
}
