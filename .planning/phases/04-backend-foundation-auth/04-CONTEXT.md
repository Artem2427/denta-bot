# Phase 4: Backend Foundation & Auth - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning

<domain>
## Phase Boundary

A real Postgres + Prisma + NestJS backend replaces the untouched `apps/server` scaffold: a shared `packages/db` Prisma package (schema + migrations for `PlatformAdmin`, `RefreshToken`, `Clinic`, `Lead`, `BlogPost`, `PricingPlan`), a browsable Swagger/OpenAPI doc, and secure `PlatformAdmin` JWT authentication (access + refresh, rotation with reuse detection, server-side logout revocation, protected-route enforcement). No `apps/platform-admin` UI or Clinic/Lead/Content CRUD modules exist yet — those are Phase 5. Success is verified at the API/Swagger level only.

</domain>

<decisions>
## Implementation Decisions

### Local DB / Environment Setup
- **D-01:** Local dev Postgres runs via Docker Compose, Postgres 17.
- **D-02:** `docker-compose.yml` lives at the monorepo root (not scoped inside `packages/db`) — `docker compose up` works from anywhere, matches "one DB for the whole workspace."
- **D-03:** Simple committed dev defaults: `postgres`/`postgres`, db name `denta_bot_dev`, in `docker-compose.yml` + a matching `.env.example` with `DATABASE_URL`. Local-only, no security reason to complicate.
- **D-04:** Compose file has just the Postgres service — no pgAdmin. Prisma Studio covers DB browsing.

### Auth Token Transport & Domain Topology
- **D-05:** Production topology is assumed to be a shared parent domain with subdomains — `dentabot.com` (web), `admin.dentabot.com` (platform-admin), `api.dentabot.com` (server) — but no hosting/domain decision actually exists yet. — **Reversibility:** reversible — **rationale:** design the refresh cookie's `Domain` attribute as an env var, not hardcoded, so the real topology (once chosen) is a one-line config change, not a rewrite.
- **D-06:** Access token is held in memory only on the frontend (never `localStorage`/`sessionStorage`); refresh token is delivered as an httpOnly, Secure cookie. — **Reversibility:** costly — **rationale:** this is the core session-security architecture; switching to a persisted-token model later means re-touching every frontend auth call site, not just a config flag.
- **D-07:** Access token TTL: 15 minutes. Refresh token TTL: 7 days.
- **D-08:** CORS allowlist covers both `apps/web`'s dev origin (`:3000`) and `apps/platform-admin`'s dev origin from day one in Phase 4, even though `apps/web`'s real fetch calls don't land until Phase 6 — avoids having to remember to circle back and re-verify CORS when the second frontend actually gets wired.

### Prisma Schema Field Specifics
- **D-09:** `Clinic.status` enum: `trial | active | suspended | cancelled`.
- **D-10:** `Clinic.plan` is an independent string/enum field, **not** a foreign key to `PricingPlan`. — **Reversibility:** costly — **rationale:** keeps billing/account state decoupled from CMS marketing content — editing a plan's public name/price in the Phase 5 CMS must not silently change what plan every existing clinic is recorded as being on. Merging them later would require a data migration reconciling the two.
- **D-11:** Clinic stubbed bot-usage fields: `messageCount` (int, default 0), `bookingsCount` (int, default 0), `lastActiveAt` (nullable datetime). No real bot exists yet; these are placeholders for Phase 5's screens.
- **D-12:** `BlogPost` mirrors the existing mock `Post` type in `apps/web/modules/blog/_data.ts`: `slug`, `title`, `excerpt`, `category` (string), `date`, `readTime`, `image` (url string), `body` (JSON — same `PostBodyBlock[]` union: paragraph/heading/list/quote). Adds a new `published: boolean` for CMS-01 draft support. Field-for-field match keeps the Phase 6 swap to real data mechanical.
- **D-13:** `PricingPlan` mirrors the existing plan shape in `apps/web/modules/prices/pricing-cards.tsx`: `name`, `monthlyPrice`, `yearlyPrice` (display-ready strings, not cents — matches how the premium UI components already consume them), `description`, `features` (string array), `isPopular` (bool). Adds new `sortOrder` (int, for staff reordering in Phase 5) and `published` (bool).
- **D-14:** `Lead.source` enum: `contacts | demo`. `Lead.status` enum: `new | contacted | converted` — exactly matches REQUIREMENTS.md's LEAD-01/02/05, no invented states (PROJECT.md explicitly defers a full sales pipeline to v2).

