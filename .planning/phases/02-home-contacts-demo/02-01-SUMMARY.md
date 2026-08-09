---
phase: 02-home-contacts-demo
plan: 01
subsystem: ui
tags: [nextjs, react, tailwind-v4, motion, phosphor-icons, premium-design-system]

# Dependency graph
requires:
  - phase: 01.1-premium-design-system
    provides: "PremiumButton, PremiumCard, Container, Reveal, SignatureMark, useInView, motion.ts constants, routes.ts, cn.ts, dt-* design tokens"
provides:
  - "Home route (/) with all 6 sections rendered in order, entirely on the premium dt- design system"
  - "Reusable StaggerGrid/StaggerItem D-28-compliant scroll-stagger primitives at apps/web/modules/home/stagger-grid.tsx, consumable by future modules (contacts, demo)"
  - "apps/web/next.config.js images.remotePatterns entry for images.unsplash.com"
affects: [02-home-contacts-demo, 03-prices-blog]

# Actuals (#2632)
actuals:
  tokens: 5823
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "StaggerGrid/StaggerItem reusable motion primitives (revealContainerVariants/revealVariants) for 80ms-staggered grid-entry reveal"
    - "Unrolled (non-.map()) JSX for fixed-cardinality card grids to keep literal component-tag counts inspectable"

key-files:
  created:
    - apps/web/modules/home/hero.tsx
    - apps/web/modules/home/problem.tsx
    - apps/web/modules/home/solution.tsx
    - apps/web/modules/home/stagger-grid.tsx
    - apps/web/modules/home/features.tsx
    - apps/web/modules/home/cta-banner.tsx
    - apps/web/modules/home/testimonials.tsx
  modified:
    - apps/web/app/page.tsx
    - apps/web/next.config.js

key-decisions:
  - "Unrolled all fixed-cardinality card grids (Problem's 4, Features' 8, Testimonials' 3) into literal JSX blocks instead of Array.map(), matching this plan's exact-count verify script expectations"
  - "cta-banner.tsx's second (outline) button uses an explicit className override for warm-white border/text since it sits on a dt-navy background, per plan's asChild+cn()-merge guidance"

requirements-completed: [HOME-01]

coverage:
  - id: D1
    description: "Home page (/) renders all 6 sections (Hero, Problem, Solution, Features, CTA Banner, Testimonials) in order with the exact Ukrainian copy from 02-CONTEXT.md, entirely on the premium dt- design system"
    requirement: "HOME-01"
    verification:
      - kind: other
        ref: "grep-based structural verification (section presence, component composition, zero @repo/ui / 1d6be4 leftovers) — see Task Commits section"
        status: pass
      - kind: other
        ref: "pnpm --filter web check-types — zero new errors outside pre-existing csstype conflict in packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx"
        status: pass
    human_judgment: true
    rationale: "Visual/animation fidelity (scroll-stagger reveal timing, exact spacing/typography match to the design archive, #features anchor scroll behavior) requires a human to load the running page — not automatable from grep/tsc alone."

duration: 27min
completed: 2026-08-09
status: complete
---

# Phase 2 Plan 1: Home Page Summary

**Home page (`/`) ported to Next.js as 6 section components on the Phase 01.1 premium `dt-` design system — Hero, Problem, Solution, Features, CTA Banner, Testimonials — with a reusable `StaggerGrid`/`StaggerItem` scroll-reveal primitive.**

## Performance

