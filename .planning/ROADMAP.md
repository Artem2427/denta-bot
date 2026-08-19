# Roadmap: denta-bot Marketing Site (apps/web)

## Milestones

- ✅ **v1.0 MVP** — Phases 1, 01.1, 2, 3 (shipped 2026-08-10)
- 🚧 **v1.1 Platform Admin API** — Phases 4, 5, 6 (in progress)

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3, 4, 5, 6): Planned milestone work
- Decimal phases (01.1): Urgent insertions between surrounding integers

<details>
<summary>✅ v1.0 MVP (Phases 1, 01.1, 2, 3) — SHIPPED 2026-08-10</summary>

- [x] Phase 1: Theme & Site Shell (2/2 plans) — completed 2026-08-08
- [x] Phase 01.1: Premium Design System (apps/web) (4/4 plans) — completed 2026-08-08
- [x] Phase 2: Home, Contacts & Demo (4/4 plans) — completed 2026-08-09
- [x] Phase 3: Prices & Blog (2/2 plans) — completed 2026-08-10

Full phase details archived at `.planning/milestones/v1.0-ROADMAP.md`.

</details>

### 🚧 v1.1 Platform Admin API (In Progress)

**Milestone Goal:** Build a real NestJS + Prisma backend that powers `apps/platform-admin` (clinic/lead/content monitoring) and gives the marketing site a CMS layer for blog/pricing content, replacing the current no-backend / mock-data-only state.

- [x] **Phase 4: Backend Foundation & Auth** - Prisma-backed NestJS API with Swagger docs and secure PlatformAdmin JWT authentication (completed 2026-08-14)
- [x] **Phase 5: Clinic, Lead & Content Management** - `apps/platform-admin` screens for full clinic/lead/CMS CRUD, backed by the API (completed 2026-08-14)
- [ ] **Phase 6: apps/web Integration** - Contacts/Demo submissions and Blog/Prices content go live on real data

## Phase Details

### Phase 4: Backend Foundation & Auth

**Goal**: A real Postgres + Prisma + NestJS backend exists — documented via Swagger, with secure PlatformAdmin JWT authentication (access + refresh, rotation with reuse detection, server-side logout revocation, and protected-route enforcement) — replacing the untouched NestJS scaffold. No `apps/platform-admin` UI exists yet; success criteria are verified at the API/Swagger level.
**Depends on**: Phase 3 (v1.0 foundation; first phase of v1.1)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):

  1. Prisma schema + migrations live in a shared `packages/db` package, version-controlled, and are the only way the DB schema changes (no manual DB edits) — running the migration produces the full schema (PlatformAdmin, RefreshToken, Clinic, Lead, BlogPost, PricingPlan tables)
  2. The generated Prisma client/types are importable from `apps/server` via `packages/db`, structurally ready for `apps/web`/`apps/platform-admin` to consume later
  3. `apps/server` serves a browsable Swagger/OpenAPI doc listing every implemented endpoint
  4. Calling `POST /auth/login` with valid PlatformAdmin credentials returns an access token + refresh token; refreshing the session rotates the refresh token and detects/punishes reuse (revokes the session family); logging out invalidates the refresh token server-side
  5. Calling any protected endpoint without a valid access token is rejected (401)

**Plans**: 2/2 plans executed
Plans:
**Wave 1**

- [x] 04-01-PLAN.md — packages/db schema/migration/seed + apps/server Prisma integration + POST /auth/login tracer + Swagger

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-02-PLAN.md — POST /auth/refresh (rotation + reuse detection), POST /auth/logout, global fail-closed AccessTokenGuard, GET /auth/me

### Phase 5: Clinic, Lead & Content Management

**Goal**: PlatformAdmin staff can log into `apps/platform-admin` and fully manage clinic accounts, the unified lead inbox, and CMS content (blog posts + pricing plans) through real screens backed by the API — turning the currently-empty Vite scaffold into a working internal tool.
**Depends on**: Phase 4
**Requirements**: CLINIC-01, CLINIC-02, CLINIC-03, CLINIC-04, CLINIC-05, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07, CMS-01, CMS-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):

  1. PlatformAdmin logs into `apps/platform-admin` and can view a list of all clinic accounts, open a single clinic's detail (contact info, status, plan, stubbed bot-usage fields), create a new clinic, edit an existing clinic's info/status/plan, and filter the list by status
  2. PlatformAdmin can view a unified Lead inbox tagged by source (contacts/demo), filter it by status and date, open a lead's full submitted detail, update a lead's status (New/Contacted/Converted), and convert a lead into a linked Clinic record
  3. PlatformAdmin can create, edit, and delete Blog posts and Pricing plans from within `apps/platform-admin`
  4. All platform-admin list/detail screens fetch data via TanStack Query against a typed client generated from the OpenAPI spec, and reflect mutations without a manual page refresh
  5. Clinic, Lead, and Content records show who last updated them and when

