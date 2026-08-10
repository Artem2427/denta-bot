# Architecture Research: NestJS + Prisma Backend Integration into Existing Turborepo Monorepo

**Domain:** Backend/monorepo integration (NestJS + Prisma + shared types package into an existing pnpm/Turborepo workspace)
**Researched:** 2026-08-10
**Confidence:** MEDIUM (patterns cross-checked against official Prisma/Turborepo docs + multiple independent 2026 community sources; no official "Prisma+NestJS+Turborepo" single source of truth exists, so specifics are synthesized)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FRONTENDS (consumers)                                                    │
│  ┌────────────────┐   ┌─────────────────────┐   ┌──────────────────────┐ │
│  │ apps/web        │   │ apps/platform-admin  │   │ apps/client-admin    │ │
│  │ Next.js 16      │   │ Vite SPA (React 19)  │   │ Vite SPA — deferred  │ │
│  │ Contacts/Demo   │   │ TanStack Query        │   │ this milestone,      │ │
│  │ forms + CMS     │   │ (leads/clinics/CMS)   │   │ scaffold only        │ │
│  │ read (blog/     │   │                       │   │                      │ │
│  │ pricing)        │   │                       │   │                      │ │
│  └────────┬────────┘   └──────────┬────────────┘   └──────────┬───────────┘│
│           │  fetch/TanStack Query │  fetch/TanStack Query      │           │
├───────────┴────────────────────────┴─────────────────────────┴────────────┤
│  API LAYER — apps/server (NestJS ^11, REST + Swagger)                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ AuthModule │ │ClinicsModule│ │ LeadsModule│ │ContentModule│ │AppModule ││
│  │ (JWT a/r)  │ │  (CRUD)    │ │(Contacts/  │ │(blog+prices)│ │(root,    ││
│  │            │ │            │ │ Demo forms)│ │            │ │ wires all)││
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └──────────┘│
│        └──────────────┴──────────────┴──────────────┘                    │
│                              │ injects PrismaService                      │
├──────────────────────────────┴─────────────────────────────────────────────┤
│  SHARED PACKAGE — packages/db (@repo/db)                                  │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ prisma/schema.prisma (models: PlatformAdmin, Clinic, Lead,          │  │
│  │   BlogPost, PricingPlan, RefreshToken)                              │  │
│  │ generated Prisma Client (custom output, gitignored)                 │  │
│  │ src/client.ts — PrismaClient singleton                              │  │
│  │ src/index.ts  — exports client + generated types                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  DATABASE — PostgreSQL (single instance this milestone)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `packages/db` (`@repo/db`) | Owns the Prisma schema, migrations, and generated client; single source of truth for DB shape and generated TS types shared by every consumer | Prisma `schema.prisma` + custom generator output + a thin `src/` wrapper exporting a `PrismaClient` singleton and re-exporting generated types |
| `apps/server` `AuthModule` | Issues/validates JWT access + refresh tokens for `PlatformAdmin` accounts; owns login, refresh, logout endpoints | NestJS + `@nestjs/passport` + `@nestjs/jwt`, two Passport strategies (access, refresh), two guards, refresh tokens persisted (hashed) via Prisma |
| `apps/server` `ClinicsModule` | CRUD + subscription/account-status fields for dental clinics (bot-usage fields modeled but stubbed) | Controller + Service + DTOs (class-validator) + Prisma model `Clinic` |
| `apps/server` `LeadsModule` | Receives/stores Contacts + Demo form submissions from `apps/web`; exposes list/manage endpoints for `platform-admin` | Public unauthenticated `POST` endpoints for form submission (rate-limited), authenticated `GET`/`PATCH` for platform-admin |
| `apps/server` `ContentModule` | CRUD for blog posts and pricing plans, replacing `apps/web/modules/blog/_data.ts` and hardcoded pricing | Controller + Service + DTOs + Prisma models `BlogPost`, `PricingPlan`; public read endpoints consumed by `apps/web`, authenticated write endpoints for `platform-admin` |
| `apps/server` `PrismaModule`/`PrismaService` | Wraps `@repo/db`'s client as an injectable NestJS provider (connection lifecycle hooks) | Global `@Module` exporting a singleton `PrismaService extends PrismaClient implements OnModuleInit/OnModuleDestroy` |
| `apps/platform-admin` API client layer | Typed fetch wrapper + TanStack Query hooks per domain (auth, clinics, leads, content) | `src/lib/api-client.ts` (fetch/axios with refresh-on-401 interceptor) + `src/queries/*.ts` (`useQuery`/`useMutation` hooks), types imported from `@repo/db` or a thin `@repo/api-types` re-export |
| `apps/web` server-side data fetching | Reads blog/pricing content from the API at request/build time (Server Components); Contacts/Demo forms POST to `LeadsModule` | Native `fetch()` in Server Components/Route Handlers for reads; `react-hook-form` + `zod` submit handler `POST`s to the leads endpoint for writes |

