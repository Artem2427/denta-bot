---
task_id: 260809-vcj
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/shared/hooks/use-count-up.ts
  - apps/web/modules/home/hero.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "On first load of the Home page, each of the 3 hero stat numbers (клінік, записів/місяць, задоволених) animates counting up from 0 to its target value over ~1.8s via requestAnimationFrame, then lands exactly on the current static display: '500+', '15 000+' (space thousand-separator), '98%'."
    - "Users with prefers-reduced-motion enabled see each stat's final value immediately on mount, with zero animation frames scheduled."
    - "The count-up logic lives in a new, standalone, exported hook (apps/web/shared/hooks/use-count-up.ts) — admin-tab.tsx's private useCountUp and the admin-simulation surface are untouched."
  artifacts:
    - apps/web/shared/hooks/use-count-up.ts
    - apps/web/modules/home/hero.tsx
  key_links:
    - "hero.tsx's HeroStat subcomponent calls useCountUp(stat.target, 1800) per stat and formats the live returned integer via formatStatNumber(count, stat.thousands) + stat.suffix, reconstructing '500+', '15 000+', '98%' exactly on every animation frame."
    - "useCountUp calls useReducedMotion() from motion/react — the same library hero.tsx and reveal.tsx already use for motion primitives — so reduced-motion behavior is consistent across the premium design system."
---

<objective>
Add a count-up animation to the 3 hero stats on Home (`apps/web/modules/home/hero.tsx`), replacing the static `500+` / `15 000+` / `98%` text with numbers that animate from 0 to their target on first page load, landing on the exact current formatting.

Purpose: Give the above-the-fold hero stats a moment of motion on load (matching the polish level of the rest of the premium design system) without introducing a dependency on the `@repo/ui`-based admin-simulation surface's private `useCountUp` in `admin-tab.tsx` — that hook stays untouched and unexported, per the Phase 01.1 architectural split between the marketing site's bespoke design system and the admin-simulation surface.
Output: A new reusable `useCountUp` hook at `apps/web/shared/hooks/use-count-up.ts`, and `hero.tsx`'s stats rendering updated to use it.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/hero.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/hooks/use-in-view.ts
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/reveal.tsx

