# Deferred Items — Phase 01

Out-of-scope issues discovered during execution. Not fixed per the Scope Boundary rule (pre-existing, unrelated to the current task's changes).

## From Plan 01-01

1. **`pnpm --filter ui check-types` fails** — pre-existing `csstype` version-resolution mismatch (`csstype@3.1.3` vs `csstype@3.2.3` both present in the pnpm dependency graph) causes `CSSProperties`/`alignmentBaseline` type errors in `calendar.tsx`, `sonner.tsx`, and `spinner.tsx`. Confirmed pre-existing: the errors reference `style` props unrelated to this plan's changes (the `'use client'` directive added to `sonner.tsx` cannot affect this), and identical errors appear in `calendar.tsx`/`spinner.tsx`, neither of which was touched this plan. Root cause is a lockfile/dependency-resolution issue, not application code — fixing it would require touching `pnpm-lock.yaml` dependency resolution, out of scope for a theme-token plan.
2. **`pnpm --filter ui lint` fails with 4 warnings** — pre-existing `react/prop-types` warnings in `calendar.tsx` (lines 135, 145) for `className`/`rootRef`/`orientation` props missing prop-type validation. `calendar.tsx` was not touched by this plan.

Both were present before this plan's commits and are unrelated to `theme.css` or `sonner.tsx`'s `'use client'` fix.
