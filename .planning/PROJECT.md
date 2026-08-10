# denta-bot Marketing Site (apps/web)

## What This Is

`apps/web` is the public marketing site for denta-bot — a SaaS product that gives dental clinics a Telegram/chat bot for patient booking automation. This milestone replaced the default `create-turbo` Next.js starter with a real marketing site (Home, Prices, Demo, Blog, Blog Post, Contacts) migrated from a Figma-exported design prototype into Next.js 16 (App Router). As of Phase 01.1, the marketing site runs on its own bespoke premium `dt-*` design system (own palette/typography/motion), not `@repo/ui` — `@repo/ui`/`packages/ui` remains the base only for `apps/admin-panel` and the Demo page's embedded admin-panel simulation.

## Core Value

The migrated site renders all six pages from the design faithfully — content, layout, and theme — using Next.js App Router conventions, so the marketing site is production-shaped (typed, validated forms, proper routing) even though it currently runs entirely on mock data. **Milestone v1.0 shipped 2026-08-10: all six routes (`/`, `/prices`, `/demo`, `/blog`, `/blog/[slug]`, `/contacts`) are live.**

## Business Context

- **Customer**: Dental clinic owners/admins evaluating denta-bot as a booking automation tool
- **Revenue model**: Clinics subscribe to a paid plan (see Prices page) after trialing the bot
- **Success metric**: Contact/demo-request form completions (currently mocked — no backend yet)
- **Strategy notes**: none external; design source of truth is the Figma file referenced in the design archive's README

## Requirements

### Validated

- ✓ Monorepo scaffolding — pnpm workspaces + Turborepo, `apps/web` (Next.js 16.2, React 19.2), `apps/server` (NestJS), `apps/admin-panel` (Vite), `apps/docs` (Next.js) — existing
- ✓ Shared component library `@repo/ui` (`packages/ui`) — Radix UI + shadcn primitives (button, card, dialog, accordion, tabs, form, input, badge, etc.), CVA + clsx/tailwind-merge, lucide-react, next-themes, sonner, Tailwind v4 token architecture (`styles/theme.css`) — existing (base for `apps/admin-panel` + Demo's admin-simulation tab only, per Phase 01.1 pivot)
- ✓ Codebase mapped — `.planning/codebase/*` (ARCHITECTURE, STACK, CONVENTIONS, STRUCTURE, TESTING, INTEGRATIONS, CONCERNS) — existing
- ✓ Replaced `packages/ui/styles/theme.css` design tokens with the design archive's light/dark palette + new `--brand` token — Phase 1
- ✓ Header/footer/theme-toggle/not-found shared shell wired into `apps/web/app/layout.tsx` via `next-themes` — Phase 1 (theme-toggle later removed from Header in Phase 01.1; dark mode deferred, see Blockers/Concerns)
- ✓ THEME-02 shadcn-primitive audit for the shell (header/footer/404) — Phase 1
- ✓ Bespoke premium `dt-*` design system (own palette/typography/motion/icons) for the `apps/web` marketing site, superseding `@repo/ui` for Home/Contacts/Demo/Prices/Blog — Phase 01.1
- ✓ All six page routes shipped: Home `/`, Contacts `/contacts`, Demo `/demo`, Prices `/prices`, Blog `/blog`, Blog Post `/blog/[slug]` — Phase 2 + Phase 3
- ✓ Contacts and Demo forms rebuilt with `react-hook-form` + `zod` validation; submission mocked (simulated delay + `sonner` toast) — Phase 2
- ✓ Blog listing + blog post detail routes driven by static mock data (in-code `apps/web/modules/blog/_data.ts`), with functional search/category filtering and a Not Found state for unknown slugs — Phase 3
- ✓ Prices page with functional monthly/yearly billing toggle, 3-tier comparison, FAQ — Phase 3
- ✓ Demo page kept as a scripted client-side chat simulation (local `useState`) — no real bot/API integration this milestone — Phase 2
- ✓ All Ukrainian copy (headings, FAQ, 6 blog posts, pricing tiers) carried over as-is from the design archive into mock data/constants in code — Phase 2 + Phase 3
- ✓ Next.js App Router best practices applied: Server Components by default, `"use client"` only where interactivity requires it, `next/image` for images — Phase 1–3

### Active

None — milestone v1.0 requirements fully shipped as of Phase 3 (2026-08-10).

### Emerged (not yet scheduled)

- [ ] "Unified source of truth" positioning — DentaBot is per-clinic (each clinic gets its own bot instance with its own settings/functions), not one shared bot; a Home page highlight section covering this (bot + manual admin booking on one core, role-based access, `created_via` analytics) shipped as an ad-hoc quick task (260810-ddh) outside the original 6-page migration scope
- [ ] Code review findings from `03-REVIEW.md` (8 warnings, non-blocking): "-20%" yearly discount badge only matches 1 of 3 pricing tiers' actual discount; pricing toggle lacks an accessible name; "Завантажити ще"/Share buttons are non-functional by design; `RelatedPosts` doesn't compute real relevance (declaration-order only); `comparison-table.tsx` duplicates `pricing-cards.tsx`'s plan data with no shared source of truth
- [ ] Fix pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict blocking `pnpm --filter web build`'s (and `apps/admin-panel`'s) production type-check — discovered in Phase 1, still open as of Phase 3

