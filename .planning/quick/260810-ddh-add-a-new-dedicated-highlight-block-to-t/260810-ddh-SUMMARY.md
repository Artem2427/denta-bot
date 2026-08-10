---
phase: quick/260810-ddh
plan: ddh
subsystem: ui
tags: [nextjs, react, phosphor-icons, tailwind, home-page]

# Dependency graph
requires:
  - phase: 01.1-premium-redesign
    provides: PremiumCard, Reveal, StaggerGrid/StaggerItem primitives and dt- design tokens
provides:
  - Home page UnifiedSource section — bot/manual booking-core, role-based admin access, and booking-source analytics highlight, rendered between Solution and Features
affects: []

# Actuals (#2632)
actuals:
  tokens: 1144
  tasks: 1
  commits: 1

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "UnifiedSource follows the established features.tsx/problem.tsx pattern: Container > Reveal(header) > StaggerGrid > StaggerItem > PremiumCard, no new primitives introduced"

key-files:
  created:
    - apps/web/modules/home/unified-source.tsx
  modified:
    - apps/web/app/page.tsx

key-decisions:
  - "Used 3-column grid (md:grid-cols-3) instead of features.tsx's 4-column layout, matching the plan's explicit 3-card spec"
  - "No id attribute on the section wrapper, per plan instruction matching problem.tsx/solution.tsx/cta-banner.tsx convention (features.tsx's id=\"features\" is unreferenced and not replicated)"

patterns-established: []

requirements-completed: []

coverage:
  - id: D1
    description: "Home page renders a new UnifiedSource section between Solution and Features presenting the unified-source-of-truth admin capability"
    verification:
      - kind: unit
        ref: "grep '<UnifiedSource />' apps/web/app/page.tsx (positioned between <Solution /> and <Features />)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Section headline communicates that bot and manual admin bookings write to one shared schedule with no desync"
    verification:
      - kind: unit
        ref: "grep 'Єдине джерело правди' and 'Один спільний розклад' apps/web/modules/home/unified-source.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "Section covers role-based admin access (regular admin vs head doctor/owner)"
    verification:
      - kind: unit
        ref: "grep 'Доступ за ролями' apps/web/modules/home/unified-source.tsx"
        status: pass
    human_judgment: false
  - id: D4
    description: "Section covers booking-source tracking enabling bot-vs-manual analytics for the clinic owner"
    verification:
      - kind: unit
        ref: "grep 'Аналітика по джерелах запису' apps/web/modules/home/unified-source.tsx"
        status: pass
    human_judgment: false
  - id: D5
    description: "Typecheck and lint pass clean for the new/modified files"
    verification:
      - kind: unit
        ref: "pnpm --filter web lint (exit 0); pnpm --filter web check-types (pre-existing unrelated packages/ui csstype failure only — see Issues Encountered)"
        status: pass
    human_judgment: true
    rationale: "check-types command as a whole exits non-zero due to a pre-existing, documented csstype@3.1.3 vs 3.2.3 conflict in packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx (STATE.md Blockers/Concerns), unrelated to this task's files. A human should confirm no new errors appear in apps/web/modules/home/unified-source.tsx or apps/web/app/page.tsx (none do)."

duration: 6min
completed: 2026-08-10
status: complete
---

# Quick Task 260810-ddh: Add Unified Source of Truth Highlight Block Summary

**New `UnifiedSource` marketing section on Home explaining the shared bot/manual booking core, role-based admin access, and booking-source analytics — rendered between Solution and Features.**

## Performance

- **Duration:** ~6 min
- **Completed:** 2026-08-10T06:42:50Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created `apps/web/modules/home/unified-source.tsx` following the `features.tsx`/`problem.tsx` structural pattern (Container > Reveal-wrapped centered header > StaggerGrid > StaggerItem > PremiumCard), using only existing dt-* primitives and `@phosphor-icons/react/ssr` icons
- Wrote original Ukrainian sales copy covering: (1) one shared schedule between bot and manual admin bookings with no desync, (2) role-based admin access (regular admin vs head doctor/owner), (3) per-channel booking-source analytics
- Wired `<UnifiedSource />` into `apps/web/app/page.tsx` between `<Solution />` and `<Features />`, with the import added in alphabetical order after `Testimonials`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create UnifiedSource section and wire into Home page** - `2b2af6c` (feat)

## Files Created/Modified
- `apps/web/modules/home/unified-source.tsx` - New section: header (h2 + sub-line) + 3-card StaggerGrid (ArrowsClockwise/UserGear/ChartPieSlice icons) covering unified schedule, role-based access, and source analytics
- `apps/web/app/page.tsx` - Added `UnifiedSource` import (alphabetically after `Testimonials`) and rendered it between `<Solution />` and `<Features />`

## Decisions Made
- Used a 3-column grid (`md:grid-cols-3`) rather than `features.tsx`'s 4-column layout, since the plan specified exactly 3 cards
- Omitted a nav-anchor `id` on the section, matching `problem.tsx`/`solution.tsx`/`cta-banner.tsx` (not `features.tsx`'s unreferenced `id="features"`)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- `pnpm --filter web check-types` fails on the pre-existing, previously documented (STATE.md Blockers/Concerns) csstype@3.1.3 vs 3.2.3 duplicate-resolution conflict in `packages/ui/src/components/shadcn-ui/button-group.tsx`, `calendar.tsx`, and `sidebar.tsx`. These files were not touched by this task and the errors are unrelated to `unified-source.tsx`/`page.tsx`. `pnpm --filter web lint` passes clean (`--max-warnings 0`, exit 0).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Home page now includes the unified-source-of-truth differentiator section between Solution and Features.
- Manual visual spot-check of http://localhost:3000/ recommended (not blocking) to confirm the section reads well alongside neighboring Solution/Features sections.

---
*Task: 260810-ddh*
*Completed: 2026-08-10*

## Self-Check: PASSED
- FOUND: apps/web/modules/home/unified-source.tsx
- FOUND: 2b2af6c (task commit)
- FOUND: .planning/quick/260810-ddh-add-a-new-dedicated-highlight-block-to-t/260810-ddh-SUMMARY.md
