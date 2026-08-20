---
phase: 06-apps-web-integration
plan: 03
subsystem: api
tags: [nestjs, prisma, nextjs, app-router, pricing, public-routes]

requires:
  - phase: 04-backend-foundation-auth
    provides: PlatformAdmin JWT auth, global fail-closed AccessTokenGuard, @Public() decorator
  - phase: 05-clinic-lead-content-management
    provides: PricingPlansController/PricingPlansService/PricingPlansModule scaffold, PricingPlanResponseDto
  - phase: 06-apps-web-integration
    plan: 01
    provides: getServerApiUrl()/getClientApiUrl() convention (apps/web/shared/lib/api-url.ts)
  - phase: 06-apps-web-integration
    plan: 02
    provides: PublicBlogPostsController pattern (class-level @Public(), least-privilege select, published-only filter), app/blog/error.tsx shape this plan replicates
provides:
  - "GET /public/pricing-plans — unauthenticated, published-only, least-privilege field selection"
  - "apps/web's Prices page fetches real CMS pricing content; hardcoded plans array removed from pricing-cards.tsx and comparison-table.tsx"
  - "apps/web/app/prices/error.tsx — second Next.js error.tsx boundary in the marketing site"
affects: []

actuals:
  tokens: 5138
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "ComparisonTable's feature matrix derived from Array.from(new Set(plans.flatMap((plan) => plan.features))) instead of hand-curated rows — any future plan/feature list change propagates automatically with zero comparison-table.tsx edits"

key-files:
  created:
    - apps/server/src/pricing-plans/public-pricing-plans.controller.ts
    - apps/web/modules/prices/types.ts
    - apps/web/app/prices/error.tsx
  modified:
    - apps/server/src/pricing-plans/pricing-plans.service.ts
    - apps/server/src/pricing-plans/pricing-plans.module.ts
    - apps/web/modules/prices/pricing-cards.tsx
    - apps/web/app/prices/page.tsx
    - apps/web/modules/prices/comparison-table.tsx

key-decisions:
  - "ComparisonTable's featureRows are derived via a union Set over all fetched plans' features[] (D-05/D-06), eliminating the former hand-duplicated 13-row table that had silently drifted out of sync with pricing-cards.tsx's own feature lists (03-REVIEW.md finding, now closed)."
  - "Zero-plans empty state and PricingCards/ComparisonTable's flexible grid/matrix logic live directly in page.tsx and the two module components respectively, matching Plan 06-02's Blog page split (fetch once at the route, pass plans down as props)."

patterns-established:
  - "Public read-only controller pairing (third instance this phase): PublicPricingPlansController sits alongside the existing protected PricingPlansController, sharing one PricingPlansService — same class-level @Public() + least-privilege select shape as Plan 06-02's PublicBlogPostsController."

requirements-completed: [CMS-04]

coverage:
  - id: D1
    description: "GET /public/pricing-plans is unauthenticated, published-only, and never leaks draft plans or admin-only fields (updatedById/updatedBy/createdAt/updatedAt); the existing protected GET /pricing-plans still requires a Bearer token"
    requirement: "CMS-04"
    verification:
      - kind: integration
        ref: "live curl against running apps/server: created one draft + one published pricing plan via the admin API, GET /public/pricing-plans included only the published plan (id/name/monthlyPrice/yearlyPrice/description/features/isPopular/sortOrder/published — no updatedById/createdAt/updatedAt), GET /pricing-plans (admin) still 401 without a Bearer token"
        status: pass
    human_judgment: false
  - id: D2
    description: "apps/web's Prices page fetches real published plans, renders PricingCards with the correct zero-one-many grid layout and plan.isPopular field, and shows a dedicated empty state ('Тарифи тимчасово недоступні' + CTA to routes.contacts) when zero plans exist"
    requirement: "CMS-04"
    verification:
      - kind: unit
        ref: "grep assertions (PricingPlan type export, isPopular/text-dt-teal usage in pricing-cards.tsx, getServerApiUrl usage in page.tsx) + tsc --noEmit clean (excl. pre-existing packages/ui csstype conflicts: button-group/calendar/sidebar/spinner)"
        status: pass
    human_judgment: true
    rationale: "The empty-state copy/CTA, the 1/2/3+ card grid layout (max-w-md centered vs. lg:grid-cols-2 vs. lg:grid-cols-3), and the checkmark color fix are visual — no browser-level test exists this phase to prove they render correctly against live seeded/empty data; a human should view /prices with 0, 1, 2, and 3+ published plans once."
  - id: D3
    description: "ComparisonTable derives its full feature matrix from the union of all fetched plans' features[] (no hand-curated rows), renders only when 2+ plans exist, and app/prices/error.tsx matches Blog's error boundary shape"
    requirement: "CMS-04"
    verification:
      - kind: unit
        ref: "grep assertions (flatMap in comparison-table.tsx, 'plans.length >= 2' in page.tsx, error.tsx file presence) + tsc --noEmit clean"
        status: pass
    human_judgment: true
    rationale: "The derived matrix's visual layout (overflow-x-auto horizontal scroll on narrow viewports, check/dash rendering per row) and the error.tsx boundary's visual copy are visual/interactive — no browser-level test exists this phase; a human should view the comparison table with 2+ plans and trigger the error boundary once."

