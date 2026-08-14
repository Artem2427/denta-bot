---
phase: 05-clinic-lead-content-management
plan: 04
subsystem: api
tags: [nestjs, prisma, postgres, jwt, class-validator, swagger]

# Dependency graph
requires:
  - phase: 05-01
    provides: "updatedById trace-field migration on BlogPost/PricingPlan, the resource-module shape (controller/service/module/dto) proven on ClinicsModule"
  - phase: 05-03
    provides: "LeadsModule's DELETE-free controller/service/module/dto shape — this plan adds the DELETE route on top of the same shape"
provides:
  - "BlogPostsModule: GET/GET:id/POST/PATCH/DELETE /blog-posts, all admin-authenticated — CMS-01"
  - "PricingPlansModule: GET/GET:id/POST/PATCH/DELETE /pricing-plans, all admin-authenticated — CMS-03"
  - "The full DELETE-inclusive resource-module shape (P2025 -> 404 on delete, no soft-delete) — this phase's first two DELETE routes"
affects: [apps-web-phase-6, blog-posts, pricing-plans]

actuals:
  tokens: 3634
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "DELETE route pattern: @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(...) calling a service .remove() that does a real Prisma .delete() and translates P2025 -> NotFoundException (no soft-delete field on either model)"
    - "Json field (BlogPost.body) accepted as Record<string, unknown> at the DTO/validation layer (@IsObject()) but cast to Prisma.InputJsonValue at the call site in create/update — Prisma's generated types reject a plain Record<string, unknown> for a Json column"
    - "Selective P2002 handling: BlogPostsService translates P2002 -> 409 (slug is @unique); PricingPlansService omits P2002 handling entirely since PricingPlan.name has no uniqueness constraint"

key-files:
  created:
    - apps/server/src/blog-posts/blog-posts.controller.ts
    - apps/server/src/blog-posts/blog-posts.service.ts
    - apps/server/src/blog-posts/blog-posts.module.ts
    - apps/server/src/blog-posts/dto/create-blog-post.dto.ts
    - apps/server/src/blog-posts/dto/update-blog-post.dto.ts
    - apps/server/src/pricing-plans/pricing-plans.controller.ts
    - apps/server/src/pricing-plans/pricing-plans.service.ts
    - apps/server/src/pricing-plans/pricing-plans.module.ts
    - apps/server/src/pricing-plans/dto/create-pricing-plan.dto.ts
    - apps/server/src/pricing-plans/dto/update-pricing-plan.dto.ts
  modified:
    - apps/server/src/app.module.ts

key-decisions:
  - "Cast dto.body to Prisma.InputJsonValue in BlogPostsService's create/update calls — the plan's DTO spec (Record<string, unknown>, @IsObject()) is correct for input validation but Prisma 7's generated BlogPostCreateInput/UpdateInput types require InputJsonValue for a Json column, not a plain Record type"
  - "Reused the already-running shared Postgres container (port 5432, from a sibling worktree) instead of starting a second docker-compose project — same approach as Plans 05-01/05-03"
  - "No root .env exists in this worktree — started apps/server with all 5 required env vars (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PLATFORM_ADMIN_EMAIL, PLATFORM_ADMIN_PASSWORD, CORS_ALLOWED_ORIGINS) exported inline on the pnpm start command, matching the plan's documented env-var fallback"

patterns-established:
  - "DELETE-inclusive resource module: first two of this phase's 4 resources to expose a hard-delete route, both proven live with a create -> delete -> second-delete-404 sequence"

requirements-completed: [CMS-01, CMS-03, INFRA-05]

