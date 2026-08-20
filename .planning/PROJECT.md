# denta-bot Platform

## What This Is

denta-bot is a SaaS product that gives dental clinics a Telegram/chat bot for patient booking automation. `apps/web` is the public marketing site — as of v1.1 a **single scrolling landing page** (hero, problem/solution, how-it-works, admin showcase, features, pricing, reviews, lead form, FAQ) served in **uk/ru/en** via URL locale routing, plus a Ukrainian-only Blog; `/prices`, `/demo` and `/contacts` survive only as redirects to landing anchors. It runs on its own bespoke premium `dt-*` design system (own palette/typography/motion), not `@repo/ui` — `@repo/ui`/`packages/ui` remains the base only for `apps/admin-panel`-lineage apps (`apps/platform-admin`, `apps/client-admin`) and the landing's embedded admin-panel simulation. Behind it sits a real backend (`apps/server`, NestJS + Prisma + Postgres) and `apps/platform-admin` — a SaaS-staff dashboard for clinic accounts, site leads, and CMS content.

## Core Value

Real data end-to-end: denta-bot staff operate the business on a real backend instead of hardcoded fixtures, and the public site converts visitors into Leads that land in that backend. **v1.0 shipped 2026-08-10** (six mock-data routes). **v1.1 shipped 2026-08-20**: NestJS + Prisma + Postgres backend, `apps/platform-admin` for clinic/lead/CMS management, and `apps/web` consolidated into a trilingual single-page landing fed by real CMS content and a real lead funnel.

## Current State

**Shipped:** v1.1 Platform Admin API (2026-08-20) — Phases 4, 5, 6, 06.1, 06.2 · 24 plans · 59 feat commits · 207 files changed since v1.0.

Working surfaces: `apps/server` (auth + clinics + leads + CMS + public read routes, Swagger at `/api/docs`), `packages/db` (Prisma 7 schema/migrations/seeds), `apps/platform-admin` (authenticated SPA on a generated typed client), `apps/web` (trilingual landing + blog on real API data). `apps/client-admin` is still an untouched Vite scaffold. No Telegram bot exists yet.

## Next Milestone Goals

**v1.2 Multi-tenant Core** — turn `Clinic` from a CRM row into a real tenant: `ClinicUser` auth + RBAC, tenant scoping via Prisma Client Extensions, `AuditLog`, doctors/services/patients/appointments + slot calculator, `/api/{public,admin,clinic}` route prefixes (migrating existing `apps/web` + `apps/platform-admin` callers), and a shared `packages/shared` for cross-surface types/utils.

Then **v1.3 Telegram** (Redis + BullMQ, per-clinic bot provisioning, webhook routing, booking FSM, reminders) and **v1.4 Billing & Analytics** (Subscription/Payment/LiqPay, analytics, health). Full spec: `.planning/phases/999.1-server-platform-multi-tenant-clinics-per-clinic-telegram-bot/SERVER-TZ.md`.

## Business Context

- **Customer**: Dental clinic owners/admins evaluating denta-bot as a booking automation tool
- **Revenue model**: Clinics subscribe to a paid plan (see Prices page) after trialing the bot
- **Success metric**: Lead-form completions on the landing page — now real: `POST /leads` persists them and they surface in `apps/platform-admin`'s Lead inbox
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
- ✓ `apps/web` wired to the real backend — rate-limited public `POST /leads` from both lead forms, and published-only `GET /public/blog-posts(/:slug)` + `GET /public/pricing-plans` replacing `modules/blog/_data.ts` and hardcoded pricing (LEAD-01, LEAD-02, CMS-02, CMS-04) — Phase 6
- ✓ Premium `dt-*` restyle of every `apps/web` route — Manrope + JetBrains Mono, 8 additive tokens, 4 CVA primitives (Section/Eyebrow/SectionHeading/Stat) replacing duplicated per-page markup — Phase 06.1
- ✓ Single-page landing consolidation + uk/ru/en URL locale routing (next-intl); `/prices`, `/demo`, `/contacts` retired to 307 anchor redirects; one lead funnel at `#lead`; Blog stays Ukrainian-only — Phase 06.2

### Active

**v1.2 (next milestone — see `SERVER-TZ.md`):**

