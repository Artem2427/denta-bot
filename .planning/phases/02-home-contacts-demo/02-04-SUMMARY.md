---
phase: 02-home-contacts-demo
plan: 04
subsystem: ui
tags: [motion, react, accessibility, prefers-reduced-motion, timers, memory-leak]

# Dependency graph
requires:
  - phase: 02-home-contacts-demo (plan 01)
    provides: "StaggerGrid/StaggerItem grid-entry stagger primitives and Reveal's established prefers-reduced-motion branching pattern"
  - phase: 02-home-contacts-demo (plan 03)
    provides: "Demo page's BotTab scripted chat scenario playback (interval-driven message ticks)"
provides:
  - "StaggerGrid/StaggerItem now honor prefers-reduced-motion, collapsing to a static opacity-only render exactly like Reveal"
  - "BotTab's runScenario retrigger guard and unmount cleanup now cancel the inner per-message setTimeout, closing a stale-message leak"
affects: [02-VERIFICATION, home, demo]

actuals:
  tokens: 991
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "useReducedMotion() branch mirrored from apps/web/shared/components/reveal.tsx into StaggerGrid/StaggerItem"
    - "Dual-ref timer tracking (intervalRef + messageTimeoutRef) cleared in both the retrigger guard and the unmount cleanup effect"

key-files:
  created: []
  modified:
    - apps/web/modules/home/stagger-grid.tsx
    - apps/web/modules/demo/bot-tab.tsx

key-decisions:
  - "Mirrored Reveal's exact opacity-only { hidden: { opacity: 1 }, visible: { opacity: 1 } } pair for StaggerItem, and dropped staggerChildren transition (empty variants) for StaggerGrid's container, since the container itself carries no opacity"
  - "messageTimeoutRef self-nulls when the inner setTimeout fires naturally, in addition to being cleared by the retrigger guard and unmount cleanup, so no stale ref is ever read as 'in flight'"

patterns-established:
  - "Any future motion.div consumer with a stagger/reveal variant pair should call useReducedMotion() locally and branch to opacity-only variants, matching Reveal/StaggerItem's now-consistent pattern"

requirements-completed: [HOME-01, DEMO-01]

coverage:
  - id: D1
    description: "StaggerGrid/StaggerItem collapse to a static, always-opaque render (no translateY animation) under prefers-reduced-motion, matching Reveal's pattern"
    requirement: "HOME-01"
    verification:
      - kind: unit
        ref: "grep-based acceptance criteria in 02-04-PLAN.md Task 1 (useReducedMotion>=3, prefersReducedMotion>=4, opacity variant pairs present)"
        status: pass
      - kind: other
        ref: "pnpm --filter web check-types (zero errors) and pnpm --filter web lint (zero warnings) over apps/web/modules/home/stagger-grid.tsx"
        status: pass
    human_judgment: true
    rationale: "Visual confirmation that cards render instantly with zero translateY motion when OS-level reduced-motion is enabled requires a manual browser spot-check (documented in plan's <verification> as not automated this plan)"
  - id: D2
    description: "Retriggering a Demo chat scenario mid-playback (within the ~400ms typing-indicator window) never leaks a stale message from the abandoned scenario into the freshly-reset chat"
    requirement: "DEMO-01"
    verification:
      - kind: unit
        ref: "grep-based acceptance criteria in 02-04-PLAN.md Task 2 (messageTimeoutRef>=5, clearTimeout(messageTimeoutRef.current)>=2, setTimeout assignment>=1, clearInterval>=2)"
        status: pass
      - kind: other
        ref: "pnpm --filter web check-types (zero errors) and pnpm --filter web lint (zero warnings) over apps/web/modules/demo/bot-tab.tsx"
        status: pass
    human_judgment: true
    rationale: "Confirming no interleaved/duplicated message appears when rapidly switching scenarios mid-playback requires manual interactive testing in the browser (documented in plan's <verification> as not automated this plan)"

duration: 12min
completed: 2026-08-09
status: complete
---

# Phase 02 Plan 04: Gap Closure — Reduced-Motion Grids & Bot-Tab Timer Leak Summary

