---
phase: 05-clinic-lead-content-management
plan: 05
subsystem: frontend
tags: [react-router, tanstack-query, openapi-fetch, openapi-typescript, react-hook-form, zod, nestjs, swagger, vite]

# Dependency graph
requires:
  - phase: 05-clinic-lead-content-management
    provides: "Clinics/Leads/BlogPosts/PricingPlans NestJS resource modules (05-01), @repo/ui Form/DataTable primitives (05-02), remaining CRUD modules (05-03/05-04)"
provides:
  - "apps/platform-admin bootstrapped as an authenticated SPA: React Router v7 auth-guarded layout route, TanStack Query provider, openapi-fetch typed client with single-in-flight-promise refresh interceptor"
  - "Working Clinics CRUD screen (list/filter/create/detail/inline-edit) — the phase's tracer bullet proving the full architecture end-to-end"
  - "Swagger response-DTO pattern (ClinicResponseDto, @ApiOkResponse/@ApiCreatedResponse) that Plans 05-06/05-07 must replicate for Leads/Content to get real typed schema.d.ts responses instead of content?: never"
affects: [05-06-leads, 05-07-content]

# Actuals (#2632)
actuals:
  tokens: 17570
  tasks: 3
  commits: 2

# Tech tracking
tech-stack:
  added: [react-router@^7, "@tanstack/react-query", "@tanstack/react-query-devtools", openapi-fetch, openapi-typescript, react-hook-form@^7 (platform-admin), zod@^3 (platform-admin), "@hookform/resolvers@^3", sonner (platform-admin), date-fns (platform-admin)]
  patterns:
    - "Typed API client: openapi-typescript generates schema.d.ts from live GET /api/docs-json; openapi-fetch's createClient<paths> wrapped in thin useQuery/useMutation hooks per resource (use-clinics.ts)"
    - "Auth: in-memory-only access token (auth-store.ts), single shared refreshPromise so concurrent 401s never double-refresh (Pitfall 2), React Router v7 authLoader guard"
    - "NestJS response DTOs (e.g. ClinicResponseDto) + @ApiOkResponse/@ApiCreatedResponse are REQUIRED on every controller method for openapi-typescript to emit a real response shape — a return type alone is not enough without the decorator"
    - "openapi-fetch error branch: endpoints without an explicit @ApiResponse for non-2xx codes generate error: never, which collapses `if (error) { response... }` narrowing to never — check response.ok instead of the error field when you need to read response.status"

key-files:
  created:
    - apps/platform-admin/src/router.tsx
    - apps/platform-admin/src/lib/api/client.ts
    - apps/platform-admin/src/lib/api/schema.d.ts
    - apps/platform-admin/src/lib/auth/auth-store.ts
    - apps/platform-admin/src/modules/auth/login-page.tsx
    - apps/platform-admin/src/shared/components/app-shell.tsx
    - apps/platform-admin/src/modules/clinics/use-clinics.ts
    - apps/platform-admin/src/modules/clinics/clinics-list-page.tsx
    - apps/platform-admin/src/modules/clinics/clinic-form-dialog.tsx
    - apps/platform-admin/src/modules/clinics/clinic-detail-page.tsx
    - apps/server/src/clinics/dto/clinic-response.dto.ts
  modified:
    - apps/platform-admin/src/index.css
    - apps/platform-admin/src/main.tsx
    - package.json (root — dev:platform-admin script)
    - apps/server/src/auth/auth.controller.ts (added @ApiOkResponse for login/refresh)
    - apps/server/src/clinics/clinics.controller.ts (added @ApiOkResponse/@ApiCreatedResponse)
    - apps/server/src/clinics/clinics.service.ts (findOne/update now include updatedBy)
    - packages/ui/src/components/shadcn-ui/spinner.tsx (boundary cast fix)
    - packages/ui/src/components/shadcn-ui/form.tsx (portable-type fix)
    - packages/ui/src/components/shadcn-ui/data-table.tsx (unused import fix)

