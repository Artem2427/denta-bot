# Stack Research

**Domain:** NestJS + Prisma REST API (platform-admin backend) — JWT auth, Swagger, shared generated types, TanStack Query consumers (Next.js + Vite)
**Researched:** 2026-08-10
**Confidence:** HIGH (versions verified live against npm registry; patterns cross-checked against official Prisma/NestJS docs and 2+ independent sources)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `prisma` + `@prisma/client` | **7.9.1** (verified via `npm view`, 2026-08-10) | ORM, migrations, generated types/client | Prisma 7 is the current major (GA since 2025-11-19). It's Rust-free, ships an ESM-compatible `prisma-client` generator, and — critically for this project — **requires** an explicit `output` path for the generated client (no more implicit `node_modules` generation). That requirement is a perfect fit for the confirmed decision to vendor the generated client into a `packages/` workspace package; you don't have to fight the tool to get that layout. |
| `@nestjs/swagger` | **11.4.6** | OpenAPI/Swagger spec + docs UI generation | Matches installed `@nestjs/core ^11.0.1` major exactly (Nest 11 line). Decorator-based (`@ApiProperty`, `@ApiTags`, `DocumentBuilder`), integrates with `class-validator`/`class-transformer` DTOs you'll already need for request validation — one annotation set drives both validation and docs. |
| `@nestjs/jwt` | **11.0.2** | JWT signing/verification service | Official Nest wrapper around `jsonwebtoken`, matches Nest 11 major. Used for both access and refresh token issuance with independent secrets/TTLs. |
| `@nestjs/passport` + `passport` + `passport-jwt` | **11.0.5 / (peer, latest `passport`) / 4.0.1** | Strategy-based auth guards | Standard Nest auth pattern: `JwtStrategy` (access) + a second `JwtRefreshStrategy` reading the refresh token from an httpOnly cookie or body, each wrapped in its own `AuthGuard('jwt')` / `AuthGuard('jwt-refresh')`. Avoids hand-rolling token extraction/verification. |
| `argon2` | **0.45.1** | Password hashing for `PlatformAdmin` credentials | OWASP's current first-choice algorithm (2024+ guidance, reaffirmed through 2026 sources): memory-hard, resists GPU/ASIC cracking in ways bcrypt's fixed ~4KB cost function can't. This is a from-scratch table with no legacy bcrypt hashes to migrate, so there's no reason to start on the weaker option. |
| `@tanstack/react-query` | **5.101.4** (v5 line) | Server-state/data-fetching on both frontends | Already the confirmed decision. v5's `queryOptions`/`useQuery`/`useMutation` API works identically in Next.js App Router (Client Components + optional RSC prefetch/hydration) and Vite/React — one client library, two consumers, no adapter needed. |
| `openapi-typescript` + `openapi-fetch` | **7.13.0 / 0.17.0** | Generate types from the NestJS Swagger JSON spec + typed fetch client | `@nestjs/swagger` emits an OpenAPI JSON document; `openapi-typescript` turns it into a `.d.ts` types file, `openapi-fetch` is a ~2KB typesafe fetch wrapper that consumes those types with zero runtime schema validation overhead. This is the natural "shared contract" complement to the shared Prisma-types package — Prisma covers DB-shape types, this covers HTTP-contract types, and both are generated (not hand-written), so they can't silently drift as fast as manual interfaces would. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@prisma/adapter-pg` + `pg` | latest matching `prisma@7.x` | Postgres driver adapter | Prisma 7's Rust-free query engine requires an explicit driver adapter per database — this is not optional the way it was pre-v6. Pick this now, at schema-creation time, since `prisma.config.ts` wires the adapter in directly. |
| `@nestjs/config` | **4.0.4** | Typed env var loading | Use with a `validate` function; see Zod option below for stronger typing. |
| `zod` | **4.4.3** | Env var schema validation + (optionally) DTO validation | Already a project convention (`react-hook-form` + `zod` on `apps/web`). Reuse it here for `ConfigModule.forRoot({ validate: (env) => envSchema.parse(env) })` so a missing/malformed env var fails fast at boot instead of at first request. |
| `class-validator` + `class-transformer` | **0.15.1 / 0.5.1** | Request DTO validation + Swagger metadata source | Nest's default validation approach; `@nestjs/swagger`'s `DocumentBuilder`/`@ApiProperty` reads the same DTO classes, so one DTO definition drives both `ValidationPipe` and the generated OpenAPI schema — no duplicate contract to maintain. |
| `cookie-parser` | **1.4.7** | Read the httpOnly refresh-token cookie | Needed if refresh tokens are delivered via httpOnly cookie (recommended over response body/localStorage — see Pitfalls). |
| `@nestjs/throttler` | latest matching Nest 11 | Rate-limit `/auth/login` and `/auth/refresh` | Not explicitly requested, but standard hardening for any JWT auth surface exposed to the internet; cheap to add, prevents brute-force/credential-stuffing against the `PlatformAdmin` table. |
| `@t3-oss/env-nextjs` (optional, `apps/web` only) | — | Typed env vars on the Next.js side, mirroring the Zod pattern server-side | Optional convenience; only if `apps/web` starts consuming server env vars directly (e.g. API base URL) beyond what's already there. Not required for this milestone. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Prisma CLI (`prisma migrate dev` / `migrate deploy`) | Schema migrations | Confirmed decision: all schema changes go through migrations, never `db push` in this monorepo once the schema stabilizes. `migrate dev` locally, `migrate deploy` in CI/prod (no interactive prompts). |
| `prisma.config.ts` | Prisma 7's new project config (replaces `datasource.url` in `schema.prisma` for connection/migration settings) | Lives in the new `packages/db` package root. `url`, `directUrl`, `shadowDatabaseUrl` in the `datasource {}` block are deprecated in v7 — set them in `prisma.config.ts` instead. |
| Turborepo task additions | New `db:generate` task, `check-types`/`build`/`dev` deps | See "Turborepo Integration" below — this is a required `turbo.json` change, not just a new package. |
| Swagger UI (`SwaggerModule.setup`) | Interactive API docs + machine-readable JSON spec | Serve at e.g. `/api/docs`; the JSON spec at `/api/docs-json` (or `-yaml`) is the input to `openapi-typescript`'s codegen step. |

