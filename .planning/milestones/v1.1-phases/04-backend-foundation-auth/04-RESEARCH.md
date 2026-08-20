# Phase 4: Backend Foundation & Auth - Research

**Researched:** 2026-08-10
**Domain:** NestJS + Prisma 7 REST backend, PlatformAdmin JWT auth (access+refresh, rotation, reuse detection, revocation), monorepo wiring
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Local DB / Environment Setup**
- D-01: Local dev Postgres runs via Docker Compose, Postgres 17.
- D-02: `docker-compose.yml` lives at the monorepo root (not scoped inside `packages/db`) — `docker compose up` works from anywhere.
- D-03: Simple committed dev defaults: `postgres`/`postgres`, db name `denta_bot_dev`, in `docker-compose.yml` + a matching `.env.example` with `DATABASE_URL`. Local-only, no security reason to complicate.
- D-04: Compose file has just the Postgres service — no pgAdmin. Prisma Studio covers DB browsing.

**Auth Token Transport & Domain Topology**
- D-05: Production topology assumed shared parent domain with subdomains (`dentabot.com`/`admin.dentabot.com`/`api.dentabot.com`) but no hosting/domain decision exists yet. Reversibility: reversible. Design the refresh cookie's `Domain` attribute as an env var, not hardcoded.
- D-06: Access token held in memory only on the frontend (never `localStorage`/`sessionStorage`); refresh token delivered as httpOnly, Secure cookie. Reversibility: costly — this is core session-security architecture.
- D-07: Access token TTL: 15 minutes. Refresh token TTL: 7 days.
- D-08: CORS allowlist covers both `apps/web`'s dev origin (`:3000`) and `apps/platform-admin`'s dev origin from day one in Phase 4, even though `apps/web`'s real fetch calls don't land until Phase 6.

**Prisma Schema Field Specifics**
- D-09: `Clinic.status` enum: `trial | active | suspended | cancelled`.
- D-10: `Clinic.plan` is an independent string/enum field, NOT a foreign key to `PricingPlan`. Reversibility: costly.
- D-11: Clinic stubbed bot-usage fields: `messageCount` (int, default 0), `bookingsCount` (int, default 0), `lastActiveAt` (nullable datetime).
- D-12: `BlogPost` mirrors `apps/web/modules/blog/_data.ts`'s `Post` type: `slug`, `title`, `excerpt`, `category` (string), `date`, `readTime`, `image` (url string), `body` (JSON — `PostBodyBlock[]` union: paragraph/heading/list/quote). Adds `published: boolean`.
- D-13: `PricingPlan` mirrors `apps/web/modules/prices/pricing-cards.tsx`'s plan shape: `name`, `monthlyPrice`, `yearlyPrice` (display-ready strings, not cents), `description`, `features` (string array), `isPopular` (bool). Adds `sortOrder` (int) and `published` (bool).
- D-14: `Lead.source` enum: `contacts | demo`. `Lead.status` enum: `new | contacted | converted`.

**Bootstrapping the First PlatformAdmin**
- D-15: First `PlatformAdmin` created via a Prisma seed script in `packages/db` reading `PLATFORM_ADMIN_EMAIL`/`PLATFORM_ADMIN_PASSWORD` env vars, upserting one record with an argon2 hash. Re-runnable, no plaintext password committed.
- D-16: No create-admin / self-service invite endpoint in Phase 4 or anywhere in v1.1. Additional staff accounts added via seed script or direct DB insert.

### Claude's Discretion
- Exact Prisma field types/nullability beyond what's specified above, index choices, and migration naming.
- `packages/db` internal structure (schema file layout, generated-client `output` path) follows this research's recommendation unless a concrete blocker surfaces.

### Deferred Ideas (OUT OF SCOPE)
- Rate limiting / spam protection on the public `POST /leads` endpoint — that endpoint doesn't exist until Phase 5/6.
- Create-admin / self-service PlatformAdmin invite flow — no requirement anywhere in v1.1.
- Role tiers / RBAC — explicitly out of scope per REQUIREMENTS.md.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Prisma schema + migrations are the single source of DB schema truth, version-controlled (no manual DB edits) | See "Prisma 7 + Turborepo Monorepo Wiring" and "Migration Discipline" pitfall — `packages/db` owns `prisma/schema.prisma`, `prisma migrate dev` locally, `prisma migrate deploy` in CI/prod, never `db push` outside prototyping |
| INFRA-02 | Generated Prisma types/client are consumable from `apps/server`, `apps/web`, and `apps/platform-admin` via a shared `packages/` package | See "Package Structure" — `packages/db` (`@repo/db`) is a valid workspace package other packages can add as a `workspace:*` dependency; Phase 4 only needs `apps/server` to actually import it (frontends stay structurally capable, not wired — see Open Questions) |
| INFRA-03 | `apps/server` exposes a REST API documented via Swagger/OpenAPI | See "NestJS Swagger Setup" — `@nestjs/swagger` `DocumentBuilder`+`SwaggerModule`, DTOs double as both validation and doc source |
| AUTH-01 | PlatformAdmin can log in with email + password and receive an access token + refresh token | See "Auth Module Architecture" and "Login Flow" |
| AUTH-02 | PlatformAdmin's session persists via refresh-token rotation (with reuse detection) without re-entering credentials | See "Refresh Token Rotation & Reuse Detection" — the phase's highest-risk logic |
| AUTH-03 | PlatformAdmin can log out, invalidating the refresh token server-side | See "Logout Flow" |
| AUTH-04 | Unauthenticated requests to protected endpoints are rejected | See "Access Token Guard" — global or route-level `AuthGuard('jwt-access')`, returns 401 |
</phase_requirements>

## Summary

This phase takes `apps/server` from an untouched NestJS scaffold to a real Postgres-backed REST API with documented endpoints and a from-scratch JWT auth system. The two hardest parts — flagged for deep research by the milestone-level SUMMARY.md — are (1) Prisma 7's monorepo wiring, which changed materially from Prisma 6 (mandatory `prisma.config.ts`, mandatory driver adapters, mandatory custom `output` path, `prisma generate` no longer runs implicitly), and (2) refresh-token rotation with reuse detection, which has no single canonical NestJS-official pattern and must be built from first principles using a `familyId`+hashed-token-row database design.

