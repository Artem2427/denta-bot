# Phase 6: apps/web Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-14
**Phase:** 6-apps/web Integration
**Areas discussed:** Public API surface, Pricing comparison-table dedup, Data-fetching approach, Demo lead capture

---

## Public API surface

| Question | Options | Selected |
|---|---|---|
| Route shape for public reads | Separate public routes / Same routes opened with @Public() | ✓ Separate public routes |
| Blog detail lookup by slug | New findBySlug on public route / Fetch all, filter in apps/web | ✓ New findBySlug on public route |
| POST /leads spam protection | Basic rate limiting now / Still defer, ship unprotected | ✓ Basic rate limiting now |
| Public route module layout | New PublicController per module / You decide | ✓ New PublicController per module |

**Notes:** Existing admin routes (`GET /blog-posts`, `GET /pricing-plans`, `LeadsController`) are protected and used by `apps/platform-admin`; new public routes are additive, not a modification of those. `BlogPost.slug` is already `@unique`, so `findBySlug` needs no migration.

---

## Pricing comparison-table dedup

| Question | Options | Selected |
|---|---|---|
| How CMS-04's dedup resolves given the PricingPlan schema doesn't support the current comparison-table's structured matrix | Derive from features[] union / Extend schema with structured fields / Drop the comparison table | ✓ Derive from features[] union |
| Numeric-limit feature phrases (e.g. "До 100 записів/місяць" vs "До 500...") | Fine as generic boolean rows / Special-case into named rows with parsed values | ✓ Fine as generic boolean rows |

**Notes:** No schema migration needed. Accepted tradeoff: comparison table loses today's hand-curated numeric-row framing in exchange for being fully data-driven with zero backend changes.

---

## Data-fetching approach

| Question | Options | Selected |
|---|---|---|
| Server-side fetch() vs TanStack Query for apps/web reads | Server-side fetch() / TanStack Query on apps/web too | ✓ Server-side fetch() |
| Blog search/filter location | Stay client-side over fetched array / Move server-side with query params | ✓ Stay client-side |
| How POST /leads is called from client form components | Plain fetch() from client component / Next.js Server Action | ✓ Plain fetch() |

**Notes:** Confirms Phase 4's pre-existing research recommendation still holds even after platform-admin adopted TanStack Query in Phase 5 — apps/web's needs (public SSR reads, two simple form POSTs) don't warrant the added dependency.

---

## Demo lead capture

| Question | Options | Selected |
|---|---|---|
| Trigger for lead capture on /demo (no existing form) | CTA + modal reusing Contacts fields / Inline form at page bottom / In-chat capture at end of bot scenario | ✓ CTA + modal reusing Contacts fields |
| Field set | Same as Contacts (name, clinic, contact, message) / Trimmed (name + contact only) | ✓ Same as Contacts |
| CTA placement | Header area near DEMO MODE badge / Below tabs as closing CTA | ✓ Header area near DEMO MODE badge |

**Notes:** This was the one requirement (LEAD-02) in this phase with no existing UI surface to attach to — codebase scouting found the Demo page is purely a scripted chat sim + admin-panel sim with zero contact-collection fields anywhere. User initially deferred this area, then chose to resolve it after seeing it flagged again at the wrap-up gate.

---

## Blog featured-post derivation (surfaced by research, post-discussion)

| Question | Options | Selected |
|---|---|---|
| How should the Blog hero "featured post" be chosen, given BlogPost has no `featured` field? | Newest published post / Drop the featured-post hero section / Add a `featured: boolean` field to BlogPost (schema migration) | ✓ Newest published post |

**Notes:** The researcher found this gap by reading the real `BlogPost` Prisma schema against `apps/web/app/blog/page.tsx`'s hardcoded `featuredPost` mock export — CONTEXT.md's original discussion didn't surface it. Resolved as D-12 and folded back into `06-CONTEXT.md` before planning.

---

## Claude's Discretion

- Exact DTO shapes for the new public endpoints
- Response caching/revalidation strategy for `fetch()` calls (`revalidate`/`cache` options)
- Whether the Demo modal form shares a literal component with `contact-form.tsx` or is a parallel copy
- Exact `@nestjs/throttler` limits (requests/window) for `POST /leads`

## Deferred Ideas

None — discussion stayed within phase scope.