- [ ] `Clinic` becomes a real tenant (slug, timezone, currency, trial/suspend dates) with `ClinicUser` auth, RBAC (owner/admin/doctor/reception) and polymorphic `RefreshToken`
- [ ] Tenant scoping via Prisma **Client Extensions** (`$use` middleware does not exist in Prisma 7) + explicit unscoped client for PlatformAdmin routes, every bypass logged to `AuditLog`
- [ ] Domain models + endpoints: Doctors, Services, Patients, Appointments (slot calculator with `SELECT … FOR UPDATE` race guard), Schedule (shifts/templates/time-off)
- [ ] `/api/{public,admin,clinic}` route prefixes — breaking; `apps/web` + `apps/platform-admin` callers migrate in the same milestone
- [ ] `packages/shared` for utilities/types used by server and all front ends

**Carried backlog (not yet scheduled):**

- [ ] "Unified source of truth" positioning — DentaBot is per-clinic (each clinic gets its own bot instance with its own settings/functions), not one shared bot; a Home page highlight section covering this (bot + manual admin booking on one core, role-based access, `created_via` analytics) shipped as an ad-hoc quick task (260810-ddh) outside the original 6-page migration scope — worth extending with real backend semantics once a real bot/admin backend exists
- [ ] Code review findings from `03-REVIEW.md` (8 warnings, non-blocking, all still open): "-20%" yearly discount badge only matches 1 of 3 pricing tiers' actual discount; pricing toggle lacks an accessible name; "Завантажити ще"/Share buttons are non-functional by design; `RelatedPosts` doesn't compute real relevance (declaration-order only); `comparison-table.tsx` duplicates `pricing-cards.tsx`'s plan data with no shared source of truth
- [ ] Fix pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict blocking `pnpm --filter web build`'s (and `apps/admin-panel`'s) production type-check — discovered in Phase 1, still open at v1.0 close; needs a monorepo-wide `pnpm.overrides` fix
- [ ] Dark mode for the premium `apps/web` site — no dark-mode `dt-*` token values exist; `ThemeToggle` removed from Header in Phase 01.1, component still exists unused; explicitly deferred at Phase 01.1 close, needs a fresh decision
- [ ] Real bot/chat API wiring for the Demo page — deferred past v1.1 (v1.1 covers backend CRM/CMS, not the Telegram bot itself)
- [ ] Code review findings from `04-REVIEW.md` (0 critical, 7 warning, non-blocking, all still open): no rate limiting on `POST /auth/login`; login timing side-channel partially defeats the "no user enumeration" claim (argon2.verify skipped on unknown emails); refresh cookie `Secure` flag depends on unvalidated `NODE_ENV`; `'refresh_token'` cookie name hardcoded in two places; `refresh()`'s `findUniqueOrThrow` can surface a raw 500 instead of 401; no max length on login password (argon2 CPU-amplification vector); Swagger docs registered unconditionally even in production
- [ ] Leftover Docker Postgres container (`agent-a8976498097c8c381-postgres-1`) from an interrupted Phase 4 session is still bound to port 5432, holding the seeded dev schema — should be adopted into this repo's own `docker-compose.yml` project (or stopped and replaced by a fresh `docker compose up -d`) before Phase 6 assumes a clean local Postgres (still open — used throughout Phase 5 too)
- [ ] Code review findings from `05-REVIEW.md` (2 critical — both fixed same-session, see `05-REVIEW-FIX.md` — plus 2 warning + 1 info left open, non-blocking): `packages/ui`'s `DataTablePagination` is exported but unusable — `DataTable` never configures `getPaginationRowModel` or exposes its table instance, so it's dead code until a consumer needs real pagination; `useFormField`'s "used outside `<FormField>`" guard can never fire (context default is a truthy `{}`, not falsy) — low-severity DX-only issue; `updatedBy` isn't `include`d consistently across `BlogPostsService`/`PricingPlansService`/`LeadsService`'s `update()`/`updateStatus()` vs. `ClinicsService.update()` — currently masked by post-mutation refetch, no observed symptom
- [ ] `apps/docs` (untouched create-turbo starter) fails `pnpm check-types` — `app/page.tsx` cannot resolve `@repo/ui/button`; the only red in the repo-wide type check at v1.1 close. Either fix the import or drop the app.
- [ ] `packages/platform-admin`'s Vite bundle exceeds the 500kB chunk-size warning threshold (847kB, 246kB gzipped) — noted by the build, not yet addressed; code-splitting via dynamic `import()` would help once the app has more routes to split along

### Out of Scope

