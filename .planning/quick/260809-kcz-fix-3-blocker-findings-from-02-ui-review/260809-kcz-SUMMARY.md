---
phase: 02-home-contacts-demo
plan: quick-260809-kcz
subsystem: ui
tags: [css, tailwind, nextjs, motion, responsive, images]

# Dependency graph
requires:
  - phase: 02-home-contacts-demo
    provides: "Home hero, Contacts, Demo pages using premium-theme.css's text-dt-h1/text-dt-h2 tokens (per 02-UI-REVIEW.md audit)"
provides:
  - "Fluid clamp()-based --text-dt-h1/--text-dt-h2 tokens (no fixed-size mobile overflow)"
  - "overflow-x-hidden backstop on <body>"
  - "Working, network-verified hero dashboard image"
  - "Reusable idleBounceAnimate/idleBounceTransition motion primitive, reduced-motion-aware"
affects: [02-home-contacts-demo, ui-review]

actuals:
  tokens: 1218
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "idleBounceAnimate/idleBounceTransition in shared/lib/motion.ts — reusable Motion keyframe+transition pair for floating-card idle bounce, gated by useReducedMotion() following reveal.tsx's ternary pattern"

key-files:
  created: []
  modified:
    - apps/web/app/premium-theme.css
    - apps/web/app/layout.tsx
    - apps/web/modules/home/hero.tsx
    - apps/web/shared/lib/motion.ts

key-decisions:
  - "Used clamp(2.25rem, 6vw+1rem, 4rem) / clamp(1.75rem, 4vw+0.75rem, 2.5rem) for --text-dt-h1/--text-dt-h2, per plan spec — floors at readable mobile sizes, caps at the original 4rem/2.5rem desktop values"
  - "Chose the pre-vetted, network-verified Unsplash photo id (1460925895917-afdab827c52f) for the hero image, matching testimonials.tsx's existing query-param style"

patterns-established:
  - "Idle-bounce motion primitive (idleBounceAnimate/idleBounceTransition) available in shared/lib/motion.ts for any future floating card needing the same continuous subtle-bounce treatment"

requirements-completed: []

coverage:
  - id: D1
    description: "Home/Contacts/Demo h1/h2 headings use fluid clamp() tokens instead of fixed sizes, eliminating mobile horizontal overflow at 375px; overflow-x-hidden backstop on body"
    verification:
      - kind: other
        ref: "grep assertions confirming clamp() token values + overflow-x-hidden class; pnpm --filter web check-types (filtered)"
        status: pass
    human_judgment: true
    rationale: "Actual absence of horizontal scroll at 375px viewport requires a rendered-browser visual check, which this executor did not run (dev server not started) — plan explicitly scopes this as a non-blocking follow-up spot-check"
  - id: D2
    description: "Home hero image replaced with a network-verified (HTTP 200, image/jpeg) laptop-with-dashboard photo, replacing the broken/wrong Unsplash id"
    verification:
      - kind: other
        ref: "curl -sI against the new images.unsplash.com URL — HTTP/2 200, content-type: image/jpeg"
        status: pass
    human_judgment: false
  - id: D3
    description: "Новий запис від Олени Коваль notification card has continuous vertical idle bounce, disabled under prefers-reduced-motion; reminder card unchanged"
    verification:
      - kind: other
        ref: "grep assertions: exactly one motion.div wrapping the notification card, idleBounceAnimate/idleBounceTransition consumed via prefersReducedMotion ternary; reminder card grep confirms plain div, unchanged"
        status: pass
    human_judgment: true
    rationale: "Actual bounce animation behavior and its suppression under prefers-reduced-motion requires a rendered-browser visual/motion check, which this executor did not run"

duration: 12min
completed: 2026-08-09
status: complete
---

# Phase 02 Quick Task 260809-kcz: Fix 3 Blocker Findings from 02-UI-REVIEW Summary