key-decisions:
  - "Added ClinicResponseDto + @ApiOkResponse/@ApiCreatedResponse to ClinicsController and AuthResponseDto's missing @ApiOkResponse to AuthController — without these, openapi-typescript's generated schema.d.ts had content?: never for every response, breaking INFRA-04's typed-client requirement at the type level (member access on a never-typed value is a hard compile error, not silently permissive)"
  - "Fixed 3 pre-existing packages/ui TS errors (spinner.tsx ref-type mismatch, form.tsx TS2742 portable-type error, data-table.tsx unused import) that blocked tsc -b for any @repo/ui consumer — root cause is a duplicate @types/react resolution in the pnpm store (apps/client-admin pins a newer/looser range than packages/ui/apps/web/platform-admin); fixed locally per-file (boundary casts / re-export instead of const re-binding) rather than a workspace-wide pnpm.overrides, since an override would silently change apps/client-admin's resolved versions outside this plan's authority"
  - "Aligned apps/platform-admin's own react/react-dom/@types/react/@types/react-dom pins to match packages/ui/apps/web exactly (was ^19.2.7/^19.2.17, now ^19.2.0/19.2.2) — the scaffold's looser pin caused a second react-hook-form install keyed to a different peer react, making @repo/ui's Form primitive and platform-admin's own useForm() structurally incompatible"
  - "openapi-fetch mutation error handling checks response.ok instead of the error field — Clinics endpoints don't declare explicit non-2xx @ApiResponse schemas, so error's generated type is never, which collapses TS narrowing of the whole error-truthy branch (including response) to never; response.ok is unrelated to that union discrimination and works safely"

requirements-completed: [CLINIC-01, CLINIC-02, CLINIC-03, CLINIC-04, CLINIC-05, INFRA-04, INFRA-05]

coverage:
  - id: D1
    description: "apps/platform-admin boots as an authenticated SPA — unauthenticated /clinics redirects to /login; a valid login (or silent refresh via the httpOnly cookie on reload) lands on /clinics"
    requirement: INFRA-04
    verification:
      - kind: integration
        ref: "curl smoke test — POST /auth/login with seeded platformadmin@dentabot.dev credentials returns accessToken; GET /clinics with Authorization: Bearer <token> returns 200 JSON"
        status: pass
      - kind: automated_ui
        ref: "Task 2 <verify> human-check (browser round-trip: unauthenticated redirect, login, full-width layout, reload-stays-logged-in) — NOT run this session, no browser available in this execution context"
        status: unknown
    human_judgment: true
    rationale: "The live routing/auth-guard/reload round trip in a real browser was specified as a human-check in the plan and could not be exercised from this non-interactive execution context; automated tsc -b/vite build and curl-based API smoke tests pass, but visual/interactive confirmation is still outstanding."
  - id: D2
    description: "Clinics list: DataTable with status Badge/filter (server-side via GET /clinics?status=), Skeleton loading, error+Retry, true-empty vs filtered-empty states"
    requirement: CLINIC-01
    verification:
      - kind: unit
        ref: "pnpm --filter platform-admin exec tsc -b && pnpm --filter platform-admin run build — both pass"
        status: pass
      - kind: integration
        ref: "curl GET /clinics (no filter) returns [] on empty DB; status filter passed as query param, not client-side array filtering"
        status: pass
    human_judgment: true
    rationale: "Visual empty/loading/error state rendering was not verified in a real browser this session."
  - id: D3
    description: "Add Clinic dialog validates client-side (zod mirroring CreateClinicDto) and surfaces a 409 duplicate-email error inline"
    requirement: CLINIC-03
    verification:
      - kind: unit
        ref: "pnpm --filter platform-admin exec tsc -b — passes; ClinicFormDialog's onSubmit catches ApiError with status 409 and calls form.setError('email', ...)"
        status: pass
    human_judgment: true
    rationale: "409-path was not exercised live in a browser (would require submitting a duplicate email through the actual dialog UI)."
  - id: D4
    description: "Clinic detail page: inline-editable Card, Save Changes PATCHes only dirty fields, Bot Usage section never renders blank messageCount/bookingsCount/lastActiveAt, trace line renders 'Last updated by {email} on {date}' or 'Not yet updated'"
    requirement: "CLINIC-02, CLINIC-04, INFRA-05"
    verification:
      - kind: integration
        ref: "curl smoke test — GET /clinics/:id includes updatedBy.email; PATCH with only {phone} leaves name/email/plan unchanged in the response"
        status: pass
      - kind: unit
        ref: "grep confirms 'Not yet updated', 'Never active', dirtyFields all present in clinic-detail-page.tsx; tsc -b passes"
        status: pass
    human_judgment: false

