---
phase: quick
plan: 260820-csp
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/modules/landing/reviews.tsx
autonomous: true
requirements: []

estimate:
  tokens: 8000
  raw_tokens: 8000
  tasks: 1
  confidence: high

must_haves:
  truths:
    - "Reviews carousel cards render at a fixed 300px width instead of stepped percentage breakpoints"
    - "Embla loop/align:'start' behavior and prev/next button disabled-state logic are unchanged"
  artifacts:
    - apps/web/modules/landing/reviews.tsx
  key_links:
    - "Per-item flex-basis class -> Embla slide sizing (min-w-0 + flex-[0_0_300px])"
</must_haves>
---

<objective>
Change the Reviews carousel's per-card slide width from responsive percentage flex-basis to a fixed 300px flex-basis, now that the carousel track is full-bleed (no max-width cap from the prior quick task 260820-1oe).

Purpose: With no container width cap, stepped percentage breakpoints (100%/50%/33.3333%) no longer produce a sensible card count — a fixed pixel width lets the number of visible cards derive naturally from viewport width.
Output: `apps/web/modules/landing/reviews.tsx` with a fixed-width card class, no other files touched.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@apps/web/modules/landing/reviews.tsx

No existing `--dt-card-width` or similar fixed-width design token exists in `apps/web/app/premium-theme.css`, and no sibling landing module uses a fixed pixel flex-basis pattern — a literal Tailwind arbitrary-value class (`flex-[0_0_300px]`) is the correct, simplest choice here (matches user's explicit "e.g. 300px" instruction; no token invented for a one-off usage).
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix carousel card width to 300px</name>
  <files>apps/web/modules/landing/reviews.tsx</files>
  <action>
    In the `items.map` block (around line 108), change the per-card wrapper `div`'s
    `className` from `min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%]`
    to `min-w-0 flex-[0_0_300px] pl-6`.

    Drop the `sm:flex-[0_0_50%]` and `lg:flex-[0_0_33.3333%]` responsive steps entirely —
    a fixed 300px basis needs no breakpoints. Keep `min-w-0` (Embla flex children still
    need it to prevent flex-shrink overflow) and keep `pl-6` (the per-item left gutter that
    pairs with the track's `-ml-6` counter-margin for inter-card spacing — unrelated to
    slide width, must stay as-is). Do not touch any other line, class, or file — this is a
    single className edit.
  </action>
  <verify>
    <automated>grep -n "flex-\[0_0_300px\] pl-6" apps/web/modules/landing/reviews.tsx | grep -vc "sm:flex-\[0_0_50%\]"</automated>
  </verify>
  <done>
    The per-card div's className is exactly `min-w-0 flex-[0_0_300px] pl-6` — no `sm:`/`lg:`
    responsive flex-basis modifiers remain anywhere in the file. Embla config (`loop: true`,
    `align: 'start'`), scroll button handlers, and disabled-state logic are byte-identical to
    before this change.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None — this is a purely presentational CSS class change to a client component with no new data flow, user input, or trust boundary crossing.

## STRIDE Threat Register

No new threats introduced. This change modifies only a Tailwind utility class string on an existing, already-reviewed component; no new inputs, dependencies, or attack surface.
</threat_model>

<verification>
- `grep -n "flex-\[0_0_300px\] pl-6" apps/web/modules/landing/reviews.tsx` matches the per-card div's className.
- `grep -c "sm:flex-\[0_0_50%\]\|lg:flex-\[0_0_33.3333%\]" apps/web/modules/landing/reviews.tsx` returns 0 (old responsive classes fully removed).
- No other file in the diff besides `apps/web/modules/landing/reviews.tsx`.
- Manual/visual: run the dev server, confirm the Reviews carousel renders fixed 300px cards, loop wraparound and prev/next buttons still work.
</verification>

<success_criteria>
Reviews carousel cards render at a fixed 300px width across all viewport sizes; Embla loop, align:'start', and prev/next button behavior are unchanged; only `apps/web/modules/landing/reviews.tsx` was modified.
</success_criteria>

<output>
Create `.planning/quick/260820-csp-reviews-tsx-change-each-carousel-card-s-/260820-csp-SUMMARY.md` when done
</output>