**Closed both code-confirmed gaps from 02-VERIFICATION.md: StaggerGrid/StaggerItem now honor prefers-reduced-motion via useReducedMotion() (mirroring Reveal), and bot-tab.tsx's scenario retrigger guard now clears the inner 400ms setTimeout alongside the interval, closing the WR-01 stale-message leak.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-09T19:38:00Z
- **Completed:** 2026-08-09T19:50:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `StaggerGrid`/`StaggerItem` (apps/web/modules/home/stagger-grid.tsx) now call `useReducedMotion()` and branch to an opacity-only/no-stagger variant pair identical to `Reveal`'s established pattern — Problem/Features/Testimonials card grids fully collapse to a static, non-animated render under OS-level reduced motion
- `bot-tab.tsx`'s `runScenario` now tracks the inner per-message-tick `setTimeout` in a new `messageTimeoutRef`, clearing it (alongside `intervalRef`) both in the retrigger cleanup guard and in the component's unmount cleanup effect — a scenario retriggered mid-playback (or the component unmounting mid-playback) can no longer let a stale message from the abandoned scenario reach `setChatMessages`
- `pnpm --filter web check-types` and `pnpm --filter web lint` both pass with zero new errors/warnings across both modified files

## Task Commits

Each task was committed atomically:

1. **Task 1: Collapse Home's staggered grids to opacity-only under prefers-reduced-motion** - `094c463` (fix)
2. **Task 2: Track and clear bot-tab's inner message setTimeout to stop scenario-retrigger leaks** - `cbffd8b` (fix)

**Plan metadata:** committed alongside this SUMMARY per worktree execution (STATE.md/ROADMAP.md updates deferred to orchestrator merge)

## Files Created/Modified
- `apps/web/modules/home/stagger-grid.tsx` - `StaggerGrid`/`StaggerItem` now call `useReducedMotion()`; `StaggerGrid`'s container drops `staggerChildren` transition and `StaggerItem` branches to `{ hidden: { opacity: 1 }, visible: { opacity: 1 } }` when reduced motion is preferred
- `apps/web/modules/demo/bot-tab.tsx` - Added `messageTimeoutRef` tracking the inner 400ms bot-message-reveal `setTimeout`; cleared in `runScenario`'s retrigger guard, self-nulled on natural fire, and cleared in the unmount cleanup effect

## Decisions Made
- Mirrored `Reveal`'s exact opacity-only variant pair for `StaggerItem` rather than inventing a new pattern, keeping all reduced-motion branches in the codebase visually and structurally consistent
- `StaggerGrid`'s container variant collapses to `{ hidden: {}, visible: {} }` (no opacity value) under reduced motion since the container itself never carries opacity — only `staggerChildren` timing, which is dropped entirely — matching the plan's read of `revealContainerVariants`/`revealVariants` in `apps/web/shared/lib/motion.ts`

## Deviations from Plan

None - plan executed exactly as written. Both files were edited exactly per the `<action>` instructions; `npx prettier --write` was run on both files afterward to match the repo's import-sort/formatting convention (not a deviation — the plan's `<action>` describes semantic edits, and Prettier's reflow is purely cosmetic, verified not to break any grep-based acceptance criterion).

## Issues Encountered
- This worktree had no `node_modules` installed (fresh git worktree checkout). Ran `pnpm install --frozen-lockfile` at the repo root (completed in ~10s via the shared pnpm store, no lockfile changes) to enable running `pnpm --filter web check-types` and `pnpm --filter web lint` per the plan's `<verification>` section. Both passed with zero errors/warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both gaps from `02-VERIFICATION.md` (score 11/13, status `gaps_found`) are closed at the source level; HOME-01 and DEMO-01 no longer carry an associated gap
- Recommended before Phase 2 re-verification closes out: the plan's own manual spot-check (OS-level reduced-motion toggle on `/`, and rapid scenario-switching on `/demo`) — not automated this plan, per `02-04-PLAN.md`'s `<verification>` section
- No blockers for phase re-verification

---
*Phase: 02-home-contacts-demo*
*Completed: 2026-08-09*

## Self-Check: PASSED
- FOUND: apps/web/modules/home/stagger-grid.tsx
- FOUND: apps/web/modules/demo/bot-tab.tsx
- FOUND: .planning/phases/02-home-contacts-demo/02-04-SUMMARY.md
- FOUND commit: 094c463
- FOUND commit: cbffd8b
- FOUND commit: 52fff9c