coverage:
  - id: D1
    description: "POST /blog-posts with a slug already used by another post returns 409, not a duplicate row"
    requirement: "CMS-01"
    verification:
      - kind: integration
        ref: "live curl: created a blog post with slug=test-post-0504, then POST'd a second post with the same slug — asserted 409 (this session)"
        status: pass
    human_judgment: false
  - id: D2
    description: "DELETE /blog-posts/:id followed by a second DELETE on the same id returns 404 the second time — hard delete, no soft-delete field"
    requirement: "CMS-01"
    verification:
      - kind: integration
        ref: "live curl: DELETE on a real id (204), then DELETE again on the same id — asserted 404 (this session)"
        status: pass
    human_judgment: false
  - id: D3
    description: "apps/server/src/app.module.ts's imports array includes BlogPostsModule and PricingPlansModule"
    requirement: "CMS-01, CMS-03"
    verification:
      - kind: integration
        ref: "grep -c 'BlogPostsModule'/'PricingPlansModule' apps/server/src/app.module.ts (both >=1) + live server route map log showing BlogPostsController/PricingPlansController routes (this session)"
        status: pass
    human_judgment: false
  - id: D4
    description: "POST /pricing-plans with a name identical to an existing plan's name succeeds (201), producing two distinct rows — PricingPlan.name has no uniqueness constraint"
    requirement: "CMS-03"
    verification:
      - kind: integration
        ref: "live curl: two POST /pricing-plans with name='Starter', different sortOrder — both 201, GET /pricing-plans returned 2 distinct ids (this session)"
        status: pass
    human_judgment: false
  - id: D5
    description: "GET /pricing-plans returns results ordered by sortOrder ascending, not createdAt"
    requirement: "CMS-03"
    verification:
      - kind: integration
        ref: "live curl GET /pricing-plans after creating sortOrder=2 then sortOrder=1 — response returned sortOrder=1 first (this session)"
        status: pass
    human_judgment: false
  - id: D6
    description: "DELETE /pricing-plans/:id on a non-existent id returns 404"
    requirement: "CMS-03"
    verification:
      - kind: integration
        ref: "live curl DELETE /pricing-plans/nonexistent-id — asserted 404 (this session)"
        status: pass
    human_judgment: false
  - id: D7
    description: "updatedById on both BlogPost and PricingPlan is set to the creating/editing admin's id on every create and update"
    requirement: "INFRA-05"
    verification:
      - kind: integration
        ref: "live curl response bodies for both POST /blog-posts and POST /pricing-plans show updatedById matching the authenticated admin's id (this session)"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-08-14
status: complete
---

# Phase 5 Plan 4: Clinic Lead Content Management Summary

**Full CRUD (incl. DELETE) for BlogPost and PricingPlan — NestJS resource modules mirroring ClinicsModule/LeadsModule's shape, closing CMS-01 and CMS-03's backend half and completing Phase 5's entire backend**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2
- **Files modified:** 11 (10 created, 1 modified: `app.module.ts`)

## Accomplishments
- Built `BlogPostsModule` — `GET/GET:id/POST/PATCH/DELETE /blog-posts`, all admin-authenticated, with slug-uniqueness enforced at the DB level (`P2002` -> 409) and a real hard `DELETE` (`P2025` -> 404 on a second delete)
- Built `PricingPlansModule` — same 5-route shape, `findAll()` ordered by `sortOrder asc` (the model's own intended display order, unlike the other 3 resources' `createdAt desc`), and intentionally no uniqueness check on `name` since `PricingPlan.name` carries no `@unique` constraint
- Proved both DELETE routes live end-to-end: create -> delete (204) -> delete again (404), confirming no soft-delete field masks the hard `Prisma .delete()`
- Confirmed `updatedById` is set server-side from `@CurrentUser().sub` on every create/update for both resources — never a client-writable DTO field
- Both `BlogPostsModule` and `PricingPlansModule` registered in `app.module.ts`, completing this phase's entire backend (Plans 05-01, 05-03, 05-04 together now cover Clinics, Leads, BlogPosts, PricingPlans)

## Task Commits

Each task was committed atomically:

1. **Task 1: BlogPostsModule — full CRUD incl. DELETE** - `818fbbc` (feat)
2. **Task 2: PricingPlansModule — full CRUD incl. DELETE** - `f18d275` (feat)

_Plan metadata (this SUMMARY + STATE.md) is committed separately by the parallel-worktree orchestrator after this plan's SUMMARY lands._

## Files Created/Modified
- `apps/server/src/blog-posts/blog-posts.controller.ts` - `BlogPostsController` — GET/GET:id/POST/PATCH/DELETE, all protected by the existing global `AccessTokenGuard`
- `apps/server/src/blog-posts/blog-posts.service.ts` - `BlogPostsService` — Prisma-backed CRUD, `P2002`/`P2025` error translation, `dto.body` cast to `Prisma.InputJsonValue` for the `Json` column
- `apps/server/src/blog-posts/blog-posts.module.ts` - `BlogPostsModule`
- `apps/server/src/blog-posts/dto/create-blog-post.dto.ts` - `CreateBlogPostDto` (class-validator + `@ApiProperty`, `body: Record<string, unknown>` validated as `@IsObject()`, never declares `updatedById`)
- `apps/server/src/blog-posts/dto/update-blog-post.dto.ts` - `UpdateBlogPostDto = PartialType(CreateBlogPostDto)`
- `apps/server/src/pricing-plans/pricing-plans.controller.ts` - `PricingPlansController` — same 5-route shape as `BlogPostsController`
- `apps/server/src/pricing-plans/pricing-plans.service.ts` - `PricingPlansService` — `findAll()` ordered by `sortOrder asc`, no `P2002` handling (no unique constraint on `name`)
- `apps/server/src/pricing-plans/pricing-plans.module.ts` - `PricingPlansModule`
- `apps/server/src/pricing-plans/dto/create-pricing-plan.dto.ts` - `CreatePricingPlanDto` (class-validator + `@ApiProperty`, `features: string[]`, never declares `updatedById`)
- `apps/server/src/pricing-plans/dto/update-pricing-plan.dto.ts` - `UpdatePricingPlanDto = PartialType(CreatePricingPlanDto)`
- `apps/server/src/app.module.ts` - registers `BlogPostsModule`, `PricingPlansModule`

