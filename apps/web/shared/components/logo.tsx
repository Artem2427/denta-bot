import { cn } from '@/shared/lib/cn';
import { routes } from '@/shared/lib/routes';
import Link from 'next/link';

// `variant="inverted"` is for placement on a bg-dt-navy surface (the
// Footer) — the default navy mark badge would be invisible against a
// navy background, so it swaps to a teal badge + warm-white wordmark.
// Same icon/mark as the header in both cases, per client request.
export function Logo({
  variant = 'default',
}: {
  variant?: 'default' | 'inverted';
}): React.JSX.Element {
  return (
    <Link href={routes.home} className="flex items-center gap-2">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-dt-card',
          variant === 'inverted' ? 'bg-dt-teal' : 'bg-dt-navy',
        )}
      >
        <span className="text-2xl">🦷</span>
      </div>
      <span
        className={cn(
          'font-dt-heading text-xl font-bold',
          variant === 'inverted' ? 'text-dt-warm-white' : 'text-dt-navy',
        )}
      >
        DentaBot
      </span>
    </Link>
  );
}
