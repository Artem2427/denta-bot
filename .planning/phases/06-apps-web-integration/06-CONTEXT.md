# Phase 6: apps/web Integration - Context

**Gathered:** 2026-08-14
**Status:** Ready for planning

<domain>
## Phase Boundary

The public marketing site (`apps/web`) is wired to the real backend built in Phases 4-5: Contacts and Demo form submissions persist as Leads via a new public `POST /leads` endpoint, and the Blog and Prices pages render real CMS content fetched from new public read endpoints, replacing `apps/web/modules/blog/_data.ts` and the hardcoded pricing data in `pricing-cards.tsx`/`comparison-table.tsx`. Requirements: LEAD-01, LEAD-02, CMS-02, CMS-04.

No auth work, no `apps/platform-admin` UI work, no real bot/chat integration — those are out of scope (already complete or explicitly deferred per PROJECT.md).

</domain>

<decisions>
## Implementation Decisions

### Public API surface (apps/server)
- **D-01:** Public reads get dedicated new routes, not the existing admin routes opened up with `@Public()`. New `GET /public/blog-posts`, `GET /public/blog-posts/:slug`, `GET /public/pricing-plans` — always published-only, no auth. Existing `GET /blog-posts`, `GET /pricing-plans` (used by `apps/platform-admin`) stay untouched and continue returning everything including drafts. — **Reversibility:** costly — **rationale:** once `apps/web` depends on these route shapes/paths, changing them means touching both the backend routes and every apps/web fetch call site.
- **D-02:** Blog detail lookup by slug gets a new `findBySlug` method on the public route (`BlogPost.slug` is already `@unique` in the schema — no migration needed), not a fetch-all-and-filter approach in `apps/web`.
- **D-03:** `POST /leads` (new, public) gets basic rate limiting (e.g. `@nestjs/throttler`, a few requests/minute per IP) from day one — it's a public write endpoint going live for the first time this phase, not something to defer again.
- **D-04:** New public routes live as a `PublicController` per feature module (e.g. `apps/server/src/blog-posts/public-blog-posts.controller.ts`, `public-pricing-plans.controller.ts`), keeping public/admin concerns visible at the file level within each existing module. `POST /leads` is added to the existing `LeadsController` with `@Public()` — it's a genuinely new action there, not a duplicate of an existing protected route.

### Pricing comparison-table dedup (CMS-04)
- **D-05:** `comparison-table.tsx`'s finer-grained matrix (numeric limits, per-feature checks) is derived from a union of all `PricingPlan.features[]` strings across plans as rows, with a check/dash per plan based on whether that plan's `features[]` includes it. No schema change — fully derivable from the existing `PricingPlan` model. — **Reversibility:** reversible — union-derivation is a pure frontend computation, easy to swap for a different approach later without a migration.
- **D-06:** Numeric-limit feature phrases (e.g. "До 100 записів/місяць" vs "До 500 записів/місяць") are **not** special-cased into named rows with parsed values — each distinct feature phrase becomes its own generic boolean row. No pattern-matching/parsing logic; matches how `features[]` is actually structured (each plan lists its own tier-specific phrase).

### Data-fetching approach
- **D-07:** `apps/web` uses server-side `fetch()` for public reads (blog/pricing) — Server Components fetch directly against `/public/*` endpoints at request time and pass data down as props. No TanStack Query added to `apps/web` (stays platform-admin-only); no new dependency.
- **D-08:** Blog search/category filtering stays client-side over a fetched array — the Server Component fetches all published posts once, `blog-filters.tsx` keeps its existing local-state filter logic unchanged, just fed real data instead of the `_data.ts` array. No query params on `GET /public/blog-posts`, no re-fetch-on-keystroke.
- **D-09:** `POST /leads` is called via a plain `fetch()` from the 'use client' form components (`contact-form.tsx`, the new Demo modal form) — same shape as the existing mocked `setTimeout`-based `onSubmit`, just hitting the real endpoint. No Server Action wrapper — keeps the existing `react-hook-form` + `zod` client-side validation flow unchanged.

### Demo page lead capture (LEAD-02 — no existing UI)
- **D-10:** A "Запросити доступ" / "Замовити демо"-style CTA button on `/demo`, placed in the header area near the "DEMO MODE" badge (visible regardless of which tab — bot or admin — the visitor is on), opens a modal reusing the Contacts form's field set and zod schema. — **Reversibility:** reversible — new isolated component, no dependency from existing Demo page code.
- **D-11:** The Demo modal form collects the same fields as Contacts: name (required), clinic (optional), contact = phone or email (required), message (optional) — same zod schema, submits with `source: demo` instead of `source: contacts`.