- ~~CMS or MDX-based blog content — mock data in code is sufficient for now~~ — **invalidated at v1.1 start**: blog/pricing content becomes DB-backed via the new platform-admin API this milestone
- ~~i18n / multi-language support — site ships Ukrainian-only, matching the design~~ — **invalidated at Phase 06.2**: the landing ships uk/ru/en via URL locale routing (next-intl); only the Blog stays Ukrainian-only
- ~~New/duplicate component library — everything routes through the existing `@repo/ui`~~ — **invalidated at Phase 01.1**: the client's premium-redesign ТЗ required a bespoke `dt-*` system for the marketing site specifically because `@repo/ui`'s theme couldn't express it; `@repo/ui` remains authoritative only for `apps/admin-panel` and the Demo page's admin-simulation tab

## Context

- **v1.0 shipped 2026-08-10.** Design source was a Figma file (`Дизайн з темами`), exported as a Vite + react-router + Tailwind v4 + shadcn code bundle (`Дизайн з темами.zip`) and unzipped to ephemeral scratch paths per-session for reference during each phase — all relevant content was transcribed into `apps/web` during execution, nothing depends on that scratch path persisting.
- Final architecture: `apps/web` runs its own bespoke premium `dt-*` design system (`apps/web/shared/components/premium-*.tsx`, `apps/web/app/premium-theme.css`) built in Phase 01.1, not `@repo/ui` — this was a mid-milestone pivot after the client sent a premium visual-redesign ТЗ during Phase 2. `@repo/ui`/`packages/ui/styles/theme.css` remains the styling source of truth only for `apps/admin-panel` and the Demo page's embedded admin-panel simulation tab.
- Final route structure: `apps/web/app/` holds only route files (`page.tsx`, `layout.tsx`, `not-found.tsx`); `apps/web/modules/<page>/` holds page-specific composition components; `apps/web/shared/{components,lib,hooks}/` holds cross-page code; `apps/web/shared/lib/routes.ts` centralizes all internal route constants.
- ~~No `.env`, no database client, no deployment config exists in the monorepo — v1.0 is frontend-only, mock-data-only~~ — **superseded by v1.1**: `docker-compose.yml` runs `postgres:17`, `packages/db` owns the Prisma 7 schema/migrations/seeds (driver adapter `@prisma/adapter-pg`), `apps/server` boots on `PORT`/`DATABASE_URL`/`JWT_*`/`CORS_ALLOWED_ORIGINS` from a root `.env` validated at startup. Redis still absent — arrives with v1.3.
- **v1.1 shipped 2026-08-20.** 233 commits since `v1.0`, 207 non-planning files changed (+13,104/−3,179). Timeline 2026-08-10 → 2026-08-20.
- Repo-wide `pnpm check-types` is green except `apps/docs`, the untouched create-turbo starter (`@repo/ui/button` unresolved). The `packages/ui` `spinner.tsx`/`button-group.tsx` errors deferred during Phase 06.1 no longer reproduce — `packages/ui` type-checks clean.

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
| `packages/db` as a shared Prisma package (`@repo/db`) with the Prisma 7 driver adapter (`@prisma/adapter-pg`), not a Prisma client inside `apps/server` | Schema/types must be importable by server and (later) both admin surfaces; migrations stay the single way the DB changes | ✓ Good — Phase 4, held through Phase 6 |
| Refresh-token rotation with an **atomic claim** (single `updateMany` guard) rather than read-then-write | Closes the TOCTOU race that would let a concurrent reuse slip past detection | ✓ Good — Phase 4 |
| `apps/platform-admin` consumes an `openapi-typescript`-generated client (`openapi-fetch`) against the live Swagger spec, not hand-written fetch wrappers | Backend DTOs are the contract; regenerating catches drift at compile time | ✓ Good — Phase 5, made Phase 6's DTO changes cheap |
| `apps/platform-admin` built entirely on `@repo/ui` (2 new primitives added: `Form`, `DataTable`) while `apps/web` stays on `dt-*` | Explicit user directive — the admin lineage keeps the shared design system; only the marketing site is bespoke | ✓ Good — Phase 5 |
| Collapse Home/Prices/Demo/Contacts into one landing page; retire those routes as 307 anchor redirects | Client-directed (DentaBot Landing design export); one scroll, one funnel — every pricing CTA points at `#lead` instead of a separate contact page | ✓ Good — Phase 06.2 |
| Add uk/ru/en URL locale routing (next-intl) for the landing, Blog stays Ukrainian-only | Sales copy must reach ru/en clinics; blog content volume doesn't justify triple translation yet | ✓ Good — Phase 06.2, 100% key/array parity verified across all 3 locale files |
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
*Last updated: 2026-08-20 after v1.1 (Platform Admin API) milestone completion*