The recommended shape: a new `packages/db` (`@repo/db`) workspace package owns `schema.prisma`, migrations, and a custom-output generated client, wired into Turborepo via an explicit `db:generate` task. `apps/server` gains a `PrismaModule`/`PrismaService` (driver-adapter-based, per Prisma 7's new client constructor shape) and an `AuthModule` with two `passport-jwt` strategies (access token from `Authorization: Bearer`, refresh token from an httpOnly cookie), a `RefreshToken` table tracking hashed tokens grouped by `familyId` for reuse detection, and `argon2id` password hashing. `@nestjs/swagger` + `class-validator` DTOs drive both request validation and the browsable OpenAPI doc from the same class definitions.

**Primary recommendation:** Build `packages/db` and the Turborepo `db:generate` wiring first and verify it against a clean `pnpm install` before writing a single line of `AuthModule` code — Prisma 7's generated-client invisibility to Turborepo's task graph is a documented, easy-to-miss failure mode, and every other task in this phase depends on the generated client resolving correctly.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Postgres schema, migrations, generated Prisma client | Database/Storage (`packages/db`) | — | Prisma's own architecture — schema is the single source of truth, client generation is a build step tied to the schema package, not the consuming app |
| Local dev Postgres instance | Database/Storage (Docker Compose, root) | — | D-01/D-02: infrastructure, not application code; lives at repo root so any app can `docker compose up` |
| REST endpoints, request validation, business logic | API/Backend (`apps/server`) | — | Standard NestJS controller→service pattern; owns all HTTP concerns |
| Swagger/OpenAPI doc generation | API/Backend (`apps/server`) | — | `@nestjs/swagger` decorates the same DTOs used for validation — doc generation is a build-time reflection of backend code, not a separate artifact |
| JWT access+refresh issuance, rotation, reuse detection, revocation | API/Backend (`apps/server` `AuthModule`) | Database/Storage (`RefreshToken` table) | Token lifecycle logic is backend business logic; persistence of the rotation state (hashed tokens, family) is a storage concern the backend owns exclusively |
| Access token storage at runtime | Browser/Client (future frontend, deferred) | — | D-06: memory-only on frontend — out of scope for Phase 4 itself (no `apps/platform-admin` UI yet) but the backend's token TTL/shape must anticipate it |
| Refresh token storage at runtime | Browser/Client (httpOnly cookie, deferred wiring) | API/Backend (cookie issuance) | Cookie is set by the backend (`Set-Cookie` on login/refresh) but held by the browser; Phase 4 only needs to prove the backend sets/reads it correctly via Swagger/curl, not a real frontend consuming it |
| CORS origin enforcement | API/Backend (`apps/server` `main.ts`) | — | Server-side allowlist is the only enforcement point; no CDN/edge layer exists in this stack |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `prisma` | 7.9.1 | Prisma CLI (schema, migrations, `prisma generate`) | Already the project's chosen ORM per PROJECT.md/SUMMARY.md; v7 is current `latest` on npm `[VERIFIED: npm registry — npm view prisma version]` |
| `@prisma/client` | 7.9.1 | Runtime client (imported via `packages/db`'s generated output) | Companion package to `prisma`, same version required `[VERIFIED: npm registry]` |
| `@prisma/adapter-pg` | 7.9.1 | Postgres driver adapter — **mandatory** in Prisma 7, no longer optional | Prisma 7 removed the bundled Rust query engine; every datasource requires an explicit driver adapter `[CITED: prisma.io/docs/guides/upgrade-prisma-orm/v7]` |
| `pg` | 8.23.0 | Underlying Postgres driver `@prisma/adapter-pg` wraps | Peer dependency of `@prisma/adapter-pg` `[CITED: prisma.io/docs/guides/upgrade-prisma-orm/v7]` |
| `@nestjs/jwt` | 11.0.2 | JWT sign/verify service, DI-friendly wrapper around `jsonwebtoken` | Official Nest package, matches `apps/server`'s existing `@nestjs/*` v11 line `[VERIFIED: npm registry]` |
| `@nestjs/passport` | 11.0.5 | Passport integration for NestJS guards/strategies | Official Nest package `[VERIFIED: npm registry]` |
| `passport-jwt` | 4.0.1 | Passport strategy for extracting/verifying JWTs (header or custom extractor) | Long-standing standard passport strategy for JWT auth `[VERIFIED: npm registry]` |
| `passport` | 0.7.0 | Peer dependency of `@nestjs/passport`/`passport-jwt` | Required peer `[VERIFIED: npm registry]` |
| `argon2` | 0.45.1 | Password hashing for `PlatformAdmin` | OWASP's current #1-ranked password-storage algorithm `[CITED: cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html]`; package name itself is `[ASSUMED]` per provenance rule (recalled from training/web, not named by an authoritative doc this session) — registry existence confirmed `[VERIFIED: npm registry]` but package-legitimacy check flagged `SUS` (see Package Legitimacy Audit) |
| `@nestjs/swagger` | 11.4.6 | OpenAPI doc generation from decorated DTOs/controllers | Official Nest package, standard for `INFRA-03` `[VERIFIED: npm registry]` |
| `class-validator` | 0.15.1 | Decorator-based DTO validation, paired with `@nestjs/swagger` | Standard NestJS validation library, referenced directly by official Prisma+NestJS integration guidance `[VERIFIED: npm registry]` |
| `class-transformer` | 0.5.1 | Plain-object↔class transformation backing `ValidationPipe({ transform: true })` | Companion to `class-validator`, required by NestJS's `ValidationPipe` `[VERIFIED: npm registry]` |
| `cookie-parser` | 1.4.7 | Express middleware to parse `req.cookies` (reads the httpOnly refresh cookie) | Standard Express middleware, NestJS's documented cookie-handling dependency `[VERIFIED: npm registry]` |
| `@types/cookie-parser` | 1.4.10 | Type defs for `cookie-parser` | Dev dependency, matches `[VERIFIED: npm registry]` |
| `@types/passport-jwt` | 4.0.1 | Type defs for `passport-jwt` | Dev dependency `[VERIFIED: npm registry]` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nestjs/config` | 4.0.4 | Typed env-var loading (`ConfigModule.forRoot`) | Use to centralize `DATABASE_URL`, JWT secrets, cookie domain, CORS origins — pair with `zod` for schema validation (project already uses `zod` per `apps/web`'s form conventions and SUMMARY.md's stack recommendation) `[VERIFIED: npm registry]` |
| `zod` | (already in monorepo via `apps/web`) | Env-var schema validation for `ConfigModule.forRoot({ validate })` | Matches existing project convention rather than introducing `joi` |
| `@nestjs/throttler` | 6.5.0 | Rate limiting | NOT needed this phase (deferred per CONTEXT.md — no public write endpoint exists until Phase 5/6); listed here only so the planner doesn't need to re-research it later `[VERIFIED: npm registry]` |
| `dotenv-cli` | — | Explicitly point Prisma CLI commands (run from `packages/db`) at the root `.env` | See "Root .env Wiring Gotcha" pitfall — `packages/db`'s `db:generate`/`db:migrate` scripts need `DATABASE_URL` from the root `.env`, not a local one |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `argon2` | `bcrypt` | OWASP now ranks bcrypt below argon2id/scrypt, "legacy systems only" — no legacy bcrypt data exists here, so no reason to choose it `[CITED: OWASP Password Storage Cheat Sheet]` |
| `passport-jwt` two-strategy pattern | Hand-rolled JWT middleware | Passport's guard/strategy DI integration is the Nest-idiomatic approach and avoids re-implementing token extraction/error handling |
| Custom refresh-token-family schema | A JWT-only refresh token with no DB row (fully stateless) | Fully stateless refresh tokens cannot be revoked server-side before expiry — directly violates AUTH-03 (logout must invalidate server-side) and AUTH-02's reuse-detection requirement, which needs a way to know a token was already consumed |
| `@nestjs/config` + `zod` | `joi` (NestJS docs' example validator) | Project already standardizes on `zod` (`apps/web` forms) — no reason to add a second schema library |

**Installation** (run from repo root; `packages/db` is a new workspace member):
```bash
# packages/db
pnpm --filter @repo/db add @prisma/client @prisma/adapter-pg pg
pnpm --filter @repo/db add -D prisma dotenv-cli @types/pg tsx

# apps/server
pnpm --filter server add @nestjs/jwt @nestjs/passport passport-jwt passport argon2 \
  @nestjs/swagger class-validator class-transformer cookie-parser @nestjs/config zod
pnpm --filter server add -D @types/passport-jwt @types/cookie-parser
```

**Version verification:** All versions above were confirmed live via `npm view <pkg> version` on 2026-08-10 (see per-package `[VERIFIED: npm registry]` tags). Training-data versions were not used directly.

## Package Legitimacy Audit

| Package | Registry | Age (latest publish) | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|----------------------|--------------|--------------|---------|-------------|
| `prisma` | npm | 2026-07-27 (14 days old at research time) | 16,009,816 | github.com/prisma/prisma | SUS (`too-new`) | **Keep** — false-positive: 16M weekly downloads, official Prisma org repo, this is a routine version bump of a package that's been the project's chosen ORM since PROJECT.md's earlier milestone, not a new/unknown package. Planner should still add a `checkpoint:human-verify` before first install per protocol. |
| `@prisma/client` | npm | 2026-07-27 | 15,046,090 | github.com/prisma/prisma | SUS (`too-new`) | **Keep** — same reasoning as `prisma` (companion package, same release train). `checkpoint:human-verify` before install. |
| `@prisma/adapter-pg` | npm | 2026-07-27 | 4,660,882 | github.com/prisma/prisma | SUS (`too-new`) | **Keep** — official Prisma monorepo package, mandatory per Prisma 7's driver-adapter requirement. `checkpoint:human-verify` before install. |
| `pg` | npm | 2026-08-08 (2 days old) | 43,701,187 | github.com/brianc/node-postgres | SUS (`too-new`) | **Keep** — the single most-downloaded Postgres driver in the npm ecosystem (43.7M/wk), long-standing maintainer; recent publish is a routine patch release. `checkpoint:human-verify` before install. |
| `argon2` | npm | 2026-07-21 | 1,921,935 | github.com/ranisalt/node-argon2 | SUS (`too-new`) | **Keep** — established package (1.9M/wk downloads), OWASP-recommended algorithm; package name is `[ASSUMED]` per provenance rule (not discovered via an authoritative doc this session). `checkpoint:human-verify` before install; verify it's `ranisalt/node-argon2` (the standard Node argon2 binding) and not a similarly-named typosquat. |
| `@nestjs/swagger` | npm | 2026-07-17 | 7,359,731 | github.com/nestjs/swagger | SUS (`too-new`) | **Keep** — official `nestjs` org package, 7.3M/wk downloads. `checkpoint:human-verify` before install. |
| `@nestjs/jwt` | npm | 2025-12-05 | 4,507,006 | github.com/nestjs/jwt | OK | Approved |
| `@nestjs/passport` | npm | 2025-01-23 | 4,210,657 | github.com/nestjs/passport | OK | Approved |
| `passport-jwt` | npm | 2022-12-24 | 4,056,454 | github.com/mikenicholson/passport-jwt | OK | Approved |
| `passport` | npm | 2023-11-27 | 7,930,603 | github.com/jaredhanson/passport | OK | Approved |
| `class-validator` | npm | 2026-02-26 | 11,085,986 | github.com/typestack/class-validator | OK | Approved |
| `class-transformer` | npm | 2021-11-22 | 11,998,815 | github.com/typestack/class-transformer | OK | Approved |
| `cookie-parser` | npm | 2024-10-08 | 10,963,712 | github.com/expressjs/cookie-parser | OK | Approved |
| `@nestjs/config` | npm | 2026-04-09 | 8,201,017 | github.com/nestjs/config | OK | Approved |
| `@nestjs/throttler` | npm | 2025-12-02 | 3,596,335 | github.com/nestjs/throttler | OK | Approved (not installed this phase — reference only) |

**Packages removed due to `[SLOP]` verdict:** none.

**Packages flagged as suspicious `[SUS]`:** `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `argon2`, `@nestjs/swagger` — all six are false positives caused by the legitimacy checker's "too-new" heuristic reacting to a *recent version publish date*, not package age or trustworthiness (all have multi-million weekly downloads and long-standing official/well-known source repos, cross-checked above). The planner must still insert a `checkpoint:human-verify` task immediately before each `pnpm add` per protocol — treat it as a fast rubber-stamp given the evidence in this table, not a deep investigation.

*`argon2`'s package name was recalled from training/web knowledge, not an authoritative doc — tagged `[ASSUMED]`. All other SUS/OK packages in this table were named directly by official documentation (Prisma upgrade guide, NestJS registry lookups) — tagged `[CITED]`/`[VERIFIED: npm registry]` as noted in the Standard Stack table.*

## Architecture Patterns

### System Architecture Diagram

```
                     ┌─────────────────────────────┐
                     │   Swagger UI / curl client   │
                     │  (this phase's verification   │
                     │   surface — no real UI yet)   │
                     └───────────────┬──────────────┘
                                     │ HTTP (CORS allowlist:
                                     │ :3000 web dev, platform-admin dev)
                                     ▼
                     ┌─────────────────────────────────────┐
                     │           apps/server (NestJS)        │
                     │                                        │
                     │  main.ts: cookie-parser, CORS,         │
                     │  global ValidationPipe, Swagger setup  │
                     │                                        │
                     │  ┌──────────────┐   ┌────────────────┐│
POST /auth/login ───▶│  │  AuthModule  │──▶│ PlatformAdmin  ││
                     │  │              │   │ lookup + argon2 ││
POST /auth/refresh──▶│  │ - login()    │   │ verify          ││
                     │  │ - refresh()  │   └────────┬───────┘│
POST /auth/logout ──▶│  │ - logout()   │            │        │
                     │  │              │   ┌────────▼───────┐│
                     │  │ passport-jwt │   │  RefreshToken  ││
                     │  │ 2 strategies:│──▶│  table: hash,  ││
                     │  │ access(hdr)  │   │  familyId,     ││
                     │  │ refresh(cook)│   │  revokedAt     ││
                     │  └──────────────┘   └────────┬───────┘│
                     │                               │        │
                     │  ┌──────────────────────┐    │        │
Any protected  ─────▶│  │ AccessTokenGuard      │    │        │
GET/POST/etc.        │  │ (401 if missing/bad)  │    │        │
                     │  └──────────────────────┘    │        │
                     │                               │        │
                     │            PrismaService ◀────┘        │
                     └───────────────┬───────────────────────┘
                                     │ @prisma/adapter-pg
                                     ▼
                     ┌─────────────────────────────┐
                     │  Postgres 17 (Docker Compose) │
                     │  denta_bot_dev                │
                     └─────────────────────────────┘

Build-time (not runtime):
  packages/db/prisma/schema.prisma
        │  prisma generate (turbo db:generate task)
        ▼
  packages/db/generated/prisma/*  ──imported via──▶  @repo/db (workspace:*)
                                                              │
                                                    apps/server only (Phase 4)
                                                    apps/web / apps/platform-admin
                                                    structurally able to import
                                                    later, but stay behind REST
                                                    boundary per architecture
                                                    recommendation (see Open Q's)
```

### Recommended Project Structure

```
packages/db/                          # @repo/db workspace package
├── package.json                      # "type" left as CommonJS (see ESM pitfall below)
├── prisma.config.ts                  # NEW in Prisma 7 — schema/migrations/datasource config
├── prisma/
│   ├── schema.prisma                 # generator output = "../generated/prisma"
│   ├── migrations/                   # committed migration history (INFRA-01)
│   └── seed.ts                       # D-15: upserts first PlatformAdmin from env vars
├── generated/prisma/                 # gitignored — prisma generate output
└── src/
    ├── client.ts                     # PrismaService-independent raw export (see below)
    └── index.ts                      # re-exports generated types + client factory

apps/server/src/
├── main.ts                           # cookie-parser, CORS, ValidationPipe, Swagger bootstrap
├── app.module.ts                     # imports PrismaModule, AuthModule (+ ConfigModule)
├── prisma/
│   ├── prisma.module.ts              # @Global() — provides/exports PrismaService
│   └── prisma.service.ts             # extends PrismaClient from @repo/db, adapter in super()
└── auth/
    ├── auth.module.ts
    ├── auth.controller.ts            # POST /auth/login, /auth/refresh, /auth/logout
    ├── auth.service.ts               # login/refresh/logout business logic, token issuance
    ├── dto/
    │   ├── login.dto.ts              # email + password, class-validator decorated
    │   └── auth-response.dto.ts      # explicit DTO — never re-export PlatformAdmin model raw
    ├── strategies/
    │   ├── access-token.strategy.ts  # passport-jwt, ExtractJwt.fromAuthHeaderAsBearerToken()
    │   └── refresh-token.strategy.ts # passport-jwt, custom extractor reading req.cookies
    ├── guards/
    │   ├── access-token.guard.ts     # AuthGuard('jwt-access')
    │   └── refresh-token.guard.ts    # AuthGuard('jwt-refresh')
    └── decorators/
        └── current-user.decorator.ts # @CurrentUser() param decorator reading req.user
```

### Pattern 1: Prisma 7 PrismaService with Driver Adapter

**What:** `PrismaService` extends `PrismaClient` from `@repo/db`'s generated output, passing a `@prisma/adapter-pg` instance to `super()`. This replaces Prisma 6's implicit Rust-engine connection.
**When to use:** Always in Prisma 7 — the driver adapter is mandatory, not a preview feature.
**Example:**
```typescript
// Source: prisma.io/nestjs (official Prisma+NestJS integration guide) [CITED]
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@repo/db';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Pattern 2: Two-Strategy passport-jwt (Access Header + Refresh Cookie)

**What:** Two separate `passport-jwt` `Strategy` instances registered under different names (`'jwt-access'`, `'jwt-refresh'`), each with its own secret and extractor.
**When to use:** Standard shape for access/refresh JWT auth in NestJS — access token read from `Authorization: Bearer`, refresh token read from the httpOnly cookie (never the body, per D-06).
**Example:**
```typescript
// Source: passport-jwt README + NestJS passport-strategy conventions (community-consistent pattern) [ASSUMED — synthesized, verify Strategy import shape against installed passport-jwt@4.0.1 types during implementation]
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }
  async validate(payload: { sub: string; email: string }) {
    return payload; // attached to req.user
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['refresh_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: { sub: string; familyId: string; jti: string }) {
    return { ...payload, rawToken: req.cookies['refresh_token'] };
  }
}
```

### Pattern 3: Refresh Token Rotation with Reuse Detection

**What:** Every issued refresh token is a signed JWT carrying `{ sub, familyId, jti }`; a matching DB row stores a hash of the token (never raw) keyed by `jti`, plus `familyId`, `revokedAt`, `expiresAt`. On refresh: verify JWT signature/expiry (via `RefreshTokenStrategy`), then look up the DB row by `jti`. If found and not revoked → this is the correct next-in-chain use: mark revoked, issue a new token pair with the **same** `familyId` and a new `jti`. If not found, already revoked, or the token otherwise fails the DB check → **reuse detected**: revoke every row sharing that `familyId` (kills the whole session lineage), reject the request.
**When to use:** This is the core mechanism for AUTH-02 — do not ship a JWT-only stateless refresh token; it cannot satisfy AUTH-03 (server-side logout revocation) or reuse detection.
**Example:**
```typescript
// Source: synthesized from Prisma-backed reuse-detection pattern (dev.to/alvaromrveiga)
// and hash-storage guidance cross-checked against OWASP/community consensus (SUMMARY.md pitfall #2) [ASSUMED — synthesis, not a single verbatim official source]
async function refresh(rawToken: string) {
  const payload = this.jwtService.verify(rawToken, { secret: refreshSecret }); // throws on bad sig/expiry
  const tokenHash = hashToken(rawToken); // e.g. sha256 — refresh tokens are high-entropy, sha256 is sufficient (not argon2, which is for low-entropy passwords)

  const row = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });

  if (!row || row.revokedAt || row.tokenHash !== tokenHash) {
    // Reuse detected (or tampering) — nuke the whole family
    await this.prisma.refreshToken.updateMany({
      where: { familyId: payload.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new UnauthorizedException('Refresh token reuse detected');
  }

  await this.prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  return this.issueTokenPair(payload.sub, payload.familyId); // new jti, same familyId
}
```

### Pattern 4: NestJS Swagger Setup Driven by the Same DTOs as Validation

**What:** `DocumentBuilder` + `SwaggerModule.setup()` in `main.ts`; DTOs decorated with both `class-validator` (`@IsEmail()`, `@MinLength()`) and `@nestjs/swagger` (`@ApiProperty()`) generate accurate docs without a second definition.
**When to use:** Always — this is INFRA-03's implementation.
**Example:**
```typescript
// Source: web-search-verified community pattern, matches official @nestjs/swagger usage shape [CITED — verified against multiple independent sources converging on identical API]
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('denta-bot Platform API')
  .setDescription('PlatformAdmin backend — auth, clinics, leads, content')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: { persistAuthorization: true },
});
```

### Anti-Patterns to Avoid

- **Stateless refresh tokens with no DB row:** Cannot be revoked before expiry — directly breaks AUTH-03. Every refresh token must have a corresponding, killable DB record.
- **Storing raw refresh tokens in the DB:** Store a hash (e.g. SHA-256 of the token string), not the plaintext token — a DB read/backup leak should not hand out live sessions.
- **`prisma db push` in this phase:** Use `prisma migrate dev` locally and commit the migration; `db push` doesn't produce a migration history and directly violates INFRA-01's "version-controlled" requirement.
- **Re-exporting the raw `PlatformAdmin` Prisma model as an API response:** It contains `passwordHash`. Always map to an explicit response DTO (`{ id, email, createdAt }`) before returning from any controller.
- **`origin: '*'` with `credentials: true` in CORS config:** Browsers reject this combination outright, and even if they didn't it would defeat the point of an allowlist — origin must be an explicit array (D-08).
- **Forcing a full-repo ESM migration to satisfy Prisma 7:** Prisma 7's generator supports `moduleFormat = "cjs"` — use it. `apps/server`'s `tsconfig.json` currently has no `"type": "module"` in its `package.json`; a wholesale ESM conversion is out of this phase's scope and would balloon the blast radius unnecessarily.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| JWT signing/verification | Custom `jsonwebtoken` wrapper | `@nestjs/jwt` | DI-integrated, handles secret/expiry config centrally, standard Nest pattern |
| Password hashing | Custom PBKDF2/salt implementation | `argon2` (argon2id mode, library defaults) | OWASP's top-ranked algorithm; the `argon2` npm package handles salting/timing-safe comparison correctly — hand-rolled crypto is the single most common source of auth vulnerabilities |
| Request validation | Manual `if (!body.email) throw ...` checks | `class-validator` decorators + global `ValidationPipe` | Centralizes validation, doubles as Swagger doc source, consistent error shape |
| API documentation | Hand-written OpenAPI YAML/JSON | `@nestjs/swagger` generated from decorated DTOs | Docs cannot drift from the real DTO shape if they're generated from it |
| Cookie parsing | Manual `Cookie` header string parsing | `cookie-parser` middleware | Handles encoding/edge cases (multiple cookies, `;` in values) correctly |
| Env var validation | Manual `process.env.X ?? throw` scattered across files | `@nestjs/config` + `zod` schema in `ConfigModule.forRoot({ validate })` | Fails fast at boot with a clear error instead of a runtime `undefined` deep in request handling |

**Key insight:** This phase's entire risk surface is auth-adjacent security logic (SUMMARY.md's own framing). Every item in this table is a place where a hand-rolled version looks like it works in manual testing but has a subtle gap (timing attacks, missing salt, cookie-parsing edge cases) that only surfaces under adversarial conditions — exactly the failure mode this phase must not ship.

## Common Pitfalls

### Pitfall 1: Prisma Client Generation Invisible to Turborepo's Task Graph
**What goes wrong:** A teammate (or CI) runs `pnpm install` on a clean clone, then `pnpm dev`/`pnpm build` — and `apps/server` fails to start because `@repo/db`'s generated client doesn't exist yet. `prisma generate` never ran.
**Why it happens:** Turborepo only tracks tasks it knows about. If `db:generate` isn't declared in `turbo.json` as a `dependsOn` of `build`/`dev`/`check-types`, Turborepo has no way to know the generated client is a prerequisite.
**How to avoid:** Add an explicit `db:generate` task (`"cache": false` — codegen output shouldn't be cache-keyed the same way source is) to `turbo.json`, and wire it as `dependsOn: ["^db:generate"]` for `dev`/`check-types` and `dependsOn: ["^build", "^db:generate"]` for `build` `[CITED: prisma.io/docs/guides/turborepo]`.
**Warning signs:** `Cannot find module '@repo/db'` or `Module has no exported member 'PrismaClient'` errors on a fresh clone that don't reproduce on the original developer's already-generated machine.

### Pitfall 2: Root `.env` Not Visible to `packages/db`'s Prisma CLI Commands
**What goes wrong:** D-03 puts `.env`/`.env.example` at the monorepo root (matching `docker-compose.yml`'s location), but `prisma generate`/`migrate dev` run with cwd = `packages/db` (via `pnpm --filter @repo/db run db:migrate`). Node's/dotenv's default `.env` lookup is relative to cwd, so `DATABASE_URL` resolves to `undefined`.
**Why it happens:** `prisma.config.ts`'s `import "dotenv/config"` loads `.env` from the current working directory by default, not the monorepo root — a subtlety that's easy to miss when D-02/D-03 explicitly chose the root location for `docker-compose.yml` convenience.
**How to avoid:** Either (a) point `dotenv/config` at the root path explicitly in `prisma.config.ts` (`import { config } from 'dotenv'; config({ path: '../../.env' })`), or (b) prefix `packages/db`'s `db:generate`/`db:migrate` scripts with `dotenv-cli` pointed at the root file (`"db:migrate": "dotenv -e ../../.env -- prisma migrate dev"`). Verify by running the script from a totally clean shell with no exported `DATABASE_URL`.
**Warning signs:** `Environment variable not found: DATABASE_URL` errors from the Prisma CLI specifically (as opposed to from `apps/server`'s own `@nestjs/config`, which is a separate load path and needs its own `envFilePath` pointed at the root).

### Pitfall 3: Refresh Tokens Without Rotation/Reuse-Detection Are a Permanent Backdoor
**What goes wrong:** A simpler-looking implementation issues a refresh token once at login and just re-verifies the same token on every `/auth/refresh` call for 7 days, with no rotation. If that token ever leaks (XSS, log capture, browser history on a shared machine), the attacker has a working session for up to 7 days with no way for the legitimate user to detect or stop it — even changing their password wouldn't necessarily revoke it unless that's separately wired.
**Why it happens:** Rotation-with-reuse-detection is meaningfully more code than "verify the same token repeatedly," so it's the corner most likely to get cut under time pressure — but AUTH-02's requirement text ("rotation... with reuse detection") makes this non-optional, not a nice-to-have.
**How to avoid:** Build Pattern 3 above from day one of `AuthModule` work. Explicitly test the reuse scenario: capture a refresh token, use it once (succeeds, rotates), then replay the *original* (now-stale) token — confirm the whole family is revoked and even the legitimately-rotated newest token now fails.
**Warning signs:** A `RefreshToken` schema/table that has no `familyId` or `revokedAt` column, or an `auth.service.ts` `refresh()` method that only calls `jwtService.verify()` with no DB lookup at all.

### Pitfall 4: CORS Configured for Only One Frontend Origin
**What goes wrong:** `apps/platform-admin` (Vite dev server) works fine in manual testing because it's the frontend actively being developed against, but the CORS allowlist quietly only has that one origin — `apps/web`'s dev origin (`:3000`) gets silently rejected months later in Phase 6 when someone finally wires up the Contacts/Demo forms.
**Why it happens:** It's easy to test against whichever frontend is currently in front of you and forget the other one entirely exists, especially across a phase boundary (Phase 4 vs. Phase 6, months apart in planning terms).
**How to avoid:** D-08 already locks this — build the allowlist as an array covering both dev origins from day one, driven by an env var so prod origins can be added later without a code change. Verify with an actual cross-origin `fetch` test from each dev origin, not just Swagger UI (which is same-origin with the API and won't surface a CORS bug).
**Warning signs:** `origin` configured as a single string instead of an array/allowlist function; only one `NEXT_PUBLIC_*`/`VITE_*` API base URL referenced anywhere in the test plan.

### Pitfall 5: Prisma 7's `output` Path Not Gitignored, or Committed by Accident
**What goes wrong:** The generated client (`packages/db/generated/prisma/`) is a build artifact that can be tens of MB of generated TypeScript/WASM. If it's not gitignored, it either bloats the repo or — worse — a stale committed version silently overrides fresh `prisma generate` output in CI if the generate step is skipped.
**Why it happens:** Prisma 7 made the custom `output` path mandatory specifically so developers have visibility into it, which makes it *feel* like source code worth committing — it isn't.
**How to avoid:** Add `packages/db/generated/` to `.gitignore` explicitly (it won't be covered by a generic `node_modules`-only ignore rule since it's outside `node_modules`).
**Warning signs:** `git status` showing hundreds of new files under `packages/db/generated/` after running `prisma generate` locally.

### Pitfall 6: `moduleFormat` Mismatch Breaking `apps/server`'s Existing CommonJS Build
**What goes wrong:** Prisma 7's `prisma-client` generator defaults to an ESM-first output. If left at the default, `apps/server` (currently CommonJS — no `"type": "module"` in its `package.json`, `tsconfig.json` targets `nodenext` without ESM) may fail to `import` the generated client at build/runtime, or nest's `ts-jest`/`tsc` toolchain may need reconfiguration mid-phase.
**Why it happens:** Prisma 7 is explicitly described as "ESM-first" in its own docs `[CITED: web search summary of prisma.io generator reference]`; this is a deliberate design shift from Prisma 6, not a default that happens to match most existing Node backends.
**How to avoid:** Set `moduleFormat = "cjs"` explicitly in the `packages/db` schema's `generator client` block (this option is documented and exists specifically for this scenario), keeping `apps/server` on its current CommonJS setup without a broader ESM migration this phase.
**Warning signs:** `ERR_REQUIRE_ESM` errors when `apps/server` tries to `require`/`import` `@repo/db`; `SyntaxError: Cannot use import statement outside a module`.

## Runtime State Inventory

Not applicable — this is greenfield backend work (`apps/server` is the untouched NestJS CLI scaffold, per CONTEXT.md and orchestrator-verified repo state). No rename, refactor, or migration of existing runtime state is involved.

## Code Examples

### PlatformAdmin Seed Script (D-15)
```typescript
// Source: synthesized from Prisma seed-script convention (prisma.io seeding docs pattern)
// + argon2 hashing (OWASP-cited above) [ASSUMED — synthesis, standard pattern not sourced verbatim]
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL;
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD must be set');
  }
  const passwordHash = await argon2.hash(password); // argon2id by default in the argon2 npm package

  await prisma.platformAdmin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

