---
phase: 06-apps-web-integration
plan: 02
subsystem: api
tags: [nestjs, prisma, nextjs, app-router, blog, public-routes]

requires:
  - phase: 04-backend-foundation-auth
    provides: PlatformAdmin JWT auth, global fail-closed AccessTokenGuard, @Public() decorator
  - phase: 05-clinic-lead-content-management
    provides: BlogPostsController/BlogPostsService/BlogPostsModule scaffold, BlogPostResponseDto
  - phase: 06-apps-web-integration
    plan: 01
    provides: getServerApiUrl()/getClientApiUrl() convention (apps/web/shared/lib/api-url.ts), public-route pattern proven via POST /leads
provides:
  - "GET /public/blog-posts, GET /public/blog-posts/:slug — unauthenticated, published-only, least-privilege field selection"
  - "apps/web's Blog list/detail pages fetch real CMS content; modules/blog/_data.ts deleted"
  - "apps/web/app/blog/error.tsx — first Next.js error.tsx boundary in the marketing site"
affects: [06-03]

actuals:
  tokens: 7650
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Class-level @Public() on a dedicated PublicXController living alongside the protected admin controller in the same module directory — read-only, no write handlers, published/status filter enforced in the service layer never the controller"
    - "apps/web Server Components fetch directly against {getServerApiUrl()}/public/* at request time with next: { revalidate: 60 }, no client-side data-fetching library"
    - "Frontend module types.ts decoupled from mock _data.ts, with body typed unknown + Array.isArray() runtime guard for real-API JSON payloads that don't guarantee the mock's array shape"

key-files:
  created:
    - apps/server/src/blog-posts/public-blog-posts.controller.ts
    - apps/web/modules/blog/types.ts
    - apps/web/app/blog/error.tsx
  modified:
    - apps/server/src/blog-posts/blog-posts.service.ts
    - apps/server/src/blog-posts/blog-posts.module.ts
    - apps/web/modules/blog/post-body.tsx
    - apps/web/modules/blog/blog-filters.tsx
    - apps/web/app/blog/page.tsx
    - apps/web/modules/blog/related-posts.tsx
    - apps/web/app/blog/[slug]/page.tsx

key-decisions:
  - "post.body is typed unknown in apps/web/modules/blog/types.ts (not PostBodyBlock[]) because the real API's BlogPostResponseDto.body is Record<string, unknown> — callers guard with Array.isArray() before treating it as blocks, exactly as the plan specified."
  - "BlogFilters/RelatedPosts both switched from self-importing mock data to receiving posts via props — Blog list/detail pages (Server Components) are now the single fetch point per route."

patterns-established:
  - "Public read-only controller pairing: PublicBlogPostsController sits in the same directory as the existing protected BlogPostsController, sharing one BlogPostsService — mirrors the method-level @Public() pattern from Plan 06-01's POST /leads, but class-level since every route on this controller is public."

requirements-completed: [CMS-02]

coverage:
  - id: D1
    description: "GET /public/blog-posts and GET /public/blog-posts/:slug are unauthenticated, published-only, and never leak draft content or admin-only fields (updatedById/updatedBy/createdAt/updatedAt)"
    requirement: "CMS-02"
    verification:
      - kind: integration
        ref: "live curl against running apps/server: created one draft + one published post via the admin API, GET /public/blog-posts included only the published slug, GET /public/blog-posts/:slug returned 404 for the draft slug and 200 for the published slug, GET /blog-posts (admin) still 401 without a Bearer token"
        status: pass
    human_judgment: false
  - id: D2
    description: "apps/web's Blog list page (/blog) fetches real published posts, derives the hero from the newest post, and renders the correct empty/zero-one-many states per the UI-SPEC"
    requirement: "CMS-02"
    verification:
      - kind: unit
        ref: "grep assertions (Post type export, getServerApiUrl usage, line-clamp-2/3 classes) + tsc --noEmit clean (excl. pre-existing packages/ui/spinner.tsx csstype conflict)"
        status: pass
    human_judgment: true
    rationale: "The empty-state copy, one-post-omits-grid behavior, and card line-clamp overflow handling are visual — no browser-level test exists this phase to prove they render correctly against live seeded/empty data; a human should view /blog with 0, 1, and 2+ published posts once."
  - id: D3
    description: "apps/web's Blog detail page (/blog/[slug]) fetches a real post + related posts, 404s cleanly on unknown/unpublished slugs, guards non-array body content, and _data.ts is deleted"
    requirement: "CMS-02"
    verification:
      - kind: unit
        ref: "grep assertions (_data.ts absence, error.tsx presence, allPosts prop, Array.isArray guard) + tsc --noEmit clean (excl. pre-existing packages/ui/spinner.tsx csstype conflict)"
        status: pass
    human_judgment: true
    rationale: "notFound() 404 rendering, the app/blog/error.tsx boundary's visual layout, and PostBody's rendering of real (non-curated) CMS body content are visual/interactive — no browser-level test exists this phase; a human should visit an unknown slug and a real published slug once."

