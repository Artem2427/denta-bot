# Project Research Summary

**Project:** denta-bot — `platform-admin` backend (v1.1 milestone)
**Domain:** First real backend for a frontend-only monorepo — NestJS + Prisma REST API, JWT auth, shared generated-types package, dual-frontend (Next.js + Vite SPA) integration via TanStack Query
**Researched:** 2026-08-10
**Confidence:** MEDIUM-HIGH

## Executive Summary

This milestone takes `apps/server` from an untouched NestJS scaffold to a real REST API backing three things: `PlatformAdmin` staff auth, a `Clinic` monitoring CRUD (with stubbed bot-usage fields), a unified `Lead` inbox for Contacts/Demo form submissions, and a lightweight two-entity CMS (blog posts, pricing plans) that replaces `apps/web`'s hardcoded mock data. Experts build this shape of system as: Prisma schema in its own shared workspace package (`packages/db`) -> NestJS feature modules (Auth, Clinics, Leads, Content) wrapping it via a `PrismaService` -> REST + Swagger contract -> typed consumption from both frontends (`apps/web` via server-side `fetch()` for public reads, `apps/platform-admin` via TanStack Query for the fully authenticated SPA experience).

The recommended approach is well-supported by current tooling: Prisma 7 (Rust-free, requires explicit `output` + driver adapter — a natural fit for the vendored-package decision already made), `@nestjs/jwt`+`passport-jwt` for two-strategy (access/refresh) auth, `argon2` for password hashing, and `openapi-typescript`/`openapi-fetch` to generate a typed HTTP client from the Swagger spec so the API contract can't silently drift from hand-written interfaces. Feature scope should stay deliberately narrow — a flat single-role auth, a 3-4 value lead-status enum, `published: boolean` CMS flags — resisting the pull toward CRM pipelines, RBAC matrices, or real-time analytics that this internal, 1-3-staff-member tool doesn't need yet.

The dominant risk cluster is auth-adjacent: this is the team's first from-scratch JWT system, and the research is consistent that skipping refresh-token rotation/reuse-detection, storing tokens in `localStorage`, or leaving CORS configured for only one of the two frontend origins are the failure modes most likely to ship silently and bite later (XSS-exposed sessions, permanent backdoors, or a working `apps/platform-admin` with a silently broken `apps/web`). The second cluster is monorepo-integration risk specific to Prisma 7 + Turborepo + pnpm — the generated client is a build artifact invisible to Turborepo's task graph unless `db:generate` is wired explicitly as a dependency of `build`/`dev`/`check-types`, and this must be verified against a genuinely clean clone, not an incrementally-updated local checkout. Both risk clusters have well-documented, concrete mitigations (rotation-with-reuse-detection pattern, single in-flight-refresh guard, explicit CORS origin allowlist, explicit `turbo.json` task edges) that should be baked into the phases that introduce them, not left to individual discipline.

## Key Findings

### Recommended Stack

Core additions to `apps/server`: `prisma`/`@prisma/client` v7 + `@prisma/adapter-pg` (Postgres driver adapter, mandatory in v7) in a new `packages/db` workspace package; `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` for two-strategy JWT auth; `argon2` for password hashing; `@nestjs/swagger` + `class-validator`/`class-transformer` for DTO-driven validation and docs generation from the same annotations; `cookie-parser` for reading the httpOnly refresh cookie; `zod` (already a project convention) for env-var schema validation. On the frontend side: `@tanstack/react-query` v5 (both `apps/web` where interactive and `apps/platform-admin`), plus `openapi-typescript` + `openapi-fetch` to generate a typed client from the NestJS Swagger JSON — avoiding hand-written interfaces that would drift from the real contract. All versions were verified live against npm registry (HIGH confidence); auth/hashing best-practice guidance is MEDIUM-HIGH confidence (consistent community consensus tracing to OWASP guidance, no single canonical spec).

**Core technologies:**
- Prisma 7 + `@prisma/adapter-pg`: ORM/migrations/generated types — Rust-free, requires explicit `output` + driver adapter, fits the vendored-package decision already made
- `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`: two-strategy (access/refresh) JWT auth — standard Nest pattern, avoids hand-rolled token extraction
- `argon2`: password hashing for `PlatformAdmin` — current OWASP-preferred algorithm, no legacy bcrypt data to migrate
- `@nestjs/swagger` + `class-validator`: one DTO definition drives both request validation and OpenAPI docs
- `@tanstack/react-query` v5 + `openapi-typescript`/`openapi-fetch`: shared typed HTTP contract for both frontends, generated not hand-written

