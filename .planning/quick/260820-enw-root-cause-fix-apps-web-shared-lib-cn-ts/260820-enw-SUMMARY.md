---
type: quick
slug: 260820-enw-root-cause-fix-apps-web-shared-lib-cn-ts
status: complete
subsystem: apps/web
tags: [tailwind-merge, styling, bugfix, root-cause]
dependency-graph:
  requires: []
  provides:
    - "Correct tailwind-merge font-size classGroup registration for text-dt-* tokens"
  affects:
    - "Every apps/web component that builds classNames via cn() and combines a text-dt-{size} token with a text-dt-{color} token"
tech-stack:
  added: []
  patterns:
    - "extendTailwindMerge({ extend: { classGroups: { 'font-size': [...] } } }) to register custom design tokens into tailwind-merge's built-in class groups instead of letting them fall into an ambiguous implicit group"
key-files:
  created: []
  modified:
    - apps/web/shared/lib/cn.ts
decisions: []
metrics:
  duration: ~15min
  completed: 2026-08-20
---

# Quick Task 260820-enw: Root-Cause Fix — apps/web/shared/lib/cn.ts Summary

Fixed a sitewide, root-cause styling bug where `tailwind-merge`'s default class-group matcher silently dropped every custom `text-dt-{h1,h2,h3,body,caption,eyebrow}` font-size class whenever a `cn(...)` call also included a `text-dt-{navy,warm-white,coral,graphite}` color class — because both families were bucketed into the same implicit conflict group and only the last one survived.

## What Changed

`apps/web/shared/lib/cn.ts` now builds its `twMerge` instance via `extendTailwindMerge({ extend: { classGroups: { 'font-size': [...] } } })`, registering the six `text-dt-*` size tokens into tailwind-merge's own built-in `'font-size'` class group (using `extend`, not `override`, so Tailwind's native `text-xl`/`text-lg`/etc. keep working unmodified and now correctly conflict-resolve against the `dt-` tokens too). No component file was touched — every component's JSX already carried the correct classes; they were only ever victims of `cn.ts` silently stripping them at runtime.

```ts
import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-dt-h1',
        'text-dt-h2',
        'text-dt-h3',
        'text-dt-body',
        'text-dt-caption',
        'text-dt-eyebrow',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Task 1 Verification (isolated, against the real file)

Ran directly against `apps/web/shared/lib/cn.ts`:

| Call | Before (documented in plan context) | After (this fix) |
|---|---|---|
| `cn('text-dt-h2','text-dt-navy')` | `'text-dt-navy'` (size class dropped) | `'text-dt-h2 text-dt-navy'` (both survive) |
| `cn('text-dt-h2','text-dt-h1')` | `'text-dt-h1'` | `'text-dt-h1'` (same-group conflict resolution intact) |
| `cn('text-xl','text-lg')` | `'text-lg'` | `'text-lg'` (native conflict resolution intact) |
| `cn('text-xl','text-dt-h2')` | co-existed without real conflict (bug) | `'text-dt-h2'` (native and custom tokens now genuinely share one conflict group) |
| `cn('text-dt-eyebrow','text-dt-coral')` | `'text-dt-coral'` (size class dropped) | `'text-dt-eyebrow text-dt-coral'` (both survive) |

`prettier --check` and `eslint --max-warnings 0` both passed on the file in isolation.

## Task 2 Verification (live, against the running dev server)

A dev server was already running on `http://localhost:3000` from earlier in this session (PID pre-existing) — reused rather than starting a new one, and left running as found (not started/stopped by this task).

Confirmed via `curl http://localhost:3000/en` after HMR picked up the `cn.ts` change:

**`SectionHeading`'s rendered `<h2>` elements** — before this fix (documented in plan context, empirically confirmed pre-fix): `class="font-dt-heading font-extrabold text-balance text-dt-navy"` (missing `text-dt-h2`). After this fix, live on the running dev server:
```
<h2 class="text-dt-h2 font-dt-heading font-extrabold text-balance text-dt-warm-white" ...>
<h2 class="text-dt-h2 font-dt-heading font-extrabold text-balance text-dt-navy" ...>
```
(multiple `<h2>` instances checked across the `/en` page; all retained `text-dt-h2` alongside their color class)

**`Eyebrow`'s rendered `<span data-slot="eyebrow">` elements** — before this fix (documented in plan context, empirically confirmed pre-fix): `class="uppercase font-dt-mono text-dt-navy mt-1 block"` (missing `text-dt-eyebrow`). After this fix, live on the running dev server:
```
<span data-slot="eyebrow" class="uppercase text-dt-eyebrow font-dt-mono text-dt-navy mt-1 block">
<span data-slot="eyebrow" class="uppercase text-dt-eyebrow font-dt-mono text-dt-coral mb-2 block">
```
(multiple `<span data-slot="eyebrow">` instances checked across the `/en` page; all retained `text-dt-eyebrow` alongside their color class)

Both checks passed on the first retry-loop iteration once the dev server's Turbopack HMR recompiled `cn.ts`.

## Deviations from Plan

None — plan executed exactly as written. Dev server was already running (reused per task instructions), so no server was started or needed stopping by this task.

## Files Modified

- `apps/web/shared/lib/cn.ts` — sole file changed, per plan's `files_modified` scope

## Commits

- `0d44f03` — fix(260820-enw): register dt- font-size tokens into tailwind-merge's font-size classGroup

## Self-Check: PASSED

- `apps/web/shared/lib/cn.ts` — FOUND, matches confirmed content exactly
- Commit `0d44f03` — FOUND in `git log`
- `git status --short apps/web/shared/lib/cn.ts` — clean (no uncommitted changes to this file)
- No component file (`section-heading.tsx`, `eyebrow.tsx`, `hero.tsx`, `features.tsx`) was staged or modified by this task
