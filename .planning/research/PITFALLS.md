# Pitfalls Research

**Domain:** First real backend for a frontend-only monorepo — NestJS + Prisma, JWT access/refresh auth from scratch, shared generated-types `packages/` package, REST+Swagger consumed by two frontends (Next.js App Router + Vite SPA) via TanStack Query
**Researched:** 2026-08-10
**Confidence:** MEDIUM (community + official-docs sources, no curated/Context7 access this run; cross-checked across 2-3 independent sources per finding — see Sources)

This repo's starting state matters: `apps/server` is an untouched NestJS scaffold (no DB, no auth, no modules, no `.env`), `apps/web` has never called a real API (all forms/data are mocked), and there is no shared-types package anywhere yet. Every pitfall below is scoped to mistakes made specifically *during that transition*, not generic backend advice.

## Critical Pitfalls

### Pitfall 1: `prisma db push`/`migrate dev` habits leak into staging or prod

**What goes wrong:**
A team that has never run migrations before reaches for the fastest command that "just works." `prisma db push` syncs the DB to the schema with no migration file and no history; `prisma migrate dev` can silently reset/drop data if it detects drift. Running either against anything but a local dev DB creates schema drift (DB out of sync with `prisma/migrations`) or destroys data outright.

**Why it happens:**
This is the team's first time using Prisma migrations at all — there's no existing muscle memory for "dev vs deploy," and early CRUD phases (Clinic, Site Leads, CMS) will all be tempted to iterate fast with `db push` because it's one command instead of "write migration, review, commit, deploy."

**How to avoid:**
- Establish the convention in the very first backend phase, before any schema work: `migrate dev` only ever targets a local/dev database; `migrate deploy` is the only command allowed to run against any shared (staging/prod) database, and it runs from CI/CD, never a developer's machine.
- Never delete or hand-edit files in `prisma/migrations/` — treat that folder as an append-only history, not a scratch folder.
- If `prisma/schema.prisma` and the DB ever diverge (e.g., someone runs a manual `ALTER TABLE`), resolve via `prisma migrate resolve`/`prisma db pull` + a new migration — never a direct DB patch.

**Warning signs:**
- `git log` shows no new files under `prisma/migrations/` despite schema.prisma changing.
- `prisma migrate status` reports drift.
- Someone asks "why is `db push` faster, can we just use that."

**Phase to address:**
Phase that introduces Prisma + first schema/migration (before any CRUD phase touches the DB) — bake the dev/deploy convention into the phase's setup checklist, not left to individual developer discipline later.

---

### Pitfall 2: Refresh tokens implemented without rotation, reuse detection, or revocation — becomes a permanent backdoor

**What goes wrong:**
"JWT access + refresh" gets treated as two token types with two expiries and nothing else: the same refresh token is reused across its whole lifetime, there's no way to invalidate a specific session (e.g., stolen laptop, logout), and a leaked refresh token remains valid until natural expiry with no way to detect the theft.

**Why it happens:**
This is the first auth system built in this repo from scratch (no `next-auth`/Passport strategy already in place) — it's easy to implement the "happy path" (issue tokens, verify signature, refresh when expired) and stop there, because that's what most tutorials show, without the theft-detection/rotation layer that's genuinely stateful backend work.

**How to avoid:**
- Rotate on every refresh: each `/auth/refresh` call issues a brand-new refresh token and immediately invalidates the old one (mark it used/revoked in the `PlatformAdmin`-linked token table).
- Detect reuse: if a refresh token that's already been rotated/revoked is presented again, treat it as a theft signal — revoke the entire token family (all tokens descended from that session) and force re-login, not just reject the one request.
- Store refresh tokens hashed (not plaintext) in the DB, same as passwords — a DB read shouldn't hand out usable session tokens.
- Give logout an actual server-side effect: revoke the refresh token record, don't just clear the client cookie.