**Plans**: 7/7 plans executed
Plans:
**Wave 1**

- [x] 05-01-PLAN.md — packages/db updatedById migration (all 4 models) + ClinicsModule (CLINIC-01..05)
- [x] 05-02-PLAN.md — @repo/ui Form + DataTable primitives (UI-SPEC Gaps 1/2)

**Wave 2** *(blocked on Wave 1)*

- [x] 05-03-PLAN.md — LeadsModule incl. Lead-to-Clinic conversion transaction (LEAD-03..07)

**Wave 3** *(blocked on Wave 2 — app.module.ts conflict with 05-03)*

- [x] 05-04-PLAN.md — BlogPostsModule + PricingPlansModule (CMS-01, CMS-03)

**Wave 4** *(blocked on Waves 1-3 — full backend + primitives needed for typed-client codegen)*

- [x] 05-05-PLAN.md — apps/platform-admin bootstrap (router/query/typed client/auth) + Clinics screens — phase tracer

**Wave 5** *(blocked on Wave 4 — router.tsx conflict)*

- [x] 05-06-PLAN.md — Leads inbox + detail + status + convert-to-Clinic screens

**Wave 6** *(blocked on Wave 5 — router.tsx conflict)*

- [x] 05-07-PLAN.md — Blog Posts + Pricing Plans screens

**UI hint**: yes

### Phase 6: apps/web Integration

**Goal**: The public marketing site (`apps/web`) is wired to the real backend — Contacts/Demo submissions persist as Leads, and the Blog and Prices pages render real CMS content instead of mock data — closing the loop from Phase 5's API/screens back to the public site.
**Depends on**: Phase 5
**Requirements**: LEAD-01, LEAD-02, CMS-02, CMS-04
**Success Criteria** (what must be TRUE):

  1. Submitting the Contacts form on `apps/web` persists a Lead via the API, tagged `source: contacts`
  2. Submitting the Demo form on `apps/web` persists a Lead via the API, tagged `source: demo`
  3. `apps/web`'s Blog list and blog post detail pages render real posts fetched from the API, with `modules/blog/_data.ts` removed
  4. `apps/web`'s Prices page renders real pricing plans fetched from the API, replacing hardcoded data and collapsing the `pricing-cards.tsx`/`comparison-table.tsx` duplication

**Plans**: 3/3 plans executed
Plans:
**Wave 1**

- [x] 06-01-PLAN.md — POST /leads (public, rate-limited) tracer + Contacts form real fetch + Demo modal (LEAD-01, LEAD-02)

**Wave 2** *(blocked on Wave 1 — proves the public-route pattern)*

- [x] 06-02-PLAN.md — PublicBlogPostsController + apps/web Blog list/detail real-data wiring, _data.ts removed (CMS-02)

**Wave 3** *(blocked on Wave 2 — sequential to avoid concurrent apps/server port/build contention during verify)*

- [x] 06-03-PLAN.md — PublicPricingPlansController + apps/web Prices page real-data wiring, comparison-table derived matrix (CMS-04)

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 01.1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Theme & Site Shell | 2/2 | Complete | 2026-08-08 |
| 01.1. Premium Design System | 4/4 | Complete | 2026-08-08 |
| 2. Home, Contacts & Demo | 4/4 | Complete | 2026-08-09 |
| 3. Prices & Blog | 2/2 | Complete | 2026-08-10 |
| 4. Backend Foundation & Auth | 2/2 | Complete    | 2026-08-14 |
| 5. Clinic, Lead & Content Management | 7/7 | Complete    | 2026-08-14 |
| 6. apps/web Integration | 3/3 | In Progress|  |
| 06.1. Premium Visual Restyle (apps/web) | 5/5 | Complete | 2026-08-18 |
| 06.2. Single-Page Landing Consolidation + i18n (apps/web) | 5/7 | In Progress|  |

### Phase 06.2: Single-Page Landing Consolidation + i18n (apps/web) (INSERTED)