## Recommended Project Structure

```
denta-bot/
├── apps/
│   ├── web/                       # existing — gains: API base URL, leads POST, content GET
│   ├── server/                    # existing skeleton — becomes real API
│   │   └── src/
│   │       ├── main.ts            # + Swagger bootstrap, CORS/cookie config, ValidationPipe
│   │       ├── app.module.ts      # + imports AuthModule/ClinicsModule/LeadsModule/ContentModule/PrismaModule
│   │       ├── prisma/
│   │       │   ├── prisma.module.ts
│   │       │   └── prisma.service.ts
│   │       ├── auth/
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── dto/{login.dto.ts,refresh.dto.ts}
│   │       │   ├── strategies/{access.strategy.ts,refresh.strategy.ts}
│   │       │   └── guards/{access.guard.ts,refresh.guard.ts}
│   │       ├── clinics/
│   │       │   ├── clinics.module.ts
│   │       │   ├── clinics.controller.ts
│   │       │   ├── clinics.service.ts
│   │       │   └── dto/{create-clinic.dto.ts,update-clinic.dto.ts}
│   │       ├── leads/
│   │       │   ├── leads.module.ts
│   │       │   ├── leads.controller.ts
│   │       │   ├── leads.service.ts
│   │       │   └── dto/{create-lead.dto.ts,update-lead.dto.ts}
│   │       └── content/
│   │           ├── content.module.ts
│   │           ├── blog/{blog.controller.ts,blog.service.ts,dto/*}
│   │           └── pricing/{pricing.controller.ts,pricing.service.ts,dto/*}
│   ├── platform-admin/            # existing empty scaffold — gains:
│   │   └── src/
│   │       ├── lib/{api-client.ts,query-client.ts}
│   │       └── queries/{auth.ts,clinics.ts,leads.ts,content.ts}
│   └── client-admin/               # deferred — no backend work this milestone
├── packages/
│   ├── db/                        # NEW — Prisma schema + generated client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/{client.ts,index.ts}
│   │   ├── generated/              # gitignored — Prisma custom generator output
│   │   └── package.json            # exports "." -> src/index.ts
│   ├── ui/                         # existing, unchanged by this milestone
│   ├── eslint-config/               # existing
│   └── typescript-config/           # existing — may gain a `node-library.json` base for packages/db & server
└── turbo.json                      # modified — new db:generate/db:migrate tasks, build/dev dependsOn
```

### Structure Rationale

- **`packages/db` as its own workspace package (not `apps/server/prisma/`):** the milestone's own decision already requires shared generated types usable from `server`, `web`, and `platform-admin` — Prisma's client/types can only be a single shared import if the schema and generator live in a package all three can depend on via `workspace:*`. Putting the schema inside `apps/server` instead would force `web`/`platform-admin` to reach across an app boundary (`../../apps/server/...`), which Turborepo's dependency graph does not resolve the same way as a workspace package and breaks the "own build target" model apps are supposed to have.
- **Feature modules under `apps/server/src/` (auth, clinics, leads, content), not a `libs/` layer:** the codebase's existing NestJS convention (`app.controller.ts`/`app.service.ts`/`app.module.ts`, controllers delegate to services) scales fine at this size (4 modules). A Nest monorepo `libs/` structure is unnecessary complexity for a single deployable API — reserve it only if a second Nest app appears later (e.g. a worker/bot process).
- **`prisma.module.ts`/`prisma.service.ts` as a small wrapper inside `apps/server`, not inside `packages/db`:** `packages/db` owns the *schema and generated client* (framework-agnostic); the NestJS-specific `OnModuleInit`/`OnModuleDestroy` lifecycle wiring is Nest-specific glue and belongs in the app that uses Nest's DI, keeping `packages/db` reusable if a second backend service is ever added.
- **`content/` module split into `blog/` and `pricing/` sub-resources under one Nest module:** both are CMS-style read-heavy resources with the same auth/permission shape (public read, admin write); grouping avoids two near-identical modules while keeping controllers separate per resource.

