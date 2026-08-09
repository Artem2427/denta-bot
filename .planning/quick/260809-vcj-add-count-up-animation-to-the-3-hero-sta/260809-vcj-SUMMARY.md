---
phase: quick-260809-vcj
plan: 260809-vcj
subsystem: ui
tags: [react, nextjs, apps-web, motion, animation]

# Dependency graph
requires:
  - phase: 01.1-premium-design-system
    provides: dt-* premium design tokens and motion/react-based motion primitives (Reveal, idle bounce) used by Home hero
provides:
  - Standalone, reusable useCountUp(target, durationMs) hook independent of admin-tab.tsx's private implementation
  - Home hero's 3 stats now animate count-up from 0 to target on mount, respecting prefers-reduced-motion
affects: [02-home-contacts-demo]

# Actuals (#2632)
actuals:
  tokens: 895
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone RAF-based count-up hook (apps/web/shared/hooks/use-count-up.ts) mirroring admin-tab.tsx's private useCountUp pattern, but exported and using motion/react's useReducedMotion for accessibility"

key-files:
  created:
    - apps/web/shared/hooks/use-count-up.ts
  modified:
    - apps/web/modules/home/hero.tsx

key-decisions:
  - "Copied admin-tab.tsx's RAF tick/cleanup pattern into a new standalone hook rather than exporting/reusing admin-tab.tsx's private useCountUp, per the plan's explicit architectural split between the marketing site's bespoke design system and the @repo/ui-based admin-simulation surface"
  - "useCountUp short-circuits to the target value with zero scheduled RAF frames when useReducedMotion() is true, checked inside the effect before any requestAnimationFrame call"
  - "formatStatNumber reconstructs the exact prior static strings ('500+', '15 000+', '98%') from the live animated integer via a digit-grouping regex for the thousands separator, so no visual regression at animation end"

patterns-established:
  - "Reusable animation hooks live in apps/web/shared/hooks/, independent of any single page/module, following the existing use-in-view.ts convention ('use client' directive, useEffect/useState from react)"

requirements-completed: []

coverage:
  - id: D1
    description: "New standalone useCountUp(target, durationMs) hook exists at apps/web/shared/hooks/use-count-up.ts, using the RAF tick/cleanup pattern and useReducedMotion() short-circuit, independent of admin-tab.tsx"
    verification:
      - kind: other
        ref: "grep checks for 'use client', export function useCountUp, useReducedMotion, requestAnimationFrame, cancelAnimationFrame (see plan Task 1 verify block); pnpm --filter web lint; pnpm --filter web check-types (csstype-filtered)"
        status: pass
    human_judgment: false
  - id: D2
    description: "hero.tsx's 3 stats render via a HeroStat subcomponent calling useCountUp(stat.target, 1800), formatting the live count via formatStatNumber to land on '500+', '15 000+', '98%' exactly as before"
    verification:
      - kind: other
        ref: "grep checks for useCountUp usage, target: 500/15000/98, thousands: true, function HeroStat, function formatStatNumber (see plan Task 2 verify block); pnpm --filter web lint; pnpm --filter web check-types (csstype-filtered)"
        status: pass
    human_judgment: true
    rationale: "The plan's own verification section flags a human visual check on / confirming the stats visibly count up on first load and land exactly on prior text, plus confirming reduced-motion shows instant final values, as worthwhile but non-blocking — best judged by eye in a browser rather than grep."

duration: 10min
completed: 2026-08-09
status: complete
---

# Quick Task 260809-vcj: Add Count-Up Animation to the 3 Hero Stats Summary

**New standalone `useCountUp` RAF hook drives a count-up animation (0 → 500+/15 000+/98%) on Home's 3 hero stats over 1.8s on mount, respecting `prefers-reduced-motion`, without touching `admin-tab.tsx`'s private implementation.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-08-09T19:40:00Z
- **Completed:** 2026-08-09T19:50:00Z
- **Tasks:** 2 completed
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments
- Created a new, standalone, exported `useCountUp(target, durationMs)` hook at `apps/web/shared/hooks/use-count-up.ts`, mirroring `admin-tab.tsx`'s RAF tick/cleanup implementation but independent of it, and short-circuiting to the target value with zero scheduled frames when `useReducedMotion()` is true
- Wired the hook into Home's `hero.tsx` via a new `HeroStat` subcomponent, converting the `stats` array from static string values to `{ target, suffix, label, thousands? }` shape and adding a `formatStatNumber` helper that reconstructs the exact prior display strings (`'500+'`, `'15 000+'`, `'98%'`) from the live animated integer
- Confirmed no scope creep: only the two plan-scoped files changed; `admin-tab.tsx` and its private `useCountUp` are untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: Create standalone useCountUp hook** - `713d8b1` (feat)
2. **Task 2: Wire animated stats into hero.tsx** - `cb675cd` (feat)

_Docs/metadata commit (SUMMARY.md, STATE.md, ROADMAP.md) is created by the orchestrator, not this executor, per this quick task's constraints._

## Files Created/Modified
- `apps/web/shared/hooks/use-count-up.ts` (new) - Standalone `useCountUp(target, durationMs)` hook: RAF-driven count-up with `useReducedMotion()`-gated instant short-circuit
- `apps/web/modules/home/hero.tsx` - `stats` array converted to `{ target, suffix, label, thousands? }`; new `formatStatNumber` helper and `HeroStat` subcomponent; stats grid now maps to `<HeroStat>` instead of inline static text

## Decisions Made
- Copied (rather than imported/exported) `admin-tab.tsx`'s RAF pattern into the new hook, preserving the Phase 01.1 architectural boundary between the marketing site's bespoke system and the `@repo/ui`-based admin-simulation surface
- Used a digit-grouping regex (`\B(?=(\d{3})+(?!\d))`) in `formatStatNumber` to reproduce the existing space thousand-separator style (`'15 000+'`) exactly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Worktree had no `node_modules` installed (fresh worktree checkout); ran `pnpm install` at the repo root to hydrate dependencies before lint/check-types could run. Not a plan deviation — standard worktree setup, no lockfile or package.json changes.
- `pnpm --filter web check-types` reports the same pre-existing csstype errors in `button-group.tsx`, `calendar.tsx`, and `sidebar.tsx` the plan anticipated and explicitly excluded from the gate; no new type errors introduced by this task's changes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Home hero stats now have first-load motion polish consistent with the rest of the premium design system
- Non-blocking follow-up recommended by the plan: a human visual check on `/` confirming the count-up animates correctly and that toggling OS-level "reduce motion" shows instant final values with no animation

---
*Phase: quick-260809-vcj*
*Completed: 2026-08-09*

## Self-Check: PASSED

- FOUND: apps/web/shared/hooks/use-count-up.ts
- FOUND: apps/web/modules/home/hero.tsx
- FOUND: commit 713d8b1 (Task 1)
- FOUND: commit cb675cd (Task 2)
- FOUND: .planning/quick/260809-vcj-add-count-up-animation-to-the-3-hero-sta/260809-vcj-SUMMARY.md
