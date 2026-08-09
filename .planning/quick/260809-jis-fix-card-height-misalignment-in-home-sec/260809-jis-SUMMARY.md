---
status: complete
---

## Quick Task: Fix card height misalignment in Home sections

**Task 1 (auto):** Added `h-full` to `StaggerItem`'s `motion.div` (`apps/web/modules/home/stagger-grid.tsx`) and to `PremiumCard`'s root `div` (`apps/web/shared/components/premium-card.tsx`), so both consume the row height their `grid` parent already allocates via CSS grid's default `align-items: stretch`. No changes needed in `problem.tsx`, `features.tsx`, or `testimonials.tsx`.

Commit: `38a5265` — `fix(260809-jis): stretch cards to fill grid row height`

Verification: `pnpm --filter web lint` clean; `pnpm --filter web check-types` shows no new errors (pre-existing csstype conflicts in `button-group.tsx`/`calendar.tsx`/`sidebar.tsx` excluded).

**Task 2 (checkpoint:human-verify):** User confirmed at http://localhost:3000/ that Problem (4 cards), Features (8 cards, 2 rows), and Testimonials (3 cards) all render with aligned card heights/borders per row.

## Self-Check: PASSED
