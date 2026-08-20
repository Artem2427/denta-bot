---
phase: 06-apps-web-integration
reviewed: 2026-08-15T00:00:00Z
depth: standard
files_reviewed: 33
files_reviewed_list:
  - apps/server/package.json
  - apps/server/src/blog-posts/blog-posts.module.ts
  - apps/server/src/blog-posts/blog-posts.service.ts
  - apps/server/src/blog-posts/public-blog-posts.controller.ts
  - apps/server/src/leads/dto/create-lead.dto.ts
  - apps/server/src/leads/leads.controller.ts
  - apps/server/src/leads/leads.module.ts
  - apps/server/src/leads/leads.service.ts
  - apps/server/src/pricing-plans/pricing-plans.module.ts
  - apps/server/src/pricing-plans/pricing-plans.service.ts
  - apps/server/src/pricing-plans/public-pricing-plans.controller.ts
  - apps/web/.env.example
  - apps/web/.gitignore
  - apps/web/app/blog/[slug]/page.tsx
  - apps/web/app/blog/error.tsx
  - apps/web/app/blog/page.tsx
  - apps/web/app/demo/page.tsx
  - apps/web/app/prices/error.tsx
  - apps/web/app/prices/page.tsx
  - apps/web/modules/blog/blog-filters.tsx
  - apps/web/modules/blog/post-body.tsx
  - apps/web/modules/blog/related-posts.tsx
  - apps/web/modules/blog/types.ts
  - apps/web/modules/contacts/contact-form.tsx
  - apps/web/modules/demo/demo-cta.tsx
  - apps/web/modules/demo/demo-lead-form.tsx
  - apps/web/modules/prices/comparison-table.tsx
  - apps/web/modules/prices/pricing-cards.tsx
  - apps/web/modules/prices/types.ts
  - apps/web/shared/components/premium-dialog.tsx
  - apps/web/shared/lib/api-url.ts
  - docker-compose.yml
  - pnpm-lock.yaml
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-08-15
**Depth:** standard
**Files Reviewed:** 33
**Status:** issues_found

## Summary

Reviewed the apps/web ↔ apps/server wiring: public read routes for blog posts and pricing plans, the new public rate-limited `POST /leads` endpoint, the Contacts/Demo lead forms, and the Blog/Prices pages converted from mock data to real fetches.

The published/draft leak boundary is implemented correctly — `findAllPublished()`/`findPublishedBySlug()` in both `BlogPostsService` and `PricingPlansService` filter `published: true` server-side (never trusting the caller) and use least-privilege `select` clauses that exclude `updatedById`/`updatedBy`/`createdAt`/`updatedAt`. `findPublishedBySlug` correctly returns a generic 404 for both "doesn't exist" and "exists but unpublished," avoiding an existence-disclosure oracle. No `dangerouslySetInnerHTML`/`eval`/hardcoded secrets were found; blog post body blocks are rendered as plain React children (auto-escaped), so there is no direct XSS vector in the reviewed rendering code.

However, two BLOCKER-level defects were found: (1) a hard contract mismatch means blog post body content can never actually render on the public site as currently wired, and (2) a validation gap in `CreateLeadDto` lets malformed data reach Prisma unvalidated on the public, unauthenticated `POST /leads` endpoint, risking unhandled 500s. Several WARNING-level robustness/config gaps are also flagged below.

## Critical Issues

### CR-01: Blog post body can never render — admin write contract rejects the shape the public reader requires

**File:** `apps/web/modules/blog/types.ts:15-19`, `apps/web/app/blog/[slug]/page.tsx:37`
**Issue:** The public blog detail page only renders body content when the fetched post's `body` is a JS array:

```ts
const blocks = Array.isArray(post.body) ? (post.body as PostBodyBlock[]) : [];
```

But the only way to create a `BlogPost.body` value is `apps/server/src/blog-posts/dto/create-blog-post.dto.ts`, whose `body` field is guarded by `@IsObject()`. `class-validator`'s `isObject()` implementation explicitly rejects arrays (`!Array.isArray(value)` — confirmed in `node_modules/.pnpm/class-validator@0.15.1/.../IsObject.js`). This means the admin API can never persist a top-level JSON array for `body`; every admin-created blog post's `body` will fail `Array.isArray()` on the frontend, `blocks` will always resolve to `[]`, and `PostBody` (`apps/web/modules/blog/post-body.tsx`) will silently render an empty `<article>` for every real post — the core "render CMS-authored blog content" feature is broken end-to-end. (There is no seed data for `BlogPost` in `packages/db/prisma/seed.ts` to mask this in dev/staging either.)
**Fix:** Either change `CreateBlogPostDto.body` to accept an array (e.g. `@IsArray()` + `@ValidateNested({ each: true })` against a `PostBodyBlockDto`), or change the frontend contract to expect an object wrapper (e.g. `{ blocks: PostBodyBlock[] }`) and update `blog-posts.service.ts`/`public-blog-posts.controller.ts` types plus `apps/web/modules/blog/types.ts` and `apps/web/app/blog/[slug]/page.tsx` to match. Add an integration/e2e test that creates a post via the real admin DTO and asserts the public detail page renders non-empty body content.

