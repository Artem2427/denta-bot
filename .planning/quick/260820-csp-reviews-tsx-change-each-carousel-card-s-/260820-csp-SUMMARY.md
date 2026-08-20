---
phase: quick
plan: 260820-csp
subsystem: ui
tags: [tailwind, embla-carousel, reviews, landing]

requires:
  - phase: quick-260820-1oe
    provides: Reviews carousel track made full-bleed (no max-width cap)
provides:
  - Reviews carousel cards render at fixed 300px width instead of stepped percentage breakpoints
affects: [landing, reviews-section]

actuals:
  tokens: 400
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - apps/web/modules/landing/reviews.tsx

key-decisions:
  - "Used literal Tailwind arbitrary-value class flex-[0_0_300px] instead of inventing a new design token — matches user's explicit 300px instruction for a one-off usage"

requirements-completed: []

coverage:
  - id: D1
    description: "Reviews carousel cards render at a fixed 300px width instead of stepped percentage breakpoints"
    verification:
      - kind: other
        ref: "grep -n \"flex-\\[0_0_300px\\] pl-6\" apps/web/modules/landing/reviews.tsx"
        status: pass
    human_judgment: true
    rationale: "Visual carousel rendering (card width, loop wraparound, button states) requires a human to confirm in the browser; static grep only proves the className string is correct."

duration: 5min
completed: 2026-08-20
status: complete
---

# Quick Task 260820-csp: Reviews Carousel Fixed Card Width Summary

**Reviews carousel cards now use a fixed 300px flex-basis instead of responsive percentage breakpoints (100%/50%/33.3333%)**

## Performance

- **Duration:** ~5 min
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Per-card wrapper `div` className changed from `min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]` to `min-w-0 flex-[0_0_300px] pl-6`
- Removed the now-unneeded `sm:`/`lg:` responsive flex-basis breakpoints
- Embla config (`loop: true`, `align: 'start'`), scroll button handlers, and disabled-state logic left untouched

## Task Commits

1. **Task 1: Fix carousel card width to 300px** - `e7ef909` (fix)

## Files Created/Modified
- `apps/web/modules/landing/reviews.tsx` - Per-card slide width changed to fixed 300px; also had pending Prettier formatting (import order, `StarIcon` JSX wrap) applied to satisfy the `prettier --check` constraint on this file

## Decisions Made
- Kept the literal Tailwind arbitrary-value class (`flex-[0_0_300px]`) rather than adding a `--dt-card-width` token, per plan context: no existing fixed-width token and no sibling module uses this pattern — not worth introducing for a single usage.

## Deviations from Plan

### Auto-fixed Issues

**1. [Task constraint] Applied Prettier formatting to satisfy prettier --check requirement**
- **Found during:** Task 1 verification
- **Issue:** The file had pre-existing Prettier formatting drift (import order via `@trivago/prettier-plugin-sort-imports`, `StarIcon` JSX line-wrap) unrelated to this task's className edit. The task constraint required the final edited file to pass `pnpm exec prettier --check` before committing.
- **Fix:** Ran `pnpm exec prettier --write` on the file. This reordered the `@phosphor-icons/react/ssr` import alongside other imports and collapsed the `StarIcon` JSX onto one line — whitespace/ordering only, no semantic changes.
- **Files modified:** apps/web/modules/landing/reviews.tsx (same file, no scope expansion)
- **Verification:** `pnpm exec prettier --check apps/web/modules/landing/reviews.tsx` passes
- **Committed in:** e7ef909 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (formatting, required by explicit task constraint)
**Impact on plan:** No scope creep — same single file, whitespace/ordering only. Required by the task's own prettier-check constraint.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Reviews carousel now renders at fixed 300px card width; visible card count derives naturally from viewport width.
- Manual/visual verification (dev server, loop wraparound, prev/next buttons) still recommended per plan's verification section but not run as part of this automated task.

---
*Phase: quick*
*Completed: 2026-08-20*
