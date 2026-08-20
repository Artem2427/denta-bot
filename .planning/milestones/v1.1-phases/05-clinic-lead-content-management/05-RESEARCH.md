# Phase 5: Clinic, Lead & Content Management - Research

**Researched:** 2026-08-14
**Domain:** NestJS/Prisma CRUD APIs + Vite/React admin SPA (TanStack Query, typed OpenAPI client, React Router, @repo/ui)
**Confidence:** MEDIUM

## Summary

Phase 5 has two halves that share one contract: a NestJS backend exposing CRUD REST endpoints for `Clinic`, `Lead`, `BlogPost`, `PricingPlan` on top of the Prisma schema and auth stack Phase 4 already built, and a `apps/platform-admin` Vite+React SPA that is currently an untouched `create-vite` scaffold consuming those endpoints. No CONTEXT.md exists for this phase (discuss-phase was skipped) — there are no locked UI/UX decisions to honor; the recommendations below are this research's own judgment, informed by existing repo conventions, and should be treated as defaults the planner can override.

The backend half is low-risk: Phase 4 already established every pattern needed (global `PrismaService` via `@Global() PrismaModule`, `class-validator`/`@nestjs/swagger` DTOs, a global fail-closed `AccessTokenGuard` with `@Public()` opt-out, `@repo/db`'s dist-based build requirement). Phase 5's 4 new resource modules are straight repetitions of that shape — no new architectural decisions needed there, just execution discipline. The one real backend design gap this phase must close is **INFRA-05** (`updatedBy` trace fields don't exist on any model yet) — this requires a new Prisma migration adding a nullable `updatedById` FK to `PlatformAdmin` on all four content models (nullable specifically because `Lead` rows can originate from `apps/web`'s unauthenticated public forms in Phase 6 — LEAD-01/02 — with no PlatformAdmin actor at creation time).

The frontend half is the real net-new work: `apps/platform-admin` has zero auth wiring, zero routing, zero data-fetching setup, and its scaffolded `index.css` still ships the raw Vite starter template's centered-1126px-box layout — none of that is production-shaped yet. `@repo/ui` also does not yet have a `Form` (react-hook-form) primitive or a TanStack-Table-backed `DataTable` component, even though `@tanstack/react-table` is already a dependency — both need to be added to `packages/ui` (not one-off built in `platform-admin`) per CLAUDE.md's component-reuse constraint. The typed-client requirement (INFRA-04) is best satisfied with `openapi-typescript` + `openapi-fetch` generating types from NestJS's Swagger JSON endpoint (`GET /api/docs-json`, confirmed live at `apps/server/src/main.ts:32-34`), consumed through thin TanStack Query hooks — this is the current (2026) idiomatic pairing for a from-scratch typed-fetch + TanStack Query setup and avoids introducing a heavier codegen tool (Orval) or an OpenAPI-client-generator with a different runtime model than plain `fetch`.

**Primary recommendation:** Build 4 parallel NestJS resource modules (`clinics`, `leads`, `blog-posts`, `pricing-plans`) mirroring `AuthModule`'s existing shape exactly (constructor-inject `PrismaService`, `class-validator` DTOs decorated with `@ApiProperty`, no `@Public()` — they're protected by the global guard by default); add the `updatedById` migration first since every other model's DTO/service depends on that shape; and treat `apps/platform-admin`'s bootstrap (React Router v7 layout-route auth guard, TanStack Query provider, `openapi-fetch` client, `@repo/ui` `Form`/`DataTable` additions) as its own Wave 0-ish foundation slice before any CRUD screen work.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Clinic/Lead/Content CRUD business logic + validation | API / Backend (`apps/server`) | Database (Prisma) | NestJS services own validation, authorization (implicit via global guard), and persistence orchestration; Prisma is the persistence tier only |
| `updatedBy`/`updatedAt` trace population | API / Backend | Database (schema) | Service layer sets `updatedById` from the authenticated request (`CurrentUser().sub`); DB just stores/returns it — never trust a client-supplied `updatedById` |
| Lead -> Clinic conversion | API / Backend | Database (transaction) | Must be atomic (single `$transaction`); business rule (what "conversion" means) lives in `LeadsService`, not the client |
| Auth session (login/refresh/protected routing) | API / Backend (issuance) | Browser / Client (SPA route guard) | Backend is authoritative (Phase 4 JWT); the SPA's React Router guard is UX-only, redirecting unauthenticated users — never a real security boundary by itself |
| List/detail screens, filters, forms | Browser / Client (`apps/platform-admin`) | API / Backend (query params) | Filtering (status/date) is implemented server-side as query params on GET-list endpoints, not client-side array filtering, so pagination stays correct later |
| Typed API client generation | Browser / Client (build tooling) | API / Backend (spec source) | `openapi-typescript` reads the NestJS-served OpenAPI JSON; the backend is the source of truth, the frontend is a pure consumer of generated types |
| `@repo/ui` primitives (Form, DataTable) | Design System (`packages/ui`) | Browser / Client (usage) | Per CLAUDE.md, all `platform-admin` UI must go through `@repo/ui` — new primitives belong in the shared package, not one-off in `apps/platform-admin` |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLINIC-01 | View list of all clinic accounts | `GET /clinics` NestJS module pattern; `@repo/ui` `DataTable` (net-new) + TanStack Query `useQuery` |
| CLINIC-02 | View single clinic detail (contact, status, plan, stubbed bot-usage) | `GET /clinics/:id`; `Clinic` model already has `messageCount`/`bookingsCount`/`lastActiveAt` stub fields (verified in schema) |
| CLINIC-03 | Create new clinic | `POST /clinics`; `CreateClinicDto` (class-validator + `@ApiProperty`) |
| CLINIC-04 | Edit clinic info/status/plan | `PATCH /clinics/:id`; `UpdateClinicDto = PartialType(CreateClinicDto)` |
| CLINIC-05 | Filter clinic list by status | `GET /clinics?status=` query param, `IsEnum(ClinicStatus)` on a query DTO |
| LEAD-03 | Unified Lead inbox tagged by source | `GET /leads` returns `source` field (enum `contacts \| demo`, already on schema) |
| LEAD-04 | View Lead's full submitted detail | `GET /leads/:id` |
| LEAD-05 | Update Lead status (New/Contacted/Converted) | `PATCH /leads/:id/status`; `LeadStatus` enum already on schema |
| LEAD-06 | Filter Leads by status and date | `GET /leads?status=&from=&to=` query params |
| LEAD-07 | Convert Lead into linked Clinic | `POST /leads/:id/convert`; Prisma interactive `$transaction` (Pattern 3 below) |
| CMS-01 | Create/edit/delete Blog posts | `blog-posts` resource module, same CRUD shape |
| CMS-03 | Create/edit/delete Pricing plans | `pricing-plans` resource module, same CRUD shape |
| INFRA-04 | Frontend uses TanStack Query + typed OpenAPI client | `openapi-typescript` + `openapi-fetch` + `@tanstack/react-query` stack (Pattern 1/2 below) |
| INFRA-05 | `updatedBy`/`updatedAt` trace fields on Clinic/Lead/Content | New migration adding nullable `updatedById` FK to all 4 models (Pattern 4 below) — `updatedAt` already exists on all 4 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| `openapi-typescript` | 7.13.0 [VERIFIED: npm registry, published 2026-02-11] | Generates TS types from the NestJS OpenAPI JSON spec | Official `openapi-ts.dev` tool; zero-runtime type generation, current idiomatic pairing with `openapi-fetch` [CITED: openapi-ts.dev/openapi-fetch] |
| `openapi-fetch` | 0.17.0 [VERIFIED: npm registry, published 2026-02-11] | Type-safe `fetch` wrapper consuming the generated types | 6kb, near-zero runtime overhead, same maintainers as `openapi-typescript` [CITED: openapi-ts.dev/openapi-fetch] |
| `@tanstack/react-query` | 5.101.4 [VERIFIED: npm registry] | Server-state data fetching/caching for `apps/platform-admin` | Required by INFRA-04; `@tanstack/react-table` is already a `@repo/ui` dependency from the same maintainer ecosystem |
| `react-router` | 7.18.2 (NOT 8.x — see Pitfall 1) [ASSUMED, package name only — see Package Legitimacy Audit] | Client-side routing + auth-guarded layout routes | v7's "data mode" (`createBrowserRouter` + loaders) supports an auth-check loader pattern without needing full framework/SSR mode [CITED: reactrouter.com] |
| `@nestjs/swagger` | 11.4.6 (already installed, Phase 4) [VERIFIED: apps/server/src/prisma... — actually apps/server/package.json] | DTO decoration + OpenAPI doc/JSON generation | Already wired in `apps/server/src/main.ts`; `PartialType` reused for Update DTOs |
| `class-validator` / `class-transformer` | 0.15.1 / 0.5.1 (already installed) [VERIFIED: apps/server/package.json] | DTO validation for the 4 new resource modules | Matches `LoginDto`'s existing pattern exactly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hook-form` | ^7 [VERIFIED: apps/web/package.json:27, apps/server convention] | Clinic/Lead/BlogPost/PricingPlan forms in `platform-admin` | CLAUDE.md mandates RHF+zod for all forms; match the version already used elsewhere in the monorepo |
| `zod` | ^3 [VERIFIED: apps/web/package.json:30, apps/server/package.json] | Form schema validation | Repo convention is `^3` everywhere (`apps/web`, `apps/server`) even though zod 4.4.3 is newer upstream [VERIFIED: npm registry] — matching the pinned major avoids a dual-zod-major split across the monorepo |
| `@hookform/resolvers` | ^3 [VERIFIED: apps/web/package.json:14] | Wires zod schemas into `react-hook-form` | Same version-consistency rationale as zod |
| `@tanstack/react-query-devtools` | 5.101.4 [VERIFIED: npm registry] | Dev-only query inspector | Optional but cheap; add as a devDependency only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `openapi-typescript` + `openapi-fetch` (bare) | `openapi-react-query` (thin TanStack wrapper over the same two libs) [VERIFIED: npm registry, OK verdict] | Slightly less boilerplate per hook, but one more dependency and one more abstraction layer over a stack this research already recommends; bare `openapi-fetch` inside custom `useQuery` calls is simpler to reason about and easier for the planner to spec task-by-task |
| `openapi-typescript`/`openapi-fetch` | Orval (codegen'd React Query hooks) | Orval generates a lot more code (full hook per endpoint) and has its own config format; heavier for a 4-resource CRUD surface than this project needs |
| React Router v7 | React Router v8 (`latest` on npm, GA'd recently) | v8 requires Node `>=22.22.0` [CITED: remix-run/react-router changelog via WebSearch] — this machine's live Node is `22.20.0` [VERIFIED: `node --version` this session], which is BELOW that floor; v7 has no such requirement and the v7->v8 migration path is a near-drop-in import-path change later, so starting on v7 is the safer default (see Pitfall 1) |
| Building `Form`/`DataTable` inline in `apps/platform-admin` | Adding them to `packages/ui/src/components/shadcn-ui/` | CLAUDE.md requires all `platform-admin` UI go through `@repo/ui`; the user's own memory note explicitly permits "extend `@repo/ui` with new variants" |

**Installation (apps/platform-admin):**
```bash
pnpm --filter platform-admin add react-router @tanstack/react-query openapi-fetch react-hook-form zod @hookform/resolvers
pnpm --filter platform-admin add -D openapi-typescript @tanstack/react-query-devtools
```

**Version verification:** All versions above were checked via `npm view <pkg> version` this session (2026-08-14). `openapi-typescript`/`openapi-fetch` are on a shared `2026-02-11` release date (same monorepo, `openapi-ts` org). `@tanstack/react-query` and `react-router` both show very recent (`2026-07-2x`) latest-publish dates — this is a routine patch/minor release cadence for both projects (see Package Legitimacy Audit below), not a freshness risk for the *package* itself.

## Package Legitimacy Audit

| Package | Registry | Age (latest publish) | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|----------------------|--------------|--------------|---------|-------------|
| `openapi-typescript` | npm | 2026-02-11 | 6,089,699 | github.com/openapi-ts/openapi-typescript | OK | Approved |
| `openapi-fetch` | npm | 2026-02-11 | 7,292,593 | github.com/openapi-ts/openapi-typescript | OK | Approved |
| `openapi-react-query` | npm | 2026-02-11 | 413,210 | github.com/openapi-ts/openapi-typescript | OK | Approved (alternative, not required) |
| `@tanstack/react-query` | npm | 2026-07-21 | 63,702,117 | github.com/TanStack/query | SUS ("too-new" heuristic only) | Approved with note — see below |
| `@tanstack/react-query-devtools` | npm | 2026-07-21 | 10,319,245 | github.com/TanStack/query | SUS ("too-new" heuristic only) | Approved with note — see below |
| `react-router` | npm | 2026-07-22 | 51,608,522 | github.com/remix-run/react-router | SUS ("too-new" heuristic only) | Approved with note — pin to `^7`, not `latest`/`^8` |

**Note on the three `SUS` verdicts:** The legitimacy checker flags "too-new" purely because each package's *most recent version tag* was published within its recency window — this is a routine release-cadence signal, not a hallucination/slopsquat signal. All three have 10M–63M weekly downloads and resolve to their well-known official GitHub orgs (`TanStack`, `remix-run`). Per protocol these are still tagged `[SUS]` inline and the planner **must** add a `checkpoint:human-verify` task before the `pnpm add` step that installs `@tanstack/react-query`, `@tanstack/react-query-devtools`, and `react-router`, confirming the installed version matches what's pinned in this document (`react-router@^7`, not `^8` or unpinned `latest`).

**Packages removed due to `[SLOP]` verdict:** none.
**Packages flagged as suspicious `[SUS]`:** `@tanstack/react-query`, `@tanstack/react-query-devtools`, `react-router` — see note above; all three assessed OK to proceed with a pre-install checkpoint.

## Architecture Patterns

### System Architecture Diagram

```
apps/web (Phase 6, out of scope this phase)
        |
        v  (future — anonymous POST /leads)
+-------------------------------------------------------------+
|                       apps/server (NestJS)                   |
|                                                               |
|  AccessTokenGuard (global, APP_GUARD) — fail-closed by default|
|  every route below requires a valid access token unless       |
|  decorated @Public()                                          |
|                                                               |
|  +-----------+   +-----------+   +--------------+ +---------+ |
|  | Clinics   |   | Leads     |   | BlogPosts    | | Pricing | |
|  | Module    |   | Module    |   | Module       | | Plans   | |
|  | (CRUD)    |   | (CRUD +   |   | (CRUD)       | | Module  | |
|  |           |   |  convert) |   |              | | (CRUD)  | |
|  +-----+-----+   +-----+-----+   +------+-------+ +----+----+ |
|        |               |                |               |     |
|        +---------------+----------------+---------------+     |
|                         |                                      |
|                  PrismaService (@Global, single instance)      |
|                         |                                      |
+-------------------------|--------------------------------------+
                           v
                    Postgres (Docker, packages/db/prisma/schema.prisma)

SwaggerModule.setup('api/docs', ...) also serves GET /api/docs-json
                           |
                           v (dev-time codegen step, server + DB must be running)
        npx openapi-typescript http://localhost:4000/api/docs-json -o src/lib/api/schema.d.ts
                           |
                           v
+-------------------------------------------------------------+
|                 apps/platform-admin (Vite SPA)                |
|                                                               |
|  main.tsx -> QueryClientProvider -> RouterProvider(router)    |
|                                                               |
|  router: createBrowserRouter([                                |
|    { path: '/login', ... },  <- public                        |
|    { path: '/', loader: authLoader, children: [                |
|        clinics list/detail/new,                                |
|        leads inbox/detail,                                     |
|        content (blog/pricing) list/edit                        |
|    ]}                                                           |
|  ])                                                              |
|                                                               |
|  openapi-fetch client (createClient<paths>) -> Authorization:  |
|  Bearer <accessToken from in-memory/Zustand store>              |
|  on 401 -> POST /auth/refresh (withCredentials, refresh cookie) |
|         -> retry original request once                         |
+-------------------------------------------------------------+
```

### Recommended Project Structure

**Backend (`apps/server/src`):**
```
src/
├── auth/                  # existing (Phase 4) — untouched
├── prisma/                # existing (Phase 4) — untouched, @Global()
├── clinics/
│   ├── clinics.controller.ts
│   ├── clinics.service.ts
│   ├── clinics.module.ts
│   └── dto/
│       ├── create-clinic.dto.ts
│       ├── update-clinic.dto.ts   # PartialType(CreateClinicDto)
│       └── clinic-query.dto.ts    # status filter
├── leads/
│   ├── leads.controller.ts
│   ├── leads.service.ts           # includes convert() transaction
│   ├── leads.module.ts
│   └── dto/
│       ├── create-lead.dto.ts     # used by Phase 6's public submit, not this phase
│       ├── update-lead-status.dto.ts
│       └── lead-query.dto.ts      # status + date range filter
├── blog-posts/  (same 4-file shape)
└── pricing-plans/ (same 4-file shape)
```

**Frontend (`apps/platform-admin/src`):**
```
src/
├── main.tsx                    # QueryClientProvider + RouterProvider
├── router.tsx                  # createBrowserRouter tree, authLoader
├── lib/
│   ├── api/
│   │   ├── schema.d.ts         # generated by openapi-typescript, gitignored or committed (decide in plan)
│   │   └── client.ts           # createClient<paths>(...), auth header injection, 401-refresh interceptor
│   └── auth/
│       └── auth-store.ts       # in-memory access token holder (see Pitfall 2)
├── modules/
│   ├── auth/          (LoginPage)
│   ├── clinics/        (ClinicsListPage, ClinicDetailPage, ClinicFormPage, useClinics hooks)
│   ├── leads/           (LeadsInboxPage, LeadDetailPage, useLeads hooks)
│   └── content/         (BlogPostsPage, PricingPlansPage, useContent hooks)
└── shared/
    └── components/      (AppShell/sidebar layout — app-specific composition only, primitives from @repo/ui)
```
This mirrors the `apps/web` convention already established (`app/`=routes only / `modules/<page>/`=page components / `shared/`=cross-page code) per the user's own memory note on `apps/web` folder structure, adapted for a router-tree instead of Next.js file-routing.

### Pattern 1: NestJS resource module (reuse Phase 4's exact shape)

**What:** Controller delegates to an injectable Service; Service constructor-injects `PrismaService` (no need to import `PrismaModule` — it's `@Global()`, verified: `apps/server/src/prisma/prisma.module.ts:4-9` reads `@Global()\n@Module({\n  providers: [PrismaService],\n  exports: [PrismaService],\n})`); DTOs use `class-validator` + `@ApiProperty`; no `@Public()` decorator anywhere in these 4 modules — the global `AccessTokenGuard` (verified: `apps/server/src/auth/auth.module.ts:19-26`, registers `{ provide: APP_GUARD, useClass: AccessTokenGuard }`) protects every route by default.

**When to use:** All 4 new resource modules (Clinics, Leads, BlogPosts, PricingPlans).

**Example (Clinics, following `AuthController`'s exact style):**
```typescript
// clinics.controller.ts
@ApiTags('clinics')
@ApiBearerAuth('access-token')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  findAll(@Query() query: ClinicQueryDto) {
    return this.clinicsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClinicDto, @CurrentUser() user: AccessTokenPayload) {
    return this.clinicsService.create(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClinicDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.clinicsService.update(id, dto, user.sub);
  }
}
```
```typescript
// update-clinic.dto.ts — PartialType from @nestjs/swagger (already a dependency,
// re-exports class-validator's decorators onto the optional fields too)
import { PartialType } from '@nestjs/swagger';
import { CreateClinicDto } from './create-clinic.dto';

export class UpdateClinicDto extends PartialType(CreateClinicDto) {}
```
[CITED: standard NestJS `PartialType` pattern, confirmed via WebSearch against multiple NestJS/Swagger community sources — training-pattern also matches; import from `@nestjs/swagger` not `@nestjs/mapped-types` since the former is already installed (`apps/server/package.json` `@nestjs/swagger: 11.4.6`) and adds Swagger metadata inheritance the latter lacks]

### Pattern 2: Typed OpenAPI client + TanStack Query hook

**What:** Generate `paths` types from the live/local NestJS OpenAPI JSON, wrap `openapi-fetch`'s typed client in one shared instance, then wrap each endpoint in a thin `useQuery`/`useMutation` hook.

**Codegen step (run after `apps/server` is booted with DB up):**
```bash
npx openapi-typescript http://localhost:4000/api/docs-json -o src/lib/api/schema.d.ts
```
[CITED: openapi-ts.dev/openapi-fetch — CLI usage snippet retrieved this session]

**Client + hook:**
```typescript
// lib/api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include', // sends the httpOnly refresh cookie on refresh calls
});
```
```typescript
// modules/clinics/use-clinics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useClinics(status?: string) {
  return useQuery({
    queryKey: ['clinics', { status }],
    queryFn: async () => {
      const { data, error } = await api.GET('/clinics', { params: { query: { status } } });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; body: UpdateClinicBody }) =>
      api.PATCH('/clinics/{id}', { params: { path: { id: input.id } }, body: input.body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinics'] }),
  });
}
```
[CITED: tanstack.com/query/v5/docs — `useMutation`/`invalidateQueries` snippet retrieved this session; `openapi-fetch`'s `GET`/`PATCH` call shape from openapi-ts.dev]

### Pattern 3: Lead-to-Clinic conversion (interactive transaction)

**What:** LEAD-07 must atomically create a `Clinic` from a `Lead`'s submitted data and mark the `Lead` `converted` with a `clinicId` pointing at the new row — either both writes happen or neither does.

**Example:**
```typescript
// leads.service.ts
async convert(leadId: string, adminId: string) {
  return this.prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });
    if (lead.status === 'converted') {
      throw new ConflictException('Lead already converted');
    }

    const clinic = await tx.clinic.create({
      data: {
        name: lead.clinicName ?? lead.name,
        email: lead.email ?? `${lead.id}@unknown.dentabot.dev`, // Clinic.email is @unique NOT NULL — see Pitfall 3
        plan: 'trial',
        updatedById: adminId,
      },
    });

    return tx.lead.update({
      where: { id: leadId },
      data: { status: 'converted', clinicId: clinic.id, updatedById: adminId },
    });
  });
}
```
[CITED: Prisma interactive-transaction pattern confirmed via WebSearch against prisma.io docs summaries this session — `$transaction(async (tx) => {...})`, first arg is a scoped Prisma Client instance, commit/rollback is automatic]

**Anti-Patterns to Avoid**
- **Two separate non-transactional calls (`clinic.create()` then `lead.update()`):** a crash between the two leaves an orphaned Clinic with no linked Lead, or a Lead marked `converted` with no Clinic — always use `$transaction`.
- **Trusting a client-supplied `updatedById`:** always derive it server-side from `@CurrentUser()`, never accept it in the request body DTO (mass-assignment / spoofing risk — see Security Domain below).
- **Client-side-only array filtering for LEAD-06/CLINIC-05:** implement `status`/`date` filters as Prisma `where` clauses in the service, not `.filter()` over an already-fetched full list — keeps the pattern correct once pagination is added later.

### Pattern 4: `updatedBy` trace field migration (INFRA-05)

**What:** `updatedAt` already exists on `Clinic`, `Lead`, `BlogPost`, `PricingPlan` [VERIFIED: packages/db/prisma/schema.prisma:57,83,101,115 — each model already has `updatedAt DateTime @updatedAt`]. `updatedBy` does not exist anywhere in the schema yet [VERIFIED: full read of packages/db/prisma/schema.prisma this session — no `updatedById`/`updatedBy` field present on any model].

**Recommended schema addition (new migration, not a manual DB edit):**
```prisma
model Clinic {
  // ...existing fields...
  updatedById String?
  updatedBy   PlatformAdmin? @relation(fields: [updatedById], references: [id])
}
// repeat identically for Lead, BlogPost, PricingPlan

model PlatformAdmin {
  // ...existing fields...
  updatedClinics       Clinic[]      @relation("ClinicUpdatedBy")
  updatedLeads         Lead[]        @relation("LeadUpdatedBy")
  updatedBlogPosts     BlogPost[]    @relation("BlogPostUpdatedBy")
  updatedPricingPlans  PricingPlan[] @relation("PricingPlanUpdatedBy")
}
```
**Why nullable:** `Lead` rows are created via `apps/web`'s public, unauthenticated Contacts/Demo forms in Phase 6 (LEAD-01/02) — at creation time there is no PlatformAdmin actor, so `updatedById` must start `NULL` and only get populated the first time a PlatformAdmin acts on the record (status change, edit, etc). Making it required on `Lead` would force a fake/placeholder actor value, which is worse than `NULL`. For consistency and to avoid a future special-case, apply the same nullable pattern to `Clinic`/`BlogPost`/`PricingPlan` even though those are always admin-created in this phase.

**Why an explicit `@relation` name:** `PlatformAdmin` now has 4 distinct one-to-many relations, each targeting a *different* related model (`Clinic`, `Lead`, `BlogPost`, `PricingPlan`) — Prisma does not strictly require relation names here since each pair of models has only one relation between them, but naming them explicitly (`"ClinicUpdatedBy"`, etc.) makes schema intent self-documenting and avoids ambiguity if a `createdBy` field is ever added later (out of scope this phase — v1 only requires `updatedBy`).

**Migration command (per README.md's documented workflow):**
```bash
pnpm --filter @repo/db run db:migrate   # prisma migrate dev --name add_updated_by_trace_fields
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Typed API client from OpenAPI spec | Hand-written `fetch` wrapper + manually-maintained TS interfaces | `openapi-typescript` + `openapi-fetch` | Manual types drift from the actual backend contract the moment a DTO changes; codegen keeps INFRA-04's "typed client generated from the OpenAPI spec" requirement literally true |
| Data table (sort/filter/paginate columns for Clinics/Leads lists) | Custom `<table>` + manual sort state | `@tanstack/react-table`'s `useReactTable` (already a `@repo/ui` dependency) wrapped in a new `@repo/ui` `DataTable` primitive | Headless table state management (sorting, column visibility, row models) is exactly what `@tanstack/react-table` exists for, and it's already installed — building it from scratch duplicates a dependency that's already paid for |
| React-hook-form + shadcn integration boilerplate | Manual `Controller`-wrapping per field in every form | shadcn's standard `Form`/`FormField`/`FormItem`/`FormMessage` primitives (add to `packages/ui/src/components/shadcn-ui/form.tsx` via `shadcn add form`, or hand-port from shadcn's public source since `@repo/ui` already uses the shadcn CLI convention) | `@repo/ui` has every other shadcn primitive (Input, Label, Select, etc.) but is missing `form.tsx` specifically [VERIFIED: packages/ui/index.tsx — full export list read this session contains no `form` line] — without it every Clinic/Lead/BlogPost/PricingPlan form in this phase would hand-roll the same RHF-context wiring 4 times |
| Auth-token-refresh race handling | Naive "refresh on every 401" per failing request | A single shared in-flight refresh promise that all concurrent 401s await before retrying | Multiple simultaneous 401s (e.g. a list + detail fetch firing together) naively refreshing independently causes duplicate `/auth/refresh` calls — Phase 4's rotation logic (`apps/server/src/auth/auth.service.ts:111-141`) treats a *second* concurrent claim on the same refresh token as reuse and revokes the whole session family, so a naive multi-refresh client would lock itself out |

**Key insight:** Every "don't hand-roll" item above has a direct, already-installed or already-documented answer in this monorepo — the risk in this phase isn't picking the wrong library, it's re-deriving something Phase 4's `AuthService.refresh()` reuse-detection logic already makes unforgiving of naive client behavior (see Pitfall 2).

## Common Pitfalls

### Pitfall 1: `react-router@latest` resolves to v8, which needs Node `>=22.22.0`
**What goes wrong:** `pnpm add react-router` without a version pin installs `8.3.0` (current `latest` dist-tag) [VERIFIED: `npm view react-router dist-tags` this session]. v8 requires Node `>=22.22.0` and Vite 7+ [CITED: remix-run/react-router changelog, via WebSearch]. This session's live Node is `v22.20.0` [VERIFIED: `node --version` this session] — below that floor.
**Why it happens:** The root `package.json` engines field only requires `>=20.19.0` [VERIFIED: package.json:26-28], so nothing in the monorepo's tooling would catch a Node-version mismatch introduced by an unpinned dependency install.
**How to avoid:** Pin `"react-router": "^7"` explicitly in `apps/platform-admin/package.json`. v7's data-mode API (`createBrowserRouter`, loaders, `redirect()`) is what this research's auth-guard pattern uses and is stable through `7.18.2`.
**Warning signs:** `pnpm install` succeeding but `vite dev` throwing an unresolvable-engine or import-resolution error the first time a v8-only export path (`react-router/dom`) is referenced from code written against v7's flatter import surface.

### Pitfall 2: Refresh-token reuse detection punishes naive concurrent-401 handling
**What goes wrong:** Phase 4's `/auth/refresh` rotation claims the presented refresh token via a single atomic `updateMany` and, if the claim fails (because a concurrent request already rotated it), revokes the **entire token family** — logging the admin out entirely [VERIFIED: `apps/server/src/auth/auth.service.ts:111-141`, the `refresh()` method]. If `apps/platform-admin`'s fetch layer independently fires `/auth/refresh` for every 401 it sees (e.g. a list query and a detail query both 401 near-simultaneously), the second refresh call is treated as reuse and the admin is force-logged-out mid-session.
**Why it happens:** This is an intentional, correct security behavior from Phase 4 (closes a TOCTOU replay-attack window) — but it means the *frontend* now has an obligation the backend won't relax: never issue two concurrent `/auth/refresh` calls.
**How to avoid:** Implement the refresh call as a single shared in-flight promise (module-level `let refreshPromise: Promise<...> | null`) that every 401-handler awaits instead of independently calling refresh.
**Warning signs:** Admins reporting random unexplained logouts, especially on screens that fire multiple queries at once (e.g. a Clinic detail page loading both the clinic and its related leads).

### Pitfall 3: `Clinic.email` is `@unique` and required — Lead-to-Clinic conversion can collide or fail
**What goes wrong:** `Clinic.email String @unique` [VERIFIED: packages/db/prisma/schema.prisma:48] but `Lead.email String?` is optional [VERIFIED: packages/db/prisma/schema.prisma:77]. A naive `tx.clinic.create({ data: { email: lead.email, ... } })` throws a Prisma unique-constraint error if (a) the Lead has no email, or (b) an existing Clinic already has that email (e.g. converting a second lead from the same clinic).
**Why it happens:** The schema was designed in Phase 4 before conversion semantics existed; nothing enforces Lead.email presence before conversion.
**How to avoid:** In `LeadsService.convert()`, validate `lead.email` is present before attempting conversion (400 if missing — the UI should require it before allowing the convert action), and catch/translate a Prisma `P2002` unique-constraint error into a clear "a clinic with this email already exists" 409 response rather than letting a raw 500 leak through.
**Warning signs:** `POST /leads/:id/convert` intermittently 500ing instead of cleanly rejecting; visible only once real lead data with missing/duplicate emails starts flowing through (likely to surface once Phase 6 wires real form submissions).

### Pitfall 4: `apps/platform-admin`'s scaffolded `index.css` still has the raw Vite-template layout
**What goes wrong:** `apps/platform-admin/src/index.css:71-81` still contains the default Vite+React template's `#root { width: 1126px; max-width: 100%; margin: 0 auto; text-align: center; border-inline: 1px solid var(--border); ... }` — a centered, narrow, text-aligned-center box completely wrong for a dashboard/admin-shell layout [VERIFIED: apps/platform-admin/src/index.css:71-81, read this session].
**Why it happens:** The app was "freshly split from the old `apps/admin-panel` this session" per the phase's known constraints — it's an untouched scaffold, not yet cleaned up.
**How to avoid:** Delete/replace the scaffold CSS (App.css, the `#root` rules, the placeholder `--text`/`--accent`/`--shadow` custom properties in `index.css`) as an early task before building any real screen — `@repo/ui/styles/theme.css` is already correctly imported (`index.css:2`) and is the actual source of truth for tokens.
**Warning signs:** Any admin screen rendering centered/narrow with unexpected `text-align: center` inherited onto content that should be left-aligned.

### Pitfall 5: root `package.json`'s `dev:admin` script targets a stale package name
**What goes wrong:** Root `package.json` has `"dev:admin": "turbo dev --filter=admin-panel"` [VERIFIED: package.json:9], but `apps/platform-admin/package.json`'s `name` field is `"platform-admin"` [VERIFIED: apps/platform-admin/package.json:2], not `"admin-panel"`. Turbo's `--filter` matches on package `name`, so this script currently resolves to nothing (or errors) since no workspace package is named `admin-panel` anymore.
**Why it happens:** Leftover from the `apps/admin-panel` -> `apps/platform-admin` split that happened in a prior session, not yet reconciled in the root scripts.
**How to avoid:** Add `"dev:platform-admin": "turbo dev --filter=platform-admin"` to root `package.json` (and fix/remove the stale `dev:admin` entry) as part of this phase's bootstrap work.
**Warning signs:** `pnpm dev:admin` silently doing nothing or erroring with "No package found matching filter."

### Pitfall 6: generating the OpenAPI spec requires a fully-booted server (DB included)
**What goes wrong:** `GET /api/docs-json` is only served once `apps/server` is actually listening, and `NestFactory.create(AppModule)` bootstraps `PrismaModule`'s `onModuleInit()` which calls `$connect()` [VERIFIED: apps/server/src/prisma/prisma.service.ts:16-18] — so even a "just generate the OpenAPI JSON" script needs a reachable Postgres, not just a compiled server.
**Why it happens:** There's no standalone doc-only bootstrap path in this codebase (e.g. a script that builds the Swagger `document` object without instantiating the full app/DB connection).
**How to avoid:** Document the codegen step as "start Docker Postgres + `pnpm dev:server`, then run `openapi-typescript` against the live `http://localhost:4000/api/docs-json` URL" — don't try to build a DB-less codegen path as a "nice to have" inside this phase; it's not required by INFRA-04 and adds scope.
**Warning signs:** `openapi-typescript` failing with `ECONNREFUSED` because someone tried to run it before `docker compose up -d` / `pnpm dev:server`.

## Code Examples

See Pattern 1-4 above for the primary verified/cited snippets (NestJS resource module, typed client + TanStack Query hook, Lead conversion transaction, Prisma migration). Additional reference:

### React Router v7 auth-guarded layout route
```typescript
// router.tsx
import { createBrowserRouter, redirect } from 'react-router';
import { getAccessToken } from '@/lib/auth/auth-store';

async function authLoader() {
  if (!getAccessToken()) {
    throw redirect('/login');
  }
  return null;
}

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  {
    path: '/',
    loader: authLoader,
    Component: AppShell,
    children: [
      { path: 'clinics', Component: ClinicsListPage },
      { path: 'clinics/:id', Component: ClinicDetailPage },
      { path: 'leads', Component: LeadsInboxPage },
      { path: 'content/blog', Component: BlogPostsPage },
      { path: 'content/pricing', Component: PricingPlansPage },
    ],
  },
]);
```
[CITED: reactrouter.com — `createBrowserRouter` + `loader` + `throw redirect()` pattern retrieved this session]

### TanStack Table basic column/row setup (for the new `@repo/ui` `DataTable`)
```typescript
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<Clinic>();
const columns = [
  columnHelper.accessor('name', { header: 'Clinic' }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('plan', { header: 'Plan' }),
];

const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
```
[CITED: tanstack.com/table/v8/docs — basic setup pattern retrieved via WebSearch summary this session]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Hand-written API client interfaces | `openapi-typescript`/`openapi-fetch` codegen from a live OpenAPI spec | Standard practice for several years, still the dominant lightweight pairing in 2026 for teams not already on a heavier codegen tool | Keeps INFRA-04 literally true — the client can't silently drift from the backend contract |
| `react-router-dom` as the routing package | Plain `react-router` (the `-dom` package was folded in during v6->v7) | Already true as of v7; v8 additionally drops the `react-router-dom` compatibility shim entirely [CITED: remix-run/react-router changelog] | Install `react-router` directly, not `react-router-dom` — this monorepo has no existing react-router usage to conflict with |

**Deprecated/outdated:**
- `@nestjs/mapped-types`'s `PartialType`: superseded by `@nestjs/swagger`'s own `PartialType` re-export for any project already using `@nestjs/swagger` (this one is) — the swagger-aware version also carries `@ApiProperty` metadata onto the optional fields, which the base `mapped-types` package does not.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | `react-router` (package name, not just version) is the correct/current package to install for client-side routing in a Vite SPA, not a renamed/forked successor | Standard Stack, Pattern 1 (router example) | Low — `react-router` is an extremely well-known, actively maintained package (51M+ weekly downloads, confirmed via registry this session); risk is version-pin drift (see Pitfall 1), not package-identity risk |
| A2 | `PartialType` from `@nestjs/swagger` (not `@nestjs/mapped-types`) is the right import for Update DTOs | Pattern 1 | Low — both packages export a `PartialType` with the same core behavior; using the wrong one just means missing Swagger metadata on optional fields, not a functional bug |
| A3 | `openapi-typescript`'s CLI can point directly at a live `http://localhost:4000/api/docs-json` URL (not just a static file) | Pattern 2, Pitfall 6 | Low-Medium — if this session's WebFetch summary of the docs page mis-transcribed the CLI usage, the planner should verify with `npx openapi-typescript --help` before committing to the exact invocation in a task |
| A4 | No CI/deployment pipeline needs to regenerate the OpenAPI client automatically this phase (manual `npx openapi-typescript ...` run is sufficient) | Pattern 2 | Low — confirmed via PROJECT.md/STATE.md that this milestone has "No deployment/hosting configuration detected"; a CI-regeneration step would be new scope beyond INFRA-04's literal requirement |

## Open Questions

1. **Should the generated `schema.d.ts` be committed to git or gitignored + regenerated on demand?**
   - What we know: Both are common; committing avoids requiring a running server just to `pnpm install && tsc`, but risks drifting from the actual backend if someone forgets to regenerate after a DTO change.
   - What's unclear: No project convention exists yet (this would be the first codegen artifact in the monorepo).
   - Recommendation: Commit it (matches this monorepo's existing "types are generated but checked in via `@repo/db`'s `dist/`" precedent from Phase 4's `packages/db` build step) but add a `pnpm --filter platform-admin run generate:api` script so it's trivially regeneratable; the planner should make this an explicit task-level decision.

2. **Should `Clinic`/`Lead`/`BlogPost`/`PricingPlan` each get their own NestJS module, or should Blog+Pricing share one `ContentModule`?**
   - What we know: CMS-01 and CMS-03 are two distinct requirement IDs but conceptually adjacent ("content").
   - What's unclear: No CONTEXT.md exists to lock this; either shape satisfies the requirements.
   - Recommendation: 4 separate single-model modules (matches `AuthModule`'s existing one-concern-per-module granularity, and keeps each module's DTO folder from mixing two unrelated Prisma models) — but this is Claude's-discretion-equivalent and the planner is free to consolidate blog/pricing into one `content/` module if it simplifies the wave structure.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Docker | Local Postgres | Yes [VERIFIED: `docker --version` this session] | 27.3.1 | — |
| Docker daemon running | Local Postgres | Yes [VERIFIED: `docker info` this session] | — | — |
| Postgres container | `apps/server` DB connectivity | Yes, but via a **leftover container** (`agent-a8976498097c8c381-postgres-1`), not this repo's own `docker-compose.yml`-managed one [VERIFIED: `docker ps` this session shows this container `Up 3 days (healthy)`, per STATE.md's known Blockers/Concerns entry] | postgres:17 | Adopt the leftover container into `docker-compose.yml`'s project, or stop it and run a fresh `docker compose up -d` — should be resolved before Phase 5 execution starts, per STATE.md's own recommendation |
| Node.js | `apps/server`, `apps/platform-admin` build | Yes | v22.20.0 [VERIFIED: `node --version` this session] | Meets root `engines.node >=20.19.0`; does NOT meet `react-router@8`'s `>=22.22.0` floor — reinforces Pitfall 1's `^7` pin |
| pnpm | Package management | Yes | 9.0.0 [VERIFIED: `pnpm --version` this session] | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** Postgres container ownership (see row above) — operational cleanup, not a hard blocker, but should be resolved early in this phase's execution to avoid confusion during live verification.

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` [VERIFIED: .planning/config.json].

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | Reused, not new | Phase 4's JWT access/refresh already implements this; Phase 5 adds no new auth surface |
| V3 Session Management | Reused, not new | Same — refresh rotation/reuse-detection already in place; Phase 5's frontend must not break it (Pitfall 2) |
| V4 Access Control | Yes — new this phase | Every Clinic/Lead/Content route relies on the *global* `AccessTokenGuard` for authentication; there is currently only one flat `PlatformAdmin` role (no per-clinic scoping needed per REQUIREMENTS.md's explicit "Role tiers / RBAC" out-of-scope note) — so authorization here reduces to "is there a valid access token at all," already covered. The one real V4 risk is IDOR-by-omission: never accept a client-supplied `updatedById`/`id` override in a DTO (whitelisted DTOs via the existing global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`, verified `apps/server/src/main.ts:17-23`, already structurally prevents this as long as `updatedById` is never added to any Create/Update DTO's own fields) |
| V5 Input Validation | Yes | `class-validator` DTOs per resource (Pattern 1); enum fields (`ClinicStatus`, `LeadStatus`, `LeadSource`) validated via `IsEnum` against the Prisma-schema-defined enum values, never a free-text string |
| V6 Cryptography | Reused, not new | No new cryptographic surface in this phase (argon2/JWT already Phase 4's concern) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Mass assignment (client sets `updatedById`, `status` transitions it shouldn't be able to, or `id`) | Tampering | Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` already strips unknown fields; additionally, never declare `updatedById` as a DTO field at all — set it exclusively from `@CurrentUser()` in the service layer |
| SQL injection | Tampering | Not applicable in practice — Prisma parameterizes all queries; no raw `$queryRawUnsafe` usage anywhere in this phase's planned code |
| Stored XSS via `BlogPost.body` (a `Json` field, likely rich text) | Tampering / Info disclosure | Out of this phase's rendering surface (Phase 6 renders it on `apps/web`), but the `platform-admin` editor should still not `dangerouslySetInnerHTML` unsanitized admin input when *previewing* it within this phase's own UI |
| IDOR via sequential/guessable `id` values | Elevation of Privilege | Prisma's `cuid()` default IDs (verified: every model uses `@id @default(cuid())`) are non-sequential/non-guessable, mitigating simple ID-enumeration; combined with the single-flat-role model, there is no cross-tenant boundary to violate this phase |
| Refresh-token family lockout from naive frontend retry logic | Denial of Service (self-inflicted) | See Pitfall 2 — single shared in-flight refresh promise, not per-request refresh calls |

## Sources

### Primary (HIGH confidence — read directly from repo this session)
- `packages/db/prisma/schema.prisma` (full file) — current schema, no `updatedBy` field exists yet
- `apps/server/src/auth/*.ts` (controller, service, module, guards, strategies, decorators, DTOs) — full auth pattern to replicate
- `apps/server/src/prisma/prisma.service.ts`, `prisma.module.ts` — `@Global()` Prisma access pattern
- `apps/server/src/main.ts` — Swagger setup confirming `GET /api/docs-json` availability
- `apps/server/src/config/env.validation.ts` — env var shape (CORS, JWT secrets, cookie config)
- `apps/platform-admin/{package.json,vite.config.ts,src/main.tsx,src/index.css,tsconfig.app.json}` — scaffold state
- `packages/ui/index.tsx`, `packages/ui/src/components/shadcn-ui/table.tsx` — confirms no `Form`/`DataTable` primitive exists yet
- `apps/web/package.json`, `apps/web/modules/contacts/contact-form.tsx` — repo's existing RHF+zod version/pattern convention
- `.planning/{REQUIREMENTS.md,STATE.md,PROJECT.md,ROADMAP.md,config.json}` — requirements, decisions, workflow config
- `.planning/phases/04-backend-foundation-auth/{04-01,04-02}-SUMMARY.md` — Phase 4 decisions/pitfalls carried forward
- `docker-compose.yml`, `README.md` — local dev bootstrap sequence
- `npm view <pkg> version` / `dist-tags` for `openapi-typescript`, `openapi-fetch`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, `react-router`, `openapi-react-query`, `zod`, `react-hook-form`, `@hookform/resolvers` — live registry checks this session
- `docker --version`, `docker info`, `docker ps`, `node --version`, `pnpm --version` — live environment checks this session

### Secondary (MEDIUM confidence — official docs fetched/searched this session)
- openapi-ts.dev/openapi-fetch — CLI + client usage snippets
- tanstack.com/query/v5/docs — `useMutation`/`invalidateQueries` snippet
- tanstack.com/table/v8/docs — basic column/row setup
- reactrouter.com — `createBrowserRouter`/loader/`redirect` auth pattern; changelog/v7-to-v8 migration notes (via remix-run/react-router changelog, WebSearch)
- prisma.io/blog — NestJS+Prisma DTO/relational-data guidance (WebSearch summary, not full-page fetch)

### Tertiary (LOW confidence — WebSearch summaries only, not independently fetched)
- General SPA JWT-storage/refresh-interceptor best-practice summaries (multiple blog posts, cross-referenced but not officially authoritative) — informed Pitfall 2/Pattern 2's design but treated as general practice, not a hard requirement

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — versions verified live against npm registry; API-shape guidance is CITED (docs fetched) for the two most load-bearing libraries (openapi-fetch, TanStack Query), WebSearch-summarized (not context7-verified, unavailable this session) for the rest
- Architecture: HIGH for the backend half (directly extrapolated from Phase 4's already-built, already-verified patterns, read this session); MEDIUM for the frontend half (net-new, best-practice-based, no existing repo precedent to verify against)
- Pitfalls: HIGH — all 6 pitfalls are grounded in files read directly this session (schema, service code, scaffold CSS, package.json, live `node`/`docker` checks), not speculative

**Research date:** 2026-08-14
**Valid until:** ~30 days for the NestJS/Prisma backend guidance (stable stack); ~14 days for the `react-router`/`@tanstack/react-query` version pins given both projects' fast release cadence noted in the Package Legitimacy Audit