Reference only, do NOT modify — mirrors the RAF tick/cleanup pattern to copy into the new standalone hook:
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/demo/admin-tab.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create standalone useCountUp hook</name>
  <files>apps/web/shared/hooks/use-count-up.ts</files>
  <action>
    Create a new file starting with a `'use client'` directive (matching the sibling `use-in-view.ts` hook's convention), importing `useEffect` and `useState` from `react`, and `useReducedMotion` from `motion/react`.

    Export a function `useCountUp(target: number, durationMs = 1000): number`. Inside:
    - Call `useReducedMotion()` and store the result.
    - Initialize a `value` state to `0` via `useState`.
    - In a `useEffect` with dependency array `[target, durationMs]` plus the reduced-motion flag: if reduced motion is preferred, call `setValue(target)` synchronously and return early from the effect with no `requestAnimationFrame` scheduled at all.
    - Otherwise, mirror `admin-tab.tsx`'s `useCountUp` RAF implementation exactly: capture `startTime = performance.now()` at effect start, define an inner `tick(now)` function that computes `elapsed = now - startTime`, `progress = Math.min(elapsed / durationMs, 1)`, calls `setValue(Math.round(target * progress))`, and re-schedules itself via `requestAnimationFrame` while `progress < 1`. Kick off the first frame with `requestAnimationFrame(tick)`, store its id, and return a cleanup function that calls `cancelAnimationFrame` on that id.
    - Return `value` from the hook.

    This is a standalone, exported primitive independent of `admin-tab.tsx` — do not import from or modify `admin-tab.tsx`.
  </action>
  <verify>
    <automated>
test "$(grep -c "'use client'" apps/web/shared/hooks/use-count-up.ts)" = "1" && \
test "$(grep -c 'export function useCountUp' apps/web/shared/hooks/use-count-up.ts)" = "1" && \
test "$(grep -c 'useReducedMotion' apps/web/shared/hooks/use-count-up.ts)" -ge "1" && \
test "$(grep -c 'requestAnimationFrame' apps/web/shared/hooks/use-count-up.ts)" -ge "1" && \
test "$(grep -c 'cancelAnimationFrame' apps/web/shared/hooks/use-count-up.ts)" -ge "1" && \
pnpm --filter web lint && \
CT_OUT="$(pnpm --filter web check-types 2>&1)"; \
test -z "$(printf '%s' "$CT_OUT" | grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx')" && \
echo PASS
    </automated>
  </verify>
  <done>`apps/web/shared/hooks/use-count-up.ts` exists, exports `useCountUp(target, durationMs)`, uses the RAF tick/cleanup pattern from `admin-tab.tsx`, and short-circuits to the target value with no scheduled frames when `useReducedMotion()` is true. `pnpm --filter web lint` and `pnpm --filter web check-types` (filtered for pre-existing csstype errors) both pass.</done>
</task>

<task type="auto">
  <name>Task 2: Wire animated stats into hero.tsx</name>
  <files>apps/web/modules/home/hero.tsx</files>
  <action>
    Import `useCountUp` from `@/shared/hooks/use-count-up`, inserted alphabetically between the existing `@/shared/components/reveal` import and the `@/shared/lib/motion` import.

    Replace the `stats` array's shape from `{ value: string, label: string }` entries to `{ target: number, suffix: string, label: string, thousands?: boolean }` entries, preserving the exact same 3 stats and labels in the same order: `{ target: 500, suffix: '+', label: 'клінік' }`, `{ target: 15000, suffix: '+', label: 'записів/місяць', thousands: true }`, `{ target: 98, suffix: '%', label: 'задоволених' }`.

    Add a module-level helper `formatStatNumber(value: number, thousands?: boolean): string` above or below the `stats` array: when `thousands` is falsy, return `String(value)`; when `thousands` is true, insert a literal space every three digits from the right via a digit-grouping regex (e.g. `\B(?=(\d{3})+(?!\d))`) so `15000` renders as `'15 000'`, matching the design's existing space-separator style exactly.

    Add a module-level component `HeroStat({ stat }: { stat: (typeof stats)[number] }): React.JSX.Element` that calls `useCountUp(stat.target, 1800)`, formats the returned live integer via `formatStatNumber(count, stat.thousands)`, appends `stat.suffix`, and renders the identical markup/classNames the current inline map body uses (`space-y-1` wrapper div; number in a div with `text-dt-h2 font-dt-heading font-bold text-dt-teal`; `stat.label` in a div with `text-sm text-dt-graphite`).

    In the `Hero` component's stats grid (`grid grid-cols-3 gap-4 pt-8`), replace the current inline `stats.map` body with `stats.map((stat) => <HeroStat key={stat.label} stat={stat} />)`. The animation starts on mount with no scroll-trigger (Hero is above-the-fold), consistent with `idleBounceAnimate` already running unconditionally on this page.

    Only `apps/web/shared/hooks/use-count-up.ts` (Task 1) and this file change — do not touch `admin-tab.tsx` or any other file.
  </action>
  <verify>
    <automated>
test "$(grep -c 'useCountUp' apps/web/modules/home/hero.tsx)" -ge "2" && \
test "$(grep -c 'target: 500' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'target: 15000' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'target: 98' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'thousands: true' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'function HeroStat' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'function formatStatNumber' apps/web/modules/home/hero.tsx)" = "1" && \
pnpm --filter web lint && \
CT_OUT="$(pnpm --filter web check-types 2>&1)"; \
test -z "$(printf '%s' "$CT_OUT" | grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx')" && \
echo PASS
    </automated>
  </verify>
  <done>`hero.tsx` imports and uses `useCountUp` via a `HeroStat` subcomponent for all 3 stats; `stats` carries numeric `target`/`suffix`/optional `thousands` fields; `formatStatNumber` reconstructs the exact current display strings from the live animated integer. No other file besides `use-count-up.ts` and `hero.tsx` changed. `pnpm --filter web lint` and `pnpm --filter web check-types` (filtered for pre-existing csstype errors) both pass.</done>
</task>

</tasks>

<verification>
- `grep`-based structural checks confirm `use-count-up.ts` exports `useCountUp` with the RAF/reduced-motion pattern, and `hero.tsx` wires it in via a `HeroStat` subcomponent with numeric `target`/`suffix`/`thousands` stat fields and a `formatStatNumber` helper.
- `pnpm --filter web lint` and `pnpm --filter web check-types` (pre-existing `button-group.tsx`/`calendar.tsx`/`sidebar.tsx` csstype errors excluded per prior phase precedent) pass after each task.
- Non-blocking note: a human visual check on `/` (Home) confirming the 3 hero stats visibly count up from 0 to 500+/15 000+/98% on first load, and land on the exact prior static text, is worthwhile — but per this task's constraints it doesn't block completion, since every change has a concrete, objectively-verifiable grep-based acceptance criterion above. Also worth confirming manually: toggling OS-level "reduce motion" shows the stats appearing instantly with no count-up.
</verification>

<success_criteria>
- `apps/web/shared/hooks/use-count-up.ts` exists as a new, standalone, exported `useCountUp(target, durationMs)` hook independent of `admin-tab.tsx`'s private implementation.
- `hero.tsx`'s 3 stats animate count-up from 0 to their target (500, 15000, 98) over ~1.8s on mount, landing on `'500+'`, `'15 000+'`, `'98%'` exactly as before.
- `prefers-reduced-motion` is respected: no RAF frames scheduled, final value shown immediately.
- Only `apps/web/shared/hooks/use-count-up.ts` (new) and `apps/web/modules/home/hero.tsx` (modified) change — `admin-tab.tsx` is untouched.
- `pnpm --filter web lint` and `pnpm --filter web check-types` pass (filtered for pre-existing csstype errors).
</success_criteria>

<output>
Create `.planning/quick/260809-vcj-add-count-up-animation-to-the-3-hero-sta/260809-vcj-SUMMARY.md` when done
</output>