## Decisions Made
- Cast `dto.body` to `Prisma.InputJsonValue` at the Prisma call site in `BlogPostsService.create`/`.update` — the DTO itself stays `Record<string, unknown>` (correct for `@IsObject()` input validation), but Prisma 7's generated `BlogPostCreateInput`/`BlogPostUpdateInput` types require `InputJsonValue` for the `Json` column, so a plain cast bridges the two without loosening validation
- Reused the already-running shared Postgres container (port 5432, from a sibling worktree agent) rather than starting a second `docker compose` project on the same port — consistent with Plans 05-01/05-03's approach and this plan's own known-issues note
- No root `.env` exists in this worktree — started `apps/server` with all 5 required env vars (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS`) exported inline on the `pnpm --filter server run start` command line, and re-ran the seed script with the same `PLATFORM_ADMIN_EMAIL`/`PASSWORD` to guarantee the login credentials used by both tasks' live verification were present (idempotent upsert, matches `packages/db/prisma/seed.ts`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `dto.body` (Record<string, unknown>) not assignable to Prisma's `InputJsonValue` type**
- **Found during:** Task 1 build (`pnpm --filter server run build`)
- **Issue:** `BlogPostsService.create`/`.update` spread `...dto` directly into Prisma's `data` object. `CreateBlogPostDto.body` is typed `Record<string, unknown>` (as the plan specified, matching `@IsObject()` validation), but Prisma 7's generated `BlogPostUncheckedCreateInput`/`UpdateInput` types require `Prisma.InputJsonValue`, which a plain `Record<string, unknown>` does not structurally satisfy (TS2322). Build failed with 2 type errors.
- **Fix:** Cast `dto.body as Prisma.InputJsonValue` (create) / `as Prisma.InputJsonValue | undefined` (update) at the Prisma call site only — the DTO's own type and validation decorator are unchanged, so client-facing input validation is unaffected.
- **Files modified:** `apps/server/src/blog-posts/blog-posts.service.ts`
- **Commit:** `818fbbc`

**2. [Rule 1 - Bug] Prettier/ESLint formatting violation in blog-posts.service.ts's import statement**
- **Found during:** Task 2 pre-commit lint scope check (`npx eslint src/blog-posts`)
- **Issue:** The single-line `import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';` (86 chars) exceeded the configured line-length, tripping `prettier/prettier`.
- **Fix:** Reformatted to the standard multi-line named-import block. Manually edited the single line (not a broad `eslint --fix` pass) to keep the diff scoped to this plan's own file, per this session's scope-discipline requirement.
- **Files modified:** `apps/server/src/blog-posts/blog-posts.service.ts`
- **Commit:** `f18d275`

---

**Total deviations:** 2 auto-fixed (both Rule 1 bugs — a Prisma type-cast fix and a lint-formatting fix, no scope creep)
**Impact on plan:** No scope creep. Both fixes stayed within this plan's own `files_modified` list; no unrelated files were touched (verified via `git diff --stat` before each commit).

## Issues Encountered
- Port 4000 was left bound by a stale `nest start` process from Task 1's verification run — `pkill -f "nest start"` alone did not free it; had to `lsof -ti:4000` + `kill -9` the specific PID before Task 2's server could bind. Not a code issue, purely a local verification-session artifact.
- This worktree had no `node_modules` installed (fresh worktree checkout) — ran `pnpm install` before the first Prisma/build command, same one-time bootstrap step Plan 05-01 encountered.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Phase 5's entire backend is now complete: `ClinicsModule` (05-01), `LeadsModule` + Lead-to-Clinic conversion (05-03), `BlogPostsModule` + `PricingPlansModule` (this plan) all live, all following the same resource-module shape
- `apps/web`'s Phase 6 integration can now read/write all 4 content types (`Clinic`, `Lead`, `BlogPost`, `PricingPlan`) against a real NestJS API instead of mocked handlers
- No blockers for Phase 6

---
*Phase: 05-clinic-lead-content-management*
*Completed: 2026-08-14*