### Out of Scope

- Real backend integration for Contacts/Demo forms — no `apps/server` endpoint exists yet for this; deferred until a future milestone
- Real bot/chat API wiring on the Demo page — stays a UI simulation this milestone
- CMS or MDX-based blog content — mock data in code is sufficient for now
- i18n / multi-language support — site ships Ukrainian-only, matching the design
- New/duplicate component library — everything routes through the existing `@repo/ui`, not a new one scoped to `apps/web`

## Context

- Design source: Figma file (`Дизайн з темами`, exported as a Vite + react-router + Tailwind v4 + shadcn code bundle: `Дизайн з темами.zip`). Unzipped for reference at `/private/tmp/claude-501/-Users-artemdanko-Developer-denta-bot/8b5d7e59-0e2d-435b-b260-ad43cb13b1c8/scratchpad/design-archive/` — this is scratch space, not persistent; relevant content should be transcribed into `apps/web`/`packages/ui` during execution, not referenced from that path long-term.
- Design pages source: `src/app/pages/{home,prices,demo,blog,blog-post,contacts,not-found}.tsx`, shared `header.tsx`/`footer.tsx`/`theme-provider.tsx`/`theme-toggle.tsx`, routing in `src/app/routes.ts` (react-router `createBrowserRouter`).
- Design theme source: `src/styles/theme.css` — custom light/dark tokens (e.g. light `--primary: #030213`), distinct from `@repo/ui`'s current default shadcn/neutral theme in `packages/ui/styles/theme.css`.
- `@repo/ui` already has ~38 shadcn components in `packages/ui/src/components/shadcn-ui/`; the design archive has its own ~45-component copy in `src/app/components/ui/` — these are near-duplicates (same shadcn lineage) but not guaranteed identical; use `@repo/ui`'s versions as the base and only add what's genuinely missing.
- Page ordering decided for roadmap: Home → Contacts/Demo (forms first, business priority) → Prices → Blog/Blog Post.
- No `.env`, no database client, no deployment config detected in the monorepo yet (per `.planning/codebase/STACK.md`) — this milestone is frontend-only, mock-data-only.

## Constraints