duration: 12min
completed: 2026-08-15
status: complete
---

# Phase 6 Plan 2: Blog Public Read Integration Summary

**New published-only public routes (`GET /public/blog-posts`, `GET /public/blog-posts/:slug`) on `apps/server`, wired end-to-end into `apps/web`'s Blog list/detail pages, replacing all mock data from `modules/blog/_data.ts` — closing CMS-02.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-15T07:30:00Z
- **Completed:** 2026-08-15T07:41:49Z
- **Tasks:** 3
- **Files modified:** 10 (3 created, 6 modified, 1 deleted)

## Accomplishments
- `PublicBlogPostsController` — new class-level `@Public()` controller alongside the existing protected `BlogPostsController`; `findAllPublished()`/`findPublishedBySlug()` on `BlogPostsService` enforce `published: true` server-side with an explicit least-privilege Prisma `select` (excludes `updatedById`/`updatedBy`/`createdAt`/`updatedAt`) and a deterministic `createdAt desc, id desc` ordering
- Verified live via a real draft-vs-published round trip through the admin API and the new public routes: draft posts never leak in the list or by direct slug lookup (404), the admin `GET /blog-posts` route is unaffected (still 401 without a Bearer token)
- `apps/web/app/blog/page.tsx` is now an async Server Component fetching `{getServerApiUrl()}/public/blog-posts`, rendering the newest published post as the hero, a dedicated empty state when zero posts exist, and omitting the filtered-posts grid entirely (not the "nothing found" message) when exactly one post exists
- `apps/web/app/blog/[slug]/page.tsx` fetches the post + full post list in parallel, calls `notFound()` on a 404 (unknown/unpublished slug), and guards `post.body` with `Array.isArray()` before passing to `PostBody`
- New `apps/web/app/blog/error.tsx` — the marketing site's first Next.js `error.tsx` boundary, matching the UI-SPEC's fetch-failure copy exactly
- `apps/web/modules/blog/_data.ts` deleted — every former consumer (`page.tsx`, `[slug]/page.tsx`, `blog-filters.tsx`, `related-posts.tsx`, `post-body.tsx`) now reads from the new `types.ts` + fetch-based data

## Task Commits

Each task was committed atomically:

1. **Task 1: PublicBlogPostsController — published-only reads, least-privilege fields** - `adfd1ba` (feat)
2. **Task 2: Blog list page — real fetch, hero, empty state, category types decoupled from mock data** - `815df25` (feat)
3. **Task 3: Blog detail page — real fetch, related posts, error boundary, delete _data.ts** - `56d9867` (feat)

_No separate plan-metadata commit yet — this worktree agent does not update STATE.md/ROADMAP.md; the orchestrator commits those centrally after merge._