**Warning signs:**
- The token table (or lack thereof) has no `revoked`/`usedAt` column.
- Logout is implemented purely client-side (clear cookie, no API call).
- There's no code path that ever inspects "was this refresh token already used."

**Phase to address:**
The `PlatformAdmin` auth phase specifically — this is core to that phase's scope, not deferrable. Do not let CRUD phases (Clinic, Leads, CMS) start until rotation + revocation exist, since every subsequent endpoint depends on the auth guard being trustworthy.

---

### Pitfall 3: Refresh token stored in `localStorage` or returned in the JSON response body for the Vite SPA

**What goes wrong:**
`apps/platform-admin` (Vite SPA) is a different framework context from `apps/web` (Next.js), so it's tempting to reach for a client-side auth library pattern that stores tokens in `localStorage` because it's simplest to wire up in a plain SPA with no server-side rendering to worry about. This exposes the refresh token to any XSS in the SPA — a single vulnerable dependency compromises every admin session, permanently, until manual revocation.

**Why it happens:**
No prior auth pattern exists in this repo to copy from, and `apps/platform-admin` has no SSR — so "store in JS state" feels natural, and `localStorage` is the path of least resistance for "survive a page refresh."

**How to avoid:**
- Refresh token: httpOnly + `Secure` + `SameSite` cookie, set by the NestJS response, never touched by frontend JS in either app.
- Access token: kept in memory only (React state/module-level variable), re-fetched via a silent refresh call on app load — not persisted to `localStorage`/`sessionStorage`.
- Because `apps/platform-admin` is a separate origin/port from `apps/server` in dev, this requires explicit CORS `credentials: true` + the cookie's `SameSite`/`Secure` attributes set correctly for cross-origin cookie delivery (see Pitfall 4).

**Warning signs:**
- Any `localStorage.setItem('token', ...)` or `localStorage.setItem('refreshToken', ...)` in the SPA code.
- The refresh/login endpoint response body includes the refresh token as JSON (should only be in the `Set-Cookie` header).

**Phase to address:**
Auth phase, and re-verified in the `platform-admin` frontend-integration phase (the pitfall can be reintroduced there even if the backend does it right).

---

### Pitfall 4: CORS + cookie config only tested against one frontend, breaks silently for the second

