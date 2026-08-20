---
phase: quick
plan: 260820-if0
subsystem: ui
tags: [phosphor-icons, react, next-intl, naming-convention, apps-web]

requires: []
provides:
  - "Every @phosphor-icons/react / @phosphor-icons/react/ssr icon import across apps/web now uses the Icon-suffixed component name (e.g. CheckIcon, not Check)"
  - "Sitewide naming consistency between the 14 files fixed by this plan and the 4 files (hero.tsx, reviews.tsx, hero-notification-badge.tsx, problem-solution.tsx) that already used the convention"
affects: [apps-web-icon-imports]

actuals:
  tokens: 4876
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Phosphor icon imports standardized on the Icon-suffixed named export (CheckIcon, HouseIcon, etc.) instead of the bare export (Check, House) across apps/web"

key-files:
  created: []
  modified:
    - apps/web/app/not-found.tsx
    - "apps/web/app/[locale]/blog/page.tsx"
    - "apps/web/app/[locale]/blog/[slug]/page.tsx"
    - apps/web/shared/components/locale-switcher.tsx
    - apps/web/shared/components/header.tsx
    - apps/web/shared/components/premium-accordion.tsx
    - apps/web/shared/components/theme-toggle.tsx
    - apps/web/shared/components/premium-dialog.tsx
    - apps/web/modules/demo/demo-tabs.tsx
    - apps/web/modules/demo/bot-tab.tsx
    - apps/web/modules/landing/pricing-section.tsx
    - apps/web/modules/landing/features.tsx
    - apps/web/modules/landing/lead-section.tsx
    - apps/web/modules/blog/blog-filters.tsx

key-decisions:
  - "Pure mechanical rename — no behavior/prop/styling changes; each file's import subpath (@phosphor-icons/react vs /ssr) preserved exactly"
  - "features.tsx's FEATURE_ICONS array element order preserved exactly (ChatCircleTextIcon, CalendarIcon, BellIcon, ChartBarIcon, StarIcon, GearIcon, UsersIcon, CheckIcon) since order encodes the per-feature icon-to-content mapping"
  - "header.tsx's pre-existing uncommitted nav-link-reorder edit (demo/pricing swap) was read fresh and preserved unmodified alongside the icon rename, committed together as one atomic change per the plan's explicit instruction"
  - "pricing-section.tsx's unrelated pre-existing console.log(plans, 'plans') debug line left untouched, per plan's explicit exclusion"

patterns-established:
  - "Icon-suffixed phosphor imports (XIcon) are now the sitewide convention across all of apps/web, not just the 4 files that originated it"

requirements-completed: []

coverage:
  - id: D1
    description: "All 22 bare phosphor icon identifiers across 14 apps/web files renamed to their Icon-suffixed equivalents, with every JSX/array usage site updated in lockstep"
    verification:
      - kind: other
        ref: "grep -nE (bare identifiers) across all 14 files returns zero matches; grep confirms each Icon-suffixed form present"
        status: pass
    human_judgment: false
  - id: D2
    description: "check-types, lint, and prettier --check all pass with no new errors/warnings referencing any of the 14 touched files"
    verification:
      - kind: other
        ref: "pnpm --filter web check-types; pnpm --filter web lint; pnpm exec prettier --check <14 files>"
        status: pass
    human_judgment: false
  - id: D3
    description: "header.tsx's pre-existing uncommitted nav-link-reorder edit preserved exactly alongside the icon rename"
    verification:
      - kind: other
        ref: "git diff apps/web/shared/components/header.tsx confirmed demo/pricing swap present alongside List/X -> ListIcon/XIcon rename"
        status: pass
    human_judgment: false

duration: ~20min
completed: 2026-08-20
status: complete
---

# Quick Task 260820-if0: Standardize Phosphor Icons React Imports Summary