### Claude's Discretion
- Exact DTO shapes for the new public endpoints, response caching/revalidation strategy for `fetch()` calls (`revalidate`/`cache` options), and whether the Demo modal form shares a literal component with `contact-form.tsx` or is a parallel copy are left to planning/implementation — no explicit preference expressed beyond "reuse the same fields and schema."
- Exact `@nestjs/throttler` limits (requests/window) for `POST /leads` left to planning — "a few requests per minute per IP" is directional, not a hard number.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & scope
- `.planning/ROADMAP.md` §"Phase 6: apps/web Integration" — goal, success criteria, requirement mapping (LEAD-01, LEAD-02, CMS-02, CMS-04)
- `.planning/REQUIREMENTS.md` — full LEAD/CMS requirement text and acceptance detail
- `.planning/PROJECT.md` — v1.1 milestone goal, constraints (server-side fetch for `apps/web` reads per Target features), deferred-item list

### Prior phase decisions (still binding)
- `.planning/phases/04-backend-foundation-auth/04-CONTEXT.md` — D-08 (CORS already covers `apps/web`'s dev origin — no CORS work needed this phase), D-12 (`BlogPost` schema mirrors `apps/web/modules/blog/_data.ts`'s `Post`/`PostBodyBlock` shape field-for-field), D-13 (`PricingPlan` schema mirrors `pricing-cards.tsx`'s plan shape), D-14 (`Lead.source: contacts | demo`, `Lead.status` enums)
- `.planning/research/SUMMARY.md` §"Phase 5: apps/web integration" (originally numbered before the 4/5/6 phase split; content still applies to what is now Phase 6) — recommends server-side `fetch()` for public reads + client POST for the two forms; flags rate limiting on the public leads endpoint as an open item to revisit "when that endpoint is actually built" (now, this phase)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/modules/contacts/contact-form.tsx` — `react-hook-form` + `zod` schema (name/clinic/contact/message), submit UX (loading → success state with `sonner` toast) — the pattern (and possibly component) to reuse for the new Demo modal form (D-10/D-11)
- `apps/platform-admin/src/lib/api/client.ts` — existing `openapi-fetch` client pattern with auth interceptors; **not directly reusable** for `apps/web` since these are unauthenticated public calls, but shows the monorepo's established API-client conventions if a similar typed client is wanted for `apps/web`'s reads
- `apps/server/src/auth/decorators/public.decorator.ts` — existing `@Public()` decorator, already used to opt routes out of the global `AccessTokenGuard`

### Established Patterns
- `apps/server`'s existing modules (`leads`, `blog-posts`, `pricing-plans`) each have `Controller`/`Service`/`dto/` — new `PublicController`s should follow the same per-module structure (D-04)
- `apps/web/app/*/page.tsx` are Server Components importing client "modules" components (`blog-filters.tsx`, `pricing-cards.tsx` are `'use client'`) — the fetch-then-pass-as-props pattern (D-07) fits this existing split without restructuring
- `PricingPlansService.findAll()` already orders by `sortOrder` — the public endpoint should reuse the same ordering plus a `published: true` filter

### Integration Points
- `apps/server/src/leads/leads.controller.ts` — currently has no `POST /leads`; new public create route goes here (D-04)
- `apps/server/src/blog-posts/`, `apps/server/src/pricing-plans/` — each needs a new `PublicController` + service method(s) for published-only reads + slug lookup (D-01, D-02, D-04)
- `apps/web/modules/blog/_data.ts` — deleted once Blog list/detail fetch real data (CMS-02 explicitly requires removal)
- `apps/web/modules/prices/pricing-cards.tsx`, `apps/web/modules/prices/comparison-table.tsx` — both currently hardcode plan data independently; both become consumers of fetched `PricingPlan[]`, with comparison-table deriving its matrix per D-05/D-06
- `apps/web/app/demo/page.tsx` — currently just renders `<DemoTabs />` with intro copy; gains the new CTA + modal (D-10)

</code_context>

<specifics>
## Specific Ideas

No visual mockups referenced. The Demo modal should visually/behaviorally match the existing Contacts form (same fields, same validation, same submit/success states) — just triggered from a CTA + dialog instead of being a standalone page section, and tagged `source: demo`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Rate limiting on `POST /leads`, previously deferred at Phase 4, is now captured as in-scope D-03 rather than deferred again.)

</deferred>

---

*Phase: 6-apps/web Integration*
*Context gathered: 2026-08-14*