# Metrics
duration: ~55min
completed: 2026-08-14
status: complete
---

# Phase 05 Plan 05: Platform-Admin Bootstrap + Clinics CRUD Summary

**Bootstrapped `apps/platform-admin` from an untouched Vite scaffold into an authenticated SPA (React Router v7 + TanStack Query + openapi-fetch typed client) and shipped a fully working Clinics list/create/detail-with-inline-edit screen against the real backend — the phase's tracer bullet proving the entire new architecture end-to-end.**

## Performance

- **Duration:** ~55 min
- **Completed:** 2026-08-14
- **Tasks:** 3 (Task 1 checkpoint approved per pre-authorization, Task 2 + Task 3 executed)
- **Files modified:** 25 (across 2 task commits)

## Accomplishments

- `apps/platform-admin` now boots via `QueryClientProvider` → `RouterProvider`, with an `authLoader`-guarded layout route (`/` requires a token or a successful silent refresh, else redirects to `/login`)
- `openapi-fetch` typed client (`lib/api/client.ts`) with `onRequest` Bearer-header injection and a 401 → `refreshAccessToken()` → single-retry interceptor
- `auth-store.ts`: in-memory-only access token (never `localStorage`), single shared in-flight `refreshPromise` so concurrent 401s never double-fire `/auth/refresh` (avoids Phase 4's reuse-detection force-logout)
- Clinics list (`DataTable` + status `Badge`/`Select` filter, `Skeleton` loading, error+Retry, true-empty vs filtered-empty states), create dialog (zod-validated, inline 409 handling), and detail page (inline edit via dirty-fields-only PATCH, Bot Usage stub fields, INFRA-05 trace line)
- `apps/platform-admin/src/index.css` scaffold cleanup — dropped the Vite-starter 1126px centered box and dead custom properties
- Backend: `ClinicResponseDto` + `@ApiOkResponse`/`@ApiCreatedResponse` decorators added to `ClinicsController` (and a missing one to `AuthController`) so the generated `schema.d.ts` carries real typed response shapes instead of `content?: never`; `ClinicsService.findOne`/`update` now `include: { updatedBy: { select: { email: true } } }`

## Task Commits

Each task was committed atomically:

1. **Task 1: Package legitimacy checkpoint** — pre-approved in a prior session per the orchestrator's explicit instruction (`react-router`, `@tanstack/react-query`, `@tanstack/react-query-devtools` all confirmed against their official npm/GitHub orgs, `react-router` pinned `^7`). No commit — nothing to build for this task, recorded here as satisfied.
2. **Task 2: Bootstrap — router, TanStack Query, typed client, auth store, AppShell, Clinics list** — `a23f7e2` (feat)
3. **Task 3: Clinic create dialog, detail page (inline edit + trace field)** — `1aaaf4b` (feat)

_Note: both commits include deviation fixes that were prerequisites for the task's own `tsc -b`/`vite build` to pass — see Deviations below._

## Files Created/Modified

- `apps/platform-admin/src/router.tsx` — `createBrowserRouter` tree with `authLoader`, `/login` public + `/` guarded layout with `clinics`/`clinics/:id` children
- `apps/platform-admin/src/lib/api/client.ts` — `openapi-fetch` client + auth middleware
- `apps/platform-admin/src/lib/api/schema.d.ts` — generated from live `GET /api/docs-json`
- `apps/platform-admin/src/lib/auth/auth-store.ts` — token store, `login`/`logout`/`refreshAccessToken`
- `apps/platform-admin/src/modules/auth/login-page.tsx` — `Form`-based login
- `apps/platform-admin/src/shared/components/app-shell.tsx` — Sidebar nav + logout + `Toaster`
- `apps/platform-admin/src/modules/clinics/use-clinics.ts` — `useClinics`/`useClinic`/`useCreateClinic`/`useUpdateClinic` + `ApiError`
- `apps/platform-admin/src/modules/clinics/clinics-list-page.tsx` — DataTable list screen
- `apps/platform-admin/src/modules/clinics/clinic-form-dialog.tsx` — create dialog
- `apps/platform-admin/src/modules/clinics/clinic-detail-page.tsx` — detail/inline-edit + trace field
- `apps/platform-admin/src/index.css`, `src/main.tsx` — scaffold cleanup, provider wiring
- `apps/server/src/clinics/dto/clinic-response.dto.ts` — new response DTO
- `apps/server/src/clinics/clinics.controller.ts`, `apps/server/src/auth/auth.controller.ts` — `@ApiOkResponse`/`@ApiCreatedResponse` added
- `apps/server/src/clinics/clinics.service.ts` — `updatedBy` include on `findOne`/`update`
- `packages/ui/src/components/shadcn-ui/{spinner,form,data-table}.tsx` — pre-existing TS error fixes (see Deviations)
- `package.json` (root) — `dev:platform-admin` script, stale `dev:admin` removed

## Decisions Made

See `key-decisions` in frontmatter. Summary: (1) added missing NestJS Swagger response-DTO decorators so the typed client actually carries real shapes; (2) fixed 3 pre-existing `packages/ui` TS errors blocking any `@repo/ui` consumer's `tsc -b`, root-caused to a duplicate `@types/react` resolution from `apps/client-admin`'s looser version pin; (3) aligned `platform-admin`'s own react/types pins to match `packages/ui`/`apps/web`; (4) use `response.ok` instead of the `error` field for openapi-fetch mutation error handling, since undeclared error-response schemas collapse TS's `error`-truthy narrowing to `never`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Swagger response DTOs/decorators — generated typed client had no real response shapes**
- **Found during:** Task 2 (writing `use-clinics.ts`'s `queryFn`, then hitting a `tsc -b` failure on `never`-typed data access)
- **Issue:** No controller in the phase (Clinics or the pre-existing Auth controller) declared `@ApiOkResponse`/`@ApiCreatedResponse`, so every generated `schema.d.ts` response was `content?: never` — the exact opposite of INFRA-04's "typed client from the generated schema" requirement, and a hard compile error the moment real screen code tried to read a response field
- **Fix:** Added `apps/server/src/clinics/dto/clinic-response.dto.ts` (`ClinicResponseDto`/`ClinicUpdatedByDto`) + `@ApiOkResponse`/`@ApiCreatedResponse` on all 4 `ClinicsController` methods; added `@ApiOkResponse({ type: AuthResponseDto })` to `AuthController`'s `login`/`refresh` (pre-existing Phase 4 gap, blocking `auth-store.ts`'s `login()`)
- **Files modified:** `apps/server/src/clinics/dto/clinic-response.dto.ts` (new), `apps/server/src/clinics/clinics.controller.ts`, `apps/server/src/auth/auth.controller.ts`
- **Verification:** `openapi-typescript` regenerated against the live server confirms real field types (`id: string`, `status: "trial"|"active"|...`, etc., not `content?: never`); `tsc -b`/`vite build` pass
- **Committed in:** `a23f7e2` (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed 3 pre-existing packages/ui TS errors blocking tsc -b for any @repo/ui consumer**
- **Found during:** Task 2, running `pnpm --filter platform-admin exec tsc -b`
- **Issue:** `spinner.tsx` (ref-type mismatch), `form.tsx` (TS2742 "cannot be named without a reference"), `data-table.tsx` (unused `React` import) all failed `tsc --noEmit` even in isolation (`pnpm --filter @repo/ui run check-types`), confirming these were pre-existing bugs unrelated to this plan's own changes, root-caused to the pnpm store resolving 2 different `@types/react` versions (`19.2.2` used by `packages/ui`/`apps/web`, `19.2.17` pulled in by `apps/client-admin`'s looser range) — any file importing `@repo/ui`'s barrel transitively type-checks the whole barrel, including `spinner.tsx`/`form.tsx`, so this blocked Task 2 even though I never directly used `Spinner` in that task
- **Fix:** `spinner.tsx` — cast `props` at the JSX boundary (`as React.ComponentProps<typeof Loader2Icon>`) instead of a plain spread; `form.tsx` — changed `const Form = FormProvider; export { Form }` to a direct `export { FormProvider as Form }` re-export (avoids TS needing to synthesize a portable inferred type for a new binding); `data-table.tsx` — removed the genuinely-unused `import * as React from 'react'`. Also considered and reverted a root `pnpm.overrides` fix (would have silently changed `apps/client-admin`'s resolved versions, outside this plan's authority) and a per-package `pnpm update react@19.2.0` (kept getting undone by subsequent `pnpm install`/`dedupe` runs) in favor of these version-resolution-agnostic, file-local fixes
- **Files modified:** `packages/ui/src/components/shadcn-ui/spinner.tsx`, `form.tsx`, `data-table.tsx`
- **Verification:** `pnpm --filter @repo/ui run check-types` passes clean; `pnpm --filter platform-admin exec tsc -b` and `vite build` pass
- **Committed in:** `a23f7e2` (Task 2 commit)

**3. [Rule 3 - Blocking] Aligned apps/platform-admin's react/@types pins to match packages/ui/apps/web**
- **Found during:** Task 2, `LoginPage`'s `Form`/`FormField` usage failed to type-check (`UseFormReturn<...>` incompatible between two different react-hook-form installs)
- **Issue:** `apps/platform-admin`'s scaffold pinned `react`/`react-dom` at `^19.2.7` and `@types/react`/`@types/react-dom` at `^19.2.17` — different from `packages/ui`/`apps/web`'s `^19.2.0`/exact `19.2.2` — causing pnpm to install a second, peer-incompatible copy of `react-hook-form` for `platform-admin` vs. the one `@repo/ui`'s `Form` primitive resolves against
- **Fix:** Changed `apps/platform-admin/package.json`'s `react`/`react-dom` to `^19.2.0` and `@types/react`/`@types/react-dom` to exact `19.2.2`, matching `packages/ui`/`apps/web`
- **Files modified:** `apps/platform-admin/package.json`, `pnpm-lock.yaml`
- **Verification:** `find node_modules/.pnpm -iname 'react-hook-form@*'` shows a single deduplicated instance after the fix; `tsc -b` passes
- **Committed in:** `a23f7e2` (Task 2 commit)

**4. [Rule 3 - Blocking] response.ok instead of error for mutation error handling**
- **Found during:** Task 3, `use-clinics.ts`'s `useCreateClinic`/`useUpdateClinic` mutationFns failed `tsc -b` with "Property 'status' does not exist on type 'never'"
- **Issue:** Neither `ClinicsController.create` nor `.update` declares an explicit non-2xx `@ApiResponse`, so openapi-typescript's generated `error` type resolves to `never` for those operations — narrowing via `if (error) { ...response.status... }` collapses the whole truthy branch (including `response`) to `never`
- **Fix:** Check `if (!response.ok)` instead of `if (error)` before reading `response.status`, since `response` is typed `Response` unconditionally in both union branches and isn't affected by the `error`-field narrowing collapse
- **Files modified:** `apps/platform-admin/src/modules/clinics/use-clinics.ts`
- **Verification:** `tsc -b` passes; curl smoke test confirms the actual HTTP status is correctly readable at runtime
- **Committed in:** `1aaaf4b` (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (1 missing-critical, 3 blocking)
**Impact on plan:** All 4 were prerequisites for the tracer bullet's own `tsc -b`/`vite build` acceptance criteria to pass — none were scope creep beyond what INFRA-04's typed-client requirement and the plan's own stated acceptance criteria demanded. Deviations 2/3 (the `@types/react` duplication and version-pin misalignment) are pre-existing repo issues surfaced by this plan, not caused by it — documented here since Plans 05-06/05-07 will hit the identical `packages/ui` errors the moment they import `@repo/ui`'s barrel, unless a future `pnpm install`/`dedupe` re-flips the resolution (the file-local fixes in spinner.tsx/form.tsx are resolution-agnostic and should hold regardless).

## Issues Encountered

- The plan's own Task 2 automated `<verify>` script checks `grep -c "'/clinics'" schema.d.ts` (single-quoted) — `openapi-typescript` always emits double-quoted keys (`"/clinics"`), so this specific grep line always returns 0 regardless of correctness. Verified manually with the correct quote style (`grep -c '"/clinics"'` → 1) instead. Flagging for the plan author; not a code defect.
- Local Postgres was the pre-existing leftover container (`agent-a8976498097c8c381-postgres-1`, port 5432) noted in STATE.md's Blockers — used as-is per the known-issues guidance; migrations were already up to date (`prisma migrate status` → "up to date"), no new migration needed this plan (Phase 5's `updatedById`/`updatedBy` fields already existed on the schema from an earlier plan in this phase).
- No browser was available in this execution context, so the human-check portions of both tasks' `<verify>` blocks (live routing/auth-guard/reload behavior; full create→list-refresh→detail→edit round trip) could not be exercised directly. Substituted with `curl`-based API smoke tests (login, GET/POST/PATCH `/clinics`, confirming `updatedBy.email` presence and partial-update semantics) plus `tsc -b`/`vite build`/`eslint` passing clean. These are recorded as `human_judgment: true` in the `coverage:` block above and should be confirmed by a human in a real browser before this plan is considered fully UAT-complete.

## User Setup Required

None — no external service configuration required. Local dev requires `docker compose up -d postgres` (or the existing leftover container) + `pnpm --filter server run start` with the env vars documented in `apps/server/src/config/env.validation.ts` before `apps/platform-admin`'s `generate:api` script or the app itself can run.

## Next Phase Readiness

- The typed-client + TanStack Query + auth-guarded-routing + `@repo/ui` DataTable/Form architecture is proven end-to-end and ready for Plans 05-06 (Leads) and 05-07 (Content) to replicate directly
- **Important for 05-06/05-07:** their own `LeadsController`/`BlogPostsController`/`PricingPlansController` will need the SAME `@ApiOkResponse`/`@ApiCreatedResponse` + response-DTO treatment this plan added to `ClinicsController`/`AuthController` — without it, their generated `schema.d.ts` responses will also be `content?: never`, hitting the identical blocking `tsc -b` failure documented in Deviation 1 above
- The `packages/ui` `spinner.tsx`/`form.tsx`/`data-table.tsx` fixes are file-local and version-resolution-agnostic, so they should remain valid even if a future `pnpm install` re-flips which `@types/react` copy the store resolves
- Not yet human-verified in a live browser (see Issues Encountered) — recommend a manual UAT pass on the live app before Phase 5 is considered fully shippable

## Self-Check: PASSED

All created files verified present on disk (router.tsx, client.ts, auth-store.ts, clinic-form-dialog.tsx, clinic-detail-page.tsx, clinic-response.dto.ts) and both task commit hashes (`a23f7e2`, `1aaaf4b`) verified present in git log.

---
*Phase: 05-clinic-lead-content-management*
*Completed: 2026-08-14*
