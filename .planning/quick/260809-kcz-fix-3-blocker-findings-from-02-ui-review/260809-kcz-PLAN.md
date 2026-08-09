---
task_id: 260809-kcz
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/app/premium-theme.css
  - apps/web/app/layout.tsx
  - apps/web/modules/home/hero.tsx
  - apps/web/shared/lib/motion.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "No page (Home hero, Contacts, Demo) shows horizontal scroll/overflow at 375px mobile viewport width; the h1/h2 heading tokens scale fluidly instead of using a fixed 64px/40px size"
    - "The Home hero image renders an actual laptop screen showing a dashboard/analytics UI (not the broken/wrong stock photo it currently shows), loaded from a network-verified images.unsplash.com URL returning HTTP 200 with an image content-type"
    - "The 'Новий запис від Олени Коваль' floating notification card on the Home hero animates with a continuous subtle vertical bounce, and that bounce is disabled when the user has prefers-reduced-motion enabled"
  artifacts:
    - apps/web/app/premium-theme.css
    - apps/web/app/layout.tsx
    - apps/web/modules/home/hero.tsx
    - apps/web/shared/lib/motion.ts
  key_links:
    - "premium-theme.css's --text-dt-h1/--text-dt-h2 clamp() tokens are consumed via the text-dt-h1/text-dt-h2 Tailwind utility classes already applied in hero.tsx, contacts/page.tsx, and demo/page.tsx — a token-level fix propagates to all 3 pages without touching those two files"
    - "hero.tsx's motion.div wraps only the top-right notification card and reads idleBounceAnimate/idleBounceTransition from shared/lib/motion.ts, gated by the same useReducedMotion() hook reveal.tsx already uses"
---

<objective>
Fix the 3 BLOCKER-tier findings from `.planning/phases/02-home-contacts-demo/02-UI-REVIEW.md` (score 14/24, all confirmed with screenshot evidence at 375px mobile viewport):

1. Systemic mobile horizontal overflow caused by fixed, non-responsive `--text-dt-h1`/`--text-dt-h2` heading tokens (Typography 1/4, Spacing 1/4).
2. Broken hero image — an Unsplash URL that renders an unrelated error-screen photo instead of a dashboard mockup (Visuals 2/4).
3. Missing idle motion on the floating "Новий запис від Олени Коваль" notification card (Visuals 2/4, Experience Design 3/4).

Purpose: These 3 findings are the direct cause of the phase's low audit score — the mobile overflow bug blocks task completion for the majority of marketing-site traffic (phone users), the broken hero image undermines credibility on the site's primary above-the-fold visual, and the static notification card fails to deliver the "alive" motion moment the client's design brief calls for.
Output: `apps/web/app/premium-theme.css` (fluid clamp() heading tokens), `apps/web/app/layout.tsx` (overflow-x-hidden backstop), `apps/web/modules/home/hero.tsx` (verified working hero image + idle-bounce notification card), `apps/web/shared/lib/motion.ts` (new reusable idle-bounce animation primitive). No other files change — Contacts/Demo pages consume the same `text-dt-h1`/`text-dt-h2` utility classes so the CSS-token fix propagates to them automatically.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/.planning/phases/02-home-contacts-demo/02-UI-REVIEW.md
@/Users/artemdanko/Developer/denta-bot/apps/web/app/premium-theme.css
@/Users/artemdanko/Developer/denta-bot/apps/web/app/layout.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/hero.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/testimonials.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/reveal.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/lib/motion.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make --text-dt-h1/--text-dt-h2 fluid, add overflow-x-hidden backstop</name>
  <files>apps/web/app/premium-theme.css, apps/web/app/layout.tsx</files>
  <action>
    In `apps/web/app/premium-theme.css`'s `@theme` block, replace the fixed `--text-dt-h1: 4rem;` (line 33) with a fluid `clamp()` value: `--text-dt-h1: clamp(2.25rem, 6vw + 1rem, 4rem);` — keep the existing trailing comment style, updating it to note this is now fluid (e.g. "hero, fluid mobile→desktop, caps at the original 3.5–4.5rem range"). Replace the fixed `--text-dt-h2: 2.5rem;` (line 35) with `--text-dt-h2: clamp(1.75rem, 4vw + 0.75rem, 2.5rem);`, same comment-update treatment. Do NOT touch `--text-dt-h1--line-height`, `--text-dt-h2--line-height`, `--text-dt-h3`, `--text-dt-h3--line-height`, `--text-dt-body`, `--text-dt-body--line-height`, `--text-dt-caption`, or any other token in the file — only the two `font-size` custom properties change value.

    In `apps/web/app/layout.tsx`, add `overflow-x-hidden` to the `<body>` element's existing template-literal className (currently `` `${interHeading.variable} ${interBody.variable} font-dt-body` ``) as a defensive backstop against any future oversized content forcing horizontal scroll. Append it to the existing string, do not restructure the className into a different form (e.g. no `cn()` helper needed for one extra class) and do not touch `<html>`, `ThemeProvider`, `Header`, `main`, `Footer`, or `Toaster`.
  </action>
  <verify>
    <automated>