**Renamed all 22 bare-name `@phosphor-icons/react`/`@phosphor-icons/react/ssr` icon imports across 14 apps/web files to their Icon-suffixed equivalents (Check -> CheckIcon, House -> HouseIcon, etc.), including features.tsx's FEATURE_ICONS array, with zero behavior/prop changes.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Renamed 7 identifiers across 5 shared chrome components (locale-switcher, header, premium-accordion, theme-toggle, premium-dialog) — preserved header.tsx's pre-existing uncommitted nav-link-reorder edit exactly
- Renamed 7 identifiers across 5 app-route/demo-module files (not-found, blog listing, blog post, demo-tabs, bot-tab)
- Renamed 11 identifiers across 4 landing/blog modules (pricing-section, features — including its FEATURE_ICONS array in original order, lead-section, blog-filters)
- Sitewide verification confirmed zero remaining bare-name occurrences of any of the 22 identifiers across all 14 touched files, and confirmed the 4 already-correct files (hero.tsx, reviews.tsx, hero-notification-badge.tsx, problem-solution.tsx) were untouched with no stray `IconIcon` double-suffix artifacts
- `pnpm --filter web check-types`, `pnpm --filter web lint`, and `prettier --check` all pass clean against every touched file

## Task Commits

1. **Task 1: Rename icon imports in shared chrome components** - `f427ee4` (refactor)
2. **Task 2: Rename icon imports in app routes and demo modules** - `5f537fb` (refactor)
3. **Task 3: Rename icon imports in landing/blog modules, then run full sitewide verification** - `6cc5e98` (refactor)

## Files Created/Modified
- `apps/web/shared/components/locale-switcher.tsx` - CaretDown/Check -> CaretDownIcon/CheckIcon
- `apps/web/shared/components/header.tsx` - List/X -> ListIcon/XIcon (pre-existing nav-link reorder preserved)
- `apps/web/shared/components/premium-accordion.tsx` - CaretDown -> CaretDownIcon
- `apps/web/shared/components/theme-toggle.tsx` - Moon/Sun -> MoonIcon/SunIcon
- `apps/web/shared/components/premium-dialog.tsx` - X -> XIcon
- `apps/web/app/not-found.tsx` - House -> HouseIcon
- `apps/web/app/[locale]/blog/page.tsx` - Clock -> ClockIcon
- `apps/web/app/[locale]/blog/[slug]/page.tsx` - ArrowLeft/Clock/ShareNetwork -> ArrowLeftIcon/ClockIcon/ShareNetworkIcon
- `apps/web/modules/demo/demo-tabs.tsx` - GearSix/Robot -> GearSixIcon/RobotIcon
- `apps/web/modules/demo/bot-tab.tsx` - Checks/Robot -> ChecksIcon/RobotIcon
- `apps/web/modules/landing/pricing-section.tsx` - Check -> CheckIcon
- `apps/web/modules/landing/features.tsx` - Bell/Calendar/ChartBar/ChatCircleText/Check/Gear/Star/Users -> Icon-suffixed (import block + FEATURE_ICONS array, order preserved)
- `apps/web/modules/landing/lead-section.tsx` - CheckCircle -> CheckCircleIcon (2 JSX sites)
- `apps/web/modules/blog/blog-filters.tsx` - Clock/MagnifyingGlass -> ClockIcon/MagnifyingGlassIcon

## Decisions Made
- Pure mechanical rename with no aliasing (`import { Check as CheckIcon }` never used) — renamed to the library's real Icon-suffixed named export in every case
- Import subpaths (`@phosphor-icons/react` vs `/ssr`) copied unchanged per file
- header.tsx's pre-existing uncommitted nav-link-reorder edit (demo/pricing swap) was preserved and committed together with the icon rename as one atomic change for that file, per the plan's explicit precondition
- pricing-section.tsx's unrelated pre-existing `console.log(plans, 'plans')` debug line left untouched

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- No blockers. This was a self-contained naming-consistency cleanup with no behavior change.
- reviews.tsx's unrelated pre-existing local card-width tweak remains uncommitted and untouched, as instructed — out of scope for this task.

## Self-Check: PASSED

All 14 claimed files exist on disk; all 3 claimed commit hashes (f427ee4, 5f537fb, 6cc5e98) found in git log.