**Fluid clamp() heading tokens eliminate mobile overflow, hero image swapped to a network-verified dashboard photo, and the "Новий запис" notification card now idle-bounces with prefers-reduced-motion support.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-08-09T19:00Z (approx.)
- **Completed:** 2026-08-09T19:13Z (approx.)
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- `--text-dt-h1`/`--text-dt-h2` in `premium-theme.css` are now `clamp()`-based fluid values (min 2.25rem/1.75rem, max unchanged at 4rem/2.5rem), consumed automatically by Home hero, Contacts, and Demo via the existing `text-dt-h1`/`text-dt-h2` utility classes — no changes needed to those two page files
- `overflow-x-hidden` added to `<body>` in `layout.tsx` as a defensive backstop
- Home hero's broken Unsplash photo replaced with a network-verified (HTTP 200, `image/jpeg`) laptop-with-dashboard image, matching `testimonials.tsx`'s existing Unsplash query-param style
- New `idleBounceAnimate`/`idleBounceTransition` primitive added to `shared/lib/motion.ts`; the "Новий запис від Олени Коваль" floating card on Home hero now bounces continuously (3s, infinite, easeInOut) and is disabled when `useReducedMotion()` reports a preference for reduced motion

## Task Commits

Each task was committed atomically:

1. **Task 1: Fluid h1/h2 tokens + overflow-x-hidden backstop** - `f83b51a` (fix)
2. **Task 2: Replace broken hero image with network-verified dashboard photo** - `debb711` (fix)
3. **Task 3: Add reduced-motion-aware idle bounce to notification card** - `080dac5` (feat)

_No plan-metadata commit — this quick task's orchestrator handles the docs commit (SUMMARY.md/STATE.md) separately per constraints._

## Files Created/Modified
- `apps/web/app/premium-theme.css` - `--text-dt-h1`/`--text-dt-h2` switched from fixed rem to `clamp()` fluid values; all other type-scale tokens untouched
- `apps/web/app/layout.tsx` - `overflow-x-hidden` appended to `<body>`'s className
- `apps/web/modules/home/hero.tsx` - hero image `src` swapped to a verified working Unsplash URL; file converted to a client component (`'use client'`) to support `useReducedMotion()`; the top notification card is now a `motion.div` with the idle-bounce animation, gated by reduced-motion preference
- `apps/web/shared/lib/motion.ts` - added `idleBounceAnimate`/`idleBounceTransition` exports (existing exports byte-identical, only appended to)

## Decisions Made
- `clamp()` bounds chosen exactly per plan spec (2.25rem→4rem for h1, 1.75rem→2.5rem for h2) — mobile floor stays legible, desktop ceiling matches the original fixed values so no visual regression at ≥1024px
- New hero image id `1460925895917-afdab827c52f` selected per plan spec (pre-vetted during planning), re-verified live via `curl -sI` at execution time — HTTP 200 + `image/jpeg` confirmed
- `hero.tsx` promoted to a client component only because `useReducedMotion()` requires it — matches the existing precedent set by `reveal.tsx`

## Deviations from Plan

### Auto-fixed Issues

None — all 3 tasks executed exactly as specified; no bugs, missing functionality, or blocking issues required a code fix outside the plan's own file list.

### Notable non-fixes (pre-existing, out-of-scope, documented per SCOPE BOUNDARY)