## Architectural Patterns

### Pattern 1: Build-before-consume shared package (`packages/db`)

**What:** `packages/db` must run `prisma generate` (producing TypeScript types + a `PrismaClient`) before any consumer (`apps/server`, and transitively `apps/web`/`apps/platform-admin` if they import types from it) can type-check or build. Turborepo needs an explicit task graph edge for this — it is not implicit from `workspace:*` alone, because `prisma generate` is a codegen step, not a TypeScript compile Turborepo already understands.
**When to use:** Any time a workspace package's build output is machine-generated (Prisma, GraphQL codegen, OpenAPI-generated clients) rather than hand-written source that `tsc` compiles directly.
**Trade-offs:** Adds one more task type (`db:generate`) to reason about, and it must be explicitly excluded from Turborepo's cache (`"cache": false`) since schema changes without file hash changes (e.g. a fresh `pnpm install` needing regeneration) can otherwise serve a stale generated client.

**Example (`turbo.json`):**
```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "globalEnv": ["DATABASE_URL"],
  "tasks": {
    "db:generate": {
      "cache": false,
      "outputs": ["generated/**"]
    },
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "!.next/dev/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["^db:generate"],
      "cache": false,
      "persistent": true
    },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^db:generate", "^check-types"] }
  }
}
```

### Pattern 2: JWT access + refresh with rotation, stored server-side

**What:** Short-lived access token (JWT, ~15 min, stateless) + long-lived refresh token, persisted (hashed) in the `RefreshToken`/`PlatformAdmin` table so it can be revoked and rotated. On every `/auth/refresh` call, the old refresh token is invalidated and a new one issued (rotation); reuse of an already-rotated token is treated as theft and revokes the whole session family.
**When to use:** Any authenticated admin surface where sessions should survive longer than an access token's lifetime but must remain revocable (e.g. staff offboarding) — exactly the `platform-admin` requirement in this milestone.
**Trade-offs:** Requires a DB write on every login and every refresh (slightly more load than a pure-stateless JWT scheme), but stateless-only refresh tokens can't be revoked before expiry, which is unacceptable for an internal admin tool holding clinic/lead data.

**Example (`apps/server/src/auth/auth.module.ts` shape):**
```typescript
@Module({
  imports: [PassportModule, JwtModule.register({}), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
```
Guards (`AccessTokenGuard`, `RefreshTokenGuard`) extend `AuthGuard('jwt-access')` / `AuthGuard('jwt-refresh')`; `AuthService.refresh()` compares the presented token's hash against the stored hash, rotates on success, and throws `UnauthorizedException` (triggering full re-login) on mismatch.

### Pattern 3: REST + Swagger with class-validator DTOs, versioned by convention

**What:** Every Nest controller endpoint has a request DTO annotated with `class-validator` decorators (`@IsString()`, `@IsEmail()`, etc.) and a `@nestjs/swagger` `@ApiProperty()` pair, with a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` in `main.ts`. `SwaggerModule.setup()` mounts interactive docs (e.g. `/api/docs`).
**When to use:** All new endpoints in `AuthModule`/`ClinicsModule`/`LeadsModule`/`ContentModule` — this is the explicit stack decision (REST + Swagger, no GraphQL) and matches the existing NestJS scaffold's idioms (controllers delegate to services).
**Trade-offs:** DTOs duplicate some shape information already present in the Prisma schema/generated types; this is an accepted cost of REST+DTO validation (vs. trusting Prisma types directly at the HTTP boundary, which skips runtime validation of untrusted client input).

### Pattern 4: Frontend-side TanStack Query, split by transport shape

**What:** `apps/web` (Next.js Server Components) reads public content (blog, pricing) via a plain `fetch()` in Server Components/Route Handlers — no client-side TanStack Query needed for those reads since they're server-rendered and public. `apps/web`'s Contacts/Demo forms POST via a client-side handler (already `react-hook-form` + `zod`), swapping the current mocked-delay submit for a real `fetch()` call. `apps/platform-admin` (a Vite SPA, fully client-rendered, authenticated) uses TanStack Query (`useQuery`/`useMutation`) for everything, wrapped once in a root `QueryClientProvider`, with an API-client layer that transparently refreshes the access token on a 401 before retrying.
**When to use:** This split follows from the two apps' actual rendering models — `apps/web` doesn't need a client-side cache for content that's server-rendered per request; `apps/platform-admin` is 100% client-rendered and authenticated, where TanStack Query's cache/refetch/mutation lifecycle earns its keep.
**Trade-offs:** Two different data-fetching idioms across the monorepo (`fetch()` in Server Components vs. TanStack Query hooks in the SPA) — acceptable because the apps have genuinely different rendering models; forcing one pattern everywhere would fight one of the two frameworks.

**Example (`apps/platform-admin/src/lib/api-client.ts` shape):**
```typescript
let isRefreshing = false;
let queue: Array<() => void> = [];

