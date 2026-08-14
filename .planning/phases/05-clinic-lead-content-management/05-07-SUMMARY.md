---
phase: 05-clinic-lead-content-management
plan: 07
subsystem: frontend
tags: [react-router, tanstack-query, openapi-fetch, openapi-typescript, react-hook-form, zod, nestjs, swagger, vite, tabs, alert-dialog, field-array]

# Dependency graph
requires:
  - phase: 05-clinic-lead-content-management
    provides: "apps/platform-admin bootstrap (router/typed-client/TanStack Query/auth) + Clinics CRUD (05-05) + Leads inbox/convert (05-06); BlogPostsModule/PricingPlansModule backend (05-04)"
provides:
  - "Blog Posts screen (/content/blog, /content/blog/new, /content/blog/:id/edit) — full-page create/edit form, publish toggle, delete-with-confirmation, JSON-only body editing (never rendered as HTML)"
  - "Pricing Plans screen (/content/pricing) — Dialog create/edit with a dynamic zero-or-more features list, delete-with-confirmation"
  - "Shared Content Tabs sub-nav between Blog Posts and Pricing Plans"
  - "BlogPostResponseDto/PricingPlanResponseDto + @ApiOkResponse Swagger pattern applied to both controllers — completes the response-DTO treatment started in 05-05 (Clinics) and 05-06 (Leads) across all 4 CRUD resources this phase built"
affects: []

# Actuals (#2632)
actuals:
  tokens: 13857
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Row-action delete: a per-row AlertDialog with local open state, embedded directly in the DataTable column's cell renderer (DeleteBlogPostAction/DeletePricingPlanAction) — Button + AlertDialogContent as siblings inside a controlled <AlertDialog open onOpenChange>, event.stopPropagation() on both the trigger Button and AlertDialogContent so the delete click never bubbles into the row's own onRowClick navigation"
    - "Dynamic zero-or-more list fields: react-hook-form's useFieldArray requires array items to be objects, so PricingPlan.features (a string[] DTO field) is represented internally as { value: string }[] and mapped to/from a plain string[] only at the submit/defaultValues boundary"
    - "Content section Tabs sub-nav is two independent pages (blog-posts-page.tsx / pricing-plans-page.tsx) each rendering its own <Tabs value=\"blog\"|\"pricing\"> with TabsTrigger onClick navigating via useNavigate — not a shared layout route, since each tab is a distinct top-level route with its own data-fetching hook"
    - "CreateBlogPostDto.body needs an explicit @ApiProperty({ type: 'object', additionalProperties: true }) — @ApiProperty() alone on a Record<string, unknown>-typed class field produces an empty object schema, which openapi-typescript compiles to the unusable Record<string, never> instead of Record<string, unknown>"

key-files:
  created:
    - apps/platform-admin/src/modules/content/use-blog-posts.ts
    - apps/platform-admin/src/modules/content/blog-posts-page.tsx
    - apps/platform-admin/src/modules/content/blog-post-form-page.tsx
    - apps/platform-admin/src/modules/content/use-pricing-plans.ts
    - apps/platform-admin/src/modules/content/pricing-plans-page.tsx
    - apps/platform-admin/src/modules/content/pricing-plan-form-dialog.tsx
    - apps/server/src/blog-posts/dto/blog-post-response.dto.ts
    - apps/server/src/pricing-plans/dto/pricing-plan-response.dto.ts
  modified:
    - apps/platform-admin/src/router.tsx
    - apps/platform-admin/src/lib/api/schema.d.ts
    - apps/server/src/blog-posts/blog-posts.controller.ts
    - apps/server/src/blog-posts/blog-posts.service.ts
    - apps/server/src/blog-posts/dto/create-blog-post.dto.ts
    - apps/server/src/pricing-plans/pricing-plans.controller.ts
    - apps/server/src/pricing-plans/pricing-plans.service.ts

