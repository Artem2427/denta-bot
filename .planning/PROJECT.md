# denta-bot Platform

## What This Is

denta-bot is a SaaS product that gives dental clinics a Telegram/chat bot for patient booking automation. `apps/web` is the public marketing site (Home, Prices, Demo, Blog, Blog Post, Contacts), migrated from a Figma-exported design prototype into Next.js 16 (App Router) and shipped as v1.0. It runs on its own bespoke premium `dt-*` design system (own palette/typography/motion), not `@repo/ui` — `@repo/ui`/`packages/ui` remains the base only for `apps/admin-panel`-lineage apps (`apps/platform-admin`, `apps/client-admin`) and the Demo page's embedded admin-panel simulation. Starting v1.1, the product grows a real backend (`apps/server`, NestJS + Prisma) and its first real admin surface, `apps/platform-admin` — a SaaS-staff dashboard for monitoring clinic accounts, site leads, and content — replacing the mock-data-only, backend-less v1.0 state.

## Core Value

The migrated site renders all six pages from the design faithfully — content, layout, and theme — using Next.js App Router conventions, so the marketing site is production-shaped (typed, validated forms, proper routing). **Milestone v1.0 shipped 2026-08-10: all six routes (`/`, `/prices`, `/demo`, `/blog`, `/blog/[slug]`, `/contacts`) are live**, still on mock data. **Milestone v1.1 (in progress)** replaces the mock layer: a real NestJS + Prisma backend feeds `apps/platform-admin` (clinic/lead/content monitoring) and the site's CMS-backed content, so denta-bot staff can operate on real data instead of hardcoded fixtures.

## Current Milestone: v1.1 Platform Admin API

**Progress:** Phase 4 (Backend Foundation & Auth) complete 2026-08-14 — real Postgres/Prisma/NestJS backend with full JWT auth lifecycle live. Next: Phase 5 (Clinic, Lead & Content Management).

**Goal:** Build a real NestJS + Prisma backend that powers `apps/platform-admin` — a SaaS-staff dashboard for monitoring clinic accounts — and give it a CMS layer for the marketing site's content, replacing the current no-backend / mock-data state.

**Target features:**
- Dedicated `PlatformAdmin` auth table (JWT access + refresh tokens; separate from any future clinic-user table)
- Clinic (client) monitoring: CRUD + account/subscription status; bot-usage fields modeled but stubbed (no real bot exists yet)
- Site leads: Contacts + Demo form submissions from `apps/web` persist to the DB and are manageable in `platform-admin`
- CMS: blog posts and pricing plans become DB-backed and editable via the API/`platform-admin`, replacing `apps/web/modules/blog/_data.ts` and hardcoded pricing data
- Prisma ORM, schema changes only via migrations, generated types/client shared via a `packages/` package usable from `server`, `web`, and `platform-admin`
- REST + Swagger (`@nestjs/swagger`) on the backend; `TanStack Query` on the frontend(s)

**Explicitly deferred:** `apps/client-admin` (per-clinic self-service panel) — next milestone. Real Telegram bot integration (webhook, booking flow) — future milestone.

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
- ✓ Prisma schema + migrations (`packages/db`, `@repo/db`) — 6-model schema (PlatformAdmin, RefreshToken, Clinic, Lead, BlogPost, PricingPlan), version-controlled `prisma migrate dev` history, generated client importable from `apps/server` — Phase 4
- ✓ `PlatformAdmin` auth: JWT access + refresh tokens, dedicated table, argon2 password hashing, refresh rotation with reuse detection (atomic claim closes the TOCTOU race), server-side logout revocation, global fail-closed `AccessTokenGuard` — Phase 4
- ✓ REST + Swagger API surface (`@nestjs/swagger`, `/api/docs`) — Phase 4 (auth endpoints only; Clinic/Lead/CMS endpoints are Phase 5)
- ✓ Clinic (client) CRUD + account/subscription monitoring — `ClinicsModule` backend + `apps/platform-admin` Clinics list/detail/create screens — Phase 5
- ✓ Unified Lead inbox: list/filter (status+date)/detail/status-update, plus atomic Lead→Clinic conversion (`prisma.$transaction`, race-guarded, TDD-covered) — backend + `apps/platform-admin` screens — Phase 5
- ✓ CMS: blog posts + pricing plans DB-backed, full CRUD (incl. delete) via API/`platform-admin` — Phase 5
- ✓ `TanStack Query` on `apps/platform-admin`, backed by an `openapi-typescript`-generated typed client (`openapi-fetch`) against the live Swagger spec — Phase 5
- ✓ `apps/platform-admin` bootstrapped from an untouched Vite scaffold into an authenticated SPA — React Router v7 (auth-guarded layout route), single-in-flight-promise refresh interceptor, built entirely on `@repo/ui` (2 new primitives added: `Form`/`DataTable`) per explicit user directive — Phase 5
- ✓ `updatedBy`/`updatedAt` trace fields on Clinic/Lead/BlogPost/PricingPlan (INFRA-05) — Phase 5