### Expected Features

Scope is an internal ops tool (clinic monitoring, lead triage, lightweight CMS) for 1-3 staff — not a market-facing product, so feature research leans on ecosystem patterns rather than named competitors. Confidence MEDIUM (WebSearch-sourced pattern knowledge, cross-corroborated, checked against PROJECT.md's existing decisions).

**Must have (table stakes):**
- `PlatformAdmin` JWT login (access+refresh), single flat role — protects everything else
- Clinic list/detail CRUD + status field (active/trial/suspended/cancelled) + plan — the core "is this account ok?" view
- Clinic bot-usage fields modeled but stubbed (no real bot yet) — avoids later schema rework
- Unified `Lead` inbox (Contacts + Demo submissions, one table with a `source` field) + status (New/Contacted/Converted) + detail view
- Blog post CRUD (DB-backed, replacing `_data.ts`) and Pricing plan CRUD (replacing hardcoded pricing + collapsing the existing pricing-cards/comparison-table duplication)
- Server-side validation mirroring the frontend's existing zod schemas

**Should have (differentiators, cheap once foundations exist):**
- Lead -> Clinic conversion link (simple FK + action)
- Search/filter on Clinics and Leads lists
- Lightweight `updatedBy`/`updatedAt` trace fields

**Defer (v2+):**
- Full sales pipeline/deal stages, granular RBAC/permission matrix, real-time SaaS analytics (MRR/churn), general-purpose page-builder CMS, approval workflows, git-based CMS, notification/webhook system, full audit-log system — all explicitly over-built for current staff size/data volume per PROJECT.md's own deferral list

### Architecture Approach

A shared `packages/db` workspace package owns the Prisma schema, migrations, and generated client (custom `output`, gitignored) — the single source of truth for DB shape, imported only by `apps/server` (never by frontends, which stay behind the REST/HTTP boundary). `apps/server` gains four feature modules (`AuthModule`, `ClinicsModule`, `LeadsModule`, `ContentModule`) that are structurally independent of each other and depend only on a `PrismaModule` wrapper and the `AuthModule`'s guards — making them safely parallelizable once auth exists. Frontends split data-fetching idiom by rendering model: `apps/web` uses server-side `fetch()` for public reads (blog/pricing) and a client POST for the two forms; `apps/platform-admin`, fully client-rendered and authenticated, uses TanStack Query end-to-end with a shared API-client layer that handles refresh-on-401.

**Major components:**
1. `packages/db` (`@repo/db`) — Prisma schema, migrations, generated client; single shared source of DB types
2. `apps/server` `AuthModule` — JWT access+refresh issuance/validation, rotation, revocation for `PlatformAdmin`
3. `apps/server` `ClinicsModule` / `LeadsModule` / `ContentModule` — independent CRUD modules gated by the auth guard (Leads' public write endpoint is the one unauthenticated exception)
4. `apps/platform-admin` API client + TanStack Query hooks — typed, refresh-aware data layer for the (currently empty) Vite SPA scaffold

### Critical Pitfalls

1. **`prisma db push`/`migrate dev` habits leaking into staging/prod** — establish the `migrate dev` (local only) vs `migrate deploy` (CI/CD only, non-interactive) convention in the very first Prisma phase, before any CRUD work begins.
2. **Refresh tokens without rotation/reuse-detection/revocation** — rotate on every refresh, detect reuse as theft (revoke the whole session family), store hashed not plaintext, give logout a real server-side effect. This is core scope for the auth phase, not deferrable — every later endpoint trusts this guard.
3. **Refresh token in `localStorage` or JSON response body (Vite SPA)** — httpOnly/Secure/SameSite cookie only, access token in memory only; re-verify this specifically in the `platform-admin` frontend-integration phase since it can be reintroduced there even if the backend is correct.
4. **CORS/cookie config tested against only one frontend** — explicit origin allowlist (array, not wildcard) covering both `apps/web` and `apps/platform-admin` from day one; re-verify when the *second* frontend gets wired, since that's the integration point most likely to be silently missed.
5. **Raw Prisma model types (with sensitive fields) leaking into the shared types package** — never re-export `@prisma/client` models wholesale for `PlatformAdmin`; export explicit response DTOs instead, established in the same phase auth is built.
6. **Prisma client generation invisible to Turborepo's task graph** — explicit `db:generate` task with `"cache": false`, wired as a `dependsOn` of `build`/`dev`/`check-types`; verify against a genuinely clean clone, not an incremental local run.

## Implications for Roadmap

Based on combined research (Architecture's "Suggested Build Order" + Pitfalls' "Phase to address" mappings + Features' dependency graph, all independently converging on the same shape):

### Phase 1: Prisma foundation (`packages/db`)
**Rationale:** Nothing downstream (DTOs, modules, frontend types) can be typed or built before the schema exists and `prisma generate` has run. This is also where the Turborepo/Prisma integration pitfall (#6) must be solved once, correctly, before anyone builds on top of it.
**Delivers:** `packages/db` workspace package (schema for `PlatformAdmin`, `RefreshToken`, `Clinic`, `Lead`, `BlogPost`, `PricingPlan`), first migration, `turbo.json` wiring (`db:generate` task + `dependsOn` edges), local Postgres setup.
**Addresses:** Foundational dependency for every FEATURES.md item.
**Avoids:** Pitfall 6 (Turborepo/Prisma wiring), Pitfall 1 (migration discipline established before first CRUD phase).

### Phase 2: Server core wiring + Auth
**Rationale:** Establishes the skeleton every feature module plugs into (PrismaModule, global ValidationPipe, Swagger bootstrap, CORS) and the one true blocking cross-feature dependency — every other module needs the access-token guard.
**Delivers:** `PrismaService`, `AuthModule` (JWT access+refresh, rotation, reuse detection, httpOnly cookie delivery), CORS allowlist covering both frontend origins from day one.
**Uses:** `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `argon2`, `cookie-parser`.
**Avoids:** Pitfalls 2, 3, 4, 5 (refresh rotation, cookie storage, CORS, DTO boundary) — these are explicitly called out as needing to be solved correctly in this exact phase since every later phase inherits the pattern.

### Phase 3: Clinics, Leads, Content modules (parallelizable)
**Rationale:** Each is structurally independent — no shared foreign keys required for v1 function — and depends only on Phase 2's Prisma/Auth foundation. Features research confirms Lead persistence in particular does not require Clinic records to exist first.
**Delivers:** `ClinicsModule` (CRUD + status + stubbed usage fields), `LeadsModule` (public unauthenticated write + authenticated management), `ContentModule` (blog + pricing CRUD, public read/authenticated write).
**Addresses:** All P1 features from FEATURES.md's prioritization matrix.
**Avoids:** Performance Trap — build list endpoints with pagination (`skip`/`take`) from the start even if unused by the UI yet.

### Phase 4: `apps/platform-admin` data layer + first screens
**Rationale:** Needs real endpoints from Phase 3 to call; this is where the currently-empty Vite scaffold gets its first real screens (login, clinics, leads, content).
**Delivers:** API client with refresh-on-401 handling (single in-flight-refresh guard), TanStack Query hooks per domain, sidebar shell, CRUD screens.
**Avoids:** Pitfall 8 (concurrent-401 refresh stampede) — needs explicit verification with a multi-query dashboard against an expired token, not just single-request testing.

### Phase 5: `apps/web` integration (leads + content, real data)
**Rationale:** Lowest-risk to do last — `apps/web` already works correctly on mock data today, so this can slip without blocking anything else. Depends on Phase 3's `LeadsModule`/`ContentModule` being stable.
**Delivers:** Real `fetch()` POST replacing the mocked Contacts/Demo submit handlers (keeping existing `react-hook-form`+`zod` validation); real server-side reads replacing `modules/blog/_data.ts` and hardcoded pricing.
**Avoids:** UX pitfall — must design real error states (network failure, validation error) since the mocked version never needed them.

### Phase Ordering Rationale

- Strict dependency chain for Phases 1->2->3: schema before modules, auth before any protected CRUD endpoint (Features' dependency graph and Architecture's build order independently agree on this).
- Phase 3's three modules and Phases 4/5's two frontend integrations can parallelize internally once their respective prerequisites land — this should inform wave-based execution within phases, not necessarily separate phases.
- Frontend integration (4, 5) intentionally follows all backend work — both frontends currently function correctly on mock data, so there's no urgency pressure to interleave; sequencing it last minimizes risk of building against an unstable API shape.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Auth):** JWT rotation/reuse-detection and CORS/cookie cross-origin behavior are exactly the kind of subtle, easy-to-get-wrong logic flagged repeatedly across Architecture and Pitfalls research — worth a `--research-phase` pass on rotation-family-revocation implementation specifics.
- **Phase 4 (platform-admin data layer):** The concurrent-401/refresh-stampede interaction (Pitfall 8) is an emergent bug from two individually-correct pieces; worth explicit research/test-design attention when planning this phase.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Prisma foundation):** Well-documented against official Prisma+Turborepo+pnpm guides (HIGH confidence sources).
- **Phase 3 (CRUD modules):** Standard NestJS controller->service->DTO pattern already established in this codebase's conventions.
- **Phase 5 (apps/web integration):** Mechanical swap of mock calls for real `fetch()`, existing conventions carry over directly.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified live against npm registry 2026-08-10; patterns cross-checked against official Prisma/NestJS docs |
| Features | MEDIUM | WebSearch-sourced ecosystem pattern knowledge (no named competitors, internal tool), cross-corroborated across sources, checked against PROJECT.md's own decisions |
| Architecture | MEDIUM | No single official "Prisma+NestJS+Turborepo" source of truth exists; synthesized from official Prisma/Turborepo docs + multiple independent 2026 community sources, plus direct repo inspection |
| Pitfalls | MEDIUM | Community + official-docs sources, no curated/Context7 access this run; cross-checked across 2-3 independent sources per finding |

**Overall confidence:** MEDIUM-HIGH — stack choices are solidly grounded; the riskiest areas (auth token lifecycle, dual-frontend CORS/cache integration) are well-documented as *patterns* to follow but will need careful, explicit verification steps during planning/execution rather than being "obviously correct" once built.

### Gaps to Address

- **Production domain/subdomain topology** for `apps/web` and `apps/platform-admin` is not yet decided — this directly determines the correct `SameSite` cookie attribute and needs resolving before Phase 2's cookie config is finalized, not after.
- **Node engine floor** (`>=18` in root `package.json`) is below Prisma 7's requirement (`>=20.19.0`); a manifest fix needed in Phase 1, not a real environment blocker since local dev already runs Node 22.
- **`apps/server/tsconfig.json`** currently doesn't extend `packages/typescript-config` (pre-existing drift); optional cleanup opportunity when Phase 1 introduces `packages/db`, not a hard blocker.
- **Rate-limiting/spam protection** on the public `POST /leads` endpoint is flagged as an open question in Architecture research, not resolved — worth explicit scoping in Phase 3's planning (`@nestjs/throttler` is available as a stack option).

## Sources

### Primary (HIGH confidence)
- npm registry `latest` dist-tags fetched live 2026-08-10 for all core stack packages
- [Prisma ORM v7.0.0 changelog](https://www.prisma.io/changelog/2025-11-19), [Upgrade to Prisma ORM v7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [Prisma + Turborepo guide](https://www.prisma.io/docs/guides/deployment/turborepo), [Prisma + pnpm workspaces guide](https://www.prisma.io/docs/guides/use-prisma-in-pnpm-workspaces)
- [openapi-fetch docs](https://openapi-ts.dev/openapi-fetch/)
- Direct repo inspection: `turbo.json`, `package.json`, `pnpm-workspace.yaml`, `apps/server/*`, `apps/platform-admin/package.json`, `apps/web/package.json`, `.planning/PROJECT.md`

### Secondary (MEDIUM confidence)
- NestJS JWT refresh-token rotation guidance (multiple 2026-dated sources: EthioDev, Elvis Duru, samuelrods.com)
- OWASP-aligned password hashing guidance (Argon2id over bcrypt consensus)
- [Secure Refresh Token Rotation with Theft Detection — Mihai Andrei](https://mihai-andrei.com/blog/refresh-token-reuse-interval-and-reuse-detection/)
- SaaS admin panel / lead-capture / minimal-CMS ecosystem pattern posts (Sequenzy, nocrm.io, AWS Well-Architected SaaS Lens, Yaro Labs)
- [TanStack Query SSR/hydration docs](https://tanstack.com/query/latest/docs/framework/react/guides/ssr), [Query Invalidation](https://tanstack.com/query/v4/docs/react/guides/query-invalidation)

### Tertiary (LOW confidence)
- Individual GitHub issue threads on Prisma/pnpm custom-output edge cases (community-reported, single-source specifics) — flagged for validation if a custom `output` path causes runtime resolution issues

---
*Research completed: 2026-08-10*
*Ready for roadmap: yes*