key-decisions:
  - "Added BlogPostResponseDto/PricingPlanResponseDto + @ApiOkResponse/@ApiCreatedResponse to both controllers — same rationale 05-05/05-06 documented for Clinics/Leads: without a response DTO, openapi-typescript's generated schema.d.ts responses were content?: never, which would have broken the typed client at compile time the moment the screens read a response field. This was the third plan in a row confirming the pattern, exactly as 05-06's SUMMARY predicted."
  - "CreateBlogPostDto.body given an explicit additionalProperties: true schema hint — without it, openapi-typescript emitted Record<string, never> for the body field (an empty-object schema, not a permissive one), which fails to type-check against the parsed JSON.parse() result the form submits"
  - "BlogPostsService.findOne / PricingPlansService.findOne both now include { updatedBy: { select: { email: true } } } — mirrors Clinics/Leads' exact pattern, needed for the INFRA-05 trace line"
  - "Row-action Delete implemented as a fully self-contained per-row component (DeleteBlogPostAction/DeletePricingPlanAction) rather than page-level dialog state — no repo precedent existed for delete-from-a-list-row (Clinics/Leads only had detail-page or Select-driven mutations), so this pattern was hand-derived from the AlertDialog primitive's controlled-open API already used in lead-detail-page.tsx's Convert flow"
  - "PricingPlan.features dynamic list uses react-hook-form's useFieldArray with an internal { value: string }[] wrapper shape (not the raw string[] the DTO uses), since useFieldArray requires array items to carry a stable object identity for its row keys"

requirements-completed: [CMS-01, CMS-03, INFRA-04, INFRA-05]

coverage:
  - id: D1
    description: "Blog Posts list: DataTable with title/category/published Badge columns, Skeleton loading, error+Retry, 'No blog posts yet' empty state with New Post CTA; row-action Delete (icon Button, aria-label='Delete post') opens an AlertDialog ('Delete this post? This can't be undone.') before calling DELETE /blog-posts/:id"
    requirement: CMS-01
    verification:
      - kind: unit
        ref: "pnpm --filter platform-admin exec tsc -b && pnpm --filter platform-admin run build — both pass; grep confirms aria-label=\"Delete post\" present in blog-posts-page.tsx"
        status: pass
      - kind: integration
        ref: "curl smoke test: POST /blog-posts creates a post; a second POST with the same slug returns 409; GET /blog-posts/:id includes updatedBy.email after the create; PATCH {published:true} updates the field; DELETE returns 204 and a follow-up GET /blog-posts confirms it's gone. Test row deleted after verification."
        status: pass
    human_judgment: true
    rationale: "The live DataTable/AlertDialog/Skeleton visual rendering and the row-click-vs-delete-button click-target separation were not exercised in a real browser this session — no browser available in this execution context, same limitation documented in 05-05/05-06's SUMMARYs."
  - id: D2
    description: "Blog Post create/edit is a full-page Form (slug/title/excerpt/category/date/readTime/image/body/published); body is edited as raw JSON text only (Textarea, zod .refine validates parseable JSON before submit), never rendered as HTML anywhere in this admin UI; a 409 duplicate-slug conflict surfaces inline under the slug field; published Switch requires no confirmation; the INFRA-05 trace line renders in edit mode"
    requirement: "CMS-01, INFRA-05"
    verification:
      - kind: unit
        ref: "grep confirms zero occurrences of the raw-HTML-injection API name in blog-post-form-page.tsx and at least one JSON.parse() call; tsc -b/build pass"
        status: pass
      - kind: integration
        ref: "curl smoke test covers the same create/409/trace-line/publish-toggle round trip as D1 (form page submits to the same use-blog-posts.ts hooks verified there)"
        status: pass
    human_judgment: true
    rationale: "The live form-fill, zod .refine() JSON-validation error message, and inline 409 FormMessage rendering were not exercised in a real browser this session."
  - id: D3
    description: "Pricing Plans list: DataTable with name/monthlyPrice/published Badge/isPopular Badge columns, shared Content Tabs sub-nav, 'No pricing plans yet' empty state with New Plan CTA; row-action Delete (icon Button, aria-label='Delete plan') opens an AlertDialog ('Delete this plan? This can't be undone. It will no longer appear on the Prices page.') before calling DELETE /pricing-plans/:id"
    requirement: CMS-03
    verification:
      - kind: unit
        ref: "pnpm --filter platform-admin exec tsc -b && pnpm --filter platform-admin run build — both pass; grep confirms aria-label=\"Delete plan\" and the empty-state copy present"
        status: pass
      - kind: integration
        ref: "curl smoke test: POST /pricing-plans creates a plan with 2 features; PATCH {features:[]} succeeds with no validation error (zero-features-allowed confirmed live); GET /pricing-plans/:id includes updatedBy.email; DELETE returns 204 and a follow-up GET confirms it's gone. Test row deleted after verification. Pre-existing unrelated PricingPlan test rows in the shared dev DB (from an earlier plan's own testing) were left untouched, not created or removed by this plan."
        status: pass
    human_judgment: true
    rationale: "The live DataTable/Tabs/AlertDialog rendering was not exercised in a real browser this session."
  - id: D4
    description: "Pricing Plan create/edit is a Dialog Form (name/monthlyPrice/yearlyPrice/description/features/isPopular/published); features is a dynamic add/remove list allowing zero entries with no minimum enforced; the INFRA-05 trace line renders in edit mode"
    requirement: "CMS-03, INFRA-05"
    verification:
      - kind: unit
        ref: "grep confirms 'Add feature' present in pricing-plan-form-dialog.tsx; tsc -b/build pass"
        status: pass
      - kind: integration
        ref: "curl smoke test confirms PATCH {features:[]} against a plan that previously had 2 features succeeds with a 200 and an empty features array in the response — the exact zero-allowed semantics the dynamic list's remove-to-zero UI depends on server-side"
        status: pass
    human_judgment: true
    rationale: "The live add/remove-feature interaction, the dialog's own Skeleton-while-loading state on edit-open, and the trace line's rendering were not exercised in a real browser this session (D4's own plan-specified human-check)."