Collapse Home/Prices/Contacts/Demo into one scrolling landing page sourced from the DentaBot Landing design export (header, hero, problem/solution, how-it-works, admin showcase, features, pricing, reviews, lead-capture, FAQ, footer as anchor sections), rewritten sales copy from that design as source of truth. Add uk/ru/en URL-based locale routing (next-intl style). Blog remains the only other real route, staying Ukrainian-only this phase. /prices, /demo, /contacts retired as destinations (redirect to landing anchors).

**Goal:** `apps/web` serves one scrolling, fully-translated (uk default-unprefixed/ru/en) landing page at `/` composed from the design export's sections and sales copy, with real API-backed pricing/lead-capture data; `/blog` stays the only other real, unlocalized route; `/prices`, `/demo`, `/contacts` are retired as destinations and redirect to landing anchors.
**Requirements**: None (urgent client-directed insertion, tracked via ROADMAP.md/STATE.md entry, not the v1.1 requirement traceability table — CONTEXT.md decisions D-01 through D-11 serve as this phase's acceptance criteria)
**Depends on:** Phase 6
**Plans:** 5/7 plans executed

Plans:
**Wave 1**

- [x] 06.2-01-PLAN.md — next-intl locale-routing infrastructure (tracer) + translated Hero + Header/Footer chrome + blog-coexistence proof (D-08, D-09, D-11)
- [x] 06.2-02-PLAN.md — idempotent PricingPlan reseed script (Старт/Клініка/Мережа, D-04, D-05) — parallel, independent domain

**Wave 2** *(blocked on Wave 1 — extends the same messages/*.json files 06.2-01 created)*

- [x] 06.2-03-PLAN.md — full uk/ru/en message content for every remaining landing section (D-10)

**Wave 3** *(blocked on Wave 2 — all 3 plans below depend only on 06.2-03's message contract and touch disjoint component files, so they run in parallel)*

- [x] 06.2-04-PLAN.md — channel marquee, problem/solution, how-it-works, admin+bot interactive demo showcase + emoji cleanup
- [x] 06.2-05-PLAN.md — features grid, reviews, consolidated FAQ
- [ ] 06.2-06-PLAN.md — pricing section (real API data) + single lead-capture form (D-04, D-06, D-07, D-11)

**Wave 4** *(blocked on Wave 3 — composes all sections into one page, retires old routes)*

- [ ] 06.2-07-PLAN.md — final page assembly (all 10 sections) + /prices/demo/contacts redirects (D-01, D-03) + dead-file cleanup

### Phase 06.1: Premium Visual Restyle (apps/web) — purely visual/CSS restyle of Home, Prices, Demo, Blog, Contacts pages to a premium look using dt- design tokens and shared primitive components (Section, Container, Eyebrow, SectionHeading, Card, Stat, Button); no route/prop/copy/dependency changes (INSERTED) — Complete 2026-08-18

**Goal:** Every page on `apps/web` (Home, Prices, Demo, Blog, Contacts) reads as premium and expensive — consistent `dt-` design tokens, shared `Section`/`Eyebrow`/`SectionHeading`/`Stat` primitives replacing today's duplicated per-page markup, tightened typography/motion/hairline-border/focus-ring spec — with zero route, prop, copy, or dependency changes.
**Requirements**: None (urgent client-directed visual restyle, not a v1.1 roadmap requirement)
**Depends on:** Phase 6
**Plans:** 5/5 plans executed
**Verification:** `06.1-VERIFICATION.md` — 16/16 truths verified (one gap found and fixed same-session: 8 undocumented emoji in `modules/demo/_data.ts`'s bot scenario messages, commit `20714d9`)

Plans:
**Wave 1**

- [x] 06.1-01-PLAN.md — fonts (Manrope + JetBrains Mono) + new dt- tokens + Section/Eyebrow/SectionHeading/Stat primitives, tracer-proven on Home's Problem section and Hero stats

**Wave 2** *(blocked on Wave 1 — all 4 plans below depend only on 06.1-01 and touch disjoint files, so they run in parallel)*

- [x] 06.1-02-PLAN.md — PremiumButton/PremiumCard/motion.ts/Header/Footer/Dialog/Accordion retrofits
- [x] 06.1-03-PLAN.md — Home sweep remainder (Solution, UnifiedSource, Features, Testimonials, CtaBanner)
- [x] 06.1-04-PLAN.md — Prices + Contacts sweep
- [x] 06.1-05-PLAN.md — Demo + Blog sweep