test "$(grep -c -- '--text-dt-h1: clamp(' apps/web/app/premium-theme.css)" = "1" && \
test "$(grep -c -- '--text-dt-h2: clamp(' apps/web/app/premium-theme.css)" = "1" && \
test "$(grep -c -- '--text-dt-h1--line-height: 1.15' apps/web/app/premium-theme.css)" = "1" && \
test "$(grep -c -- '--text-dt-h2--line-height: 1.15' apps/web/app/premium-theme.css)" = "1" && \
test "$(grep -c -- '--text-dt-h3: 1.5rem' apps/web/app/premium-theme.css)" = "1" && \
test "$(grep -c 'overflow-x-hidden' apps/web/app/layout.tsx)" -ge "1" && \
pnpm --filter web lint && \
CT_OUT="$(pnpm --filter web check-types 2>&1)"; \
test -z "$(printf '%s' "$CT_OUT" | grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx')" && \
echo PASS
    </automated>
  </verify>
  <done>`--text-dt-h1` and `--text-dt-h2` in `apps/web/app/premium-theme.css` are `clamp()`-based fluid values (min 2.25rem/1.75rem, max unchanged at the original 4rem/2.5rem), all other type-scale tokens are byte-identical to before. `apps/web/app/layout.tsx`'s `<body>` carries `overflow-x-hidden`. `pnpm --filter web lint` and `pnpm --filter web check-types` (filtered for pre-existing csstype errors) both pass.</done>
</task>

<task type="auto">
  <name>Task 2: Replace broken hero image with a network-verified dashboard photo</name>
  <files>apps/web/modules/home/hero.tsx</files>
  <action>
    In `apps/web/modules/home/hero.tsx`, replace only the `src` value of the `next/image` `Image` component (~line 62) that currently points at the broken Unsplash photo id — swap it for this network-verified working URL, already confirmed during planning to return HTTP 200 with `content-type: image/jpeg` and to visually depict a laptop screen showing a dashboard UI with charts/stats/sidebar nav (the exact "DentaBot Dashboard" alt-text scenario): `https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080` — matching the same query-parameter style (`crop`, `cs`, `fit`, `fm`, `q`, `w`) already used successfully in `testimonials.tsx`'s Unsplash images. Keep `alt="DentaBot Dashboard"`, `width={800}`, `height={600}`, `priority`, `sizes="(min-width: 1024px) 50vw, 100vw"`, and `className="h-auto w-full rounded-dt-card shadow-[var(--shadow-dt-card)]"` completely unchanged — only the `src` string value changes. Do not add a new remote image host; `images.unsplash.com` is already whitelisted in `apps/web/next.config.js`.
  </action>
  <verify>
    <automated>