### Active

**v1.1 (this milestone):**

- [ ] `apps/web` wired to the real backend — Contacts/Demo submissions persist as Leads, Blog/Prices pages render real CMS content (Phase 6)

**Carried backlog (not yet scheduled):**

- [ ] "Unified source of truth" positioning — DentaBot is per-clinic (each clinic gets its own bot instance with its own settings/functions), not one shared bot; a Home page highlight section covering this (bot + manual admin booking on one core, role-based access, `created_via` analytics) shipped as an ad-hoc quick task (260810-ddh) outside the original 6-page migration scope — worth extending with real backend semantics once a real bot/admin backend exists
- [ ] Code review findings from `03-REVIEW.md` (8 warnings, non-blocking, all still open): "-20%" yearly discount badge only matches 1 of 3 pricing tiers' actual discount; pricing toggle lacks an accessible name; "Завантажити ще"/Share buttons are non-functional by design; `RelatedPosts` doesn't compute real relevance (declaration-order only); `comparison-table.tsx` duplicates `pricing-cards.tsx`'s plan data with no shared source of truth
- [ ] Fix pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict blocking `pnpm --filter web build`'s (and `apps/admin-panel`'s) production type-check — discovered in Phase 1, still open at v1.0 close; needs a monorepo-wide `pnpm.overrides` fix
- [ ] Dark mode for the premium `apps/web` site — no dark-mode `dt-*` token values exist; `ThemeToggle` removed from Header in Phase 01.1, component still exists unused; explicitly deferred at Phase 01.1 close, needs a fresh decision
- [ ] Real bot/chat API wiring for the Demo page — deferred past v1.1 (v1.1 covers backend CRM/CMS, not the Telegram bot itself)
- [ ] Code review findings from `04-REVIEW.md` (0 critical, 7 warning, non-blocking, all still open): no rate limiting on `POST /auth/login`; login timing side-channel partially defeats the "no user enumeration" claim (argon2.verify skipped on unknown emails); refresh cookie `Secure` flag depends on unvalidated `NODE_ENV`; `'refresh_token'` cookie name hardcoded in two places; `refresh()`'s `findUniqueOrThrow` can surface a raw 500 instead of 401; no max length on login password (argon2 CPU-amplification vector); Swagger docs registered unconditionally even in production
- [ ] Leftover Docker Postgres container (`agent-a8976498097c8c381-postgres-1`) from an interrupted Phase 4 session is still bound to port 5432, holding the seeded dev schema — should be adopted into this repo's own `docker-compose.yml` project (or stopped and replaced by a fresh `docker compose up -d`) before Phase 6 assumes a clean local Postgres (still open — used throughout Phase 5 too)
- [ ] Code review findings from `05-REVIEW.md` (2 critical — both fixed same-session, see `05-REVIEW-FIX.md` — plus 2 warning + 1 info left open, non-blocking): `packages/ui`'s `DataTablePagination` is exported but unusable — `DataTable` never configures `getPaginationRowModel` or exposes its table instance, so it's dead code until a consumer needs real pagination; `useFormField`'s "used outside `<FormField>`" guard can never fire (context default is a truthy `{}`, not falsy) — low-severity DX-only issue; `updatedBy` isn't `include`d consistently across `BlogPostsService`/`PricingPlansService`/`LeadsService`'s `update()`/`updateStatus()` vs. `ClinicsService.update()` — currently masked by post-mutation refetch, no observed symptom
- [ ] `packages/platform-admin`'s Vite bundle exceeds the 500kB chunk-size warning threshold (847kB, 246kB gzipped) — noted by the build, not yet addressed; code-splitting via dynamic `import()` would help once the app has more routes to split along

