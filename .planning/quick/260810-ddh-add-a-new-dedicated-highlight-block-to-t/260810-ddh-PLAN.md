---
type: quick
slug: 260810-ddh-add-a-new-dedicated-highlight-block-to-t
autonomous: true
files_modified:
  - apps/web/modules/home/unified-source.tsx
  - apps/web/app/page.tsx
must_haves:
  truths:
    - "Home page renders a new section between Solution and Features presenting the unified-source-of-truth admin capability"
    - "Section headline communicates that bot and manual admin bookings write to one shared schedule with no desync"
    - "Section covers role-based admin access (regular admin vs head doctor/owner)"
    - "Section covers booking-source tracking enabling bot-vs-manual analytics for the clinic owner"
  artifacts:
    - apps/web/modules/home/unified-source.tsx
  key_links:
    - "apps/web/app/page.tsx imports and renders <UnifiedSource /> between <Solution /> and <Features />"
---

<objective>
Add a new "unified source of truth" highlight section to the apps/web Home page, positioned between the existing Solution and Features sections, using the established dt-* premium design system patterns (Container, Reveal, StaggerGrid/StaggerItem, PremiumCard, Phosphor `/ssr` icons).

Purpose: Give the marketing site a dedicated, sales-friendly callout explaining why DentaBot's Telegram bot and admin panel share one booking core — no desync between channels, role-based admin access, and per-channel booking analytics — a differentiator prospective clinics care about.
Output: New `apps/web/modules/home/unified-source.tsx` component, wired into `apps/web/app/page.tsx`.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/.claude/CLAUDE.md
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/features.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/problem.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/solution.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/home/stagger-grid.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/premium-card.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/container.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/reveal.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/premium-theme.css
@/Users/artemdanko/Developer/denta-bot/apps/web/app/page.tsx

