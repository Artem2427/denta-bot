# Phase 4: Backend Foundation & Auth - Pattern Map

**Mapped:** 2026-08-10
**Files analyzed:** 24
**Analogs found:** 6 / 24 (partial/data-shape matches only — this is greenfield backend work; `apps/server` is the untouched Nest CLI scaffold, so most new files have **no in-repo analog** and must follow RESEARCH.md's `[CITED]`/official-pattern code examples verbatim instead)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|----------------|
| `apps/server/src/main.ts` | config/bootstrap | request-response | `apps/server/src/main.ts` (existing, to be extended) | exact (modify-in-place) |
| `apps/server/src/app.module.ts` | module | request-response | `apps/server/src/app.module.ts` (existing, to be extended) | exact (modify-in-place) |
| `apps/server/src/prisma/prisma.module.ts` | module | CRUD | none in-repo | no-analog (use RESEARCH.md Pattern 1) |
| `apps/server/src/prisma/prisma.service.ts` | service | CRUD | none in-repo | no-analog (use RESEARCH.md Pattern 1) |
| `apps/server/src/auth/auth.module.ts` | module | request-response | `apps/server/src/app.module.ts` (module wiring shape only) | role-match |
| `apps/server/src/auth/auth.controller.ts` | controller | request-response | `apps/server/src/app.controller.ts` (controller wiring shape only) | role-match (shape, not content) |
| `apps/server/src/auth/auth.service.ts` | service | event-driven (token lifecycle) | `apps/server/src/app.service.ts` (DI shape only) | role-match (shape, not content) |
| `apps/server/src/auth/dto/login.dto.ts` | model (DTO) | request-response | none in-repo | no-analog (use RESEARCH.md class-validator convention) |
| `apps/server/src/auth/dto/auth-response.dto.ts` | model (DTO) | request-response | none in-repo | no-analog |
| `apps/server/src/auth/strategies/access-token.strategy.ts` | middleware | request-response | none in-repo | no-analog (use RESEARCH.md Pattern 2) |
| `apps/server/src/auth/strategies/refresh-token.strategy.ts` | middleware | request-response | none in-repo | no-analog (use RESEARCH.md Pattern 2) |
| `apps/server/src/auth/guards/access-token.guard.ts` | middleware | request-response | none in-repo | no-analog |
| `apps/server/src/auth/guards/refresh-token.guard.ts` | middleware | request-response | none in-repo | no-analog |
| `apps/server/src/auth/decorators/current-user.decorator.ts` | utility | request-response | none in-repo | no-analog |
| `packages/db/prisma/schema.prisma` | model (schema) | CRUD | none in-repo | no-analog (field shapes mirror below) |
| `packages/db/prisma.config.ts` | config | — | none in-repo | no-analog (use RESEARCH.md Prisma 7 guide) |
| `packages/db/prisma/seed.ts` | utility (batch) | batch | none in-repo | no-analog (use RESEARCH.md seed script example) |
| `packages/db/src/index.ts` | utility | — | `packages/ui/src/index.tsx` (barrel re-export shape, workspace-package convention) | role-match |
| `packages/db/package.json` | config | — | `packages/ui/package.json`, `apps/admin-panel/package.json` (`workspace:*` convention) | role-match |
| `docker-compose.yml` (root) | config | — | none in-repo | no-analog |
| `.env.example` (root) | config | — | none in-repo | no-analog |
| `turbo.json` (modify) | config | — | `turbo.json` (existing, to be extended with `db:generate`) | exact (modify-in-place) |
| `package.json` (root, modify `engines.node`) | config | — | `package.json` (existing, to be extended) | exact (modify-in-place) |
| `Clinic`/`Lead`/`BlogPost`/`PricingPlan` Prisma models (in `schema.prisma`) | model | CRUD | `apps/web/modules/blog/_data.ts` (`Post`/`PostBodyBlock` shape for `BlogPost`); `apps/web/modules/prices/pricing-cards.tsx` (`plans` shape for `PricingPlan`) | field-shape-match (D-12/D-13 mandate mirroring these) |

## Pattern Assignments

### `apps/server/src/main.ts` (bootstrap, modify-in-place)

**Analog:** `apps/server/src/main.ts` (current 8-line scaffold, read in full above)

Current state — everything after `NestFactory.create` needs to be added:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**Target pattern** — copy verbatim from RESEARCH.md "Global `ValidationPipe` + Cookie/CORS Bootstrap" (cross-verified `[CITED]`), inserting `cookie-parser`, CORS allowlist (array, `credentials: true` — D-08, never `origin: '*'`), global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`, and Swagger setup (RESEARCH.md Pattern 4) between `app = await NestFactory.create(...)` and `app.listen(...)`. Note: existing scaffold uses port `3000` default — this conflicts with `apps/web`'s dev port; RESEARCH.md's example defaults to `process.env.PORT ?? 4000`, matching D-08's CORS-allowlist intent (server must not collide with web's `:3000`). Use `4000`, not the scaffold's `3000`.

---

### `apps/server/src/app.module.ts` (module, modify-in-place)

**Analog:** `apps/server/src/app.module.ts` (current, read in full above — 10 lines, empty `imports: []`)

Extend the existing `imports: []` array to add `PrismaModule`, `AuthModule`, and `ConfigModule.forRoot({ isGlobal: true, validate })` (RESEARCH.md's `@nestjs/config` + `zod` recommendation). Keep `AppController`/`AppService` as-is (unused Nest CLI scaffold placeholders — no requirement to remove them this phase).

---

### `apps/server/src/prisma/prisma.service.ts` (service, CRUD) — no in-repo analog

**Source:** RESEARCH.md Pattern 1 "Prisma 7 PrismaService with Driver Adapter" — verbatim from the official Prisma+NestJS integration guide `[CITED]`. Copy exactly as shown (extends `PrismaClient` from `@repo/db`, `PrismaPg` adapter in `super()`, `OnModuleInit`/`OnModuleDestroy` lifecycle hooks for `$connect`/`$disconnect`).

### `apps/server/src/prisma/prisma.module.ts` (module) — no in-repo analog

**Pattern to follow:** standard Nest `@Global()` module — `@Global() @Module({ providers: [PrismaService], exports: [PrismaService] }) export class PrismaModule {}`. No in-repo analog exists (this codebase has zero non-trivial Nest modules); use the shape implied by `apps/server/src/app.module.ts`'s `@Module({...})` decorator syntax as the only local syntactic reference, combined with RESEARCH.md's architecture diagram (`PrismaModule`/`PrismaService` — `@Global()`, provides/exports `PrismaService`).

---

### `apps/server/src/auth/*` (controller/service/module, request-response) — no in-repo analog

**Source:** RESEARCH.md's full "Recommended Project Structure" tree + Patterns 2 and 3.

**Controller shape reference** (syntax only, not content) — `apps/server/src/app.controller.ts`:
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```
Follow this constructor-DI + decorator-route shape for `AuthController` (`@Controller('auth')`, `@Post('login')`/`@Post('refresh')`/`@Post('logout')`), but the actual login/refresh/logout logic has no local precedent — copy from RESEARCH.md Patterns 2 (`AccessTokenStrategy`/`RefreshTokenStrategy`) and 3 (rotation-with-reuse-detection `refresh()` algorithm) verbatim, adapting variable names to the project's Prisma model names (`PlatformAdmin`, `RefreshToken`).

**Critical security pattern (non-negotiable, from RESEARCH.md Anti-Patterns + Security Domain):**
- Never re-export the raw `PlatformAdmin` Prisma model (contains `passwordHash`) — always map to `AuthResponseDto { id, email, createdAt }`.
- Refresh token DB row: store a SHA-256 hash of the token, never the raw token. Every issued refresh token needs a DB row with `familyId`, `revokedAt`, `expiresAt` (RESEARCH.md Pattern 3 — this project's single highest-risk piece of logic, per RESEARCH.md's own framing).
- Login failures: generic "invalid credentials" 401 regardless of whether the email exists or the password is wrong (no user enumeration).

---

### `packages/db/package.json` and `packages/db/src/index.ts` (config/utility) — workspace-package convention analog

**Analog:** `packages/ui/package.json` and `packages/ui/src/index.tsx` — establishes the monorepo's `workspace:*`-consumed package convention (`main`/`exports` pointing at a single barrel entry file). Follow the same `name: "@repo/db"`, `private: true` (or publishable-shaped per INFRA-02's "structurally ready" framing), and a single `src/index.ts` re-export barrel for the generated Prisma types + a client factory, per RESEARCH.md's recommended `packages/db` structure.

**Consumption convention** — `apps/admin-panel/package.json` already shows the pattern other apps use to declare a `workspace:*` dependency:
```json
"@repo/ui": "workspace:*"
```
`apps/server/package.json` should add `"@repo/db": "workspace:*"` the same way.

---

### `packages/db/prisma/schema.prisma` — `BlogPost` and `PricingPlan` model field shapes

**Analog for `BlogPost`:** `apps/web/modules/blog/_data.ts` lines 1-16 (`PostBodyBlock` union + `Post` type) — D-12 mandates a field-for-field mirror:
```typescript
export type PostBodyBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'quote'; text: string; author?: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  body: PostBodyBlock[];
};
```
Prisma model: `slug` (unique string), `title`, `excerpt`, `category` (string, not enum/FK per this file's convention), `date` (keep as display-ready string per D-12's "field-for-field match" intent — do not coerce to `DateTime` unless planning decides otherwise), `readTime` (string), `image` (string URL), `body` (`Json`, typed as `PostBodyBlock[]` at the application layer since Prisma has no native discriminated-union column type), plus new `published: boolean` (D-12).

**Analog for `PricingPlan`:** `apps/web/modules/prices/pricing-cards.tsx` lines 13-63 (the `plans` array) — D-13 mandates a mirror:
```typescript
const plans = [
  {
    name: 'Старт',
    monthlyPrice: '599',
    yearlyPrice: '499',
    description: 'Для невеликих клінік',
    features: ['До 100 записів/місяць', '1 лікар', ...],
    // popular?: boolean — only present on one plan in the mock array
  },
];
```
Prisma model: `name`, `monthlyPrice` (string — display-ready, NOT cents, per D-13's explicit note matching how the premium UI already consumes it), `yearlyPrice` (string), `description`, `features` (`String[]`), `isPopular` (boolean — renamed from the mock's `popular` per D-13), plus new `sortOrder: Int` and `published: Boolean` (D-13).

---

### `turbo.json` (modify) — add `db:generate` task

**Analog:** `turbo.json` (existing, read in full above).

Current:
```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": { "dependsOn": ["^build"], "inputs": ["$TURBO_DEFAULT$", ".env*"], "outputs": [".next/**", "!.next/cache/**", "!.next/dev/**"] },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```
Add a new `"db:generate": { "cache": false }` task, and wire `"dependsOn": ["^db:generate"]` into `dev`/`check-types`, and `"dependsOn": ["^build", "^db:generate"]` into `build` — per RESEARCH.md Pitfall 1 (`[CITED: prisma.io/docs/guides/turborepo]`). Preserve all existing `build`/`lint`/`dev` config untouched otherwise.

---

### `package.json` (root, modify) — bump `engines.node`

**Analog:** `package.json` (existing, read in full above, line 22-24: `"engines": { "node": ">=18" }`).

Change to `">=20.19.0"` per Prisma 7's floor (RESEARCH.md Environment Availability + STATE.md blocker note). Leave every other field (`scripts`, `devDependencies`, `packageManager`) untouched — this is a single-field edit.

---

## Shared Patterns

### Monorepo workspace-package convention
**Source:** `packages/ui/package.json` + `apps/admin-panel/package.json`'s `"@repo/ui": "workspace:*"` dependency declaration.
**Apply to:** `packages/db/package.json` (name `@repo/db`) and `apps/server/package.json`'s new dependency entry.

### NestJS constructor-DI + decorator-route shape
**Source:** `apps/server/src/app.controller.ts` (full file, 13 lines) and `apps/server/src/app.module.ts` (full file, 11 lines) — the only real Nest syntax precedent in this repo.
**Apply to:** `AuthController`, `AuthModule`, `PrismaModule` — same `@Controller()`/`@Module()`/`private readonly` constructor-injection shape, just with real routes/providers instead of the `Hello World` placeholder.

### Data-shape mirroring for CMS-adjacent models
**Source:** `apps/web/modules/blog/_data.ts` (`Post`/`PostBodyBlock`) and `apps/web/modules/prices/pricing-cards.tsx` (`plans`).
**Apply to:** `BlogPost` and `PricingPlan` Prisma models — D-12/D-13 explicitly require field-for-field mirrors so Phase 6's mock-to-real-data swap is mechanical.

### Auth/security-critical logic (no in-repo precedent — RESEARCH.md is authoritative)
**Source:** RESEARCH.md Patterns 1-4 and Anti-Patterns/Security Domain sections.
**Apply to:** every file under `apps/server/src/auth/`, `apps/server/src/prisma/`, and `packages/db/prisma/seed.ts`. These are genuinely greenfield — there is nothing else in the codebase to copy from, so the plan's action sections should cite RESEARCH.md line ranges directly rather than an in-repo file.

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md's cited patterns/code examples instead of an in-repo analog):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/server/src/prisma/prisma.service.ts` | service | CRUD | No Prisma/DB code exists anywhere in the repo yet — use RESEARCH.md Pattern 1 verbatim |
| `apps/server/src/prisma/prisma.module.ts` | module | CRUD | Same — no `@Global()` module precedent locally |
| `apps/server/src/auth/strategies/*.strategy.ts` | middleware | request-response | No passport/JWT code exists — use RESEARCH.md Pattern 2 verbatim |
| `apps/server/src/auth/guards/*.guard.ts` | middleware | request-response | Same — no guard precedent locally |
| `apps/server/src/auth/decorators/current-user.decorator.ts` | utility | request-response | No custom param decorators exist in the repo |
| `apps/server/src/auth/dto/*.dto.ts` | model (DTO) | request-response | No `class-validator`/`@nestjs/swagger` DTO exists anywhere; `apps/web` uses `zod` for forms, a different validation library entirely, so it is not a usable analog |
| `apps/server/src/auth/auth.service.ts` (refresh rotation logic specifically) | service | event-driven | Highest-risk logic in the phase (RESEARCH.md's own framing) — no NestJS-official or in-repo canonical pattern; RESEARCH.md Pattern 3 is a synthesized best-practice, treat it as the ground truth |
| `packages/db/prisma.config.ts` | config | — | Prisma 7's config file is new-in-version; no local precedent, no other `packages/*` uses Prisma |
| `packages/db/prisma/seed.ts` | utility (batch) | batch | No seed scripts exist anywhere in the monorepo |
| `docker-compose.yml`, `.env.example` (root) | config | — | Nothing containerized exists in this repo yet |

## Metadata

**Analog search scope:** `apps/server/src` (full), `apps/web/modules/blog`, `apps/web/modules/prices`, `packages/ui` (package.json/index.tsx only), `apps/admin-panel/package.json`, root `turbo.json`/`package.json`
**Files scanned:** 12
**Pattern extraction date:** 2026-08-10
</content>
