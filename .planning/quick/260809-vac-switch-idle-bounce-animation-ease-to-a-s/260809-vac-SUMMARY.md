---
phase: quick
plan: 260809-vac
subsystem: ui
tags: [motion, framer-motion, animation, easing, apps-web]

# Dependency graph
requires:
  - phase: 01.1-premium-redesign
    provides: apps/web/shared/lib/motion.ts (EASE_DT_EXPO_OUT, idleBounceAnimate, idleBounceTransition)
provides:
  - EASE_DT_BOUNCE ease-out-back cubic-bezier token for spring/overshoot motion
  - idleBounceTransition now uses EASE_DT_BOUNCE instead of EASE_DT_EXPO_OUT
affects: [home hero notification card motion, future bounce/spring UI motion]

actuals:
  tokens: 147
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns: ["Dedicated ease tokens per motion character (EASE_DT_EXPO_OUT for deceleration, EASE_DT_BOUNCE for overshoot/spring) rather than reusing one ease across differently-feeling animations"]

key-files:
  created: []
  modified: [apps/web/shared/lib/motion.ts]

key-decisions:
  - "Added a new EASE_DT_BOUNCE token instead of repurposing EASE_DT_EXPO_OUT, so revealVariants/hoverLift keep their existing non-bouncy deceleration while only idleBounceTransition gets the spring/overshoot feel"

patterns-established:
  - "Motion easing tokens are named for their character (EXPO_OUT, BOUNCE) and reused by reference across consumers in motion.ts"

requirements-completed: []

coverage:
  - id: D1
    description: "idleBounceTransition.ease switched from EASE_DT_EXPO_OUT to new EASE_DT_BOUNCE (ease-out-back cubic-bezier), giving the Home hero notification card's idle bounce a spring/overshoot feel instead of plain deceleration"
    verification:
      - kind: unit
        ref: "grep-based structural checks in 260809-vac-PLAN.md verify block (EASE_DT_BOUNCE value, ease: EASE_DT_BOUNCE count, ease: EASE_DT_EXPO_OUT count unchanged at 2, duration/repeat/y-array unchanged)"
        status: pass
      - kind: other
        ref: "pnpm --filter web lint"
        status: pass
      - kind: other
        ref: "pnpm --filter web check-types (pre-existing button-group.tsx/calendar.tsx/sidebar.tsx csstype errors excluded)"
        status: pass
    human_judgment: true
    rationale: "Visual 'spring feel' vs 'plain deceleration' is a subjective motion-quality judgment the user requested by feel ('дебаунс ефект и плавна') — automated checks confirm the ease value and untouched fields are correct, but only a human visually watching the hero notification card can confirm it now reads as a bounce rather than a float."

duration: 6min
completed: 2026-08-09
status: complete
---

# Quick Task 260809-vac: Switch Idle Bounce Animation Ease to Spring Overshoot Summary

**Added `EASE_DT_BOUNCE` ease-out-back cubic-bezier token and switched `idleBounceTransition.ease` to it, giving the Home hero notification card's idle bounce a spring/overshoot feel while leaving `EASE_DT_EXPO_OUT`'s other consumers untouched.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-09T19:28:00Z
- **Completed:** 2026-08-09T19:34:48Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added `EASE_DT_BOUNCE = [0.34, 1.56, 0.64, 1] as const` export to `apps/web/shared/lib/motion.ts`, following the exact pattern of `EASE_DT_EXPO_OUT`
- Switched `idleBounceTransition.ease` from `EASE_DT_EXPO_OUT` to `EASE_DT_BOUNCE`, keeping `duration: 1.6`, `repeat: Infinity`, and `idleBounceAnimate` (`{ y: [0, -8, 0] }`) unchanged
- Confirmed `EASE_DT_EXPO_OUT`, `revealVariants`, `revealContainerVariants`, and `hoverLift` remain byte-identical (still consumed twice by `revealVariants` and `hoverLift`)
- Confirmed `hero.tsx` has zero diff — it already consumes `idleBounceAnimate`/`idleBounceTransition` by reference

## Task Commits

Each task was committed atomically:

1. **Task 1: Add EASE_DT_BOUNCE and switch idleBounceTransition's ease to it** - `bf5b359` (feat)

**Plan metadata:** committed separately by orchestrator (docs commit, not by this executor)

## Files Created/Modified
- `apps/web/shared/lib/motion.ts` - Added `EASE_DT_BOUNCE` ease-out-back token; switched `idleBounceTransition.ease` to reference it

## Decisions Made
- Added a dedicated `EASE_DT_BOUNCE` token rather than modifying `EASE_DT_EXPO_OUT` in place, since `EASE_DT_EXPO_OUT` is shared by `revealVariants` (scroll reveal) and `hoverLift` (hover) and those must keep their smooth, non-bouncy deceleration character.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The worktree had no `node_modules` installed (fresh git worktree, dependencies not pre-installed). Ran `pnpm install --frozen-lockfile` at the workspace root before running `pnpm --filter web lint`/`check-types` — this is environment setup, not a deviation from the plan's code changes, and did not modify any tracked files.
- `pnpm --filter web check-types` reported pre-existing `csstype@3.1.3` vs `3.2.3` duplicate-resolution errors in `packages/ui/src/components/shadcn-ui/button-group.tsx`, `calendar.tsx`, and `sidebar.tsx` — these are the known pre-existing errors the plan's verify step explicitly filters out (tracked in STATE.md Blockers/Concerns), unrelated to `motion.ts`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `apps/web/shared/lib/motion.ts` now exposes `EASE_DT_BOUNCE` for any future bounce/spring-style motion, alongside `EASE_DT_EXPO_OUT` for deceleration-style motion.
- No blockers. Visual confirmation of the bounce feel on the Home hero notification card is a human-judgment item (see `coverage` D1) — recommend a quick visual check in dev (`pnpm dev:web`, notification card idle bounce) before considering this fully verified.

---
*Phase: quick*
*Completed: 2026-08-09*

## Self-Check: PASSED

- FOUND: apps/web/shared/lib/motion.ts
- FOUND: bf5b359 (git log --oneline --all)