duration: 26min
completed: 2026-08-15
status: complete
---

# Phase 6 Plan 3: Prices Public Read Integration Summary

**New published-only public route (`GET /public/pricing-plans`) on `apps/server`, wired into `apps/web`'s Prices page — collapsing `pricing-cards.tsx`/`comparison-table.tsx`'s hardcoded, drift-prone duplicate plan data into a single fetched `PricingPlan[]` source with a derived comparison matrix — closing CMS-04.**

## Performance

- **Duration:** 26 min
- **Started:** 2026-08-15T07:23:00Z
- **Completed:** 2026-08-15T07:48:52Z
- **Tasks:** 3
- **Files modified:** 8 (3 created, 5 modified)

## Accomplishments
- `PublicPricingPlansController` — new class-level `@Public()` controller alongside the existing protected `PricingPlansController`; `findAllPublished()` on `PricingPlansService` enforces `published: true` server-side with an explicit least-privilege Prisma `select` (excludes `updatedById`/`updatedBy`/`createdAt`/`updatedAt`), preserving the model's own `sortOrder: 'asc'` ordering
- Verified live via a real draft-vs-published round trip through the admin API and the new public route: the draft plan never leaked into `GET /public/pricing-plans`, and the admin `GET /pricing-plans` route is unaffected (still 401 without a Bearer token)
- `apps/web/app/prices/page.tsx` is now an async Server Component fetching `{getServerApiUrl()}/public/pricing-plans`, rendering a dedicated empty state ("Тарифи тимчасово недоступні" + "Зв'язатися з нами" CTA) when zero plans exist
- `pricing-cards.tsx` dropped its local hardcoded `plans` array in favor of a `plans` prop; grid layout now flexes to the real plan count (1 → centered single card, 2 → `lg:grid-cols-2`, 3+ → `lg:grid-cols-3`); renamed `plan.popular` → `plan.isPopular` (the real Prisma field); fixed the feature-checkmark icon's off-palette `text-green-500` to `text-dt-teal`
- `comparison-table.tsx` rewritten to derive its full matrix from `Array.from(new Set(plans.flatMap((plan) => plan.features)))` — no more hand-curated rows that could silently drift from each plan's actual `features[]` (closes the 03-REVIEW.md data-duplication finding); renders only when `plans.length >= 2`
- New `apps/web/app/prices/error.tsx` — matches Plan 06-02's `blog/error.tsx` shape/copy exactly, scoped to `/prices`

## Task Commits

Each task was committed atomically:

1. **Task 1: PublicPricingPlansController — published-only reads, least-privilege fields** - `cdf8217` (feat)
2. **Task 2: Prices page fetch + PricingCards wiring — isPopular rename, color fix, flexible grid** - `bc9bd79` (feat)
3. **Task 3: ComparisonTable derived-matrix rewrite (D-05/D-06) + conditional render + error boundary** - `03d7dbe` (feat)

_No separate plan-metadata commit yet — this worktree agent does not update STATE.md/ROADMAP.md; the orchestrator commits those centrally after merge._

