---
phase: 03-prices-blog
reviewed: 2026-08-10T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - apps/web/shared/components/premium-switch.tsx
  - apps/web/shared/components/premium-badge.tsx
  - apps/web/modules/prices/pricing-cards.tsx
  - apps/web/modules/prices/comparison-table.tsx
  - apps/web/modules/prices/faq-accordion.tsx
  - apps/web/app/prices/page.tsx
  - apps/web/shared/components/premium-card.tsx
  - apps/web/modules/blog/_data.ts
  - apps/web/modules/blog/post-body.tsx
  - apps/web/modules/blog/related-posts.tsx
  - apps/web/modules/blog/blog-filters.tsx
  - apps/web/app/blog/page.tsx
  - apps/web/app/blog/[slug]/page.tsx
findings:
  critical: 0
  warning: 8
  info: 5
  total: 13
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-08-10T00:00:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Reviewed the Prices and Blog module surfaces (premium primitives, pricing cards/comparison table/FAQ, and blog listing/detail/related-posts/filters). No crash-level bugs, injection vectors, or hardcoded secrets were found; `tsc --noEmit` and `eslint` were run against every file in scope and both are clean for this file set (pre-existing `packages/ui` csstype errors are unrelated and out of scope). `next.config.js` does have `images.unsplash.com` whitelisted, so the blog's remote images will actually render.

The issues found are all correctness/quality-adjacent: a marketing claim (`-20%`) that doesn't match the computed numbers for two of three plans, two dead-looking interactive controls (Load More, Share) that give no feedback and do nothing, a "Related Posts" feature that isn't actually related-by-anything, an accessibility gap on the pricing toggle, and a couple of cross-module coupling / data-duplication smells worth cleaning up before this ships as "production-shaped."

## Warnings

### WR-01: "-20%" yearly-discount badge doesn't match the actual computed discount for 2 of 3 plans

**File:** `apps/web/modules/prices/pricing-cards.tsx:13-63,83`
**Issue:** The yearly toggle always displays a static `<PremiumBadge variant="teal">-20%</PremiumBadge>` regardless of which plan a visitor is looking at. Computed from the actual `monthlyPrice`/`yearlyPrice` values:
- Старт: (599−499)/599 ≈ 16.7%
- Бізнес: (1199−999)/1199 ≈ 16.7%
- Клініка: (2499−1999)/2499 = 20.0%
Only the "Клініка" plan actually has a 20% discount; the badge overstates the savings for the other two plans by ~3.3pp. This is a customer-facing pricing claim rendered directly from the same data that contradicts it.
**Fix:** Either normalize the yearly prices so all three plans hit exactly -20% (e.g. Старт 599→479, Бізнес 1199→959), or compute/display the badge per-plan instead of a single global label:
```tsx
const discountPct = Math.round(
  (1 - Number(plan.yearlyPrice) / Number(plan.monthlyPrice)) * 100,
);
```

### WR-02: Pricing yearly/monthly switch has no accessible name

**File:** `apps/web/modules/prices/pricing-cards.tsx:79-84`
**Issue:** `<PremiumSwitch checked={isYearly} onCheckedChange={setIsYearly} />` sits between two plain `<span>` labels ("Щомісяця" / "Щороку") with no `<label htmlFor>`, `aria-label`, or `aria-labelledby` connecting them to the control. Screen reader users hear only "switch, not checked" with no indication of what it toggles.
**Fix:**
```tsx
<PremiumSwitch
  checked={isYearly}
  onCheckedChange={setIsYearly}
  aria-label="Перемкнути між щомісячною та щорічною оплатою"
/>
```

### WR-03: "Завантажити ще" (Load more) button is non-functional

**File:** `apps/web/app/blog/page.tsx:79-87`
**Issue:** The button renders as a fully-styled call to action with no `onClick`, no `href`, and lives in a Server Component (`app/blog/page.tsx` has no `'use client'` directive), so it structurally cannot be wired for interactivity without further refactoring. As shipped it's a dead control that looks functional but does nothing when clicked — misleading to users.
**Fix:** Either remove the button until pagination is implemented, or wire it to real pagination state (which will require extracting it into a client component, similar to `BlogFilters`).

### WR-04: "Поділитися" (Share) button is non-functional

**File:** `apps/web/app/blog/[slug]/page.tsx:51-57`
**Issue:** Same pattern as WR-03 — the icon button has `aria-label="Поділитися"` (so it announces correctly to assistive tech) but no click handler at all, and `BlogPostPage` is an `async` Server Component so `onClick` cannot even be attached without extracting the button into a client subcomponent.
**Fix:** Extract into a small client component using the Web Share API with a clipboard fallback:
```tsx
'use client';
export function ShareButton({ title, url }: { title: string; url: string }) {
  const onShare = () =>
    navigator.share ? navigator.share({ title, url }) : navigator.clipboard.writeText(url);
  return (
    <PremiumButton variant="ghost" size="icon" aria-label="Поділитися" onClick={onShare}>
      <ShareNetwork weight="regular" className="h-5 w-5" />
    </PremiumButton>
  );
}
```

### WR-05: "Related Posts" isn't actually related to anything