### CR-02: `CreateLeadDto` skips all validation on `email`/`phone` when both fields are supplied, letting malformed data reach Prisma on a public endpoint

**File:** `apps/server/src/leads/dto/create-lead.dto.ts:26-36`
**Issue:**

```ts
@ValidateIf((o: CreateLeadDto) => !o.phone)
@IsString()
@IsNotEmpty()
email?: string;

@ValidateIf((o: CreateLeadDto) => !o.email)
@IsString()
@IsNotEmpty()
phone?: string;
```

`class-validator`'s `@ValidateIf` gates *all* validators declared on that property, not just format checks — when its condition is `false`, the property receives **zero validation**, including the `@IsString()` type check. Since the condition on `email` is `!o.phone`, supplying any truthy `phone` value disables all validation on `email` (and vice versa). A public, unauthenticated caller (this is `POST /leads`, `@Public()`, not the two legitimate frontend forms which always send exactly one of the two) can submit e.g. `{ "name": "x", "phone": "1", "email": { "foo": "bar" }, "source": "contacts" }`. `ValidationPipe`'s `forbidNonWhitelisted`/`whitelist` only strip *unknown* properties — they do not fix an already-declared property's skipped type check. The malformed `email` object then flows unmodified into `leadsService.create()` → `this.prisma.lead.create({ data: dto })` against a `String?` column, which Prisma Client rejects at runtime with an uncaught `PrismaClientValidationError` (no try/catch in `LeadsService.create()`), surfacing as an unhandled 500 from a public route.
**Fix:** Validate both fields unconditionally for type/shape, and use `@ValidateIf` only to control the "at least one must be present" requirement, e.g.:

```ts
@IsOptional()
@IsEmail()
email?: string;

@IsOptional()
@IsString()
@Matches(/^\+?[0-9\s\-()]{7,20}$/)
phone?: string;

@ValidateIf((o: CreateLeadDto) => !o.phone && !o.email)
@IsNotEmpty({ message: 'Either email or phone is required' })
_atLeastOneContact?: never; // or a class-level @ValidateIf/custom validator asserting o.email || o.phone
```
(Or use a custom class-level validator that checks `o.email || o.phone` independently of per-field format checks.) Also wrap `LeadsService.create()` in a try/catch that maps Prisma validation errors to a `BadRequestException` as defense in depth.

## Warnings

### WR-01: Blog slug not URL-encoded before use in fetch path

**File:** `apps/web/app/blog/[slug]/page.tsx:24-25`
**Issue:** `slug` (from the dynamic route param) is interpolated directly into the fetch URL without `encodeURIComponent`:

```ts
fetch(`${apiUrl}/public/blog-posts/${slug}`, { next: { revalidate: 60 } })
```

If a slug contains reserved URL characters (`#`, `?`, `%`, etc. — plausible if an admin ever changes the slug field to something unusual, or via a crafted route), `fetch`'s URL parser will misinterpret part of the string (e.g. a `#` truncates everything after it into a fragment that's never sent), silently sending a different path than intended and producing a spurious 404 instead of an intended request.
**Fix:** `fetch(`${apiUrl}/public/blog-posts/${encodeURIComponent(slug)}`, ...)`.

### WR-02: `CreateLeadDto` has no format/length constraints — public endpoint accepts unbounded, unformatted strings