test "$(grep -c '1460925895917-afdab827c52f' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'images.unsplash.com' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'alt="DentaBot Dashboard"' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'width={800}' apps/web/modules/home/hero.tsx)" = "1" && \
test "$(grep -c 'height={600}' apps/web/modules/home/hero.tsx)" = "1" && \
URL=$(grep -o 'https://images\.unsplash\.com/photo-1460925895917-afdab827c52f[^"]*' apps/web/modules/home/hero.tsx | head -1) && \
test -n "$URL" && \
HEADERS=$(curl -sI "$URL") && \
echo "$HEADERS" | grep -q ' 200' && \
echo "$HEADERS" | grep -qi '^content-type: image/' && \
pnpm --filter web lint && \
CT_OUT="$(pnpm --filter web check-types 2>&1)"; \
test -z "$(printf '%s' "$CT_OUT" | grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx')" && \
echo PASS
    </automated>
  </verify>
  <done>`hero.tsx`'s `Image` component `src` points at `https://images.unsplash.com/photo-1460925895917-afdab827c52f?...` (a laptop-with-dashboard photo, network-verified HTTP 200 + `image/*` content-type at both plan time and executor verify time); `width`/`height`/`sizes`/`className`/`alt` are unchanged from before. `pnpm --filter web lint` and `pnpm --filter web check-types` (filtered) both pass.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Add reduced-motion-aware idle bounce to the notification card</name>
  <files>apps/web/shared/lib/motion.ts, apps/web/modules/home/hero.tsx</files>
  <action>
    In `apps/web/shared/lib/motion.ts`, add two new exports alongside the existing `EASE_DT_EXPO_OUT`/`revealVariants`/`revealContainerVariants`/`hoverLift`, without modifying any of those four: `idleBounceAnimate` — the Motion `animate` keyframe object `{ y: [0, -6, 0] }` — and `idleBounceTransition` — the transition object `{ duration: 3, repeat: Infinity, ease: 'easeInOut' }`. These are the reusable idle-bounce primitive the audit asked for, so future floating cards can reuse them without duplicating the keyframe/transition inline.

    In `apps/web/modules/home/hero.tsx`: add a `'use client'` directive as the very first line of the file (required because the component will call the `useReducedMotion()` hook — the same reason `reveal.tsx` has one). Import `motion` and `useReducedMotion` from `'motion/react'`, and import `idleBounceAnimate`/`idleBounceTransition` from `'@/shared/lib/motion'`. Inside the `Hero` function body, before the `return` statement, call `const prefersReducedMotion = useReducedMotion();` — matching `reveal.tsx`'s pattern exactly (its own `useReducedMotion()` call and reduced-motion branch). Change the outer element of the "Новий запис від Олени Коваль" notification card — the element currently rendered as a plain `div` with className `"absolute -top-4 -right-4 flex items-center gap-2 rounded-dt-card bg-dt-warm-white p-4 shadow-[var(--shadow-dt-hover)]"` — from `div` to `motion.div`, keeping that exact className unchanged, and add `animate={prefersReducedMotion ? undefined : idleBounceAnimate}` and `transition={prefersReducedMotion ? undefined : idleBounceTransition}` props, mirroring `reveal.tsx`'s ternary-branch approach to disabling motion when the user prefers reduced motion. The card's children (`Check` icon, `SignatureMark pulse`, the "Новий запис від Олени Коваль" span) stay exactly as they are.

    Leave the "Нагадування відправлено 24 пацієнтам" reminder card (the other absolutely-positioned card, className starting `"absolute -bottom-4 -left-4"`) completely untouched — it stays a plain `div` with no motion wrapper, no `animate`/`transition` props, and no other changes. Only the top notification card gets the bounce, per the audit's scope.
  </action>
  <verify>
    <automated>