**What goes wrong:**
The team builds and tests auth against `apps/platform-admin` first (or `apps/web`'s leads endpoint first), configures CORS with a single hardcoded origin, and ships it. The second frontend then either can't send/receive the auth cookie at all (silent CORS rejection, cookie just never arrives) or works in dev but breaks in a deployed environment where the two apps live on different subdomains.

**Why it happens:**
This is the first time this repo's backend serves more than one frontend origin — there's no existing multi-origin CORS config to extend, so the first person to wire it naturally hardcodes what they're testing against (`localhost:3000` or `localhost:5173`) and moves on.

**How to avoid:**
- Configure NestJS CORS with an explicit origin allowlist (array, not wildcard) that includes both `apps/web` and `apps/platform-admin` origins from day one, `credentials: true`.
- Wildcard `origin: '*'` is incompatible with `credentials: true` — this combination fails silently/inconsistently across browsers, don't reach for it as a shortcut.
- Every frontend fetch/axios call that needs the cookie must explicitly opt in (`credentials: 'include'` for `fetch`, `withCredentials: true` for axios) — this is easy to forget on a subset of calls (e.g., Next.js Server Component fetches vs. Client Component TanStack Query calls may use different HTTP clients and need this set independently in both places).
- If `apps/web` (Next.js) and `apps/server` end up on different subdomains in production, the refresh cookie's `SameSite` setting needs revisiting (`Lax` may block cross-subdomain flows depending on the exact deployment topology) — decide the production domain layout before finalizing cookie attributes, not after.

**Warning signs:**
- CORS origin config is a single string, not an array/env-driven list.
- One frontend's requests work, the other's silently 401 with no server-side error logged (classic sign the cookie never arrived).

**Phase to address:**
Auth phase (initial CORS config) — but explicitly re-verify in whichever phase wires the *second* frontend to the API, since it's the integration point most likely to be missed if only tested against the first.

---

### Pitfall 5: Prisma-generated types (including sensitive fields) leak directly into frontend code via the shared `packages/` package

**What goes wrong:**
The shared types package re-exports Prisma's generated model types wholesale (e.g., `export type { PlatformAdmin } from '@prisma/client'`). The full `PlatformAdmin` type — including `passwordHash`, internal refresh-token fields, etc. — becomes importable from `apps/web` and `apps/platform-admin`. Even if the API response is correctly scrubbed at runtime, the *type* implies the field exists and is safe to reference, and it's easy to accidentally `select`-forget an exclusion in a new endpoint and return the hash over the wire.

**Why it happens:**
Exporting the raw Prisma type is the zero-effort path when wiring the shared-types package for the first time — writing separate DTO/response types for every model feels like duplicate work when Prisma "already generated the type."

**How to avoid:**
- Never export raw Prisma model types from the shared package for models with sensitive fields (`PlatformAdmin`, any future clinic-user table). Use Prisma's `omit` (global, at `PrismaClient` construction) to exclude `passwordHash`/token fields from every query by default, and define explicit response DTOs (NestJS classes with `@ApiProperty()`/class-validator, or plain shared interfaces) for what actually crosses the wire.
- The shared `packages/` package should export **API contract types** (request/response DTOs), not a straight re-export of `@prisma/client`'s model namespace — this also decouples frontend types from internal schema churn (renaming an internal-only DB column shouldn't force a frontend type update).
- Swagger (`@nestjs/swagger`) generation from DTOs doubles as a check here: if a sensitive field shows up in the generated OpenAPI schema for a response, that's a signal the DTO is wrong.

**Warning signs:**
- `import { PlatformAdmin } from '@repo/db-types'` or similar appears in frontend code.
- A controller method's return type is `Promise<PlatformAdmin>` (the raw Prisma model) instead of a response DTO.

**Phase to address:**
Shared-types-package phase, in tandem with the auth phase (since `PlatformAdmin` is the first model with sensitive fields) — establish the DTO-not-raw-model convention before CMS/Clinic models get added and copy the pattern either correctly or incorrectly.

---

### Pitfall 6: Prisma Client generation breaks Turborepo's dev/build pipeline the first time it's wired

**What goes wrong:**
A fresh clone (or CI runner) runs `turbo dev`/`turbo build` and `apps/server` fails because `@prisma/client` hasn't been generated yet — the generated client is a build artifact, not something present after a plain `pnpm install`. Under pnpm's symlinked `node_modules`, this gets worse: a custom `output` path for the generated client, or a shared-types package that also touches Prisma's generated output, can produce "cannot find module '.prisma/client'" errors that don't reproduce on the original author's machine (because their local `.pnpm` cache already has it).

**Why it happens:**
This is the monorepo's first Prisma integration — there's no existing `db:generate` step in `turbo.json` to model the new setup on, and pnpm's non-flat `node_modules` layout (unlike npm/yarn hoisting) is easy to get wrong on a first pass, especially if the shared types package tries to re-export or wrap the generated client from a different workspace package than the one that owns `schema.prisma`.

**How to avoid:**
- Add an explicit `db:generate` (or equivalent) task in `turbo.json` and make every `dev`/`build` task that touches the DB `dependsOn: ["^db:generate"]` — don't rely on `postinstall` alone (it doesn't cover schema changes after install).
- Keep `schema.prisma` and the generated client in a single owning package (a `packages/database`-style package, not duplicated across `apps/server` and the shared types package) — other packages import the client from that one package, they don't generate their own.
- List `DATABASE_URL` in `turbo.json`'s `globalEnv` so Turborepo's cache hashing accounts for it; keep `migrate deploy` (and any command that touches a real DB) marked as uncached/non-memoized — it's not a pure function of its inputs the way a build step is.
- Document (in the package README or a root script) that a fresh clone needs `pnpm install && pnpm db:generate` before `turbo dev` works — this is the exact class of "works on my machine" bug a first-time Prisma setup produces.