## Files Created/Modified
- `apps/server/src/blog-posts/public-blog-posts.controller.ts` - new `PublicBlogPostsController`, class-level `@Public()`, `GET /` and `GET /:slug`, delegates to `BlogPostsService`
- `apps/server/src/blog-posts/blog-posts.service.ts` - added `findAllPublished()`/`findPublishedBySlug()` with explicit `select` and published-only filtering
- `apps/server/src/blog-posts/blog-posts.module.ts` - registered `PublicBlogPostsController` alongside the existing `BlogPostsController`
- `apps/web/modules/blog/types.ts` - new `Post`/`PostBodyBlock` types, `body: unknown` for the real API's `Record<string, unknown>` shape
- `apps/web/modules/blog/post-body.tsx` - `PostBodyBlock` import switched from `./_data` to `./types`
- `apps/web/modules/blog/blog-filters.tsx` - `posts` now arrives via prop; card title/excerpt gained `line-clamp-2`/`line-clamp-3`
- `apps/web/app/blog/page.tsx` - rewritten as an async Server Component fetching real published posts; empty state, hero, zero-one-many BlogFilters gating, "Завантажити ще" button removed
- `apps/web/modules/blog/related-posts.tsx` - `allPosts` now arrives via prop instead of self-importing `./_data`
- `apps/web/app/blog/[slug]/page.tsx` - fetches post + list in parallel, `notFound()` on 404, throws on other failures, `Array.isArray()` guard on `post.body`
- `apps/web/app/blog/error.tsx` - new error boundary, `'use client'`, "Щось пішло не так" copy + `Оновити` retry button
- `apps/web/modules/blog/_data.ts` - deleted

## Decisions Made
- `body` typed `unknown` (not `PostBodyBlock[]`) in `types.ts` per the plan's explicit rationale — the real API's `BlogPostResponseDto.body` is `Record<string, unknown>`, so every consumer guards with `Array.isArray()` at the boundary rather than trusting an unverified cast.
- Both `BlogFilters` and `RelatedPosts` moved from self-importing mock data to receiving `posts`/`allPosts` via props, making the two page-level Server Components (`page.tsx`, `[slug]/page.tsx`) the single fetch point per route.

## Deviations from Plan

None - plan executed exactly as written. All three tasks' `<action>` steps were followed verbatim; no Rule 1-4 auto-fixes were required.

## Issues Encountered

- **Worktree-local build/install artifacts missing:** this fresh worktree had no `node_modules` anywhere (root or workspace) and no generated Prisma client (`packages/db/generated/prisma`) or compiled `packages/db/dist`. Resolved with a one-time `pnpm install` at the repo root, `prisma generate`, and `pnpm --filter @repo/db run build` before `pnpm --filter server run build` — the same one-time worktree setup step documented in Plan 06-01's summary, not a plan deviation.
- **Root `.env` inaccessible via the file tools' permission policy:** as in Plan 06-01, `DATABASE_URL` and auth env vars were supplied as inline shell env vars (verification-only, not committed) when running `prisma generate`/`migrate deploy` and `pnpm --filter server run start`. The environment note's already-running `denta-bot-postgres-1` container was reused (the same port-5432 conflict from 06-01 recurred when `docker compose up -d postgres` was attempted) — all curl-based acceptance criteria (draft-leak check, 404, 200, 401) passed against it.
- **Pre-existing, out-of-scope TypeScript error in both `tsc --noEmit` runs:** `packages/ui/src/components/shadcn-ui/spinner.tsx(7,6)` — the same documented `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict (STATE.md Deferred Items) already excluded for `button-group.tsx`/`calendar.tsx`/`sidebar.tsx`, unrelated to any file this plan touches (confirmed present identically in Plan 06-01's verify runs). Not fixed — out of scope per the deviation rules' scope boundary.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `GET /public/blog-posts`/`GET /public/blog-posts/:slug` are live, published-only, and least-privilege — Plan 06-03 (Prices public reads, if scoped similarly) can follow the same `Public*Controller` pattern.
- `apps/web`'s Blog pages are fully wired to real CMS content; `_data.ts` is gone, so any future blog-post admin-authored content created via `apps/platform-admin` (Phase 5) now renders on the live site without further apps/web changes.
- No blockers. The pre-existing `packages/ui/spinner.tsx` csstype error (see Issues Encountered) is unrelated to this phase's scope and does not block `apps/web`'s dev/build — it only surfaces during a monorepo-wide `tsc --noEmit` pass that also type-checks `packages/ui`.

---
*Phase: 06-apps-web-integration*
*Completed: 2026-08-15*

## Self-Check: PASSED

All 3 created files verified present on disk (`public-blog-posts.controller.ts`, `types.ts`, `error.tsx`); `_data.ts` confirmed deleted; all 3 task commits (`adfd1ba`, `815df25`, `56d9867`) verified in `git log --all`.