- **Tech stack**: Next.js 16.2 (App Router), React 19.2, Tailwind CSS v4, `@repo/ui` (Radix + shadcn + CVA) — must reuse, not replace, the existing monorepo stack
- **Component reuse**: For `apps/admin-panel` and the Demo page's embedded admin-panel simulation, all UI must go through `@repo/ui`; app-specific one-off components only for page composition, not primitives already covered by the design system. **Superseded for the `apps/web` marketing site (Home/Contacts/Demo's marketing chrome/Prices/Blog) as of the Phase 01.1 premium redesign (2026-08-08, client-directed):** the marketing site now uses its own bespoke component system (own palette/typography/motion), not built on `@repo/ui`. `packages/ui`/`theme.css` is unmodified and stays the base only for `apps/admin-panel` and the Demo page's admin-simulation tab.
- **Forms**: `react-hook-form` + `zod` required for all form validation (Contacts, Demo if applicable)
- **State management**: Zustand allowed but not mandatory — add only when local/prop-drilled state genuinely becomes unmanageable
- **Data**: Mock/static data only this milestone — no real API integration
- **Styling source of truth**: For `apps/admin-panel`/admin-demo, `packages/ui/styles/theme.css` remains authoritative. For the `apps/web` marketing site, the Phase 01.1 premium design system (own tokens, likely under `apps/web/shared/`) is authoritative instead — see Phase 01.1 CONTEXT.md once planned.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Marketing site (`apps/web`, excl. Demo's admin-simulation tab) gets its own bespoke premium component system, not built on `@repo/ui` | Client sent a detailed premium visual-redesign ТЗ (new palette/typography/motion) mid-Phase-2 that conflicts with the Phase 1 brand-blue `@repo/ui` theme; user explicitly said not to base the site on `packages/ui`, only the Demo page's admin-simulation should keep matching the real `@repo/ui`-based `apps/admin-panel` product | — Pending, Phase 01.1 |
| Reuse `@repo/ui` instead of porting the design's own `components/ui/*` | Avoids a duplicate, drifting shadcn component set across the monorepo; `@repo/ui` is already consumed by `apps/web`, `apps/docs`, `apps/admin-panel` | — Pending |
| Re-theme `packages/ui/styles/theme.css` globally (not a scoped override in `apps/web`) | Design tokens are meant to be the new brand theme, not a one-app override; keeps all `@repo/ui` consumers visually consistent | ✓ Good — Phase 1 |
| Carry over Ukrainian copy verbatim from the design archive | Content is already finished/approved (headings, FAQ, blog posts, pricing); no rewrite requested | ✓ Good |
| Forms use `react-hook-form` + `zod`, submission stays mocked | Matches explicit requirement; no backend endpoint exists yet to call | — Pending |
| Demo page stays a scripted UI simulation | Explicit decision — real bot integration deferred to a future milestone | ✓ Good |
| Zustand deferred until proven necessary | Avoids premature state-management complexity; `next-themes` + local `useState` cover current known needs | — Pending |
| New brand accent token `--brand: #1d6be4` added to `theme.css` (not in the design's own token set) | Design's `--primary` (`#030213`) is a separate dark-navy token that drives the default `Button`; the bright blue used for logo/active-nav/hover needed its own first-class token, not scattered `bg-[#1d6be4]` utility classes | ✓ Good — Phase 1 |
| `apps/web` restructured: `app/` holds only route files; shared components live in a top-level `components/`, route paths centralized in `lib/routes.ts` (with a `@/*` tsconfig alias) | User-directed mid-Phase-1 refactor — keeps Next.js App Router convention clean as page count grows in Phase 2/3, avoids hardcoded href strings scattered across components | ✓ Good — Phase 1 |
| Styling changes route through `packages/ui/styles/theme.css` (via `apps/web/app/globals.css`'s import); `@repo/ui` components can gain new variants as pages need them, keeping palette consistency with established tokens | User-confirmed ongoing convention for this milestone — the token/component layer is a living part of the design-archive port, not frozen after Phase 1 | ✓ Good — Phase 1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-10 after Phase 3 (Prices & Blog) — milestone v1.0 complete*