**Warning signs:**
- A teammate (or CI) hits `Cannot find module '@prisma/client'` or `.prisma/client` on a clean checkout.
- `turbo build` succeeds locally but fails in CI, or vice versa.

**Phase to address:**
The Prisma-setup/shared-types-package phase, before any CRUD phase depends on it — verify with a genuinely clean clone + `pnpm install` (not an incremental local run) before calling the phase done.

---

### Pitfall 7: TanStack Query wired inconsistently between the Next.js App Router surface and the Vite SPA, causing double-fetches or stale post-mutation data

**What goes wrong:**
Two different integration patterns get invented independently because the two frontends have never called a real API before: `apps/web`'s Server Components fetch data directly (or via a server-side call) while Client Components also mount `useQuery` for the same data with `staleTime: 0` (the TanStack Query default) — causing an immediate redundant client refetch right after the server-rendered data arrives. Separately, `apps/platform-admin` mutations (e.g., approving a lead, editing a blog post) succeed but the list view keeps showing old data because the mutation's `onSuccess` never calls `invalidateQueries` with a matching query key.

**Why it happens:**
Nothing in this repo currently calls a real API, so there's no existing "how we fetch and invalidate" convention — the Next.js side and the Vite SPA side are natural candidates for two developers/sessions inventing two different patterns, and TanStack Query's SSR story (hydration boundaries) is genuinely more involved than plain client-side `useQuery`.

**How to avoid:**
- For `apps/web` Server Components that need `platform-admin`-sourced or CMS data: prefetch on the server with `queryClient.prefetchQuery` and wrap the subtree in `<HydrationBoundary>`, rather than double-fetching with a client `useQuery` for the same key — or skip TanStack Query entirely for pure Server Component reads and only use it for the pages/sections that need client-side interactivity (filters, mutations).
- Standardize query keys as a shared factory (co-located with the shared types package or a `shared/lib/query-keys.ts`) so both `apps/web` and `apps/platform-admin` — if either ever queries overlapping resources — invalidate consistently, and so a mutation's `invalidateQueries` key can't silently mismatch a `useQuery` key.
- Every mutation (create/update/delete lead, clinic, blog post, pricing plan) must call `invalidateQueries` (or an optimistic update) in `onSuccess` — treat "list doesn't refresh after mutation" as a UAT-blocking bug, not a follow-up.
- Set a non-zero `staleTime` deliberately for data that doesn't need instant consistency (e.g., blog/pricing CMS content) instead of leaving the TanStack Query default of 0, to avoid unnecessary background refetch storms on every navigation.

**Warning signs:**
- Network tab shows the same GET fired twice on initial page load in `apps/web`.
- After creating/editing a Clinic or Lead in `platform-admin`, the list still shows stale data until a manual page refresh.
- Query keys are ad-hoc string literals duplicated across files instead of a shared constant/factory.

**Phase to address:**
Whichever phase wires TanStack Query into each frontend for the first time — establish the query-key-factory + invalidation convention in that phase's plan, don't leave it to be discovered per-endpoint.

---

### Pitfall 8: Concurrent 401s during token expiry trigger a refresh stampede or an unhandled logout loop in the Vite SPA

**What goes wrong:**
`apps/platform-admin`'s dashboard fires several TanStack Query requests on mount (clinics, leads, CMS lists). When the access token expires, all of them 401 simultaneously. Without coordination, each one independently triggers its own `/auth/refresh` call — multiple refresh calls race, and because refresh tokens are now rotated (Pitfall 2's fix), the second concurrent refresh call reuses an already-rotated token and gets treated as theft, forcing an unwanted logout even though this was legitimate concurrent traffic, not an attacker.