async function request(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { ...init, credentials: 'include' });
  if (res.status !== 401) return res;
  if (!isRefreshing) {
    isRefreshing = true;
    await refreshAccessToken(); // POST /auth/refresh, httpOnly cookie rotated server-side
    isRefreshing = false;
    queue.forEach((retry) => retry());
    queue = [];
  }
  return new Promise((resolve) => queue.push(() => resolve(request(input, init))));
}
```

## Data Flow

### Request Flow — Contacts/Demo form → Leads → Platform Admin

```
apps/web Contacts/Demo form (react-hook-form + zod, client component)
    ↓ POST /leads  (public, rate-limited, no auth)
apps/server LeadsController → LeadsService.create()
    ↓ Prisma (via PrismaService, generated client from @repo/db)
PostgreSQL — Lead row inserted (source: 'contact'|'demo', status: 'new')
    ↓
apps/platform-admin queries/leads.ts → useQuery(['leads']) → GET /leads (JWT access token required)
    ↓
apps/server LeadsController → LeadsService.findAll() (JWT AccessTokenGuard)
    ↓
apps/platform-admin renders lead list; staff can PATCH /leads/:id (status update) via useMutation
```

### Request Flow — Content (blog/pricing) read

```
apps/web blog/pricing route (Server Component)
    ↓ fetch(`${API_BASE_URL}/content/blog`) at request time (no client JS needed)
apps/server ContentModule/blog.controller.ts → BlogService.findAll() (public, no auth)
    ↓ Prisma
PostgreSQL — BlogPost rows
    ↓
apps/web renders blog list/detail server-side, replacing apps/web/modules/blog/_data.ts
```

### Auth Flow — PlatformAdmin login + refresh

```
apps/platform-admin login form
    ↓ POST /auth/login {email, password}
AuthController → AuthService.login() → bcrypt.compare → issue access JWT (short-lived, response body)
                                                       → issue refresh token (httpOnly, Secure, SameSite cookie)
                                                       → store hashed refresh token on PlatformAdmin/RefreshToken row
apps/platform-admin stores access token in memory (not localStorage); every request attaches it as Bearer
    ↓ on 401 → POST /auth/refresh (cookie sent automatically)
AuthService.refresh() → validate + rotate refresh token → issue new access + refresh
    ↓ reused/expired refresh token → 401 → apps/platform-admin redirects to /login