**File:** `apps/server/src/leads/dto/create-lead.dto.ts:15-46`
**Issue:** `name`, `clinicName`, `email`, `phone`, and `message` only have `@IsString()`/`@IsNotEmpty()` — there is no `@IsEmail()` on `email`, no phone-format check on `phone`, and no `@MaxLength()` anywhere. Since this is a public, unauthenticated, rate-limited-only-by-IP (5/min) endpoint, a caller can submit e.g. a multi-MB `message` or `name` string repeatedly (bounded only by Express's default body-size limit and the 5-req/min throttle across potentially many source IPs), or store non-email garbage in `email` (used later for admin-facing display and — per the Lead→Clinic `convert()` flow in `leads.service.ts` — as the new `Clinic.email`, itself a `@unique` column, so junk values could also cause confusing `ConflictException`s during conversion).
**Fix:** Add `@IsEmail()` to `email`, a `@Matches()` phone-format regex to `phone` (mirroring the frontend's `/^\+?[0-9\s\-()]{7,20}$/`), and `@MaxLength(...)` to `name`/`clinicName`/`message`/`email`/`phone`.

### WR-03: Blog category filter list is hardcoded and disconnected from real (dynamic) CMS data

**File:** `apps/web/modules/blog/blog-filters.tsx:17, 24-25`
**Issue:**

```ts
const categories = ['Всі', 'Автоматизація', 'Маркетинг', 'Управління клінікою'];
...
const matchesCategory = activeCategory === 'Всі' || post.category === activeCategory;
```

This was safe when the page used hardcoded mock data guaranteed to use exactly these four categories. Now that `posts` comes from the real backend (`BlogPost.category` is a free-text `String` column set by whoever creates the post via the admin API), an admin can create a published post with any category string. That post will always appear under "Всі" but can never be surfaced by any category filter button, and there's no button generated for its actual category — silent, permanent filter dead-end for any category outside the original four.
**Fix:** Derive the category list from the fetched `posts` array (e.g. `['Всі', ...new Set(posts.map(p => p.category))]`) instead of a hardcoded constant.

### WR-04: `getServerApiUrl`/`getClientApiUrl` silently fall back to `localhost:4000` with no production safeguard

**File:** `apps/web/shared/lib/api-url.ts:6, 10`
**Issue:** Both helpers unconditionally fall back to `http://localhost:4000` when `API_URL`/`NEXT_PUBLIC_API_URL` are unset. In a deployed environment where the env var is missing/mistyped, Server Components (`Blog`/`Prices` pages) will attempt to fetch `localhost:4000` from the server process — almost always unreachable in production — and every page load will hit the generic `throw new Error(...)` → `error.tsx` boundary with no indication of *why* (missing env var vs. backend down). Same for the client-side lead forms silently POSTing to `localhost:4000` from a visitor's browser.
**Fix:** At minimum, log a clear warning when falling back in a non-development `NODE_ENV`, or fail fast at startup/build if `API_URL`/`NEXT_PUBLIC_API_URL` are required for the target environment.

### WR-05: Per-IP throttling on `POST /leads` has no visible `trust proxy` handling

**File:** `apps/server/src/leads/leads.controller.ts:42-43`, `apps/server/src/leads/leads.module.ts:11`
**Issue:** `ThrottlerGuard` keys its bucket by the request's resolved client IP (`req.ip` under the hood). None of the reviewed files (nor `apps/server/src/main.ts`, checked for context) configure Express `trust proxy`. Deployed behind a reverse proxy/load balancer (the typical production topology), this means either: (a) every request appears to originate from the proxy's IP, collapsing the 5-req/min limit into one shared bucket for *all* visitors (legitimate traffic gets rate-limited by strangers), or (b) if `trust proxy` is later added naively, `X-Forwarded-For` becomes attacker-controllable, letting the 5-req/min limit be trivially bypassed by spoofing a new header value per request.
**Fix:** Explicitly configure `app.set('trust proxy', <expected-hop-count-or-proxy-list>)` in `main.ts` matching the real deployment topology, and add a regression note/test asserting the throttle key reflects the real client IP behind the production proxy.

## Info

### IN-01: `contact-form.tsx` and `demo-lead-form.tsx` duplicate ~90 lines of schema + submit logic

**File:** `apps/web/modules/contacts/contact-form.tsx:15-72`, `apps/web/modules/demo/demo-lead-form.tsx:15-75`
**Issue:** The zod schema, `EMAIL_REGEX`, and the entire submit handler (including the 429/`!res.ok`/catch branches) are copy-pasted between the two forms. The code comment in `demo-lead-form.tsx` notes this is a deliberate discretion call for two call sites, but it does mean any future validation-rule or error-copy change must be made in both places or they will silently drift.
**Fix:** Consider extracting the shared schema + submit logic into a `useLeadForm(source: LeadSource)` hook if a third call site ever appears.

### IN-02: `@ApiBearerAuth('access-token')` applies to the public `POST /leads` route too

**File:** `apps/server/src/leads/leads.controller.ts:34-41`
**Issue:** `@ApiBearerAuth('access-token')` is declared at the controller class level, so it also decorates the `@Public()` `POST /` route. Generated Swagger docs will show a lock icon / "requires bearer token" on an endpoint that explicitly does not require one, which can mislead API consumers or QA.
**Fix:** Move `@ApiBearerAuth('access-token')` off the class and onto each protected method individually, or add `@ApiSecurity({})`/an explicit "no auth required" override on the `create()` handler.

### IN-03: `PricingCards` uses feature text as the React `key`

**File:** `apps/web/modules/prices/pricing-cards.tsx:82`
**Issue:** `<li key={feature}>` — if a `PricingPlan.features` array (admin-authored, free text) ever contains a duplicate string, React will warn about duplicate keys and may misapply state/animation to the wrong list item on reorder.
**Fix:** Key by index within the plan's feature list (`key={\`${plan.id}-${idx}\`}`) since the list is render-only and not reordered.

---

_Reviewed: 2026-08-15_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
