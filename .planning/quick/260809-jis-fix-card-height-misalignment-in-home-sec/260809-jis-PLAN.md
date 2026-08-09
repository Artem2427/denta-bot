---
task_id: 260809-jis
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/modules/home/stagger-grid.tsx
  - apps/web/shared/components/premium-card.tsx
autonomous: false
requirements: []
must_haves:
  truths:
    - "Problem section's 4 cards render with equal height and aligned bottom borders across the row, regardless of copy length per card"
    - "Features section's 8 cards render with equal height and aligned bottom borders within each grid row"
    - "Testimonials' 3 cards render with equal height and aligned bottom borders, regardless of differing quote lengths"
  artifacts:
    - apps/web/modules/home/stagger-grid.tsx
    - apps/web/shared/components/premium-card.tsx
  key_links:
    - "StaggerGrid's `grid` container already stretches each StaggerItem to the row's tallest-card height (CSS grid default align-items:stretch) -> StaggerItem's motion.div must carry `h-full` to consume that stretched height -> PremiumCard's root div must also carry `h-full` to fill the now-tall StaggerItem wrapper, closing the height chain from grid row down to the visible card border"
---

<objective>
Fix card height misalignment in the Home page's Problem, Features, and Testimonials sections. Cards with different text lengths currently render at visibly different heights/border positions inside the same CSS grid row, because neither `StaggerItem`'s wrapping `motion.div` nor `PremiumCard`'s root `div` stretch to fill the grid row height that their `grid` parent already allocates.

Purpose: Restore the pre-redesign visual alignment where all cards in a row share the same height and bottom border position, regardless of content length.
Output: `h-full` added to `StaggerItem`'s `motion.div` (`apps/web/modules/home/stagger-grid.tsx`) and to `PremiumCard`'s root `div` (`apps/web/shared/components/premium-card.tsx`). No other structural changes; three consumer files (`problem.tsx`, `features.tsx`, `testimonials.tsx`) are unmodified and verified visually only.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/stagger-grid.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/premium-card.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/problem.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/features.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/testimonials.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add h-full to StaggerItem and PremiumCard so cards stretch to their grid row height</name>
  <files>apps/web/modules/home/stagger-grid.tsx, apps/web/shared/components/premium-card.tsx</files>
  <action>
    In `apps/web/modules/home/stagger-grid.tsx`, `StaggerItem` currently returns `<motion.div variants={revealVariants}>{children}</motion.div>` with no className prop at all. Add `className="h-full"` to that `motion.div`. `StaggerItem` does not currently accept a `className` prop from callers, so a literal string is correct here — do not add a new prop, just set the className directly so the wrapper consumes the full row height the parent `grid` container (`StaggerGrid className="grid gap-6 ..."`) already allocates to it via the CSS grid default `align-items: stretch`.

    In `apps/web/shared/components/premium-card.tsx`, `PremiumCard`'s root `div` builds its className via `cn('rounded-dt-card border border-dt-navy/10 bg-dt-warm-white p-6 shadow-[var(--shadow-dt-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-dt-hover)]', className)`. Add the `h-full` token to that first string argument (e.g. prepend `'h-full rounded-dt-card ...'`), keeping every existing class token and the `className` passthrough argument exactly as-is — this makes PremiumCard's own root div fill the now-tall `StaggerItem` wrapper from Task 1's first change, closing the height chain from grid row to visible card border.

    Do not touch `problem.tsx`, `features.tsx`, or `testimonials.tsx` — they already pass `PremiumCard` as `StaggerItem`'s child and need no code changes; the fix propagates through the two shared components only.
  </action>
  <verify>
    <automated>
test "$(grep -c 'className="h-full"' apps/web/modules/home/stagger-grid.tsx)" -ge "1" && \
test "$(grep -c "'h-full" apps/web/shared/components/premium-card.tsx)" -ge "1" && \
pnpm --filter web lint && \
CT_OUT="$(pnpm --filter web check-types 2>&1)"; \
test -z "$(printf '%s' "$CT_OUT" | grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx')" && \
echo PASS
    </automated>
  </verify>
  <done>Both `StaggerItem`'s motion.div and `PremiumCard`'s root div carry an `h-full` class alongside their existing classes; `pnpm --filter web lint` passes with zero warnings; `pnpm --filter web check-types` produces no new TS errors (pre-existing button-group.tsx/calendar.tsx/sidebar.tsx csstype errors excluded).</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>`h-full` added to `StaggerItem` (`apps/web/modules/home/stagger-grid.tsx`) and `PremiumCard` (`apps/web/shared/components/premium-card.tsx`) so every card now stretches to fill its CSS grid row height instead of sizing to its own content.</what-built>
  <how-to-verify>
    1. Run `pnpm --filter web dev` (or reuse a running dev server) and open http://localhost:3000/.
    2. Scroll to "Знайомо?" (Problem — 4 cards, `lg:grid-cols-4`). Confirm all 4 card borders/backgrounds end at the same bottom edge on desktop width, even though each card has a different amount of body text.
    3. Scroll to "Все що потрібно для роботи клініки" (Features — 8 cards, `lg:grid-cols-4`, two rows of 4). Confirm each row's 4 cards share the same bottom edge (row 1 aligns independently from row 2).
    4. Scroll to "Що кажуть клініки" (Testimonials — 3 cards, `md:grid-cols-3`). Confirm all 3 cards share the same bottom edge despite each having a visibly different quote length.
    5. Resize the viewport to a `md` (tablet, 2-column) width and re-check Problem/Features — confirm alignment still holds for a partial second row.
  </how-to-verify>
  <resume-signal>Type "approved" or describe which card(s)/section(s) still look misaligned.</resume-signal>
</task>

</tasks>

<verification>
- `grep` confirms `h-full` present in both `stagger-grid.tsx` and `premium-card.tsx`.
- `pnpm --filter web lint` and `pnpm --filter web check-types` (filtered for pre-existing csstype errors) both pass.
- Human visual check confirms Problem (4 cards), Features (8 cards, 2 rows), and Testimonials (3 cards) all render with aligned card heights/borders per row at both desktop and tablet widths.
</verification>

<success_criteria>
- Both shared components (`StaggerItem`, `PremiumCard`) stretch to fill their CSS grid row.
- No visual regression: existing hover/transition/shadow/spacing classes on `PremiumCard` remain unchanged.
- No code changes required in `problem.tsx`, `features.tsx`, or `testimonials.tsx`.
- Reviewer confirms all three Home sections now render with visually aligned card heights.
</success_criteria>

<output>
Create `.planning/quick/260809-jis-fix-card-height-misalignment-in-home-sec/260809-jis-SUMMARY.md` when done
</output>
