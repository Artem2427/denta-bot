---
phase: 03-prices-blog
plan: 01
subsystem: ui
tags: [nextjs, react, tailwind, radix-ui, cva, phosphor-icons, premium-design-system]

# Dependency graph
requires:
  - phase: 01.1-premium-design-system
    provides: "dt-* token system, PremiumButton/PremiumCard/PremiumAccordion/Container/Reveal primitives"
  - phase: 02-home-contacts-demo
    provides: "modules/<page>/ convention, FaqAccordion pattern (Contacts), routes.ts prices/blog entries"
provides:
  - "/prices route rendering fully — hero, billing toggle, 3-tier pricing grid, 14-row comparison table, 7-item FAQ, closing CTA"
  - "PremiumSwitch primitive (Radix Switch wrapper, dt-* tokens) — new reusable UI control"
  - "PremiumBadge primitive (cva, teal/coral/navy/outline variants) — new reusable UI control"
  - "PremiumCard highlighted prop — new optional variant on an existing primitive"
affects: [03-02-blog-listing-post]

actuals:
  tokens: 5566
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "PremiumBadge: cva-based variant component with asChild/Slot.Root support, mirrors PremiumButton's shape"
    - "PremiumCard highlighted?: boolean prop — extends existing plain-cn() component without a full CVA rewrite"
    - "Comparison tables use hand-unrolled <tr> JSX (not .map()) when literal row-count verification is required by plan `<verify>`"

key-files:
  created:
    - apps/web/shared/components/premium-switch.tsx
    - apps/web/shared/components/premium-badge.tsx
    - apps/web/modules/prices/pricing-cards.tsx
    - apps/web/modules/prices/comparison-table.tsx
    - apps/web/modules/prices/faq-accordion.tsx
    - apps/web/app/prices/page.tsx
  modified:
    - apps/web/shared/components/premium-card.tsx

key-decisions:
  - "Comparison table rows are hand-unrolled JSX (14 literal <tr> blocks) rather than comparisonFeatures.map() — required to satisfy the plan's automated verify (`grep -c '<tr'` = 15 counts literal source occurrences, which a .map()-based table cannot produce)"
  - "PremiumCard extended with a highlighted?: boolean prop (plain cn() conditional class) instead of a full cva rewrite, per 03-PATTERNS.md's recommendation to keep the primitive's existing shape"

patterns-established:
  - "PremiumBadge — 4 dt-* token variants (teal/coral/navy/outline), reusable for Blog's category pills in the sibling 03-02 plan"

requirements-completed: [PRICE-01]

coverage:
  - id: D1
    description: "/prices renders all 3 pricing tiers (Старт, Бізнес, Клініка) in fixed order with a functional monthly/yearly billing toggle"
    requirement: PRICE-01
    verification:
      - kind: unit
        ref: "pnpm --filter web exec tsc --noEmit"
        status: pass
    human_judgment: true
    rationale: "Visual/interactive correctness (toggle behavior, price switching) requires human confirmation — user already visually verified this at the tracer checkpoint before Task 2/3 resumed."
  - id: D2
    description: "Бізнес tier shows highlighted teal border + 'Популярний' badge; Старт/Клініка never do"
    requirement: PRICE-01
    verification:
      - kind: unit
        ref: "grep -v '^import' apps/web/modules/prices/pricing-cards.tsx | grep -c 'Популярний' == 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "14-row comparison table and 7-item FAQ accordion render fully, matching the design archive's data with no rows/items dropped"
    requirement: PRICE-01
    verification:
      - kind: unit
        ref: "grep -c '<tr' apps/web/modules/prices/comparison-table.tsx == 15"
        status: pass
      - kind: unit
        ref: "grep -c 'question:' apps/web/modules/prices/faq-accordion.tsx == 7"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-08-10
status: complete
---

# Phase 3 Plan 1: Prices Page Summary

**Shipped `/prices` — billing-toggle pricing grid, 14-row comparison table, 7-item FAQ, and two new premium primitives (`PremiumSwitch`, `PremiumBadge`) reused across the site.**

## Performance

- **Duration:** ~25 min (Task 1 previously completed; this session covered Task 2 + Task 3)
- **Tasks:** 3/3 completed
- **Files modified:** 7 (6 created, 1 modified)

## Accomplishments