- **Duration:** 27 min (git commit timestamps, base → last task commit)
- **Started:** 2026-08-09T10:01:02Z
- **Completed:** 2026-08-09T10:27:52Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Home route (`apps/web/app/page.tsx`) fully replaces the `create-turbo` placeholder with the real, production-shaped 6-section marketing homepage
- `StaggerGrid`/`StaggerItem` built as the first consumer of `revealContainerVariants` (D-28's 80ms-staggered-children grid-entry pattern), reused across Problem/Features/Testimonials
- `apps/web/next.config.js` now allows `images.unsplash.com` hotlinks (Hero dashboard mockup + one testimonial photo), scoped tightly (no wildcard subdomain) per the plan's SSRF threat mitigation
- Zero `@repo/ui` imports and zero `#1d6be4` brand-blue literals anywhere in the 8 new/modified Home files

## Task Commits

Each task was committed atomically:

1. **Task 1: next.config.js image host + Hero, Problem, Solution sections** - `fa691cc` (feat)
2. **Task 2: Features, CTA Banner, Testimonials sections + finish page.tsx** - `3d674d1` (feat)

_Note: SUMMARY/state metadata commit follows this plan's task commits (worktree mode — no STATE.md/ROADMAP.md writes here; orchestrator handles those centrally)._

## Files Created/Modified
- `apps/web/next.config.js` - Added `images.remotePatterns` entry for `images.unsplash.com`
- `apps/web/app/page.tsx` - Rewritten to compose all 6 Home sections in order
- `apps/web/modules/home/hero.tsx` - Hero: badge, h1, subhead, 2 CTAs, 3 stats, hero image, 2 floating cards (incl. `SignatureMark` on the confirmation-moment card)
- `apps/web/modules/home/problem.tsx` - Problem: 4-card staggered-reveal grid ("Знайомо?")
- `apps/web/modules/home/solution.tsx` - Solution: 2-column numbered-step tracks ("Для пацієнта"/"Для клініки") + CTA
- `apps/web/modules/home/stagger-grid.tsx` - Reusable `StaggerGrid`/`StaggerItem` motion primitives
- `apps/web/modules/home/features.tsx` - Features (`id="features"`): 8-card staggered-reveal grid
- `apps/web/modules/home/cta-banner.tsx` - Navy CTA banner: 2 buttons both routing to `/demo`
- `apps/web/modules/home/testimonials.tsx` - Testimonials: 3-card staggered-reveal grid (1 photo + 2 emoji avatars)

## Decisions Made
- Unrolled all fixed-cardinality card grids into literal JSX (no `Array.map()`) so each card is a distinct, individually-inspectable `<StaggerItem>`/`<PremiumCard>` pair — matches this plan's exact-count verify expectations and keeps card content easy to diff/edit per-card going forward.
- Used a `className` override (via `cn()`'s tailwind-merge) on the CTA banner's second `PremiumButton` for the warm-white-on-navy outline treatment, since the base `outline` variant assumes a light background.
- Ran `pnpm install --frozen-lockfile` at the worktree root before `check-types` — the worktree had no `node_modules` (fresh worktree checkout); installing from the existing lockfile (no version changes) is environment setup, not a package-legitimacy concern, so this was auto-fixed under deviation Rule 3.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan's `<verify>` grep checks used flawed line-counting logic that could never pass as literally written**
- **Found during:** Task 1 (Problem section) and Task 2 (Features/CTA Banner/Testimonials)
- **Issue:** Two independent bugs in the plan's automated `<verify>` blocks:
  (a) `grep -c "StaggerItem"` / `grep -c "PremiumButton"` count *matching lines*, not component occurrences — any correctly-formatted multi-line JSX usage (opening tag on one line, closing tag on another) plus the import statement itself (which also contains the literal identifier) makes an exact-N line-count assertion structurally unsatisfiable for N>1 pairs, regardless of how correct the underlying implementation is.
  (b) `grep -Ec 'pattern' file1 file2 ... fileN` prefixes each result with `filename:count` when given multiple file arguments (even for 0 matches on macOS/BSD grep), so the captured `$(...)` output is multi-line text like `file1:0\nfile2:0\n...` — which can never string-equal the literal `"0"` the test expected, independent of whether the pattern actually appears anywhere.
- **Fix:** Verified the real intent (exact pair/button counts, zero brand-blue/`@repo/ui` leftovers) using corrected, semantically-equivalent checks: `grep -o "<StaggerItem"/"<PremiumButton" | wc -l` for exact opening-tag counts, and `grep -Ec ... | awk -F: '{s+=$NF} END{print s+0}'` to sum per-file counts into a single scalar. All corrected checks pass; the underlying implementation was correct on the first attempt in all cases — only the verify script's counting methodology was flawed.
- **Files modified:** None (implementation files unaffected; only the ad-hoc verification commands run during this session were corrected)
- **Verification:** All 6 Home sections render the exact card/button counts specified (4 Problem cards, 8 Features cards, 2 CTA Banner buttons, 3 Testimonials cards), confirmed via corrected occurrence-based grep and manual line inspection
- **Committed in:** fa691cc (Task 1), 3d674d1 (Task 2) — no separate fix commit needed since implementation was already correct

**2. [Rule 3 - Blocking] Installed missing worktree dependencies before running check-types**
- **Found during:** Task 2's `pnpm --filter web check-types` verify step
- **Issue:** The worktree had no `node_modules` at all (fresh worktree checkout never had `pnpm install` run in it), so `next`/`tsc` were not resolvable — `check-types` failed with `spawn ENOENT` before ever reaching a type-checking step
- **Fix:** Ran `pnpm install --frozen-lockfile` at the worktree root (existing `pnpm-lock.yaml`, no version changes, no new packages added — pure environment setup, not a package-legitimacy install per the deviation-rule exclusion's intent)
- **Files modified:** None (`pnpm-lock.yaml` untouched — frozen-lockfile install)
- **Verification:** `pnpm --filter web check-types` then ran successfully; confirmed zero new errors outside the pre-existing `csstype` conflict in `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx`
- **Committed in:** N/A (no file changes to commit — `node_modules` is gitignored)

---

**Total deviations:** 2 auto-fixed (1 bug in plan's own verify tooling, 1 blocking environment-setup issue)
**Impact on plan:** No scope creep. Both fixes were necessary to actually confirm the plan's acceptance criteria were met; neither touched implementation files.

## Issues Encountered
- Session was interrupted by a platform-level API error (Claude Code session limit) mid-Task-1, after `problem.tsx` had already been written but before verification/commit. On resume, re-verified worktree state via `git status`/`git diff` before continuing — confirmed no prior commits existed and no work was lost; resumed exactly where left off.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Home page is feature-complete per HOME-01 and ROADMAP Phase 2 success criterion 1; `StaggerGrid`/`StaggerItem` are ready for reuse by the Demo and Contacts modules in subsequent plans of this phase.
- Manual spot-check (browser verification of scroll-reveal stagger timing, `#features` anchor scroll, both `/demo` CTAs) was explicitly out of scope for this plan's automated verification (per the plan's `<verification>` section) — recommended before phase sign-off.
- No blockers for Contacts/Demo plans in this phase.

---
*Phase: 02-home-contacts-demo*
*Completed: 2026-08-09*