## Installation

```bash
# apps/server — auth, validation, docs
pnpm --filter server add @nestjs/jwt @nestjs/passport passport passport-jwt \
  @nestjs/swagger @nestjs/config class-validator class-transformer \
  argon2 cookie-parser zod
pnpm --filter server add -D @types/passport-jwt @types/cookie-parser

# new packages/db workspace package — Prisma schema + generated client
pnpm --filter db add @prisma/client @prisma/adapter-pg pg
pnpm --filter db add -D prisma @types/pg typescript

# apps/web and apps/platform-admin — typed API client + TanStack Query
pnpm --filter web add @tanstack/react-query
pnpm --filter platform-admin add @tanstack/react-query
pnpm --filter web add -D openapi-typescript openapi-fetch
pnpm --filter platform-admin add -D openapi-typescript openapi-fetch
# (or generate the .d.ts types once in packages/api-types and have both apps
#  depend on that package + openapi-fetch directly — see Architecture note)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `prisma` v7 (`prisma-client` generator) | `prisma` v6 (`prisma-client-js` generator) | If you need to keep Node.js support at `>=18` (v6 still generates into `node_modules` and doesn't force driver adapters). This repo already runs Node 22.20.0 locally and has no `.nvmrc`/CI pin forcing 18, so v7 is the better long-term choice — just requires bumping the root `package.json` `engines.node` (see Pitfalls). |
| `argon2` | `bcrypt` | Only if you have an existing bcrypt user table to stay compatible with (not the case — `PlatformAdmin` is brand new) or a deployment target where `argon2`'s native binary can't build (rare; it ships prebuilt binaries for common platforms). |
| `openapi-typescript` + `openapi-fetch` | `@hey-api/openapi-ts` (with its TanStack Query plugin) or `openapi-react-query` | `openapi-react-query` is worth a look later — it's a ~1KB wrapper that turns the same generated types directly into typed `useQuery`/`useMutation` hooks, removing a little boilerplate vs. wiring `openapi-fetch` calls into TanStack Query manually. Start with the more explicit `openapi-fetch` + manual `useQuery` approach for milestone v1.1 (fewer moving parts to debug on a first backend), revisit `openapi-react-query` once the API surface is stable. |
| REST + Swagger + `openapi-typescript` | GraphQL + Apollo / codegen | Explicitly out of scope per confirmed decisions — do not add `@nestjs/graphql`, `apollo-server`, `graphql`, or `@apollo/client`. REST/Swagger is simpler to reason about for a small admin CRUD surface and matches the TanStack Query (not Apollo) frontend decision. |
| Storing refresh tokens hashed in `PlatformAdmin`/a `RefreshToken` table | Stateless refresh (no DB record, just a longer-lived JWT) | Stateless refresh tokens can't be revoked (no logout-everywhere, no compromise response) — wrong tradeoff for a staff admin auth surface where a small number of privileged accounts justify the extra DB write per refresh. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| `prisma db push` for schema changes after initial scaffold | Confirmed decision requires migrations for all schema changes; `db push` skips the migration history entirely and will desync `packages/db/prisma/migrations` from the actual DB state | `prisma migrate dev` (local) / `prisma migrate deploy` (CI/prod) |
| Storing refresh tokens in `localStorage`/`sessionStorage` on the frontend | Vulnerable to XSS token theft — any injected script can read and exfiltrate the token | httpOnly, `Secure`, `SameSite=Strict`/`Lax` cookie for the refresh token; access token can live in memory (not persisted) on the client |
| Same secret/signing key for access and refresh JWTs | A leaked access-token secret would also let an attacker forge refresh tokens (and vice versa); also makes independent revocation/rotation harder | Two distinct secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`), ideally two distinct TTLs (short access, longer refresh) |
| Long-lived access tokens (days/weeks) "for convenience" | A stolen access token stays valid for its full lifetime with no revocation mechanism (JWTs aren't checked against a DB by design) | Short access TTL (15min–1hr) + refresh rotation; only the refresh token touches the DB and can be revoked |
| GraphQL tooling (`@nestjs/graphql`, `apollo-server`, `@apollo/client`) | Explicitly out of scope per confirmed decisions (REST + Swagger, TanStack Query not Apollo) | `@nestjs/swagger` + REST controllers, `@tanstack/react-query` + `openapi-fetch` |
| Hand-written duplicate TypeScript interfaces mirroring Prisma models or API responses in `apps/web`/`apps/platform-admin` | Drifts silently from the real DB schema / API contract the moment either changes; defeats the entire point of the shared-package decision | Import generated Prisma types from `packages/db`; import generated OpenAPI types from the `openapi-typescript` output (either committed to a shared package or generated as a build step per consuming app) |

## Stack Patterns by Variant

**Prisma package layout (`packages/db`):**
- `packages/db/prisma/schema.prisma` — `generator client { provider = "prisma-client"; output = "../generated/prisma" }` (output is **required** in Prisma 7, not optional)
- `packages/db/prisma.config.ts` — connection URL / migration config (v7 moved this out of `schema.prisma`'s `datasource` block)
- `packages/db/src/client.ts` — instantiates `PrismaClient` with the `@prisma/adapter-pg` driver adapter, memoized as a singleton (guards against multiple instances in Nest's DI + dev hot-reload)
- `packages/db/src/index.ts` — `export { prisma } from "./client"` + `export * from "../generated/prisma"` (re-exports both the client instance and every generated model/type)
- Add `generated/` to `.gitignore` — it's a build artifact regenerated by `db:generate`, not hand-authored source
- `apps/server` depends on `"@repo/db": "workspace:*"`, wraps the shared client in a Nest-idiomatic `PrismaService extends PrismaClient implements OnModuleInit` (calls `$connect()` in `onModuleInit`, registers shutdown hooks) rather than importing the raw client everywhere via DI
- `apps/web`/`apps/platform-admin` should generally **not** import `@repo/db` directly (it's a server-only package with DB credentials in scope) — they consume the API via the OpenAPI-typed client instead. Reserve `@repo/db` for `apps/server` (and any future server-side-only tooling, e.g. seed scripts).

**If `apps/web` needs the OpenAPI types too (per the confirmed cross-app requirement):**
- Generate the `.d.ts` file once from the running (or committed) Swagger JSON into a `packages/api-types` (or `packages/api-client`) workspace package, not independently per-app — avoids two copies of the same generated types drifting if regenerated at different times
- `apps/server`'s `build` task should emit/update the OpenAPI JSON (e.g. a small script hitting `SwaggerModule.createDocument` and writing `openapi.json`) that the codegen step reads, so type generation doesn't require a running server in CI

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `@nestjs/core@^11.0.1` (installed) | `@nestjs/swagger@11.4.6`, `@nestjs/jwt@11.0.2`, `@nestjs/passport@11.0.5`, `@nestjs/config@4.0.4` | All verified as current majors aligned to the Nest 11 line — no cross-major mismatches. |
| `prisma@7.x` / `@prisma/client@7.x` | **Node.js >= 20.19.0** (20.x), or >= 22.12.0 (22.x), or >= 24.0.0 (24.x) | This repo's root `package.json` currently declares `"engines": { "node": ">=18" }` — that's **below** Prisma 7's floor and needs bumping (local dev machine already runs Node 22.20.0, so this is a manifest/CI fix, not an actual environment blocker). |
| `prisma@7.x` (`prisma-client` generator) | Requires an explicit database driver adapter (e.g. `@prisma/adapter-pg` for Postgres) | Not optional post-v6 — the Rust-free query engine needs the adapter to talk to the DB. Pick the target DB (Postgres assumed given no decision stated otherwise) before scaffolding `packages/db`. |
| `@tanstack/react-query@5.x` | React 19.2 (both `apps/web` and `apps/platform-admin` are already on `^19.2.x`) | No known compatibility issues; v5 has supported React 19 since general availability. |
| `openapi-typescript@7.x` / `openapi-fetch@0.17.x` | Any valid OpenAPI 3.x JSON/YAML document, incl. what `@nestjs/swagger`'s `DocumentBuilder` emits | Framework-agnostic — consumes the spec file, not the Nest runtime, so no direct version coupling to `@nestjs/swagger`'s version. |

## Turborepo Integration

The current root `turbo.json` has `build`/`lint`/`check-types` tasks but **no `db:generate`/Prisma-aware task** — this needs to be added, not just the new package:

```jsonc
// turbo.json — additions needed
{
  "tasks": {
    "build": {
      "dependsOn": ["^build", "^db:generate"]   // was: ["^build"]
    },
    "dev": {
      "dependsOn": ["^db:generate"],              // was: no dependsOn
      "cache": false,
      "persistent": true
    },
    "check-types": {
      "dependsOn": ["^check-types", "^db:generate"] // generated types must exist before type-checking
    },
    "db:generate": {
      "cache": false,
      "outputs": ["generated/**"]
    },
    "db:migrate": { "cache": false },
    "db:deploy": { "cache": false }
  },
  "globalEnv": ["DATABASE_URL"]
}
```

`packages/db/package.json` needs `db:generate` (`prisma generate`), `db:migrate` (`prisma migrate dev`), `db:deploy` (`prisma migrate deploy`) scripts, plus a `check-types` script (`tsc --noEmit`) so it participates in the existing `pnpm check-types` root pipeline. Any app importing `@repo/db` or a generated `packages/api-types` package must add it as a `workspace:*` dependency for Turborepo to compute the correct task graph (`^build`/`^db:generate` ordering).

## Sources

- npm registry `latest` dist-tags fetched live 2026-08-10 for: `@nestjs/core`, `@nestjs/swagger`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/config`, `passport-jwt`, `prisma`, `@prisma/client`, `argon2`, `bcrypt`, `@tanstack/react-query`, `openapi-typescript`, `openapi-fetch`, `class-validator`, `class-transformer`, `zod`, `cookie-parser`, `@types/passport-jwt` — HIGH confidence (primary registry data)
- [Prisma ORM v7.0.0 changelog](https://www.prisma.io/changelog/2025-11-19) — Rust-free default, `prisma-client` generator, required `output` path — HIGH confidence (official)
- [Upgrade to Prisma ORM v7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) and [Upgrading to Prisma 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) — driver adapter requirement, `prisma.config.ts` replacing `datasource.url`, `@prisma/client` still required — HIGH confidence (official docs)
- [Prisma + Turborepo guide](https://www.prisma.io/docs/guides/deployment/turborepo) — `turbo.json` task wiring, `packages/database` export pattern — HIGH confidence (official)
- [Prisma + pnpm workspaces guide](https://www.prisma.io/docs/guides/use-prisma-in-pnpm-workspaces) — package layout, `client.ts`/`index.ts` re-export split, custom `output` for cross-package type resolution — HIGH confidence (official)
- [Prisma system requirements / Node version issue thread](https://github.com/gitroomhq/postiz-app/issues/1079) — Node `>=20.19.0` floor for Prisma 7 — MEDIUM confidence (community-reported, cross-checked against multiple search results agreeing on the same figures)
- NestJS JWT refresh-token rotation guidance (multiple 2026-dated sources: `blog.iamstarcode.com`, `etdevhub.com`, `elvisduru.com`, `samuelrods.com`) — short access TTL, rotate-on-use refresh, hash refresh tokens at rest, httpOnly cookie delivery — MEDIUM confidence (community best-practice consensus, consistent across independent sources, no single authoritative spec)
- OWASP-aligned password hashing guidance (`onlinehashcrack.com`, `shattered.io`, multiple 2026 comparison posts) — Argon2id as current default recommendation over bcrypt — MEDIUM-HIGH confidence (traces to OWASP Password Storage Cheat Sheet consensus, cross-checked across sources)
- [openapi-fetch docs](https://openapi-ts.dev/openapi-fetch/) and [openapi-react-query docs](https://openapi-ts.dev/openapi-react-query/) — typed client pattern from an OpenAPI spec, TanStack Query wrapper option — HIGH confidence (official project docs)
- Repo inspection: `/Users/artemdanko/Developer/denta-bot/turbo.json`, `/Users/artemdanko/Developer/denta-bot/apps/server/package.json`, `/Users/artemdanko/Developer/denta-bot/package.json`, `/Users/artemdanko/Developer/denta-bot/pnpm-workspace.yaml`, `/Users/artemdanko/Developer/denta-bot/apps/platform-admin/package.json` — direct read, ground truth for current-state gaps (no `db:generate` task, Node engine floor too low, no existing Prisma/auth packages)

---
*Stack research for: NestJS + Prisma REST API (platform-admin backend), v1.1 milestone*
*Researched: 2026-08-10*