### Global `ValidationPipe` + Cookie/CORS Bootstrap
```typescript
// Source: multiple independent community sources converged on identical API shape [CITED — cross-verified]
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: (process.env.CORS_ALLOWED_ORIGINS ?? '').split(',').filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup — see Pattern 4

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Prisma Rust query engine, implicit `node_modules/@prisma/client` generation, `prisma-client-js` generator | Rust-free client, mandatory custom `output` path, `prisma-client` generator, mandatory driver adapters | Prisma 7 (2026) `[CITED: prisma.io/docs/guides/upgrade-prisma-orm/v7]` | Every Prisma+NestJS tutorial/guide written before this version is stale on setup mechanics — this research already accounts for v7's shape, but any additional research during implementation should be version-pinned to 7.x, not generic "Prisma NestJS" search results |
| bcrypt as default password-hashing recommendation | argon2id ranked first by OWASP | Ongoing shift, OWASP cheat sheet current as of this research | No legacy bcrypt data exists in this project, so no migration path is needed — straight to argon2id |
| Automatic `prisma generate` after `npm install`/`migrate` | Explicit `prisma generate` required every time | Prisma 7 | Must be wired into `turbo.json`'s task graph explicitly (Pitfall 1) — this is not optional developer-experience polish, it's required for the build to work at all |

**Deprecated/outdated:**
- `prisma-client-js` generator provider: removed default in v7, superseded by `prisma-client`.
- Implicit `node_modules`-based Prisma Client resolution: superseded by mandatory custom `output`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `argon2` (ranisalt/node-argon2) is the correct npm package name for Argon2 hashing in Node | Standard Stack, Package Legitimacy Audit | Low — registry-confirmed to exist, 1.9M weekly downloads, matches OWASP-recommended algorithm family; worst case is a naming/API surface surprise during implementation, not a wrong algorithm choice |
| A2 | Exact `passport-jwt` `Strategy`/`ExtractJwt` import shape shown in Pattern 2's code example matches the installed `passport-jwt@4.0.1` types | Architecture Patterns → Pattern 2 | Low-medium — this is a long-stable API (no breaking changes in years); if wrong, TypeScript will surface it immediately at compile time during implementation, not silently at runtime |
| A3 | Refresh-token rotation schema (familyId + per-token hashed row + revokedAt) as described in Pattern 3 is the right shape for this project, rather than an alternative (e.g. sliding-window single-row-per-user) | Architecture Patterns → Pattern 3, Common Pitfalls #3 | Medium — this is the single riskiest piece of the phase; if the schema shape is wrong it may require a migration to fix later, though the *behavior* (rotation + reuse detection + family revocation) is the actual AUTH-02 requirement and multiple independent sources converge on this general shape |
| A4 | `moduleFormat = "cjs"` is the correct generator option to avoid ESM migration blast radius, and is compatible with `apps/server`'s current `tsconfig.json` (`module: "nodenext"`, no `"type": "module"`) | Common Pitfalls #6 | Medium — if this option doesn't fully prevent ESM-related friction, the planner may need a Wave 0 spike task to verify `@repo/db` imports cleanly into `apps/server` before building `AuthModule` on top of it |
| A5 | SHA-256 (not argon2) is the correct hash function for refresh-token-at-rest storage, since refresh tokens are high-entropy random strings (not low-entropy user passwords) | Architecture Patterns → Pattern 3 code example | Low — this is standard cryptographic practice (argon2/bcrypt are deliberately slow for password guessing resistance; a high-entropy token doesn't need that, and using a slow hash on every refresh call would add latency), but worth a second look during implementation review |
| A6 | Root `.env` load path for `packages/db`'s Prisma CLI scripts (`dotenv-cli` pointed at `../../.env`) is the cleanest fix for Pitfall 2, rather than an alternative like symlinking or duplicating the file | Common Pitfalls #2 | Low — multiple valid fixes exist for this problem; the specific mechanism is Claude's-discretion-level detail, not a locked architectural decision |

**If this table is empty:** N/A — six assumptions listed above need no further user confirmation before planning (all are implementation-detail-level, none touch locked CONTEXT.md decisions), but planner/executor should verify A3 and A4 concretely during Wave 0 before deep AuthModule work.

## Open Questions (RESOLVED)

1. **Does INFRA-02 require `apps/web`/`apps/platform-admin` to actually import `@repo/db` in Phase 4, or just be "structurally ready" per CONTEXT.md's phrasing?** RESOLVED
   - What we know: REQUIREMENTS.md's INFRA-02 text says types are "consumable from `apps/server`, `apps/web`, and `apps/platform-admin`." CONTEXT.md's Phase 4 success criteria #2 softens this to "structurally ready... to consume later." The milestone SUMMARY.md's architecture recommendation is explicit that frontends should stay behind the REST/HTTP boundary and never import raw Prisma client types (security: would expose `passwordHash` and other sensitive fields on the `PlatformAdmin` model type).
   - What's unclear: Whether the planner should add a no-op "add `@repo/db` as a devDependency of `apps/platform-admin`" task just to prove workspace-linkability, or whether "structurally ready" is satisfied purely by `@repo/db` existing as a valid, publishable-shaped workspace package.
   - Resolution: Treat CONTEXT.md's phrasing as authoritative (it's the phase-specific refinement of the broader milestone requirement) — Phase 4 does NOT wire any frontend import of `@repo/db`. INFRA-02 is verified at the API/Swagger level only, per the phase's own stated verification approach ("success criteria are verified at the API/Swagger level"). Reflected in Plan 04-01's `must_haves`/prohibitions.

2. **`SameSite` cookie attribute value: `'lax'` or `'strict'`?** RESOLVED
   - What we know: D-05 flags production domain topology as undecided but assumed to be same-parent-domain subdomains, which browsers treat as "same-site" for `SameSite` purposes (subdomains under one registrable domain, e.g. `admin.dentabot.com` → `api.dentabot.com`, are same-site regardless of subdomain). Local dev is all `localhost` with different ports, also same-site by browser `SameSite` rules (port isn't part of "site").
   - What's unclear: Whether `'strict'` (stronger CSRF protection, but blocks the cookie on top-level cross-site navigation entirely) or `'lax'` (default-safe middle ground) is preferred. Since the refresh cookie is scoped to `path: '/auth/refresh'` and only ever sent via same-site `fetch`/XHR calls (never a top-level navigation), `'strict'` should work without UX friction and is the more conservative choice.
   - Resolution: `SameSite=strict` adopted, exposed as an env var (`REFRESH_COOKIE_SAMESITE`) alongside the `Domain` attribute (already planned per D-05) so it can be relaxed to `'lax'` if a real deployment topology later turns out to be genuinely cross-site (different top-level domains, not subdomains) — at which point `SameSite=None; Secure` would be required instead, a bigger change worth flagging if it ever comes up. Reflected in `.env.example` / Plan 04-01's action block.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Docker (daemon running) | D-01/D-02 local Postgres via Compose | ✓ | 27.3.1, daemon running | — |
| Node.js | Prisma 7 (`>=20.19.0` required) | ✓ | v22.20.0 (exceeds minimum) | — |
| pnpm | Workspace install/build | ✓ | 9.0.0 (matches root `packageManager`) | — |
| psql CLI | Optional manual DB inspection (not required — Prisma Studio covers this per D-04) | ✓ | 17.1 (Postgres.app) | Not needed; Prisma Studio (`prisma studio`) is the documented DB-browsing tool |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** none — full toolchain already present and version-compatible.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | Yes | `argon2id` password hashing (OWASP-current), no plaintext/reversible storage, credential validation on every login attempt with generic error messages (don't leak "email not found" vs "wrong password") |
| V3 Session Management | Yes | httpOnly/Secure refresh cookie (D-06), short-lived access token (15 min, D-07), server-side revocable refresh tokens with rotation+reuse detection (AUTH-02/03), no session tokens in URL or `localStorage` |
| V4 Access Control | Yes | `AccessTokenGuard` on every protected route (AUTH-04); single flat `PlatformAdmin` role this phase (no RBAC matrix per REQUIREMENTS.md's explicit deferral) |
| V5 Input Validation | Yes | `class-validator` DTOs + global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` on every endpoint |
| V6 Cryptography | Yes | `argon2` (never hand-rolled hashing); JWT signing via `@nestjs/jwt` with distinct access/refresh secrets (never the same secret for both), secrets sourced from env vars, never hardcoded |
| V7 Error Handling / Logging | Yes | Auth failures must return generic 401s (no "user not found" vs "wrong password" distinction) to avoid user enumeration; avoid logging raw tokens or passwords anywhere (including error stack traces) |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Refresh token theft via XSS (token in `localStorage`/response body) | Information Disclosure | httpOnly cookie only (D-06) — JS cannot read it even if XSS occurs elsewhere on the page |
| Refresh token replay after legitimate rotation (stolen-then-reused token) | Spoofing / Elevation of Privilege | Reuse detection + family revocation (Pattern 3) — presenting an already-rotated token kills the whole session lineage, not just that one token |
| CSRF on cookie-authenticated endpoints | Tampering | `SameSite=Strict` (see Open Question 2) + CORS allowlist (D-08) — cross-site requests can't carry the cookie or pass the origin check |
| User enumeration via differing login error messages | Information Disclosure | `auth.service.ts`'s `login()` must return the same generic "invalid credentials" error whether the email doesn't exist or the password is wrong — do not let `class-validator`'s `@IsEmail()` failures vs. a "user not found" 404 leak which case occurred |
| SQL injection | Tampering | Not applicable in the traditional sense — Prisma's generated client is parameterized by construction; the risk is instead **raw query misuse** (`$queryRawUnsafe`) — avoid it entirely this phase, no raw queries are needed for auth/CRUD |
| Sensitive field leakage via serialized Prisma model | Information Disclosure | Never return a raw `PlatformAdmin` object from a controller (it includes `passwordHash`) — always map through an explicit response DTO (Anti-Patterns section) |