### Out of Scope

- ~~CMS or MDX-based blog content — mock data in code is sufficient for now~~ — **invalidated at v1.1 start**: blog/pricing content becomes DB-backed via the new platform-admin API this milestone
- i18n / multi-language support — site ships Ukrainian-only, matching the design
- ~~New/duplicate component library — everything routes through the existing `@repo/ui`~~ — **invalidated at Phase 01.1**: the client's premium-redesign ТЗ required a bespoke `dt-*` system for the marketing site specifically because `@repo/ui`'s theme couldn't express it; `@repo/ui` remains authoritative only for `apps/admin-panel` and the Demo page's admin-simulation tab

## Context

- **v1.0 shipped 2026-08-10.** Design source was a Figma file (`Дизайн з темами`), exported as a Vite + react-router + Tailwind v4 + shadcn code bundle (`Дизайн з темами.zip`) and unzipped to ephemeral scratch paths per-session for reference during each phase — all relevant content was transcribed into `apps/web` during execution, nothing depends on that scratch path persisting.
- Final architecture: `apps/web` runs its own bespoke premium `dt-*` design system (`apps/web/shared/components/premium-*.tsx`, `apps/web/app/premium-theme.css`) built in Phase 01.1, not `@repo/ui` — this was a mid-milestone pivot after the client sent a premium visual-redesign ТЗ during Phase 2. `@repo/ui`/`packages/ui/styles/theme.css` remains the styling source of truth only for `apps/admin-panel` and the Demo page's embedded admin-panel simulation tab.
- Final route structure: `apps/web/app/` holds only route files (`page.tsx`, `layout.tsx`, `not-found.tsx`); `apps/web/modules/<page>/` holds page-specific composition components; `apps/web/shared/{components,lib,hooks}/` holds cross-page code; `apps/web/shared/lib/routes.ts` centralizes all internal route constants.
- No `.env`, no database client, no deployment config exists in the monorepo (per `.planning/codebase/STACK.md`) — v1.0 is frontend-only, mock-data-only, matching scope.

## Constraints