```

### Key Data Flows

1. **Write path (leads):** untrusted public input (`apps/web` visitor) → DTO validation at the API boundary → Prisma insert. No auth required for the write, but rate-limiting/basic spam protection is an open question for a later phase (see Pitfalls research).
2. **Read path (content):** server-rendered, public, no auth — `apps/web` treats the API as its CMS backend the same way it previously treated `_data.ts`.
3. **Admin path (clinics/leads/content management):** always authenticated via the access+refresh JWT pair; `apps/platform-admin` is the only consumer this milestone (`apps/client-admin` deferred).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (single clinic base, internal staff tool) | Single Postgres instance, single `apps/server` process, no caching layer — current architecture is already correctly sized; do not add Redis/queues/read-replicas preemptively |
| Growth (dozens–hundreds of clinics, real bot traffic) | Add a queue (e.g. BullMQ) for bot-usage event ingestion once the real Telegram bot exists (out of scope this milestone, but `Clinic` schema's stubbed bot-usage fields should anticipate this); consider read replicas only if `platform-admin` dashboard queries become slow |
| Later (multi-tenant client-admin at scale) | `apps/client-admin`'s eventual per-clinic auth will likely need a second, clinic-scoped auth table/strategy alongside `PlatformAdmin` — plan the `AuthModule` to support a second Passport strategy without a rewrite (e.g. keep strategies pluggable, don't hardcode `PlatformAdmin` assumptions into shared guards) |

### Scaling Priorities

1. **First bottleneck (not yet reached):** N+1 Prisma queries in list endpoints (e.g. `ClinicsService.findAll()` naively including relations) — mitigate with Prisma `include`/`select` discipline as `ClinicsModule` grows, not with premature caching.
2. **Second bottleneck (future, post-bot):** bot-usage event volume once the real Telegram integration lands — the `Clinic` model's stubbed usage fields should be designed so a future event-ingestion path (queue → aggregation job → `Clinic` counters) doesn't require a schema rewrite.

## Anti-Patterns

### Anti-Pattern 1: Letting `apps/server`'s `build`/`dev` run without an explicit `^db:generate` dependency

**What people do:** Add `packages/db` as a `workspace:*` dependency and assume Turborepo/pnpm will "just work" because the package is linked.
**Why it's wrong:** `prisma generate` produces files on disk (the generated client/types) that nothing in the TypeScript compile graph triggers automatically. A fresh clone + `pnpm install` + `pnpm build` will fail with "Cannot find module '.prisma/client'" (or the custom output path) until generate has run at least once. Turborepo does not know to run it unless `build`/`dev`/`check-types` explicitly `dependsOn: ["^db:generate"]`.
**Do this instead:** Add `db:generate` as its own Turborepo task (uncached, since Prisma's own generation is fast and cache invalidation on schema changes is fragile to get right) and make every consuming task depend on it, as shown in Pattern 1 above.

### Anti-Pattern 2: Running `prisma migrate dev` against a shared/staging database, or running it in CI

**What people do:** Use `migrate dev` (which can reset/drift-correct the database interactively) as the only migration command, including in CI or against a database other developers/staging depend on.
**Why it's wrong:** `migrate dev` is designed for local development — it can prompt for destructive resets when it detects drift, and running it non-interactively in CI or against a shared DB risks data loss or blocking on prompts.
**Do this instead:** `migrate dev` (with a local/shadow DB) only in local development to author new migration files; `migrate deploy` (non-interactive, applies existing migration files, no schema-diffing) everywhere else — CI, staging, production. Keep this as two distinct `packages/db` scripts (`db:migrate` vs `db:deploy`), matching the milestone's "migrations-only schema changes" decision.

### Anti-Pattern 3: Storing the refresh token in `localStorage`/`sessionStorage` on `apps/platform-admin`

**What people do:** Store both access and refresh tokens in browser storage for simplicity, since it's easy to read/attach to every request.
**Why it's wrong:** Any XSS vulnerability in the SPA (or a compromised third-party script) can exfiltrate a `localStorage` refresh token, giving a persistent, long-lived compromise — worse than leaking a short-lived access token. This is a materially bigger risk for an internal tool holding clinic/lead PII than the added complexity of cookie handling.
**Do this instead:** Issue the refresh token as an `httpOnly`, `Secure`, `SameSite=Strict` (or `Lax`, depending on cross-origin needs between `apps/web`'s domain and the API) cookie, invisible to JS; keep only the short-lived access token in memory (not persisted storage) on the client, matching the Auth Flow shown above.

### Anti-Pattern 4: Duplicating DTO/validation shapes by hand-writing frontend types instead of consuming `@repo/db`'s generated types

**What people do:** Write parallel, hand-maintained TypeScript interfaces in `apps/web`/`apps/platform-admin` that mirror the Prisma models, because it feels simpler than wiring up the shared package import.
**Why it's wrong:** This immediately reintroduces the "no shared types/contracts package" gap the milestone context explicitly calls out as a known architectural weakness — any schema change now requires manually updating N hand-written type copies, and drift bugs (frontend expecting a field the API no longer sends) become likely.
**Do this instead:** Import Prisma-generated types (or a thin re-exported subset for API-response shapes, if raw Prisma model types leak too much internal detail — e.g. hashed password fields) from `@repo/db` in both `apps/server`'s DTOs and the frontends' query/mutation hooks, so schema changes propagate through one `pnpm build` of `packages/db`.

### Anti-Pattern 5: Building `apps/client-admin`'s auth/API wiring "for free" alongside `platform-admin` this milestone

**What people do:** Since the `AuthModule`/API client patterns are being built anyway, extend them to also wire up `apps/client-admin` "while we're in there."
**Why it's wrong:** The milestone context explicitly defers `apps/client-admin` to the next milestone — building it now expands scope, and its eventual auth model (clinic-scoped, likely a separate table/strategy from `PlatformAdmin`) isn't decided yet, risking rework.
**Do this instead:** Keep `AuthModule`'s design *extensible* (pluggable Passport strategies, no hardcoded `PlatformAdmin`-only assumptions baked into shared guards) but do not implement a second auth table or `client-admin`-facing endpoints this milestone.

## Integration Points

### Files/configs that must change

| File | Change | Why |
|------|--------|-----|
| `turbo.json` | Add `db:generate` task (`"cache": false`); add `"^db:generate"` to `build`/`dev`/`check-types`'s `dependsOn`; add `globalEnv: ["DATABASE_URL"]` (and `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `API_BASE_URL` etc. as they're introduced) | Without this, builds/type-checks silently use a stale or missing generated Prisma client (Anti-Pattern 1); env vars affecting output must be declared for correct task hashing |
| `pnpm-workspace.yaml` | No change needed | Already globs `packages/*`, so `packages/db` is picked up automatically once added |
| `package.json` (root) | Add convenience scripts, e.g. `"db:generate": "turbo run db:generate"`, `"db:migrate": "turbo run db:migrate --filter=@repo/db"`, `"dev:platform-admin": "turbo dev --filter=platform-admin"` (mirroring existing `dev:web`/`dev:server`/`dev:admin` pattern — note `dev:admin` currently points at the removed `apps/admin-panel`, likely needs renaming/updating to `dev:platform-admin`) | Keeps the existing per-app dev script convention consistent as apps are added/renamed |
| `packages/typescript-config/base.json` (or a new `packages/typescript-config/node-library.json`) | Consider adding a Node-target base config for `packages/db` (and eventually aligning `apps/server`'s ad-hoc `tsconfig.json` to extend a shared base) | `apps/server/tsconfig.json` currently does **not** extend `packages/typescript-config` (it's the raw Nest CLI default) — this is pre-existing drift from the shared-config convention documented elsewhere in the repo; introducing `packages/db` is a natural point to also bring `apps/server` in line, though it's optional/cleanup-scoped, not a hard blocker |
| `apps/server/package.json` | Add `@nestjs/passport`, `@nestjs/jwt`, `passport`, `passport-jwt`, `bcrypt` (or `argon2`), `@nestjs/swagger`, `class-validator`, `class-transformer`, `@repo/db` (workspace:*); add `"check-types": "tsc --noEmit"` script (currently missing — `apps/server` has no `check-types` script, so the root `check-types` Turborepo task silently no-ops for it today) | Required dependencies for the auth/validation/docs stack; the missing `check-types` script is a pre-existing gap that should be closed alongside this work so `apps/server`'s new DTOs/types are actually type-checked in CI |
| `apps/server/src/main.ts` | Add `SwaggerModule` bootstrap, global `ValidationPipe`, CORS config (`app.enableCors({ origin: [...], credentials: true })` to allow cookies from `apps/web`'s and `apps/platform-admin`'s origins) | REST+Swagger and cookie-based refresh tokens both require explicit bootstrap wiring not present in the current "Hello World" `main.ts` |
| `apps/server/src/app.module.ts` | Import `PrismaModule`, `AuthModule`, `ClinicsModule`, `LeadsModule`, `ContentModule` | Wires the new feature modules into the root module (currently only has the default `AppController`/`AppService`) |
| `apps/web/package.json` + new `apps/web/shared/lib/api-client.ts` (or similar, matching the existing `shared/lib/` convention) | Add an `API_BASE_URL` env-driven fetch wrapper for reads (blog/pricing) and the leads POST | Replaces `apps/web/modules/blog/_data.ts` and the Contacts/Demo forms' mocked-delay submit handlers with real HTTP calls |
| `apps/platform-admin/package.json` | Add `@tanstack/react-query`, a fetch/axios client, and remove/replace the Vite starter `App.tsx` scaffold | Currently a bare Vite+React+`@repo/ui` scaffold with no data layer at all |
| Root `.gitignore` | Ensure `packages/db/generated/**` (or wherever the custom Prisma output lands) and any root/`apps/server/.env` are ignored | No `.env*` files exist in the repo yet (per PROJECT.md) — this milestone introduces the first ones (`DATABASE_URL`, JWT secrets) |