## Sources

### Primary (HIGH confidence)
- npm registry `latest` versions fetched live via `npm view <pkg> version`, 2026-08-10, for all 15 packages in the Standard Stack table `[VERIFIED: npm registry]`
- `gsd-tools query package-legitimacy check` — live registry signal check (downloads, publish date, repo, postinstall scripts) for all 15 packages, 2026-08-10
- Direct repo inspection: `package.json` (root), `turbo.json`, `pnpm-workspace.yaml`, `apps/server/package.json`, `apps/server/tsconfig.json`, `apps/platform-admin/package.json`, `packages/typescript-config/base.json` — all read this session
- Local environment probes: `docker --version`/`docker info`, `pnpm --version`, `node --version`, `psql --version` — all run this session

### Secondary (MEDIUM confidence — CITED, official docs, fetched via WebFetch summarization)
- [Prisma ORM v7 Upgrade Guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) — Node version floor, `prisma.config.ts`, generator/adapter requirements, ESM changes, CLI command changes
- [Prisma + Turborepo guide](https://www.prisma.io/docs/guides/turborepo) — `packages/database` structure, `db:generate` task wiring
- [Prisma + pnpm workspaces guide](https://www.prisma.io/docs/guides/deployment/pnpm-workspaces) — workspace package.json shape, `workspace:*` consumption pattern
- [Prisma + NestJS integration guide](https://www.prisma.io/nestjs) — `PrismaService` driver-adapter pattern (Pattern 1, verbatim-sourced)
- [Prisma Config reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference) — `prisma.config.ts` shape
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — argon2id parameter recommendations, algorithm ranking

### Tertiary (LOW confidence — community sources, cross-corroborated but not officially authoritative)
- [dev.to/alvaromrveiga — refresh token reuse detection without cluttering your database](https://dev.to/alvaromrveiga/implement-refresh-token-automatic-reuse-detection-without-cluttering-your-database-lb) — family-based schema design (Pattern 3's basis, adapted)
- [mihai-andrei.com — refresh token reuse detection](https://mihai-andrei.com/blog/refresh-token-reuse-interval-and-reuse-detection/) — alternative `usedAt`+grace-window design, cross-checked against the above for the "revoke whole session on reuse" conclusion
- WebSearch aggregate results (multiple 2026-dated NestJS auth/CORS/argon2 posts — EthioDev, samuelrods.com [fetch failed, title/summary only], syskool.com, various Medium/DEV.to) — used for cross-corroboration of standard patterns (CORS `credentials:true`+array origin, `ValidationPipe` options, `SwaggerModule` bootstrap shape), not as a single authoritative source

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — every version live-verified against npm registry this session; package names for `@prisma/*`/`pg`/NestJS packages sourced from official docs, `argon2` name is `[ASSUMED]` per provenance rule despite registry confirmation
- Architecture (Prisma 7 monorepo wiring): MEDIUM-HIGH — grounded in 4 independent official Prisma documentation pages (upgrade guide, Turborepo guide, pnpm workspaces guide, NestJS integration guide) that converge on a consistent structure; WebFetch-based summarization caps the seam's automated confidence classification at LOW per-source, but cross-source convergence across official docs materially raises actual reliability above that floor
- Architecture (JWT refresh rotation/reuse detection): MEDIUM — no single official NestJS-blessed pattern exists (this is architecture the team must build, not import); Pattern 3 synthesizes 2 independent community sources plus first-principles security reasoning cross-checked against the milestone SUMMARY.md's own pitfall framing; flagged in Assumptions Log (A3) as the highest-risk synthesis in this document
- Pitfalls: MEDIUM-HIGH — pitfalls 1, 2, 5, 6 are directly derived from official Prisma 7 docs (concrete, verifiable); pitfalls 3, 4 are synthesized from community consensus + the milestone-level SUMMARY.md's own pre-identified risk list (independently converging)
- Security Domain: MEDIUM-HIGH — ASVS category mapping is standard/well-established; specific control choices (argon2id, httpOnly cookie, SameSite=Strict) are each individually CITED to an authoritative source

**Research date:** 2026-08-10
**Valid until:** 2026-09-09 (30 days) — Prisma 7 is a fast-moving major version (released within the last ~3 months per its own changelog cadence); re-verify exact version numbers and any `prisma.config.ts`/generator syntax against the live docs if planning is delayed past this window.