### Bootstrapping the First PlatformAdmin
- **D-15:** The first `PlatformAdmin` account is created via a Prisma seed script in `packages/db` that reads `PLATFORM_ADMIN_EMAIL`/`PLATFORM_ADMIN_PASSWORD` from env vars and upserts one record with an argon2 hash. Re-runnable, no plaintext password ever committed; documented as a setup step.
- **D-16:** No create-admin / self-service invite endpoint in Phase 4 (or anywhere in v1.1) — REQUIREMENTS.md's AUTH-01–04 only cover login/refresh/logout. Additional staff accounts (if ever needed) are added via the seed script or a direct DB insert.

### Claude's Discretion
- Exact Prisma field types/nullability beyond what's specified above, index choices, and migration naming are left to planning/implementation.
- `packages/db` internal structure (schema file layout, generated-client `output` path) follows the research's recommendation unless a concrete blocker surfaces.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & scope
- `.planning/ROADMAP.md` §"Phase 4: Backend Foundation & Auth" — goal, success criteria, requirement mapping (INFRA-01/02/03, AUTH-01/02/03/04)
- `.planning/REQUIREMENTS.md` — full AUTH/INFRA requirement text and acceptance detail
- `.planning/PROJECT.md` — v1.1 milestone goal, constraints, deferred-item list (dark mode, csstype conflict, Node engine floor are unrelated to this phase's scope but tracked there)

### Research
- `.planning/research/SUMMARY.md` — stack recommendations (Prisma 7 + `@prisma/adapter-pg`, `@nestjs/jwt`+`passport-jwt`, `argon2`, `@nestjs/swagger`), architecture approach (`packages/db` ownership boundary, module structure), and the 6 critical pitfalls (migration discipline, refresh rotation/reuse-detection, cookie storage, CORS, DTO boundary, Turborepo/Prisma wiring) — all directly govern this phase's implementation

### State / open technical items
- `.planning/STATE.md` §"Blockers/Concerns" — flags the Node engine floor mismatch (root `package.json` `engines.node: ">=18"` vs Prisma 7's `>=20.19.0` requirement) as needing a manifest fix early in this phase; local dev already runs Node 22.20.0 so this is not an environment blocker, just a manifest correction

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/modules/blog/_data.ts` — `Post`/`PostBodyBlock` type shape to mirror in the `BlogPost` Prisma model (D-12)
- `apps/web/modules/prices/pricing-cards.tsx` — plan tier shape (`name`/`monthlyPrice`/`yearlyPrice`/`description`/`features`/`popular`) to mirror in the `PricingPlan` Prisma model (D-13)

### Established Patterns
- `apps/server` is currently the untouched Nest CLI scaffold (`AppController`/`AppService`/`AppModule`, "Hello World") — this phase is greenfield backend work, no existing server-side patterns to preserve or extend
- Monorepo convention: shared code lives in `packages/*`, consumed via `workspace:*` protocol (e.g. `@repo/ui`) — `packages/db` should follow the same pattern (likely `@repo/db`)

### Integration Points
- `packages/db` (new) owns the Prisma schema/migrations/generated client — imported only by `apps/server` per the research's architecture recommendation; frontends stay behind the REST/HTTP boundary, never importing Prisma types directly
- `turbo.json` currently has `build`/`lint`/`check-types`/`dev` tasks with no DB-generation step — needs an explicit `db:generate` task (`"cache": false`) wired as a `dependsOn` of `build`/`dev`/`check-types` (research pitfall #6), verified against a clean clone
- Root `package.json`'s `engines.node: ">=18"` needs bumping to reflect Prisma 7's `>=20.19.0` floor

</code_context>

<specifics>
## Specific Ideas

No particular visual/behavioral references beyond the decisions above — this is a backend-only phase (no UI), verified at the API/Swagger level.

</specifics>

<deferred>
## Deferred Ideas

- **Rate limiting / spam protection on the public `POST /leads` endpoint** — flagged as an open question in research, but that endpoint doesn't exist until Phase 5 (module) / Phase 6 (real `apps/web` wiring). Revisit when that endpoint is actually built.
- **Create-admin / self-service PlatformAdmin invite flow** — no requirement anywhere in v1.1; single flat role, 1-3 staff. Would only become relevant if staff headcount or role tiers (already out of scope per REQUIREMENTS.md) change.
- **Role tiers / RBAC** — explicitly out of scope per REQUIREMENTS.md, unchanged by this discussion.

</deferred>

---

*Phase: 4-Backend Foundation & Auth*
*Context gathered: 2026-08-10*