- **Tech stack**: Next.js 16.2 (App Router), React 19.2, Tailwind CSS v4, `@repo/ui` (Radix + shadcn + CVA) — must reuse, not replace, the existing monorepo stack
- **Component reuse**: For `apps/admin-panel` and the Demo page's embedded admin-panel simulation, all UI must go through `@repo/ui`; app-specific one-off components only for page composition, not primitives already covered by the design system. **Superseded for the `apps/web` marketing site (Home/Contacts/Demo's marketing chrome/Prices/Blog) as of the Phase 01.1 premium redesign (2026-08-08, client-directed):** the marketing site now uses its own bespoke component system (own palette/typography/motion), not built on `@repo/ui`. `packages/ui`/`theme.css` is unmodified and stays the base only for `apps/admin-panel` and the Demo page's admin-simulation tab.
- **Forms**: `react-hook-form` + `zod` required for all form validation (Contacts, Demo if applicable)
- **State management**: Zustand allowed but not mandatory — add only when local/prop-drilled state genuinely becomes unmanageable
- **Data**: v1.0 was mock/static-data only. Starting v1.1, `apps/platform-admin` and the marketing site's leads/CMS content are backed by a real NestJS + Prisma API — no more mock data for those surfaces
- **Styling source of truth**: For `apps/admin-panel`/admin-demo, `packages/ui/styles/theme.css` remains authoritative. For the `apps/web` marketing site, `apps/web/app/premium-theme.css`'s `dt-*` token system (Phase 01.1) is authoritative instead.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Marketing site (`apps/web`, excl. Demo's admin-simulation tab) gets its own bespoke premium component system, not built on `@repo/ui` | Client sent a detailed premium visual-redesign ТЗ (new palette/typography/motion) mid-Phase-2 that conflicts with the Phase 1 brand-blue `@repo/ui` theme; user explicitly said not to base the site on `packages/ui`, only the Demo page's admin-simulation should keep matching the real `@repo/ui`-based `apps/admin-panel` product | ✓ Good — Phase 01.1, held for Phases 2–3 without regression |
| Reuse `@repo/ui` instead of porting the design's own `components/ui/*` | Avoids a duplicate, drifting shadcn component set across the monorepo; `@repo/ui` is already consumed by `apps/web`, `apps/docs`, `apps/admin-panel` | ✓ Good, though superseded for `apps/web`'s own marketing pages by the decision above — `@repo/ui` reuse held for `apps/admin-panel` and Demo's admin-simulation as designed |
| Re-theme `packages/ui/styles/theme.css` globally (not a scoped override in `apps/web`) | Design tokens are meant to be the new brand theme, not a one-app override; keeps all `@repo/ui` consumers visually consistent | ✓ Good — Phase 1 |
| Carry over Ukrainian copy verbatim from the design archive | Content is already finished/approved (headings, FAQ, blog posts, pricing); no rewrite requested | ✓ Good — held through Phase 3, minor original additions (5 new blog post bodies, Home's unified-source section) written in matching tone |
| Forms use `react-hook-form` + `zod`, submission stays mocked | Matches explicit requirement; no backend endpoint exists yet to call | ✓ Good — Phase 2 (Contacts form) |
| Demo page stays a scripted UI simulation | Explicit decision — real bot integration deferred to a future milestone | ✓ Good — Phase 2 |
| Zustand deferred until proven necessary | Avoids premature state-management complexity; `next-themes` + local `useState` cover current known needs | ✓ Good — never needed across all 4 phases; local state was always sufficient |
| New brand accent token `--brand: #1d6be4` added to `theme.css` (not in the design's own token set) | Design's `--primary` (`#030213`) is a separate dark-navy token that drives the default `Button`; the bright blue used for logo/active-nav/hover needed its own first-class token, not scattered `bg-[#1d6be4]` utility classes | ✓ Good — Phase 1, later superseded by the `dt-*` system for `apps/web` at Phase 01.1 |
| `apps/web` restructured: `app/` holds only route files; shared components live in a top-level `components/`, route paths centralized in `lib/routes.ts` (with a `@/*` tsconfig alias) | User-directed mid-Phase-1 refactor — keeps Next.js App Router convention clean as page count grows in Phase 2/3, avoids hardcoded href strings scattered across components | ✓ Good — Phase 1, structure held (evolved to `modules/<page>/` + `shared/` at Phase 01.1) all the way through Phase 3 |
| Styling changes route through `packages/ui/styles/theme.css` (via `apps/web/app/globals.css`'s import); `@repo/ui` components can gain new variants as pages need them, keeping palette consistency with established tokens | User-confirmed ongoing convention for this milestone — the token/component layer is a living part of the design-archive port, not frozen after Phase 1 | Superseded — `apps/web` moved to the standalone `dt-*` system at Phase 01.1; this convention held only for `apps/admin-panel`/Demo's admin-simulation as originally scoped |
| Blog posts beyond the one archived article need original body content (5 of 6 posts) | Design archive only fully wrote body content for the featured post; the other 5 posts had title/excerpt only | ✓ Good — Phase 3, written in matching tone, grounded in each post's existing title/excerpt, no fabricated stats contradicting the archived article's figures |
| Blog search/category filters made functional (not decorative like the archive) | Archive's filter UI had zero wiring; functional filtering was a small addition given the data was already local | ✓ Good — Phase 3, AND-combined exact-category + substring-search, verified via UAT |

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
*Last updated: 2026-08-14 after Phase 4 (Backend Foundation & Auth) completion*
