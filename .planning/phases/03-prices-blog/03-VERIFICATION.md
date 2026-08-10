---
phase: 03-prices-blog
verified: 2026-08-10T00:00:00Z
status: human_needed
score: 13/13 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Visit /prices in a dev server. Toggle the billing switch (Щомісяця/Щороку) and confirm all 3 tier prices switch smoothly without a reload; confirm the Бізнес card visually shows the teal border + 'Популярний' badge and Старт/Клініка do not; expand/collapse each of the 7 FAQ accordion items; click each 'Обрати план' CTA and the closing 'Напишіть нам' CTA and confirm they navigate to /contacts."
    expected: "Billing toggle updates prices live with no console errors; Бізнес card is visually distinct; FAQ items expand/collapse via Radix; all CTAs land on /contacts."
    why_human: "Visual parity with the design archive, hover/interaction feel, and accordion animation cannot be confirmed by static grep/type-check — this is explicitly flagged by the plan's own <verification> section as a manual/end-of-phase check (workflow.human_verify_mode: end-of-phase)."
  - test: "Visit /blog. Type a search string that matches nothing (e.g. 'zzz') and confirm the empty-state message renders; type a string that matches a real post title/excerpt and confirm the grid narrows; click each category filter button and confirm exact-category narrowing; clear all filters and confirm the original 5-post order returns; confirm the featured post card never duplicates into the grid or moves; confirm 'Завантажити ще' does nothing when clicked (by design, D-03). Then open 3 different post detail pages (including the featured post) and confirm real, distinct body content renders, the CTA card buttons route to /demo and /contacts respectively, and the 'Схожі статті' related-posts links work."
    expected: "Filters visibly narrow/restore the grid; featured post stays static; each visited post shows unique, non-empty body content; all internal links resolve correctly."
    why_human: "Client-side filter interaction and real-content read-through require visual/interactive confirmation beyond what tsc/grep can prove — explicitly deferred to end-of-phase human check per the plan's <verification> section."
---

# Phase 3: Prices & Blog Verification Report

