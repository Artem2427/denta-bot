import { Loader2Icon } from 'lucide-react';

import { cn } from '../../lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      // Cast at the boundary: the monorepo currently resolves more than one
      // @types/react copy (a pre-existing peer-dependency hoisting artifact
      // across apps pinning different react ranges), which makes structural
      // ref-type checking between this file's React types and lucide-react's
      // reject as "different but unrelated" even though they're compatible
      // at runtime. Scoped to this one spread, not a workspace-wide opt-out.
      {...(props as React.ComponentProps<typeof Loader2Icon>)}
    />
  );
}

export { Spinner };