**Why it happens:**
This interaction only appears once rotation-on-every-refresh is implemented (correctly, per Pitfall 2) *and* multiple queries are in flight at once — it's an emergent bug from two individually-correct pieces (rotation + parallel queries) that wasn't visible when testing single-request flows.

**How to avoid:**
- Implement a single in-flight refresh guard in the HTTP client layer shared by all TanStack Query fetchers: the first 401 triggers exactly one `/auth/refresh` call; every other concurrent 401 waits on that same in-flight promise and retries with the new access token once it resolves, instead of each firing its own refresh.
- This guard needs to live in the fetch wrapper/axios instance used by TanStack Query's `queryFn`s, not per-hook — otherwise every `useQuery` call site has to reimplement it correctly.
- Test this explicitly with a dashboard view that fires 3+ parallel queries against an expired token, not just a single-request manual test.

**Warning signs:**
- Multiple `POST /auth/refresh` calls in the network tab within milliseconds of each other.
- Users get logged out intermittently on the dashboard even with valid credentials, especially right around access-token expiry.

**Phase to address:**
The `platform-admin` API-integration phase (where TanStack Query + the auth HTTP client are wired together) — this is a frontend-side pitfall that surfaces after the backend auth phase is otherwise correct, so it needs its own verification step, not just "auth works" from the backend phase.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| `prisma db push` instead of migrations during early schema iteration | Faster local iteration, no migration-file bureaucracy | No migration history to deploy from; forces a "squash into a real migration" cleanup before shipping; risk of drift if forgotten | Only inside a throwaway local sandbox DB, never committed as the schema-change workflow, and never on any shared DB |
| Single hardcoded CORS origin during initial auth phase | One less config decision while building/testing auth | Second frontend integration breaks silently later, debugged under time pressure | Never — the cost of an array-of-origins config from day one is near zero |
| Re-exporting raw `@prisma/client` model types from the shared package instead of writing DTOs | Zero extra code, "already typed" | Sensitive fields leak into frontend type surface; internal schema changes force frontend type churn | Never for models with sensitive fields (`PlatformAdmin`); marginally acceptable for pure lookup/enum tables with no sensitive data |
| Storing refresh token in `localStorage` "just for now, will move to cookies later" | Faster to wire up in a plain SPA with no cookie/CORS config needed | XSS-exposed session tokens ship to real users if "later" never happens; retrofitting httpOnly cookies later means solving CORS+cookie config anyway, on a deadline | Never in anything beyond a local disposable prototype not touching real data |
| No refresh-token rotation, just long-lived refresh tokens with a fixed expiry | Simpler token table, fewer state transitions to implement | No way to detect/react to a stolen refresh token until it naturally expires (could be weeks) | Never for the `PlatformAdmin` table given it controls clinic/lead/CMS data access |

## Integration Gotchas

Common mistakes when connecting to external services/frameworks in this transition.

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Prisma + pnpm workspaces | Multiple packages each generate their own Prisma client into `node_modules`, causing one to silently overwrite another under pnpm's symlink structure | One package owns `schema.prisma` + client generation; every other package imports the client from that package, never generates its own |
| Prisma custom generator `output` path + pnpm | Custom `output` path breaks under pnpm's `.pnpm` store nesting (`.prisma/client` not found at runtime) | Prefer Prisma's default generation location inside the owning package unless there's a concrete reason to customize it; if customized, test on a clean `pnpm install`, not just an incrementally-updated local checkout |
| Turborepo task graph + Prisma generate | `dev`/`build` tasks don't declare `dependsOn: ["^db:generate"]`, so a clean clone fails on first run | Explicit `db:generate` task in `turbo.json`, wired as a dependency of every task that imports the generated client |
| NestJS Swagger (`@nestjs/swagger`) + DTO validation | Response DTOs aren't kept in sync with actual controller return shapes (e.g., a service returns the raw Prisma entity but the DTO omits a field) — Swagger docs lie about the real response | Always return the DTO instance (or a plain object shaped exactly like it) from controllers, ideally via a NestJS `ClassSerializerInterceptor` + `@Exclude()`/`@Expose()` on the DTO so serialization is enforced, not just documented |
| TanStack Query + Next.js Server Components | `useQuery` in a Client Component duplicates a fetch already done server-side in the parent Server Component, with mismatched cache keys | Use `HydrationBoundary` + server `prefetchQuery` with the *same* query key the Client Component's `useQuery` uses, or pass `initialData` explicitly |
| Two frontends sharing one auth cookie domain | Cookie `SameSite`/`Secure`/domain attributes tuned only for `localhost` dev, never revisited for the real deployment topology | Decide (even provisionally) whether `apps/web` and `apps/platform-admin` will share a parent domain/subdomain in production before finalizing cookie attributes — this changes what `SameSite` value is even viable |