test "$(grep -c "'use client'" apps/web/modules/home/hero.tsx)" -ge "1" && \
test "$(grep -c 'useReducedMotion' apps/web/modules/home/hero.tsx)" -ge "1" && \
test "$(grep -c 'idleBounceAnimate' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'idleBounceTransition' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'idleBounceAnimate' apps/web/modules/home/hero.tsx)" -ge "1" && \
test "$(grep -c 'idleBounceTransition' apps/web/modules/home/hero.tsx)" -ge "1" && \
test "$(grep -c '<motion.div' apps/web/modules/home/hero.tsx)" = "1" && \
grep -B3 'Нагадування відправлено' apps/web/modules/home/hero.tsx | grep -q '<div className="absolute -bottom-4 -left-4' && \
test "$(grep -c 'EASE_DT_EXPO_OUT' apps/web/shared/lib/motion.ts)" = "1" && \
test "$(grep -c 'revealVariants' apps/web/shared/lib/motion.ts)" -ge "1" && \
test "$(grep -c 'hoverLift' apps/web/shared/lib/motion.ts)" = "1" && \
pnpm --filter web lint && \
CT_OUT="$(pnpm --filter web check-types 2>&1)"; \
test -z "$(printf '%s' "$CT_OUT" | grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx')" && \
echo PASS
    </automated>
  </verify>
  <done>`apps/web/shared/lib/motion.ts` exports `idleBounceAnimate`/`idleBounceTransition` without altering existing exports. `hero.tsx` is a client component (`'use client'`), calls `useReducedMotion()`, and renders exactly one `motion.div` — the "Новий запис від Олени Коваль" card — with `animate`/`transition` props gated by `prefersReducedMotion`; the "Нагадування відправлено 24 пацієнтам" card remains a plain, unanimated `div`. `pnpm --filter web lint` and `pnpm --filter web check-types` (filtered) both pass.</done>
</task>

</tasks>

<verification>
- `grep`-based structural checks confirm: fluid `clamp()` tokens for `--text-dt-h1`/`--text-dt-h2` with all sibling tokens byte-identical; `overflow-x-hidden` present on `<body>`; the new hero image URL present with unchanged `width`/`height`/`sizes`/`className`/`alt`; the new `idleBounceAnimate`/`idleBounceTransition` primitive exported from `motion.ts` and consumed by exactly one `motion.div` in `hero.tsx`, with the second floating card untouched.
- A live `curl -sI` network check against the chosen Unsplash URL confirms HTTP 200 + `image/*` content-type — both during planning (already run) and again at executor verify time, so a since-broken/renamed URL would fail the gate rather than silently pass.
- `pnpm --filter web lint` and `pnpm --filter web check-types` (pre-existing `button-group.tsx`/`calendar.tsx`/`sidebar.tsx` csstype errors excluded) pass after all 3 tasks.
- Non-blocking note: a human visual spot-check of http://localhost:3000/ at a 375px viewport (Home hero, Contacts, Demo headings; hero image; notification-card bounce) is worthwhile to confirm the fixes read correctly, and a follow-up `/gsd-ui-review` re-run against Phase 02 would formally re-score the 3 previously-failing pillars — but per this plan's constraints neither blocks completion, since all 3 tasks have concrete, objectively-verifiable structural/network acceptance criteria above.
</verification>

<success_criteria>
- No horizontal scroll/overflow on Home, Contacts, or Demo at 375px viewport width — `--text-dt-h1`/`--text-dt-h2` are fluid `clamp()` values consumed identically by all 3 pages' existing `text-dt-h1`/`text-dt-h2` classes, plus an `overflow-x-hidden` backstop on `<body>`.
- Home hero renders a real, network-verified laptop-with-dashboard photo from `images.unsplash.com` instead of the broken error-screen image, with all other `Image` props unchanged.
- The "Новий запис від Олени Коваль" floating card on Home hero has a continuous, subtle vertical bounce that respects `prefers-reduced-motion`; the "Нагадування відправлено 24 пацієнтам" card is unchanged/static.
- Only `apps/web/app/premium-theme.css`, `apps/web/app/layout.tsx`, `apps/web/modules/home/hero.tsx`, and `apps/web/shared/lib/motion.ts` are modified. Contacts/Demo page files are untouched.
- `pnpm --filter web lint` and `pnpm --filter web check-types` pass (filtered for pre-existing csstype errors) after each task and at plan completion.
</success_criteria>

<output>
Create `.planning/quick/260809-kcz-fix-3-blocker-findings-from-02-ui-review/260809-kcz-SUMMARY.md` when done
</output>