**Design system reference (apps/web, dt-* namespace — do NOT use `@repo/ui` here per CLAUDE.md's Phase 01.1 supersession):**
- `text-dt-h2 font-dt-heading font-bold text-dt-navy` — section heading
- `text-dt-body text-dt-graphite` — section sub-line (see `problem.tsx` for the exact centered-header + sub-line pattern)
- `text-dt-h3 font-dt-heading font-semibold text-dt-navy` — card title
- `text-dt-graphite` — card body copy
- `text-dt-teal` — icon accent color used for all Features icons (`h-10 w-10 mb-3`)
- Section wrapper padding is `py-8 lg:py-12` (halved from the original `py-16 lg:py-24` per quick task 260809-v68 — every existing Home section, including `features.tsx`/`problem.tsx`/`solution.tsx`, already uses this value; match it exactly, do not reintroduce the old padding)
- Icons come from `@phosphor-icons/react/ssr` (NOT the client-only `@phosphor-icons/react` entry) — confirmed available in the installed `@phosphor-icons/react@2.1.10` package: `ArrowsClockwise`, `UserGear`, `ChartPieSlice`

**Current Home section order (`apps/web/app/page.tsx`):** Hero -> Problem -> Solution -> Features -> CtaBanner -> Testimonials. Imports are sorted alphabetically by module path (`cta-banner`, `features`, `hero`, `problem`, `solution`, `testimonials`).
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create UnifiedSource section and wire into Home page</name>
  <files>apps/web/modules/home/unified-source.tsx, apps/web/app/page.tsx</files>
  <action>
Create `apps/web/modules/home/unified-source.tsx` following the exact structural pattern of `features.tsx` (Container > Reveal-wrapped centered header block > StaggerGrid > StaggerItem > PremiumCard), reusing `problem.tsx`'s header pattern (h2 + centered sub-line paragraph) for the intro. Do not introduce any new shared component, wrapper, or styling primitive — only the four already-imported building blocks (`Container`, `Reveal`, `StaggerGrid`/`StaggerItem`, `PremiumCard`) plus `@phosphor-icons/react/ssr` icons, exactly as `features.tsx` uses them.

Export a named `UnifiedSource(): React.JSX.Element` function component. Section wrapper: `<section className="py-8 lg:py-12">` (no `id` attribute — matches `problem.tsx`/`solution.tsx`/`cta-banner.tsx`, none of which carry a nav-anchor id; `features.tsx`'s `id="features"` is unreferenced elsewhere and not a pattern to replicate here).

Header block (matches `problem.tsx`'s pattern): `<Reveal>` wrapping a `<div className="mb-12 text-center">` containing an `<h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">` with the headline "Єдине джерело правди — незалежно від каналу запису", followed by a `<p className="mx-auto max-w-2xl text-dt-body text-dt-graphite">` sub-line: "Бот і адміністратор працюють в одній системі запису — жодних розбіжностей і подвійних бронювань".

Body: `<StaggerGrid className="grid gap-6 md:grid-cols-3">` containing exactly 3 `<StaggerItem>` > `<PremiumCard>` entries, each with an icon (`weight="regular" className="mb-3 h-10 w-10 text-dt-teal"`), an `<h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">` title, and a `<p className="text-dt-graphite">` description — same markup shape as each card body in `features.tsx`. Use this exact original copy (new copy, not from any design archive):

1. Icon `ArrowsClockwise`. Title: "Один спільний розклад". Description: "Запис через Telegram- чи WhatsApp-бота і запис, який адміністратор вніс вручну після дзвінка, миттєво потрапляють в один розклад. Зайнятий слот одразу зникає з бота — і навпаки. Подвійного бронювання просто не буває."
2. Icon `UserGear`. Title: "Доступ за ролями". Description: "Звичайний адміністратор бачить і веде записи свого дня. Головний лікар або власник клініки має повну аналітику по клініці й керує розкладами всіх лікарів."
3. Icon `ChartPieSlice`. Title: "Аналітика по джерелах запису". Description: "Кожен запис зберігає канал, звідки він прийшов — бот чи ручний ввід адміністратора. Власник бачить реальну частку записів через бота й ухвалює рішення на основі цифр, а не здогадок."

(Copy conveys the `created_via`/bot-vs-manual data-tracking concept in plain sales language rather than exposing the raw field name or enum values as visible UI text, and does not name any specific competitor product — standard practice for public-facing marketing copy while still capturing the full differentiation described in the task.)

Then edit `apps/web/app/page.tsx`: add `import { UnifiedSource } from '@/modules/home/unified-source';` after the `Testimonials` import (alphabetical order by module path is preserved — `unified-source` sorts after `testimonials`), and render `<UnifiedSource />` between `<Solution />` and `<Features />` in the JSX (so the final order is Hero, Problem, Solution, UnifiedSource, Features, CtaBanner, Testimonials).
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot && pnpm --filter web check-types && pnpm --filter web lint</automated>
  </verify>
  <done>`apps/web/modules/home/unified-source.tsx` exists exporting `UnifiedSource`, rendered in `apps/web/app/page.tsx` between Solution and Features; `pnpm --filter web check-types` and `pnpm --filter web lint` both pass with zero errors/warnings.</done>
</task>

</tasks>

<verification>
- `pnpm --filter web check-types` passes (no TypeScript errors introduced).
- `pnpm --filter web lint` passes with `--max-warnings 0`.
- Manual spot-check: `pnpm --filter web dev`, open http://localhost:3000, confirm the new section renders between Solution ("DentaBot бере це на себе") and Features ("Все що потрібно для роботи клініки") with headline, 3-point grid, and consistent dt-* styling (navy headings, teal icons, warm-white cards).
</verification>

<success_criteria>
- New section visible on Home between Solution and Features.
- Headline + 3 supporting points cover: (1) unified bot/manual booking core with no desync, (2) role-based admin access, (3) booking-source analytics.
- All markup reuses existing `dt-*` premium components (`Container`, `Reveal`, `StaggerGrid`, `StaggerItem`, `PremiumCard`) and Phosphor `/ssr` icons — no new design-system primitives introduced.
- Copy is original, Ukrainian, sales-friendly — not ported from the design archive.
- Typecheck and lint pass clean.
</success_criteria>

<output>
Create `.planning/quick/260810-ddh-add-a-new-dedicated-highlight-block-to-t/260810-ddh-SUMMARY.md` when done.
</output>