## Performance Traps

Patterns that work at small scale but fail as usage grows. (Scale here is low — internal admin tool + marketing site leads — but a couple of traps are worth flagging early since they're cheap to avoid now and expensive to retrofit.)

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| No pagination on Clinic/Leads/CMS list endpoints | List endpoints return the entire table; fine with 20 rows, slow with 2,000 | Build list endpoints with `skip`/`take` (Prisma) + a paginated response DTO from the start, even if the frontend doesn't paginate the UI yet | Once real clinics/leads accumulate over months of marketing traffic (dozens to low hundreds is enough to notice on a small DB instance) |
| N+1 queries via Prisma relations accessed in a loop (e.g., fetching each Clinic then separately querying its leads) | Dashboard list views get slow as row count grows; DB query count scales linearly with rows rendered | Use Prisma `include`/`select` to fetch relations in the same query, not a loop of `findUnique` calls per row | Noticeable once list views exceed ~50-100 rows with related data |

## Security Mistakes

Domain-specific security issues beyond general web security, specific to this auth/API transition.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Access token given a long expiry "to reduce refresh calls" | Wider window for a stolen access token to be usable (access tokens can't be revoked individually, only refresh tokens can) | Keep access tokens short-lived (minutes, not hours); rely on silent refresh for UX, not a long-lived access token |
| Swagger UI exposed and reachable in production without auth | Full API surface (including internal admin endpoints/DTOs) discoverable by anyone who finds the URL | Gate `/api/docs` (or wherever Swagger UI mounts) behind auth or disable it outside development/staging |
| Global `ValidationPipe` misconfigured (`whitelist` off, or `forbidNonWhitelisted` off) | Over-posting/mass-assignment: a client can send extra fields (e.g., attempting to set an `isAdmin`-style flag on a Clinic or PlatformAdmin record) that get silently accepted | Enable `whitelist: true` (and generally `forbidNonWhitelisted: true`) globally from the very first module, before any CRUD endpoint exists to exploit |
| Refresh token comparison done with a plain `===` string check against a stored plaintext token | Timing-attack surface, and plaintext token storage means a DB read leaks usable sessions | Hash refresh tokens at rest (e.g., SHA-256) and compare hashes; never store or log the raw token value server-side |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Silent logout on refresh-token expiry with no warning | Admin loses unsaved form state (e.g., mid-edit on a blog post) with no explanation | Detect an impending/failed refresh and surface a clear "session expired, please log in again" state before discarding in-progress UI state |
| No loading/error state distinction on first real API calls | Because `apps/web`'s forms currently just simulate success, the team may carry that pattern forward and not build real error states (network failure, validation error, 500) for the now-real Contacts/Demo submission | Explicitly design and test the failure path (server down, validation error, duplicate submission) for every endpoint that used to be mocked — this is genuinely new work, not already covered by the mock-data phases |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces, specific to this milestone's exact scope.

- [ ] **Auth endpoints:** Often missing logout revocation — verify a logged-out refresh token is actually rejected server-side, not just cleared client-side.
- [ ] **Refresh flow:** Often missing reuse detection — verify replaying an already-used refresh token invalidates the whole session family, not just that one request.
- [ ] **Shared types package:** Often missing DTO boundary — verify no frontend import pulls in a raw Prisma model type with sensitive fields (`passwordHash`, token hashes).
- [ ] **Prisma setup:** Often missing clean-clone verification — verify `git clone` + `pnpm install` + `turbo dev` works without a manually-run `prisma generate` step someone forgot to script.
- [ ] **CORS config:** Often missing the second origin — verify both `apps/web` and `apps/platform-admin` origins are in the allowlist, not just whichever was used to test.
- [ ] **List endpoints (Clinics/Leads/CMS):** Often missing pagination — verify `skip`/`take` exist even if unused by the UI yet.
- [ ] **Mutations (create/edit/delete Lead, Clinic, Blog Post, Pricing Plan):** Often missing cache invalidation — verify the list view actually refreshes after a mutation without a manual page reload.
- [ ] **Swagger docs:** Often missing production gating — verify `/api/docs` isn't publicly reachable once deployed, or is intentionally acceptable per a real decision (not an oversight).
- [ ] **Contacts/Demo form submission (now real, was mocked):** Often missing real error-state UI — verify a failed submission (network error, validation error) shows something other than the old "simulated success" toast.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|-----------------|------------------|
| Schema drift from `db push`/manual DB edits | MEDIUM | Run `prisma db pull` to capture actual DB state, diff against `schema.prisma`, hand-write a corrective migration, and use `prisma migrate resolve --applied` to reconcile history without re-running destructive commands |
| Refresh tokens already shipped without rotation/revocation | MEDIUM | Add the token table's `revoked`/`family`/`usedAt` columns via a migration, deploy the rotation logic, and force-expire all pre-existing refresh tokens (revoke them all) so the new logic applies cleanly to fresh sessions only |
| Raw Prisma types already imported across frontend code | LOW–MEDIUM | Introduce the DTO types alongside the raw ones, migrate imports file-by-file (mechanical find/replace per model), then remove the raw re-export from the shared package once nothing references it |
| CORS only allowed one origin, second frontend breaks in a later phase | LOW | One-line fix (add origin to the allowlist array) — but audit for any hardcoded single-origin assumptions elsewhere (e.g., a cookie `domain` attribute) at the same time |
| No cache invalidation wired for mutations, discovered late | LOW | Add `invalidateQueries` calls to each mutation's `onSuccess`; if query keys were inconsistent, this is also the moment to introduce a shared query-key factory rather than patching each call site ad hoc |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| `db push`/`migrate dev` misuse against shared DBs | Prisma-setup phase (first schema + migration) | `prisma migrate status` clean on staging/prod; CI runs `migrate deploy`, never `migrate dev` |
| Refresh tokens without rotation/reuse-detection/revocation | `PlatformAdmin` auth phase | A test that reuses an already-rotated refresh token and asserts the whole session family is revoked |
| Refresh token in `localStorage`/JSON body | Auth phase (backend) + platform-admin frontend-integration phase | Inspect `Set-Cookie` header (httpOnly, Secure, SameSite set) and confirm no token appears in JSON response body or browser storage |
| CORS/cookies not tested against both frontends | Auth phase (initial) + second-frontend integration phase | Manually exercise login from both `apps/web` (if it ever needs auth) and `apps/platform-admin`, confirm cookie round-trips on both |
| Raw Prisma types leaking into shared package | Shared-types-package phase | Code review / grep for `from '@prisma/client'` imports outside the owning DB package and `apps/server` |
| Turborepo/Prisma generate wiring breaks clean clones | Prisma-setup phase | CI (or a fresh `git clone` in a scratch dir) runs `pnpm install && turbo build` with zero manual steps |
| TanStack Query double-fetch / stale-after-mutation | Frontend API-integration phase(s) for `apps/web` and `apps/platform-admin` | Network tab shows one fetch per resource per navigation; mutating a record updates its list view without manual refresh |
| Concurrent-401 refresh stampede / false theft-detection logout | `platform-admin` API-integration phase | Load a multi-query dashboard view with a pre-expired access token, confirm exactly one `/auth/refresh` call fires and all queries recover |
| No pagination on list endpoints | Respective CRUD phases (Clinic, Leads, CMS) | Endpoint accepts and honors `skip`/`take` (or cursor) params even if the current UI always requests page 1 |

## Sources

- [Deploying database changes with Prisma Migrate — Prisma Docs](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)
- [A mental model for Prisma Migrate — Prisma Docs](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/mental-model)
- [About the shadow database — Prisma Docs](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database)
- [Development and production — Prisma Docs](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)
- [How to use Prisma ORM in pnpm workspaces — Prisma Docs](https://www.prisma.io/docs/guides/use-prisma-in-pnpm-workspaces)
- [How to use Prisma ORM with Turborepo — Prisma Docs](https://www.prisma.io/docs/guides/turborepo)
- [Turborepo caching with Prisma — GitHub Discussion #9125](https://github.com/vercel/turborepo/discussions/9125)
- [Generated prisma client cached but not restored — Turborepo Issue #3393](https://github.com/vercel/turborepo/issues/3393)
- [Multiple prisma clients and databases — Turborepo Discussion #3493](https://github.com/vercel/turborepo/discussions/3493)
- [Cannot find module '.prisma/client/default' with custom output + pnpm — Prisma Issue #25833](https://github.com/prisma/prisma/issues/25833)
- [Excluding fields — Prisma Docs](https://www.prisma.io/docs/orm/v6/prisma-client/queries/excluding-fields)
- [Introducing global omit for model fields — Prisma Blog](https://www.prisma.io/blog/introducing-global-omit-for-model-fields-in-prisma-orm-5-16-0)
- [Secure Refresh Token Rotation with Theft Detection — Mihai Andrei](https://mihai-andrei.com/blog/refresh-token-reuse-interval-and-reuse-detection/)
- [JWT Refresh Token: Rotation, Revocation, and Secure Storage — Jsonic](https://jsonic.io/guides/jwt-refresh-token)
- [LocalStorage vs httpOnly Cookies for JWT — Wisp CMS](https://www.wisp.blog/blog/understanding-token-storage-local-storage-vs-httponly-cookies)
- [Secure Storage of Refresh Tokens in SPAs — Medium](https://medium.com/@nijesh.hirpara/secure-storage-of-refresh-tokens-in-single-page-applications-02e0863f192a)
- [Server Rendering & Hydration — TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [Advanced Server Rendering — TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Query Invalidation — TanStack Query Docs](https://tanstack.com/query/v4/docs/react/guides/query-invalidation)
- [axios-auth-refresh — GitHub](https://github.com/Eden1711/axios-auth-refresh)
- [JWT Refresh Token Race Conditions — SpiritCode.blog](https://spiritcode.blog/jwt-refresh-token-race-conditions-how-i-finally-fixed-it/)
- [NestJS Per-DTO ValidationPipe override — Gist](https://gist.github.com/GHkrishna/3b38872ba8c2eb1d299d0a943013de49)
- [forbidNonWhitelisted does not allow optional properties — NestJS Issue #2535](https://github.com/nestjs/nest/issues/2535)
- [NestJS Enable CORS in Production — GeeksforGeeks](https://www.geeksforgeeks.org/javascript/nestjs-enable-cors-in-production/)
- [Avoiding CORS Issues in React/Next.js — PropelAuth](https://www.propelauth.com/post/avoiding-cors-issues-in-react-next-js)

---
*Pitfalls research for: denta-bot v1.1 — first NestJS+Prisma backend, JWT auth, shared types package, dual-frontend TanStack Query integration*
*Researched: 2026-08-10*