**1. Pre-existing `pnpm --filter web lint` failure — unrelated `logo.tsx` unused import**
- **Found during:** Task 1 verify step (full-repo `pnpm --filter web lint` invocation)
- **Issue:** `apps/web/shared/components/logo.tsx` (last touched by pre-existing commit `ed2469e`, before this task's base) imports `ChatCircleDots` from `@phosphor-icons/react/ssr` but no longer uses it (icon was swapped for a tooth emoji in that prior commit) — triggers `@typescript-eslint/no-unused-vars`, which fails the repo's `--max-warnings 0` gate for the *entire* `pnpm --filter web lint` run, even though `logo.tsx` is untouched by this plan.
- **Not fixed:** `logo.tsx` is outside this plan's `<files>` scope (premium-theme.css/layout.tsx/hero.tsx/motion.ts only) and the plan's own success criteria explicitly require "Only [those 4 files] are modified." Per the executor's SCOPE BOUNDARY rule, pre-existing warnings in unrelated files are not auto-fixed.
- **Verification performed instead:** Ran `eslint` scoped directly to each file this plan touched (`layout.tsx`, `hero.tsx`, `motion.ts`) — all exit 0, zero warnings, confirming no new lint issues were introduced by this plan's changes.
- **Recommendation:** A trivial one-line fix (remove the unused `ChatCircleDots` import) should be picked up in a follow-up quick task or the next phase touching `logo.tsx`.

**2. Pre-existing `pnpm --filter web check-types` failure — `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict**
- **Found during:** All 3 tasks' verify steps (`pnpm --filter web check-types`)
- **Issue:** Already documented in `.planning/STATE.md` (Blockers/Concerns) and `.planning/phases/01.1-premium-design-system/deferred-items.md` since Phase 1 — 5 `tsc` errors confined to `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx`, none referencing any file this plan touched.
- **Not fixed:** Same known project-wide blocker, requires a monorepo-wide `pnpm.overrides` fix, out of scope for this quick task. This is the exact error set the plan's own verify script already filters out via `grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx'`.

**3. Plan verify script's `EASE_DT_EXPO_OUT` grep assertion is over-strict**
- **Found during:** Task 3 verify step
- **Issue:** The plan's automated verify chain asserts `grep -c 'EASE_DT_EXPO_OUT' apps/web/shared/lib/motion.ts` equals `1`, but the pre-existing (unmodified) file already contains 3 matching lines — the definition plus 2 usages inside `revealVariants`/`hoverLift`. This was true before this plan's Task 3 edit too; Task 3 only appended new exports below `hoverLift` (confirmed via `git diff` — lines 1-22 byte-identical).
- **Not fixed (script, not code):** Verified intent manually instead — a direct `git diff` of `motion.ts` confirms the pre-existing exports (`EASE_DT_EXPO_OUT`, `revealVariants`, `revealContainerVariants`, `hoverLift`) are completely untouched, and only `idleBounceAnimate`/`idleBounceTransition` were added, matching the task's `<done>` criteria.

---

**Total deviations:** 0 auto-fixed code changes. 3 documented pre-existing/script issues (none blocking the actual deliverables).
**Impact on plan:** None — all 3 tasks' substantive done-criteria are met; the noted items are either pre-existing unrelated repo state or a minor plan-script assertion quirk, both fully documented above for traceability.

## Issues Encountered
- Worktree had no `node_modules` installed at spawn time — ran `pnpm install --frozen-lockfile` (10s) before any lint/check-types verification could run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 BLOCKER-tier findings from `02-UI-REVIEW.md` are addressed at the code level (fluid typography, working hero image, idle-bounce motion).
- Recommended follow-up (non-blocking, per plan's own verification notes): a human visual spot-check of http://localhost:3000/ at 375px viewport across Home/Contacts/Demo, and a `/gsd-ui-review` re-run against Phase 02 to formally re-score the 3 previously-failing pillars.
- Separately, unrelated `logo.tsx` unused-import lint warning should be cleaned up in a future quick task to restore a fully clean `pnpm --filter web lint` run.

---
*Phase: 02-home-contacts-demo (quick task 260809-kcz)*
*Completed: 2026-08-09*

## Self-Check: PASSED

All claimed files verified to exist on disk (`apps/web/app/premium-theme.css`, `apps/web/app/layout.tsx`, `apps/web/modules/home/hero.tsx`, `apps/web/shared/lib/motion.ts`) and all 3 task commit hashes (`f83b51a`, `debb711`, `080dac5`) verified present in git log.