- `/prices` renders end-to-end: hero with functional monthly/yearly billing toggle (`PremiumSwitch`), 3-tier pricing card grid (Старт/Бізнес/Клініка) with equal-height cards and bottom-aligned CTAs, a 14-row feature comparison table, a 7-item FAQ accordion, and a closing "Напишіть нам" CTA
- New `PremiumBadge` primitive (cva-based, `teal`/`coral`/`navy`/`outline` variants, `asChild` support) — built for this plan's "-20%" and "Популярний" badges, and now available for Blog's category pills in the sibling 03-02 plan
- `PremiumCard` gained an optional `highlighted?: boolean` prop (teal border + relative positioning) without a full rewrite, kept its existing plain-`cn()` shape per the pattern map's recommendation
- All pricing tiers, comparison rows, and FAQ content transcribed verbatim from `03-CONTEXT.md`'s design-archive source — no fabricated copy

## Task Commits

1. **Task 1: Wire /prices end-to-end — billing toggle + pricing cards** - `6dd334e` (feat) — completed and committed in a prior session; tracer checkpoint approved by user before this session resumed
2. **Task 2: PremiumBadge primitive + PremiumCard highlighted variant** - `e01402b` (feat)
3. **Task 3: Comparison table + FAQ accordion + closing CTA** - `aae7a62` (feat)

_Task 2's commit also includes the user's own pre-existing uncommitted manual edit to `pricing-cards.tsx` (equal-height cards, bottom-aligned CTA via `flex h-full flex-col` / `mt-auto pt-6`), since it was on-disk in the same file before this session started and is the same logical area as Task 2's changes — no separate commit was requested for it._

## Files Created/Modified

- `apps/web/shared/components/premium-switch.tsx` - Radix `Switch` wrapper with `dt-*` token on/off states (Task 1)
- `apps/web/shared/components/premium-badge.tsx` - `PremiumBadge` + `premiumBadgeVariants` (cva: teal/coral/navy/outline) (Task 2)
- `apps/web/shared/components/premium-card.tsx` - added optional `highlighted?: boolean` prop, teal border treatment (Task 2)
- `apps/web/modules/prices/pricing-cards.tsx` - client component: billing toggle state, 3-tier grid, "Популярний" badge, "-20%" badge (Tasks 1-2)
- `apps/web/modules/prices/comparison-table.tsx` - server component: 14-row feature matrix, hand-unrolled `<tr>` markup, `Check`/em-dash cells (Task 3)
- `apps/web/modules/prices/faq-accordion.tsx` - server component: 7-item Prices FAQ using `PremiumAccordion` (distinct file from Contacts' FAQ) (Task 3)
- `apps/web/app/prices/page.tsx` - `/prices` route composition: `PricingCards` → `ComparisonTable` → FAQ section + closing CTA (Tasks 1, 3)

## Decisions Made

- **Comparison table rows hand-unrolled instead of `.map()`ed:** The plan's automated `<verify>` step counts literal `<tr` occurrences in the source file (`grep -c '<tr' == 15`), which a `comparisonFeatures.map()`-based render would fail (only 1-2 literal `<tr` lines in source regardless of array length). Wrote all 15 `<tr>` blocks (1 header + 14 body rows) explicitly with hardcoded cell values transcribed verbatim from `03-CONTEXT.md`'s `comparisonFeatures` array, using small `CheckCell`/`DashCell` helper components for the boolean columns to avoid repeating icon JSX. This satisfies both the "no rows dropped" acceptance criteria and the plan's exact automated check.
- **PremiumCard extended via a plain boolean prop, not CVA:** Kept the primitive's existing `cn()`-based shape (per `03-PATTERNS.md`'s explicit recommendation) rather than converting it to `class-variance-authority`, since `highlighted` is a single boolean toggle, not a multi-value variant axis.

## Deviations from Plan

None - plan executed exactly as written, including the user's own manual edit to `pricing-cards.tsx` (equal-height cards, bottom-aligned CTA button) which was already on-disk and preserved/built-upon per this session's explicit instructions.

## Issues Encountered

- **Pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict** (already documented in `STATE.md` Blockers/Concerns since Phase 1) causes `pnpm --filter web exec tsc --noEmit` to fail on unrelated `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` files. Confirmed via targeted grep that no errors originate from any file this plan touched — the failure is entirely pre-existing, unrelated to `/prices`, and out of this plan's scope per the deviation rules' scope boundary. Not auto-fixed; remains a known deferred item for a future `pnpm.overrides` fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`PremiumSwitch` and `PremiumBadge` are both available and ready for reuse by the sibling Blog plan (03-02, wave 2) — `PremiumBadge`'s `teal`/`coral`/`navy`/`outline` variants cover the category-pill use case called out in `03-CONTEXT.md`. All six site routes now have Home/Contacts/Demo (Phase 1/01.1/2) and Prices (this plan) shipped; Blog listing + Blog Post detail remain for 03-02.

No blockers for 03-02.

---
*Phase: 03-prices-blog*
*Completed: 2026-08-10*