**Phase Goal:** Users can view pricing tiers and browse the blog listing and individual posts, completing all six routes of the site.
**Verified:** 2026-08-10
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/prices` renders all 3 tiers (Старт, Бізнес, Клініка) in that fixed order, static mock data | ✓ VERIFIED | `apps/web/modules/prices/pricing-cards.tsx:13-63` — `plans` array literal in exact order, mapped unconditionally |
| 2 | All 3 tiers render unconditionally, no empty state needed | ✓ VERIFIED | `plans.map(...)` over a static, always-3-element array — no conditional/loading branch |
| 3 | Only Бізнес shows "Популярний" badge + highlighted teal border | ✓ VERIFIED | `highlighted={plan.popular}` (only Бізнес has `popular: true`); badge rendered inside `{plan.popular && (...)}`; `grep -c 'Популярний'` (excluding imports) = 1 |
| 4 | Billing toggle switches all 3 tiers' price without reload; "-20%" badge visible next to yearly label | ✓ VERIFIED | `isYearly` React state via `PremiumSwitch`; price expr `{isYearly ? plan.yearlyPrice : plan.monthlyPrice} ₴` inside each card; static `<PremiumBadge variant="teal">-20%</PremiumBadge>` always rendered next to "Щороку" |
| 5 | 14-row comparison table + 7-item FAQ render fully, no rows/items dropped | ✓ VERIFIED | `grep -c '<tr' comparison-table.tsx` = 15 (1 header + 14 body); `grep -c 'question:' faq-accordion.tsx` = 7; row/question content matches 03-CONTEXT.md verbatim |
| 6 | Featured post (`automation-increases-profit`) renders once in Featured Post section, excluded from Posts Grid — grid shows exactly the other 5, no duplication | ✓ VERIFIED | `apps/web/app/blog/page.tsx` renders `featuredPost` statically outside `<BlogFilters />`; `blog-filters.tsx` imports only `posts` (5-entry array), never `featuredPost` |
| 7 | Posts Grid renders the 5 non-featured posts in archived order when no filter active | ✓ VERIFIED | `_data.ts`'s `posts` array order = common-booking-mistakes, telegram-bots-medical, dental-marketing-guide, missed-appointments, reminder-system; `blog-filters.tsx` uses `Array.prototype.filter` only, `grep -c '.sort('` = 0 |
| 8 | Empty-state message on zero filter matches (backstop) | ✓ VERIFIED | `blog-filters.tsx:65-68` — explicit `filtered.length === 0 ? <p>За вашим запитом нічого не знайдено</p> : <grid>` branch, reachable by any non-matching search string |
| 9 | Search + category filters functionally wired per D-02 (AND-combined); featured post stays static | ✓ VERIFIED | `blog-filters.tsx:23-32` — `matchesCategory && matchesSearch` single boolean expression; category exact `===`; search case-insensitive substring over title+excerpt; featured post section is a separate server-rendered block unaffected by `BlogFilters` |
| 10 | All 6 posts have non-empty body content | ✓ VERIFIED | `featuredPost.body` has 10 blocks (verbatim archived article); each of the 5 `posts` entries has 5-7 blocks (paragraph/heading/list), all original and non-empty |
| 11 | Ukrainian copy (titles, quotes, apostrophes, em-dashes) renders as-authored | ✓ VERIFIED | Direct string literals throughout `_data.ts`/`post-body.tsx`/`blog/[slug]/page.tsx` (e.g. `Зв&apos;язатись`, `— {author}` footer, blockquote text) — no `dangerouslySetInnerHTML`, no lossy transforms |
| 12 | Unknown slug calls `notFound()`, renders existing `app/not-found.tsx` | ✓ VERIFIED | `blog/[slug]/page.tsx:20-25` — `const post = getPostBySlug(slug); if (!post) notFound();` imported from `next/navigation`; `apps/web/app/not-found.tsx` exists and is the Next.js App Router convention target |
| 13 | Slug matching is case-sensitive exact match (backstop) | ✓ VERIFIED | `_data.ts:222-224` — `getPostBySlug` uses `post.slug === slug` strict equality, no `.toLowerCase()`/`.trim()` |

**Score:** 13/13 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/shared/components/premium-switch.tsx` | Radix Switch wrapper, `dt-*` tokens | ✓ VERIFIED | Exports `PremiumSwitch`, checked/unchecked state classes, imported/used in pricing-cards.tsx |
| `apps/web/shared/components/premium-badge.tsx` | cva-based badge, teal/coral/navy/outline variants | ✓ VERIFIED | Exports `PremiumBadge` + `premiumBadgeVariants`, 4 variants present, `asChild` via `Slot.Root`; used in prices + blog |
| `apps/web/shared/components/premium-card.tsx` (modified) | optional `highlighted` prop | ✓ VERIFIED | `highlighted?: boolean` conditionally appends `border-2 border-dt-teal relative` |
| `apps/web/modules/prices/pricing-cards.tsx` | billing toggle + 3-tier grid | ✓ VERIFIED | Full client component as described above |
| `apps/web/modules/prices/comparison-table.tsx` | 14-row feature matrix | ✓ VERIFIED | Server component, hand-unrolled 14 `<tr>` rows |
| `apps/web/modules/prices/faq-accordion.tsx` | 7-item FAQ, distinct from Contacts' FAQ | ✓ VERIFIED | Separate file, uses `PremiumAccordion*` primitives, 7 items |
| `apps/web/app/prices/page.tsx` | `/prices` route | ✓ VERIFIED | Composes `PricingCards` → `ComparisonTable` → FAQ section + closing CTA |
| `apps/web/modules/blog/_data.ts` | mock data + `getPostBySlug` | ✓ VERIFIED | `featuredPost`, `posts` (5), `PostBodyBlock`/`Post` types, strict-equality lookup |
| `apps/web/modules/blog/post-body.tsx` | content-block renderer | ✓ VERIFIED | Handles paragraph/heading/list/quote via plain JSX, no `dangerouslySetInnerHTML` |
| `apps/web/modules/blog/related-posts.tsx` | self-excluding related posts | ✓ VERIFIED | Excludes current slug, takes first 3 of remaining (see WR-05 quality note below — not a must-have failure) |
| `apps/web/modules/blog/blog-filters.tsx` | search + category filter, filtered grid, empty state | ✓ VERIFIED | `'use client'`, both `useState` calls present, AND-combined predicate, empty-state branch |
| `apps/web/app/blog/page.tsx` | `/blog` route | ✓ VERIFIED | Hero + static Featured Post + `BlogFilters` + decorative Load More |
| `apps/web/app/blog/[slug]/page.tsx` | `/blog/[slug]` dynamic route | ✓ VERIFIED | Async Server Component, awaits `params`, calls `notFound()`, renders full post detail + CTA + related posts |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `prices/page.tsx` | `pricing-cards.tsx` billing state | `isYearly` conditional price string | ✓ WIRED | `{isYearly ? plan.yearlyPrice : plan.monthlyPrice} ₴` |
| `pricing-cards.tsx` | `PremiumCard(highlighted)` + `PremiumBadge('Популярний')` | applied only to Бізнес | ✓ WIRED | `highlighted={plan.popular}`, badge inside `plan.popular &&` guard |
| `pricing-cards.tsx` CTA buttons | `/contacts` | `PremiumButton asChild Link` | ✓ WIRED | `<Link href={routes.contacts}>Обрати план</Link>` |
| `prices/page.tsx` closing CTA | `/contacts` | `Link` | ✓ WIRED | `<Link href={routes.contacts}>Напишіть нам →</Link>` |
| `blog/page.tsx` | `blog-filters.tsx` → `_data.ts` posts | search+category reduces rendered grid | ✓ WIRED | `blog-filters.tsx` imports `posts`, filters via `Array.prototype.filter`, renders `filtered` |
| `blog/[slug]/page.tsx` | `getPostBySlug` → `notFound()` → `app/not-found.tsx` | undefined slug branch | ✓ WIRED | Confirmed above |
| post/featured/related-post `Link`s | `/blog/[slug]` | `routes.blogPost(slug)` | ✓ WIRED | Used consistently across `blog/page.tsx`, `blog-filters.tsx`, `related-posts.tsx` |
| `blog/[slug]/page.tsx` CTA card buttons | `/demo`, `/contacts` | `PremiumButton asChild Link` | ✓ WIRED | `routes.demo` and `routes.contacts` both linked |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Comparison table row count (14 body + 1 header) | `grep -c '<tr' comparison-table.tsx` | 15 | ✓ PASS |
| Prices FAQ item count | `grep -c 'question:' faq-accordion.tsx` | 7 | ✓ PASS |
| "Популярний" appears exactly once (non-import) | `grep -v '^import' pricing-cards.tsx \| grep -c 'Популярний'` | 1 | ✓ PASS |
| Blog posts have `slug:` fields (6 posts + type + fn param) | `grep -c 'slug:' _data.ts` | 8 (1 type decl + 1 featuredPost + 5 posts + 1 fn param) | ✓ PASS |
| No `.sort()` in blog-filters (order preservation) | `grep -c '.sort(' blog-filters.tsx` | 0 | ✓ PASS |
| Full `apps/web` typecheck | `pnpm --filter web exec tsc --noEmit` | Exits non-zero, but only from pre-existing `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` csstype duplicate-resolution errors (unrelated to this phase, confirmed present before this phase's changes per 03-02-SUMMARY.md) | ✓ PASS (no errors in any phase-3 file) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PRICE-01 | 03-01-PLAN.md | Prices page with all tiers, ported copy | ✓ SATISFIED | `/prices` route + all 5 truths above |
| BLOG-01 | 03-02-PLAN.md | Blog listing showing all 6 mock posts | ✓ SATISFIED | Featured post (1) + grid (5) = 6, truths 6-9 above |
| BLOG-02 | 03-02-PLAN.md | Individual Blog Post at `/blog/[slug]` with post content | ✓ SATISFIED | Truths 10-11 above |
| BLOG-03 | 03-02-PLAN.md | Unknown slug shows Not Found | ✓ SATISFIED | Truths 12-13 above |

No orphaned requirements — REQUIREMENTS.md's Phase 3 traceability row (PRICE-01, BLOG-01, BLOG-02, BLOG-03) exactly matches the requirement IDs declared across both plans' frontmatter.

### Anti-Patterns Found

No debt markers (`TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`) found in any of the 13 phase-3 files. One incidental match on the literal word "placeholder" in `blog-filters.tsx` is the legitimate HTML `placeholder="Пошук статей..."` input attribute, not a stub marker.

The prior code review (`03-REVIEW.md`, 0 critical / 8 warning / 5 info) flagged several quality issues that do not fail any must-have truth and are advisory per this project's review policy:
- **WR-01:** the static "-20%" badge overstates the discount for Старт/Бізнес (actual ~16.7%, only Клініка is truly -20%) — faithfully ported from the design archive's own non-per-plan badge, not a fabrication introduced by this phase.
- **WR-05:** `RelatedPosts` excludes the current slug but doesn't actually match by category/topic — the must-have only required self-exclusion + first-3, which is met; "relatedness" quality is a legitimate follow-up, not a phase-goal blocker.
- **WR-03/WR-04:** "Завантажити ще" and "Поділитися" buttons are non-functional — WR-03 is explicit design decision D-03 (decorative, no handler by intent); WR-04 (Share) was not a must-have and doesn't block BLOG-01/02/03.

None of these affect phase-goal achievement; they are pre-existing/advisory per the phase's own decisions and code review triage.

## Human Verification Required

See frontmatter `human_verification` — 2 items covering `/prices` and `/blog` end-to-end visual/interactive confirmation, both explicitly deferred to end-of-phase human check by the plans' own `<verification>` sections (`workflow.human_verify_mode: end-of-phase`). Note: the Task-1 tracer slice of each plan was already visually approved by the user mid-execution (per both SUMMARYs), but that predates Task 2/3's additions (badges, comparison table, FAQ, filters, related posts) — a full end-of-phase pass has not yet been recorded.

## Gaps Summary

No gaps. All 13 must-have truths (5 from 03-01, 8 from 03-02) and all 4 roadmap Success Criteria are verified in the codebase via direct code inspection, automated grep checks matching the plans' own `<verify>` commands, and a typecheck run confirming zero errors originate from any phase-3 file. All six site routes (`/`, `/contacts`, `/demo`, `/prices`, `/blog`, `/blog/[slug]`) are now complete, and the header nav (`Ціни`/`Блог`) resolves to real pages. The only open item is the human visual/interactive pass both plans explicitly deferred to end-of-phase — this is a process step, not a code defect.

---

*Verified: 2026-08-10*
*Verifier: Claude (gsd-verifier)*
