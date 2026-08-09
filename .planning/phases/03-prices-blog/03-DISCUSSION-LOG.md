# Phase 3: Prices & Blog - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-09
**Phase:** 3-Prices & Blog
**Areas discussed:** Blog post body content, Blog search/filter functionality, Blog Load More button

---

## Blog post body content

| Option | Description | Selected |
|--------|-------------|----------|
| Unique short bodies per post | Write a brief matching body (headings + paragraphs, same style as archived article) for each of the 5 other posts | ✓ |
| Reuse the one archived body for all | Every `/blog/[slug]` page shows the same archived article body, swapping only the header | |

**User's choice:** Unique short bodies per post
**Notes:** Design archive only fully wrote body content for the featured post; the other 5 need original supporting content grounded in their existing title/excerpt.

---

## Blog search & category filters

| Option | Description | Selected |
|--------|-------------|----------|
| Keep decorative, port as-is | Matches archive exactly — non-functional | |
| Make them functional | Real client-side search + category filtering over the 6 mock posts | ✓ |

**User's choice:** Make them functional
**Notes:** Archive has zero wiring (no onChange/onClick), but data is already local and the addition is small.

---

## Blog "Load More" button

| Option | Description | Selected |
|--------|-------------|----------|
| Omit the button | Drop it — nothing more to load with only 6 posts | |
| Keep it, decorative | Port as-is, purely visual, no click handler | ✓ |

**User's choice:** Keep it, decorative
**Notes:** Matches archive; BLOG-01 only requires showing all 6 posts, already satisfied by the grid.

---

## Claude's Discretion

- Mock-data file location/shape for blog posts, including the new `body` field structure
- Whether the pricing comparison table needs a new `PremiumTable` primitive or plain `<table>` + `dt-*` classes
- New premium primitives for Switch (billing toggle) and Badge (popular/category pills)
- `ImageWithFallback` porting approach (same call as Phase 2)
- Exact wording of the 5 new blog post bodies

## Deferred Ideas

None — discussion stayed within phase scope.
