---
task_id: 260809-vac
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/shared/lib/motion.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "The idle bounce animation on the Home hero's 'Новий запис від Олени Коваль' notification card now overshoots slightly past its peak before settling (a spring/bounce feel) instead of the smooth monotonic deceleration of EASE_DT_EXPO_OUT — because idleBounceTransition's ease is now the new EASE_DT_BOUNCE ease-out-back cubic-bezier token"
    - "duration: 1.6, y: [0, -8, 0], and repeat: Infinity are all unchanged — only the ease value changed"
    - "EASE_DT_EXPO_OUT, revealVariants, revealContainerVariants, and hoverLift remain byte-identical since EASE_DT_EXPO_OUT is still used by Reveal and hoverLift for their non-bouncy scroll-reveal/hover motion"
  artifacts:
    - apps/web/shared/lib/motion.ts
  key_links:
    - "hero.tsx already imports idleBounceAnimate/idleBounceTransition by reference and applies them to the notification card's motion.div via animate/transition props, gated by useReducedMotion() — swapping the ease constant in motion.ts propagates automatically with zero changes needed in hero.tsx"
---

<objective>
Give the idle bounce animation on the Home hero's "Новий запис від Олени Коваль" notification card (`apps/web/modules/home/hero.tsx`, driven by `apps/web/shared/lib/motion.ts`) a natural spring/overshoot feel instead of its current plain deceleration, per direct user feedback ("дебаунс ефект и плавна" — a physical spring bounce, not a technical debounce). All changes are confined to `apps/web/shared/lib/motion.ts`.

Purpose: The current `idleBounceTransition` uses `EASE_DT_EXPO_OUT` (`[0.16, 1, 0.3, 1]`), a smooth deceleration curve with no overshoot — it reads as a plain float, not a bounce. Adding a new `EASE_DT_BOUNCE` ease-out-back cubic-bezier (`[0.34, 1.56, 0.64, 1]`) and using it only for `idleBounceTransition` gives the notification card a spring-like overshoot while keeping `EASE_DT_EXPO_OUT` unchanged for its other consumers (`revealVariants`, `hoverLift`), which should stay non-bouncy.
Output: New `EASE_DT_BOUNCE` export added to `apps/web/shared/lib/motion.ts`; `idleBounceTransition.ease` switched from `EASE_DT_EXPO_OUT` to `EASE_DT_BOUNCE`. `hero.tsx` is untouched — it already consumes `idleBounceAnimate`/`idleBounceTransition` by reference.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/lib/motion.ts
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/hero.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add EASE_DT_BOUNCE and switch idleBounceTransition's ease to it</name>
  <files>apps/web/shared/lib/motion.ts</files>
  <action>
    In `apps/web/shared/lib/motion.ts`, add a new named export `EASE_DT_BOUNCE` directly below the existing `EASE_DT_EXPO_OUT` const declaration, following the exact same pattern: `export const EASE_DT_BOUNCE = [0.34, 1.56, 0.64, 1] as const;`. This is a standard "ease-out-back" cubic-bezier that overshoots past 1 before settling, giving a spring-like bounce character while remaining a smooth interpolated curve.

    Then, in `idleBounceTransition`, change only the `ease` field from `EASE_DT_EXPO_OUT` to `EASE_DT_BOUNCE`. Keep `duration: 1.6` and `repeat: Infinity` exactly as they currently are. Do not touch `idleBounceAnimate` (`{ y: [0, -8, 0] }`) at all.

    Do NOT modify `EASE_DT_EXPO_OUT`, `revealVariants`, `revealContainerVariants`, or `hoverLift` — leave those four byte-identical, since `EASE_DT_EXPO_OUT` is still consumed by `revealVariants` (in `Reveal`) and `hoverLift` and must keep its current non-bouncy character there.

    Do not modify `apps/web/modules/home/hero.tsx` — it already imports and applies `idleBounceAnimate`/`idleBounceTransition` by reference in the notification card's `motion.div`, and its `useReducedMotion()` gating (setting `animate`/`transition` to `undefined` when reduced motion is preferred) requires zero changes to keep working.
  </action>
  <verify>
    <automated>
test "$(grep -c 'export const EASE_DT_BOUNCE = \[0.34, 1.56, 0.64, 1\] as const;' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'export const EASE_DT_EXPO_OUT = \[0.16, 1, 0.3, 1\] as const;' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'ease: EASE_DT_BOUNCE' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'ease: EASE_DT_EXPO_OUT' apps/web/shared/lib/motion.ts)" = "2" && \
test "$(grep -c 'duration: 1.6' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'repeat: Infinity' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'y: \[0, -8, 0\]' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'duration: 0.5, ease: EASE_DT_EXPO_OUT' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'duration: 0.2, ease: EASE_DT_EXPO_OUT' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'staggerChildren: 0.08' apps/web/shared/lib/motion.ts)" = "1" && \
git diff --name-only -- apps/web | grep -qx 'apps/web/shared/lib/motion.ts' && \
test "$(git diff --name-only -- apps/web | wc -l | tr -d ' ')" = "1" && \
pnpm --filter web lint && \
CT_OUT="$(pnpm --filter web check-types 2>&1)"; \
test -z "$(printf '%s' "$CT_OUT" | grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx')" && \
echo PASS
    </automated>
  </verify>
  <done>`apps/web/shared/lib/motion.ts` exports a new `EASE_DT_BOUNCE = [0.34, 1.56, 0.64, 1] as const` and `idleBounceTransition.ease` is `EASE_DT_BOUNCE` (duration/repeat/idleBounceAnimate unchanged). `EASE_DT_EXPO_OUT`, `revealVariants`, `revealContainerVariants`, and `hoverLift` are unchanged, with `EASE_DT_EXPO_OUT` still used exactly twice (in `revealVariants` and `hoverLift`). `apps/web/modules/home/hero.tsx` has zero diff. `pnpm --filter web lint` and `pnpm --filter web check-types` (filtered for pre-existing csstype errors) both pass.</done>
</task>

</tasks>

<verification>
- `grep`-based structural checks confirm `EASE_DT_BOUNCE` is added with the exact value, `idleBounceTransition.ease` now references it, `EASE_DT_EXPO_OUT` still appears exactly twice (in `revealVariants`/`hoverLift`), and `duration: 1.6`/`repeat: Infinity`/`y: [0, -8, 0]` are unchanged.
- `git diff --name-only` confirms `apps/web/shared/lib/motion.ts` is the only file touched — `hero.tsx` has zero diff.
- `pnpm --filter web lint` and `pnpm --filter web check-types` (pre-existing `button-group.tsx`/`calendar.tsx`/`sidebar.tsx` csstype errors excluded) pass after the change.
</verification>

<success_criteria>
- A new `EASE_DT_BOUNCE = [0.34, 1.56, 0.64, 1] as const` export exists in `motion.ts`, following the exact pattern of `EASE_DT_EXPO_OUT`.
- `idleBounceTransition` uses `EASE_DT_BOUNCE` as its `ease` value; `duration: 1.6`, `y: [0, -8, 0]`, and `repeat: Infinity` are preserved.
- `EASE_DT_EXPO_OUT`, `revealVariants`, `revealContainerVariants`, and `hoverLift` remain byte-identical.
- Only `apps/web/shared/lib/motion.ts` is modified; `hero.tsx` requires zero changes.
- `pnpm --filter web lint` and `pnpm --filter web check-types` pass (filtered for pre-existing csstype errors).
</success_criteria>

<output>
Create `.planning/quick/260809-vac-switch-idle-bounce-animation-ease-to-a-s/260809-vac-SUMMARY.md` when done
</output>