### New packages/modules needed (net-new)

| Component | Type | Notes |
|-----------|------|-------|
| `packages/db` | New workspace package | Prisma schema, migrations, generated client, exported via `@repo/db` |
| `apps/server/src/prisma/` | New Nest module | `PrismaModule`/`PrismaService` wrapping `@repo/db`'s client for Nest DI |
| `apps/server/src/auth/` | New Nest module | `PlatformAdmin` JWT access+refresh auth (login, refresh, logout, guards, strategies) |
| `apps/server/src/clinics/` | New Nest module | Clinic CRUD + subscription/account status + stubbed bot-usage fields |
| `apps/server/src/leads/` | New Nest module | Contacts/Demo form intake + platform-admin lead management |
| `apps/server/src/content/` | New Nest module (blog + pricing sub-resources) | DB-backed CMS replacing `apps/web`'s mock blog/pricing data |
| `apps/platform-admin/src/lib/api-client.ts` | New file | Fetch/axios wrapper with 401-triggered refresh-and-retry |
| `apps/platform-admin/src/queries/` | New directory | TanStack Query hooks per domain (auth, clinics, leads, content) |
| `apps/web`'s content-reading layer | New file(s) in `shared/lib/` | Server-side `fetch()` helpers replacing `modules/blog/_data.ts` |