**File:** `apps/web/modules/blog/related-posts.tsx:17-19`
**Issue:** `related` is computed as `[featuredPost, ...posts].filter(p => p.slug !== excludeSlug).slice(0, 3)` — it excludes the current post and takes the first 3 in array-declaration order. There is no matching on `category` or any other relation. The result: nearly every blog post's "Схожі статті" section shows the same 2-3 posts (`featuredPost`, `common-booking-mistakes`, `telegram-bots-medical`), regardless of the current post's actual topic. Section heading promises relevance the implementation doesn't deliver.
**Fix:** Filter by shared category first, falling back to the exclusion-only behavior when there aren't enough same-category posts:
```tsx
const pool = [featuredPost, ...posts].filter((p) => p.slug !== excludeSlug);
const sameCategory = pool.filter((p) => p.category === currentCategory);
const related = [...sameCategory, ...pool.filter((p) => p.category !== currentCategory)].slice(0, 3);
```

### WR-06: `PostBody` switch has no exhaustiveness check — new block kinds silently render nothing

**File:** `apps/web/modules/blog/post-body.tsx:13-61`
**Issue:** The `switch (block.kind)` over the `PostBodyBlock` discriminated union ends in `default: return null;`. If `PostBodyBlock` ever gets a new variant (e.g. `{ kind: 'image' }`), TypeScript won't flag the missing case here — the block will just silently disappear from the rendered article with no compile-time or runtime signal.
**Fix:** Replace the `default` branch with an exhaustiveness assertion:
```tsx
default: {
  const _exhaustive: never = block;
  return _exhaustive;
}
```

### WR-07: Blog module reaches into `modules/home` for a shared animation primitive

**File:** `apps/web/modules/blog/blog-filters.tsx:8`, `apps/web/modules/blog/related-posts.tsx:4`
**Issue:** Both files import `StaggerGrid`/`StaggerItem` from `@/modules/home/stagger-grid`. Per this project's own folder convention (`app/`=routes, `modules/<page>/`=page-scoped components, `shared/`=cross-page components/lib), a generic stagger-animation wrapper being owned by the `home` module and imported cross-module into `blog` creates coupling between otherwise-independent page modules — changes to the Home page's module can now break Blog, and it's not discoverable that `blog` depends on `home`.
**Fix:** Move `stagger-grid.tsx` to `shared/components/` and update all three modules (`home`, `blog`, and any future consumer) to import it from there.

### WR-08: Pricing comparison table duplicates plan/feature data with no shared source of truth

**File:** `apps/web/modules/prices/comparison-table.tsx:23-190` (vs. `apps/web/modules/prices/pricing-cards.tsx:13-63`)
**Issue:** `ComparisonTable` hand-writes every feature/plan cell (records, doctors, analytics tier, integrations, etc.) as static JSX, fully independent of the `plans` array in `pricing-cards.tsx` that drives the pricing cards above it. The two already required cross-checking by hand during this review to confirm they agree — any future edit to one (e.g. adding a feature to the Бізнес plan) has no compiler or runtime signal forcing the other to be updated, so they will silently drift.
**Fix:** Derive the comparison table rows from a single shared data structure (e.g. a `planFeatures` map keyed by feature name → per-plan boolean/value) consumed by both `PricingCards` and `ComparisonTable`.

## Info

### IN-01: Table headers missing `scope` attributes

**File:** `apps/web/modules/prices/comparison-table.tsx:26-29`
**Issue:** `<th>` cells for "Функція"/"Старт"/"Бізнес"/"Клініка" have no `scope="col"`, and the first `<td>` of each row (feature name) isn't marked as a row header either. This degrades table navigation for screen reader users.
**Fix:** Add `scope="col"` to the header `<th>` cells and consider `<th scope="row">` for the first cell of each data row.

### IN-02: Magic number `3` for related-posts count

**File:** `apps/web/modules/blog/related-posts.tsx:19`
**Issue:** `.slice(0, 3)` hardcodes the related-posts count inline.
**Fix:** Extract a named constant, e.g. `const RELATED_POSTS_COUNT = 3;`.

### IN-03: Blog category filter list is hand-maintained, not derived from data

**File:** `apps/web/modules/blog/blog-filters.tsx:17`
**Issue:** `const categories = ['Всі', 'Автоматизація', 'Маркетинг', 'Управління клінікою']` is manually kept in sync with the categories actually used in `posts` (`modules/blog/_data.ts`). Adding a post with a new category won't add a filter chip for it (the post would only be reachable via "Всі").
**Fix:** Derive dynamically: `const categories = ['Всі', ...new Set(posts.map((p) => p.category))];`

### IN-04: No `generateMetadata` for blog post detail route

**File:** `apps/web/app/blog/[slug]/page.tsx`
**Issue:** The dynamic blog post route has no `generateMetadata` export, so every post shares the app-level default `<title>`/description instead of per-post SEO metadata (title, description, OG image from `post.image`).
**Fix:** Add a `generateMetadata` function that reads the same `slug` param and returns `{ title: post.title, description: post.excerpt, openGraph: { images: [post.image] } }`, calling `notFound()` consistently if the post is missing.

### IN-05: FAQ accordion items keyed by array index

**File:** `apps/web/modules/prices/faq-accordion.tsx:50`
**Issue:** `<PremiumAccordionItem key={index} value={`item-${index}`}>` uses the array index for both `key` and the accordion `value`. Safe today since `faqs` is static and never reordered, but it's a pattern that breaks silently (wrong item stays "open" after reorder) if the list ever becomes dynamic or is edited to remove an early entry.
**Fix:** Derive a stable key/value from content, e.g. a slugified `faq.question`.

---

_Reviewed: 2026-08-10T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