# Metrics
duration: ~50min
completed: 2026-08-14
status: complete
---

# Phase 05 Plan 07: Content Management — Blog Posts + Pricing Plans Summary

**Blog Posts (full-page create/edit, JSON-only body editing, publish toggle, delete) and Pricing Plans (Dialog create/edit with a dynamic zero-or-more features list, delete) screens, wired against the real BlogPostsModule/PricingPlansModule backend — completing CMS-01 and CMS-03's frontend and all 14 of Phase 5's requirement IDs.**

## Performance

- **Duration:** ~50 min
- **Completed:** 2026-08-14
- **Tasks:** 2
- **Files modified:** 15 (across 2 task commits)

## Accomplishments

- `/content/blog` list: `DataTable` with title/category/published `Badge` columns, shared Content `Tabs` sub-nav (Blog Posts / Pricing Plans), `Skeleton` loading, error+Retry, "No blog posts yet" empty state, row-action Delete (`aria-label="Delete post"`) with an `AlertDialog` confirmation
- `/content/blog/new` and `/content/blog/:id/edit`: a full-page `Form` (not a Dialog — body/excerpt/image are too large for a modal) with slug/title/excerpt/category/date/readTime/image/body/published fields; `body` is edited as raw JSON text only (`Textarea`, zod `.refine()` validates parseable JSON before submit, `JSON.parse()`'d immediately before the request), never rendered via any HTML-injection API anywhere in this admin UI; a 409 duplicate-slug conflict surfaces inline under the slug field; the `published` `Switch` needs no confirmation; the INFRA-05 trace line renders in edit mode
- `/content/pricing` list: `DataTable` with name/monthlyPrice/published/isPopular columns, the same shared Content `Tabs` sub-nav, "No pricing plans yet" empty state, row-action Delete (`aria-label="Delete plan"`) with an `AlertDialog` confirmation
- `PricingPlanFormDialog`: a `Dialog` `Form` with name/monthlyPrice/yearlyPrice/description/features(dynamic add/remove list via `useFieldArray`, zero allowed, no minimum)/isPopular/published; the INFRA-05 trace line renders in edit mode
- Backend: `BlogPostResponseDto`/`PricingPlanResponseDto` + `@ApiOkResponse`/`@ApiCreatedResponse` added to both controllers (completing the response-DTO treatment across all 4 of this phase's CRUD resources); both `findOne` services now include `updatedBy`; `CreateBlogPostDto.body` given an explicit `additionalProperties: true` schema hint so the generated client type is usable

## Task Commits

Each task was committed atomically:

1. **Task 1: Blog Posts — list, full-page create/edit form, publish toggle, delete** — `bbfc5cd` (feat)
2. **Task 2: Pricing Plans — list, dialog create/edit with dynamic features, delete** — `9b7ba44` (feat)

## Files Created/Modified

- `apps/platform-admin/src/modules/content/use-blog-posts.ts` — `useBlogPosts`/`useBlogPost`/`useCreateBlogPost`/`useUpdateBlogPost`/`useDeleteBlogPost` + local `ApiError`
- `apps/platform-admin/src/modules/content/blog-posts-page.tsx` — list screen with Tabs sub-nav and per-row delete
- `apps/platform-admin/src/modules/content/blog-post-form-page.tsx` — full-page create/edit form
- `apps/platform-admin/src/modules/content/use-pricing-plans.ts` — `usePricingPlans`/`usePricingPlan`/`useCreatePricingPlan`/`useUpdatePricingPlan`/`useDeletePricingPlan` + local `ApiError`
- `apps/platform-admin/src/modules/content/pricing-plans-page.tsx` — list screen with Tabs sub-nav and per-row delete
- `apps/platform-admin/src/modules/content/pricing-plan-form-dialog.tsx` — Dialog create/edit form with dynamic features list
- `apps/platform-admin/src/router.tsx` — `content/blog`, `content/blog/new`, `content/blog/:id/edit`, `content/pricing` routes added
- `apps/platform-admin/src/lib/api/schema.d.ts` — regenerated against the live server; `BlogPostResponseDto`/`PricingPlanResponseDto` now real, not `content?: never`
- `apps/server/src/blog-posts/dto/blog-post-response.dto.ts` — new response DTO
- `apps/server/src/pricing-plans/dto/pricing-plan-response.dto.ts` — new response DTO
- `apps/server/src/blog-posts/blog-posts.controller.ts` — `@ApiOkResponse`/`@ApiCreatedResponse` added
- `apps/server/src/blog-posts/blog-posts.service.ts` — `findOne` now includes `updatedBy`
- `apps/server/src/blog-posts/dto/create-blog-post.dto.ts` — `body` field given `additionalProperties: true`
- `apps/server/src/pricing-plans/pricing-plans.controller.ts` — `@ApiOkResponse`/`@ApiCreatedResponse` added
- `apps/server/src/pricing-plans/pricing-plans.service.ts` — `findOne` now includes `updatedBy`

## Decisions Made

See `key-decisions` in frontmatter. Summary: (1) added the missing response-DTO/`@ApiOkResponse` Swagger treatment to both controllers, the third and fourth resource in a row to need it (05-05 Clinics, 05-06 Leads, this plan's Blog Posts and Pricing Plans); (2) added an explicit `additionalProperties: true` hint to `CreateBlogPostDto.body` so the JSON-editing Textarea's parsed value type-checks against the generated client type; (3) added `updatedBy` includes to both `findOne` services for the trace line; (4) hand-derived a per-row `AlertDialog` delete pattern (no repo precedent — Clinics/Leads never had list-row delete); (5) wrapped `PricingPlan.features` in `{ value: string }[]` internally to satisfy `useFieldArray`'s object-identity requirement, mapped to/from `string[]` only at the DTO boundary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added BlogPostResponseDto/PricingPlanResponseDto + @ApiOkResponse/@ApiCreatedResponse — generated typed client had no real response shapes**
- **Found during:** Task 1, confirming `schema.d.ts` state before writing `use-blog-posts.ts` (per 05-06's SUMMARY explicitly flagging this as the expected Task 1 step for this plan)
- **Issue:** Neither `BlogPostsController` nor `PricingPlansController` declared `@ApiOkResponse`/`@ApiCreatedResponse`, so every generated response for `/blog-posts*`/`/pricing-plans*` was `content?: never`
- **Fix:** Added `blog-post-response.dto.ts`/`pricing-plan-response.dto.ts` + decorators on all methods of both controllers; regenerated `schema.d.ts` against a temporarily-started live server (`pnpm --filter server run start` with inline-exported dev env vars, per the known-issue guidance against touching `.env`)
- **Files modified:** `apps/server/src/blog-posts/dto/blog-post-response.dto.ts` (new), `apps/server/src/pricing-plans/dto/pricing-plan-response.dto.ts` (new), `apps/server/src/blog-posts/blog-posts.controller.ts`, `apps/server/src/pricing-plans/pricing-plans.controller.ts`, `apps/platform-admin/src/lib/api/schema.d.ts`
- **Verification:** Regenerated `schema.d.ts` shows real field types; `tsc -b`/`vite build` pass
- **Committed in:** `bbfc5cd` (blog-posts), `9b7ba44` (pricing-plans)

**2. [Rule 2 - Missing Critical] BlogPostsService.findOne / PricingPlansService.findOne now include updatedBy**
- **Found during:** Task 1/Task 2, writing each form's trace line
- **Issue:** Neither `findOne` loaded the `updatedBy` relation — INFRA-05's trace line had no data source without it
- **Fix:** Added `include: { updatedBy: { select: { email: true } } }` to both, mirroring Clinics/Leads' exact pattern
- **Files modified:** `apps/server/src/blog-posts/blog-posts.service.ts`, `apps/server/src/pricing-plans/pricing-plans.service.ts`
- **Verification:** curl smoke tests confirm `updatedBy.email` present on both resources after a create
- **Committed in:** `bbfc5cd`, `9b7ba44`

**3. [Rule 3 - Blocking] CreateBlogPostDto.body given an explicit additionalProperties: true schema hint**
- **Found during:** Task 1, `pnpm --filter platform-admin exec tsc -b` on `blog-post-form-page.tsx`'s `onSubmit`
- **Issue:** `@ApiProperty()` alone on a `Record<string, unknown>`-typed class field produced an empty-object OpenAPI schema (no properties, no `additionalProperties`), which `openapi-typescript` compiles to `Record<string, never>` — an unusable type that rejects the form's `JSON.parse(values.body)` result at compile time
- **Fix:** Changed the decorator to `@ApiProperty({ type: 'object', additionalProperties: true })`
- **Files modified:** `apps/server/src/blog-posts/dto/create-blog-post.dto.ts`
- **Verification:** Regenerated `schema.d.ts` shows `body: { [key: string]: unknown }` instead of `Record<string, never>`; `tsc -b` passes
- **Committed in:** `bbfc5cd`

**4. [Rule 3 - Blocking] `pnpm install` and `@repo/db` generate/build required before any tsc/build would run**
- **Found during:** Session start, first `pnpm --filter server exec tsc --noEmit` attempt
- **Issue:** This worktree had never run `pnpm install` (`node_modules` absent entirely) and `@repo/db`'s generated Prisma client/`dist` output didn't exist yet — same worktree-provisioning gap 05-06's SUMMARY documented for its own worktree
- **Fix:** Ran `pnpm install`, then `pnpm --filter @repo/db run db:generate` and `run build` with `DATABASE_URL` exported inline (never touching `.env`, per the known-issue guidance)
- **Files modified:** none (installs/builds only, no source changes)
- **Verification:** `pnpm --filter server exec tsc --noEmit -p tsconfig.build.json` passes clean afterward
- **Committed in:** N/A — build/install artifacts only, not committed

---

**Total deviations:** 4 auto-fixed (2 missing-critical, 2 blocking)
**Impact on plan:** All 4 were prerequisites for the plan's own stated acceptance criteria / `tsc -b`/`vite build` gates to pass, or for any command to run at all in this worktree. Deviations 1 and 2 are the exact "expected, not surprising" gaps 05-06's SUMMARY predicted for this plan. No scope creep beyond BlogPostsModule/PricingPlansModule's own frontend consumption.

## Issues Encountered

- No node_modules were installed in this worktree at session start, and `@repo/db` had no generated Prisma client/build output — resolved via `pnpm install` + `db:generate` + `build` before any other work (see Deviation 4). Worktree-provisioning state, not a plan-caused issue — same gap 05-06 hit in its own worktree.
- No browser was available in this execution context, so every `human-check`/interactive portion of both tasks' `<verify>` blocks (live Tabs navigation, DataTable rendering, AlertDialog confirmation clicks, the dynamic add/remove-feature interaction, Switch toggling) could not be exercised directly. Substituted with a thorough curl-based integration smoke test instead: full create → 409-duplicate → GET-with-updatedBy → PATCH (publish toggle / zero-features update) → DELETE-returns-204 → GET-confirms-gone round trip for both Blog Posts and Pricing Plans, run against a temporarily-started live server. All test rows created during verification were deleted afterward, leaving the shared dev DB clean for other worktree agents; pre-existing unrelated `PricingPlan` test rows found in the DB (from an earlier plan's own testing) were left untouched. These are recorded as `human_judgment: true` in the `coverage:` block above for the visual/interactive portions only — the functional round trip itself is `pass`, not `unknown`.
- Local Postgres was the pre-existing leftover container (`agent-a8976498097c8c381-postgres-1`, port 5432) noted in STATE.md's Blockers — used as-is per the known-issue guidance.

## User Setup Required

None — no external service configuration required. Local dev requires `docker compose up -d postgres` (or the existing leftover container) + `pnpm --filter server run start` with the env vars documented in `apps/server/src/config/env.validation.ts`, same as Plans 05-05/05-06.

## Next Phase Readiness

- Phase 5's entire requirement set (all 14 IDs across CLINIC-*, LEAD-*, CMS-*, INFRA-04, INFRA-05) is now satisfied on the frontend, alongside the backend modules built earlier in this phase
- The response-DTO/`@ApiOkResponse` pattern is now applied consistently across all 4 CRUD resources this phase built (Clinics, Leads, Blog Posts, Pricing Plans) — any future resource added to `apps/platform-admin` should follow the same pattern from its own Task 1, not treat it as a surprise deviation
- Not yet human-verified in a live browser (see Issues Encountered) — recommend a manual UAT pass (Tabs navigation, per-row Delete AlertDialogs, the dynamic features add/remove list, publish-toggle Switches) on the live app before Phase 5 is considered fully shippable
- Phase 6 (`apps/web` Integration) can now build against a fully populated, admin-editable Blog Posts / Pricing Plans backend instead of mock data

## Self-Check: PASSED

All created files verified present on disk (`use-blog-posts.ts`, `blog-posts-page.tsx`, `blog-post-form-page.tsx`, `use-pricing-plans.ts`, `pricing-plans-page.tsx`, `pricing-plan-form-dialog.tsx`, `blog-post-response.dto.ts`, `pricing-plan-response.dto.ts`) and both task commit hashes (`bbfc5cd`, `9b7ba44`) verified present in `git log`.

---
*Phase: 05-clinic-lead-content-management*
*Completed: 2026-08-14*