### Existing components modified (not net-new)

| Component | Modification |
|-----------|---------------|
| `apps/server/src/app.module.ts`, `main.ts` | Wire in new modules, Swagger, ValidationPipe, CORS (currently near-empty Nest CLI defaults) |
| `apps/web/modules/blog/_data.ts` | Retired/replaced by API calls once `ContentModule` ships (kept as fallback/seed data for `packages/db`'s seed script, potentially) |
| `apps/web`'s Contacts/Demo form submit handlers | Swap mocked `setTimeout` delay + `sonner` toast for a real `fetch()` POST to `LeadsModule`, keeping the existing `react-hook-form` + `zod` validation and toast UX |
| `turbo.json`, root `package.json` | See table above |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `packages/db` ↔ `apps/server` | Direct import (`@repo/db`) via workspace symlink | `apps/server` is the only consumer that talks to the database; no other app should import `@repo/db`'s `PrismaClient` directly — everything else goes through the REST API |
| `apps/server` ↔ `apps/web` | HTTP (REST, JSON), public endpoints unauthenticated (leads write, content read) | `apps/web` never imports `@repo/db` for live data — only the API boundary; it may still use `@repo/db`'s generated *types* (not the client) if useful for typing fetch responses, via `workspace:*` |
| `apps/server` ↔ `apps/platform-admin` | HTTP (REST, JSON), authenticated via JWT access token (Bearer) + refresh token (httpOnly cookie) | CORS must explicitly allow `apps/platform-admin`'s origin with `credentials: true` for the cookie to be sent |
| `apps/web`/`apps/platform-admin` ↔ each other | None — no direct communication; both are independent API consumers | Matches existing "three independent frontend surfaces" pattern already in the repo |

## Suggested Build Order

This is the dependency-respecting order a roadmap should phase the work in — each step's outputs are required inputs for the next:

1. **`packages/db` scaffold + Prisma schema + first migration.** Nothing downstream (shared types, DTOs, NestJS modules, frontend query hooks) can be typed or built before the schema exists and `prisma generate` has produced a client. Includes: `PlatformAdmin`, `RefreshToken` (or refresh-token fields on `PlatformAdmin`), `Clinic`, `Lead`, `BlogPost`, `PricingPlan` models; `turbo.json`/`package.json` wiring from the Integration Points table; local Postgres (e.g. docker-compose, out of this file's scope but needed for `migrate dev` to run at all).
2. **`apps/server` core wiring: `PrismaModule`, global `ValidationPipe`, Swagger bootstrap, CORS.** Establishes the skeleton every feature module plugs into; low-risk, unblocks parallel module development.
3. **`AuthModule` (JWT access + refresh for `PlatformAdmin`).** Needed before any authenticated endpoint (Clinics management writes, Leads management, Content writes) can be built/tested end-to-end, since those endpoints depend on the access-token guard.
4. **`ClinicsModule`, `LeadsModule`, `ContentModule` (parallelizable with each other once step 3 lands).** Each is an independent Nest module depending only on `PrismaModule` + `AuthModule`'s guards — safe to build concurrently once the auth guard exists. `LeadsModule`'s public write endpoint has no dependency on step 3 and could technically move earlier if the roadmap wants `apps/web` form wiring to land before `platform-admin` auth is ready.
5. **`apps/platform-admin` data layer: API client, TanStack Query hooks, replace Vite starter scaffold, wire login flow.** Depends on steps 3–4 being live (needs real endpoints to call); this is also where the currently-empty `apps/platform-admin/src/App.tsx` scaffold gets its first real screens.
6. **`apps/web` integration: swap mocked Contacts/Demo submit handlers for real `LeadsModule` POST; swap `modules/blog/_data.ts` and hardcoded pricing for `ContentModule` reads.** Last, since it depends on `LeadsModule`/`ContentModule` being stable — and this is the lowest-risk step to do last because `apps/web` already works correctly on mock data if this slips.

## Sources

- [How to use Prisma ORM and Prisma Postgres with Turborepo — Prisma Documentation](https://www.prisma.io/docs/guides/deployment/turborepo) — official, fetched directly; turbo.json `dependsOn`/`outputs`/`globalEnv` pattern and `packages/db` structure
- [How to Initialize a Turborepo monorepo with Prisma ORM and Prisma Postgres — Prisma Documentation](https://www.prisma.io/docs/ai/prompts/turborepo)
- [Setting Up a Shared PostgreSQL Database in a Turborepo for Express.js and Next.js Using Prisma — Medium](https://medium.com/@ajeeshRS/setting-up-a-shared-postgresql-database-in-a-turborepo-for-express-js-and-next-js-using-prisma-a447d089237f)
- [Turborepo monorepo with Prisma — Trigger.dev docs](https://trigger.dev/docs/guides/example-projects/turborepo-monorepo-prisma)
- [Full-stack TypeScript monorepo guide: Next.js, React Native, NestJS, GraphQL, Prisma — GitHub Gist](https://gist.github.com/realcc/c08ff57de93274ec3e0d5809bd5a54ef) — build-order/dependency pattern for shared-types packages
- [NestJS monorepo with pnpm workspaces — Gabriel Caiana](https://gabrielcaiana.com/blog/nestjs-monorepo-with-pnpm-workspaces-how-i-structured-the-dev-experience-for-multiple-services/)
- [NestJS Authentication Guide 2026 - JWT, Passport & Guards — Encore](https://encore.dev/articles/nestjs-authentication-guide)
- [NestJS Authentication with JWT, Refresh Tokens, and RBAC: The Complete Guide (2026) — EthioDev](https://etdevhub.com/article/nestjs-authentication-jwt-refresh-tokens-rbac-complete-guide-2026)
- [NestJS JWT Authentication with Refresh Tokens Complete Guide — Elvis Duru](https://www.elvisduru.com/blog/nestjs-jwt-authentication-refresh-token)
- [What's the correct approach to use axios response interceptors with react-query having retries enabled — TanStack/query GitHub Discussion #3653](https://github.com/TanStack/query/discussions/3653)
- [Refreshing an authentication token in TanStack Query — Akhila Ariyachandra](https://akhilaariyachandra.com/blog/refreshing-an-authentication-in-token-in-tanstack-query)
- [TanStack and Next.js: The De Facto Frontend Logic Layer for 2026 — DEV Community](https://dev.to/mericcintosun/tanstack-and-nextjs-the-de-facto-frontend-logic-layer-for-2026-4mal)
- Direct repo inspection: `/Users/artemdanko/Developer/denta-bot/turbo.json`, `package.json`, `pnpm-workspace.yaml`, `apps/server/{package.json,tsconfig.json,src/*}`, `apps/platform-admin/package.json`, `apps/client-admin/package.json`, `packages/ui/package.json`, `packages/typescript-config/base.json`, `apps/web/package.json`, `.planning/PROJECT.md`

---
*Architecture research for: NestJS + Prisma backend integration (v1.1 milestone)*
*Researched: 2026-08-10*