## Files Created/Modified
- `apps/server/src/pricing-plans/public-pricing-plans.controller.ts` - new `PublicPricingPlansController`, class-level `@Public()`, `GET /`, delegates to `PricingPlansService.findAllPublished()`
- `apps/server/src/pricing-plans/pricing-plans.service.ts` - added `findAllPublished()` with explicit `select` and published-only filtering, `sortOrder: 'asc'`
- `apps/server/src/pricing-plans/pricing-plans.module.ts` - registered `PublicPricingPlansController` alongside the existing `PricingPlansController`
- `apps/web/modules/prices/types.ts` - new `PricingPlan` type shared by `pricing-cards.tsx` and `comparison-table.tsx`
- `apps/web/modules/prices/pricing-cards.tsx` - removed hardcoded `plans` array, receives `plans` via prop; `getGridClassName()` helper for 1/2/3+ layouts; `plan.popular` → `plan.isPopular`; checkmark `text-green-500` → `text-dt-teal`; `key={plan.id}`
- `apps/web/app/prices/page.tsx` - rewritten as an async Server Component fetching real published plans; zero-plans empty state; `PricingCards`/`ComparisonTable` gated behind plan count
- `apps/web/modules/prices/comparison-table.tsx` - `ComparisonTable({ plans })`; `featureRows` derived from `flatMap`+`Set`; header/rows generated dynamically per plan instead of 13 hand-written rows
- `apps/web/app/prices/error.tsx` - new error boundary, `'use client'`, "Щось пішло не так" copy + `Оновити` retry button, mirrors `blog/error.tsx`

## Decisions Made
- `featureRows` derived via a union `Set` over all fetched plans' `features[]` (D-05/D-06) rather than any hand-curated row list or numeric-limit parsing — eliminates the exact data-duplication issue flagged in `03-REVIEW.md` (comparison-table hand-duplicated pricing-cards' plan data with no shared source of truth).
- Grid layout and empty-state logic live in `page.tsx`/`pricing-cards.tsx` respectively rather than being pushed into a shared layout helper — matches Plan 06-02's established "fetch once at the route, pass plans down as props" split for Blog.

## Deviations from Plan

None - plan executed exactly as written. All three tasks' `<action>` steps were followed verbatim; no Rule 1-4 auto-fixes were required.

## Issues Encountered

- **Fresh worktree had no installed dependencies or generated Prisma client:** unlike Plans 06-01/06-02's worktrees (which had at least partial artifacts), this worktree had zero `node_modules` anywhere and no `packages/db/generated/prisma` or `packages/db/dist`. Resolved with a one-time `pnpm install` at the repo root, `prisma generate`, and `pnpm --filter @repo/db run build` before `pnpm --filter server run build` — the same one-time worktree setup step documented in both prior plans' summaries, not a plan deviation.
- **Root `.env` inaccessible via the file tools' permission policy:** as in Plans 06-01/06-02, `DATABASE_URL` and auth env vars (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS`) were supplied as inline shell env vars (verification-only, not committed) when running `prisma generate`/`migrate deploy` and `pnpm --filter server run start`. The environment note's already-running `denta-bot-postgres-1` container (confirmed reachable on port 5432 per this plan's environment note) was used directly — all curl-based acceptance criteria (draft-leak check, 401 on admin route) passed against it.
- **Pre-existing, out-of-scope TypeScript error in both `tsc --noEmit` runs:** `packages/ui/src/components/shadcn-ui/spinner.tsx(7,6)` — the same documented `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict (STATE.md Deferred Items) already excluded for `button-group.tsx`/`calendar.tsx`/`sidebar.tsx` in Plans 06-01/06-02, unrelated to any file this plan touches. Not fixed — out of scope per the deviation rules' scope boundary.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `GET /public/pricing-plans` is live, published-only, and least-privilege — the third and final `Public*Controller` this phase (after Plan 06-01's `POST /leads` and Plan 06-02's `PublicBlogPostsController`), completing the phase's public-route surface.
- `apps/web`'s Prices page is fully wired to real CMS content; both `pricing-cards.tsx` and `comparison-table.tsx` now share a single `PricingPlan` type and a single fetch point (`app/prices/page.tsx`) — any future pricing plan created via `apps/platform-admin` (Phase 5) renders on the live site, including in the derived comparison matrix, without further `apps/web` changes.
- No blockers. The pre-existing `packages/ui/spinner.tsx` csstype error (see Issues Encountered) is unrelated to this phase's scope and does not block `apps/web`'s dev/build.
- This was the last plan in Phase 6 (wave 3, depends on 06-02) — CMS-04 is now complete, closing the phase's remaining requirement alongside LEAD-01/LEAD-02 (Plan 06-01) and CMS-02 (Plan 06-02).

---
*Phase: 06-apps-web-integration*
*Completed: 2026-08-15*

## Self-Check: PASSED

All 3 created files verified present on disk (`public-pricing-plans.controller.ts`, `types.ts`, `error.tsx`); all 3 task commits (`cdf8217`, `bc9bd79`, `03d7dbe`) verified in `git log --all`.
