---
phase: 03-prices-blog
plan: 02
subsystem: apps/web blog surfaces
tags: [nextjs-app-router, mock-data, client-filtering, blog]
dependency graph:
  requires: [03-01 PremiumBadge, apps/web premium dt-* design system]
  provides: [/blog route, /blog/[slug] dynamic route, modules/blog/_data.ts mock content module]
  affects: [Header "Блог" nav link now resolves to a real page]
tech-stack:
  added: []
  patterns:
    - "Discriminated-union content-block renderer (PostBodyBlock kind: paragraph|heading|list|quote) instead of raw HTML/markdown string, avoiding dangerouslySetInnerHTML entirely"
    - "'use client' boundary isolated to the smallest subtree (blog-filters.tsx owns search/category state + filtered grid); hero and featured post stay server-rendered"
key-files:
  created:
    - apps/web/modules/blog/_data.ts
    - apps/web/modules/blog/post-body.tsx
    - apps/web/modules/blog/related-posts.tsx
    - apps/web/modules/blog/blog-filters.tsx
    - apps/web/app/blog/page.tsx
    - apps/web/app/blog/[slug]/page.tsx
  modified: []
decisions:
  - "Category filter uses strict === equality (no substring match); search filter is case-insensitive substring across title+excerpt; both combine with AND, matching D-02 exactly as first written in Task 2 — Task 3's review found no corrections needed"
  - "Posts grid/related-posts/featured-post markup uses Array.prototype.filter (never .sort()) so archived array order is always preserved when no filter is active"
metrics:
  duration: ~20min (Task 2 + Task 3 only; Task 1 was already complete)
  completed: 2026-08-10
status: complete
actuals:
  tokens: 8106
  tasks: 3
  commits: 2
---

# Phase 3 Plan 2: Blog listing + Blog Post detail Summary

Completed the Blog surfaces (`/blog` and `/blog/[slug]`) with real per-post content and functionally wired search/category filters, closing out all six routes of the marketing site.

## What Was Built

**Task 1 (already complete before this session, commit `e86ef2c`):** `apps/web/modules/blog/_data.ts` (featuredPost + 5 authored posts + `getPostBySlug`), `post-body.tsx` (content-block renderer), `related-posts.tsx`, and `apps/web/app/blog/[slug]/page.tsx` (async Server Component, awaits `params`, calls `notFound()` for unknown slugs). User approved this tracer slice via visual checkpoint before Task 2/3 proceeded.

**Task 2 — Blog listing page (commit `4234682`):**
- `apps/web/app/blog/page.tsx`: hero (h1 + subhead), a statically-rendered Featured Post section (whole card links to its own detail page, never affected by filters below), `<BlogFilters />` slot, and a decorative "Завантажити ще" button with no `onClick` (per D-03).
- `apps/web/modules/blog/blog-filters.tsx`: `'use client'` component owning `search`/`activeCategory` state, filtering the 5 non-featured `posts` (featured post is excluded from the filterable set), rendering a `md:grid-cols-2 lg:grid-cols-3` grid of `PremiumCard` post cards (image + `PremiumBadge` category overlay + date/readTime + title + excerpt + "Читати →"), with an empty-state message ("За вашим запитом нічого не знайдено") when the filtered array is empty.

**Task 3 — Filter predicate review (no code changes; verified in place):**
Reviewed the predicate written in Task 2 against D-02's four requirements — all already satisfied:
1. Category filter: `post.category === activeCategory` (exact match, no substring).
2. Search filter: `post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query)` (case-insensitive substring, either field).
3. Combined with logical AND: `return matchesCategory && matchesSearch;` in a single expression.
4. No `.sort()` anywhere in the file (`grep -c '.sort(' blog-filters.tsx` → 0) — `Array.prototype.filter` preserves the archived array order.

No corrections were needed, so Task 3 produced no file changes and no separate commit — its verification is folded into this Summary.

## Deviations from Plan

None — plan executed exactly as written. Task 2's filter predicate was written correctly on the first pass, so Task 3 (intended as a review/correction pass) found nothing to fix.

## Verification

- `pnpm --filter web exec tsc --noEmit`: zero new errors introduced by any blog file (`grep` for `apps/web/modules`/`apps/web/app` paths in the tsc output returns empty). The command's overall non-zero exit is caused by a **pre-existing** `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict in `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` — confirmed present at `HEAD` (commit `e86ef2c`, before this plan's Task 2/3 changes) by stashing this plan's new files and re-running `tsc`; the same errors appear identically. This is the same blocker already logged in `.planning/STATE.md`'s Blockers/Concerns section ("recommended before/during Phase 2"), unrelated to and not introduced by this plan.
- `grep -c "'use client'" apps/web/modules/blog/blog-filters.tsx` → 1; both `useState` calls present.
- `apps/web/app/blog/page.tsx` renders `featuredPost` outside `<BlogFilters />`; `BlogFilters` imports `posts` (5-entry array), not `featuredPost`.
- "Завантажити ще" button has no `onClick` prop.
- `grep -c '.sort(' apps/web/modules/blog/blog-filters.tsx` → 0.
- Manual end-of-phase human verification (per `workflow.human_verify_mode: end-of-phase`) is deferred to phase-level aggregation, per this plan's `success_criteria` note — not performed in this session beyond the already-approved Task 1 tracer checkpoint.

## Known Stubs

None. All 6 posts have real, non-empty, mutually-consistent body content (Task 1); the listing/detail pages render real mock data throughout.

## Self-Check: PASSED

- FOUND: apps/web/app/blog/page.tsx
- FOUND: apps/web/modules/blog/blog-filters.tsx
- FOUND: apps/web/modules/blog/_data.ts
- FOUND: apps/web/modules/blog/post-body.tsx
- FOUND: apps/web/modules/blog/related-posts.tsx
- FOUND: apps/web/app/blog/[slug]/page.tsx
- FOUND commit: e86ef2c
- FOUND commit: 4234682
