# Phase 6: apps/web Integration - Research

**Researched:** 2026-08-14
**Domain:** NestJS public API surface (rate-limited write + published-only reads) + Next.js 16 App Router server-side data fetching
**Confidence:** HIGH

## Summary

This phase wires two existing mocked flows in `apps/web` to the real `apps/server` backend built in Phases 4-5: (1) the Contacts form and a new Demo modal form POST to a new public `POST /leads` endpoint, tagged `source: contacts`/`source: demo`; (2) the Blog and Prices pages fetch real, published-only content from two new public read endpoints, replacing `apps/web/modules/blog/_data.ts` and the hardcoded arrays in `pricing-cards.tsx`/`comparison-table.tsx`.

All the moving parts already exist in a form that generalizes cleanly: `apps/server` has three modules (`leads`, `blog-posts`, `pricing-plans`) each with an established `Controller`/`Service`/`dto/` shape (confirmed by reading all three), a working `@Public()` decorator + fail-closed `AccessTokenGuard`, and a `Lead`/`BlogPost`/`PricingPlan` Prisma schema that already matches `apps/web`'s current mock-data shapes field-for-field (per Phase 4's D-12/D-13). `apps/web` has an established Server Component (`page.tsx`) → client "module" component (`'use client'`) split already in place for all three target pages, and a working `react-hook-form` + `zod` Contacts form whose validation/submit-state pattern is the direct template for the new Demo modal.

The one genuinely new piece of infrastructure is rate limiting: `@nestjs/throttler` is not yet a dependency anywhere in the monorepo. It is a legitimate, actively maintained NestJS-org package (verified via package-legitimacy check and npm registry: v6.5.0, published 2025-12-02, 3.6M weekly downloads, no postinstall script) and its per-route application (`@UseGuards(ThrottlerGuard)` + `@Throttle(...)` on the single new `POST /leads` handler, no global `APP_GUARD` registration) is a well-documented pattern that avoids rate-limiting the rest of the API.

**Primary recommendation:** Add three files per feature module (`public-blog-posts.controller.ts`, `public-pricing-plans.controller.ts`, plus a `create-lead.dto.ts` + a new `POST /leads` handler on the existing `LeadsController`), install `@nestjs/throttler` for that one route only, and fetch server-side in `apps/web`'s three `page.tsx` files with plain `fetch()` (default Next.js caching semantics — no experimental Cache Components flag is enabled in this project, so standard `cache`/`next.revalidate` options apply as documented).

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Public reads get dedicated new routes, not the existing admin routes opened up with `@Public()`. New `GET /public/blog-posts`, `GET /public/blog-posts/:slug`, `GET /public/pricing-plans` — always published-only, no auth. Existing `GET /blog-posts`, `GET /pricing-plans` (used by `apps/platform-admin`) stay untouched and continue returning everything including drafts. — **Reversibility:** costly.
- **D-02:** Blog detail lookup by slug gets a new `findBySlug` method on the public route (`BlogPost.slug` is already `@unique` in the schema — no migration needed), not a fetch-all-and-filter approach in `apps/web`.
- **D-03:** `POST /leads` (new, public) gets basic rate limiting (e.g. `@nestjs/throttler`, a few requests/minute per IP) from day one.
- **D-04:** New public routes live as a `PublicController` per feature module (e.g. `apps/server/src/blog-posts/public-blog-posts.controller.ts`, `public-pricing-plans.controller.ts`). `POST /leads` is added to the existing `LeadsController` with `@Public()`.
- **D-05:** `comparison-table.tsx`'s finer-grained matrix is derived from a union of all `PricingPlan.features[]` strings across plans as rows, with a check/dash per plan based on whether that plan's `features[]` includes it. No schema change. — **Reversibility:** reversible.
- **D-06:** Numeric-limit feature phrases are **not** special-cased into named rows with parsed values — each distinct feature phrase becomes its own generic boolean row.
- **D-07:** `apps/web` uses server-side `fetch()` for public reads (blog/pricing) — Server Components fetch directly against `/public/*` endpoints at request time and pass data down as props. No TanStack Query added to `apps/web`.
- **D-08:** Blog search/category filtering stays client-side over a fetched array — the Server Component fetches all published posts once, `blog-filters.tsx` keeps its existing local-state filter logic unchanged. No query params on `GET /public/blog-posts`.
- **D-09:** `POST /leads` is called via a plain `fetch()` from the `'use client'` form components (`contact-form.tsx`, the new Demo modal form) — same shape as the existing mocked `setTimeout`-based `onSubmit`. No Server Action wrapper.
- **D-10:** A CTA button on `/demo` ("Запросити доступ" / "Замовити демо"), placed in the header area near the "DEMO MODE" badge, opens a modal reusing the Contacts form's field set and zod schema. — **Reversibility:** reversible.
- **D-11:** The Demo modal form collects the same fields as Contacts: name (required), clinic (optional), contact = phone or email (required), message (optional) — same zod schema, submits with `source: demo` instead of `source: contacts`.

### Claude's Discretion

- Exact DTO shapes for the new public endpoints.
- Response caching/revalidation strategy for `fetch()` calls (`revalidate`/`cache` options).
- Whether the Demo modal form shares a literal component with `contact-form.tsx` or is a parallel copy.
- Exact `@nestjs/throttler` limits (requests/window) for `POST /leads` — "a few requests per minute per IP" is directional, not a hard number.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. Rate limiting on `POST /leads` (previously deferred at Phase 4) is now in-scope as D-03.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEAD-01 | A Contacts-form submission on `apps/web` is persisted as a Lead via the API | New public `POST /leads` route on existing `LeadsController` + `CreateLeadDto` + client `fetch()` from `contact-form.tsx` (see Code Examples) |
| LEAD-02 | A Demo-form submission on `apps/web` is persisted as a Lead via the API | Same `POST /leads` route, `source: demo`; new modal component pattern (see Architecture Patterns, Pattern 3) built on Radix `Dialog` (already a dependency) |
| CMS-02 | `apps/web`'s Blog list/detail pages render real Blog posts from the API, replacing `modules/blog/_data.ts` | New `PublicBlogPostsController` (`GET /public/blog-posts`, `GET /public/blog-posts/:slug`) + server-side `fetch()` in `app/blog/page.tsx` and `app/blog/[slug]/page.tsx` (see Runtime State Inventory-equivalent note on the "featured post" concept) |
| CMS-04 | `apps/web`'s Prices page renders real Pricing plans from the API, replacing hardcoded data and collapsing `pricing-cards.tsx`/`comparison-table.tsx` duplication | New `PublicPricingPlansController` (`GET /public/pricing-plans`) + server-side `fetch()` in `app/prices/page.tsx`; comparison-table derived per D-05/D-06 (see Architecture Patterns, Pattern 2) |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Lead form validation (structure/format) | Browser / Client | — | `react-hook-form` + `zod` already runs client-side in `contact-form.tsx`; D-09 keeps this unchanged |
| Lead persistence + rate limiting | API / Backend | Database | `POST /leads` writes to Postgres via Prisma; `@nestjs/throttler` enforces per-IP request limits at the guard layer before the handler runs |
| Published-only content filtering (blog/pricing) | API / Backend | Database | `published: true` filter belongs in the Prisma query (`PublicController` → `Service`), not client-side — never ships draft content to the public bundle |
| Blog category/search filtering | Browser / Client | — | D-08 locks this as client-side over an already-fetched array — no new backend query surface |
| Blog/pricing initial page render | Frontend Server (SSR) | API / Backend | Server Components (`page.tsx`) `fetch()` the public API at request time and pass data as props (D-07) — no client-side data-fetching library |
| Comparison-table feature-matrix derivation | Frontend Server (SSR) | — | Pure computation over the already-fetched `PricingPlan[]` array (D-05/D-06) — no new backend endpoint |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nestjs/throttler` | 6.5.0 [VERIFIED: npm registry — `npm view @nestjs/throttler version` → `6.5.0`, published 2025-12-02] | Per-route rate limiting on `POST /leads` | Official `nestjs`-org package (`git+https://github.com/nestjs/throttler.git`), 3.6M weekly downloads, the de facto NestJS rate-limiting solution referenced by NestJS's own security docs |

No other new runtime packages are required. `apps/server` already has `class-validator`/`class-transformer`/`@nestjs/swagger` (used identically for every existing DTO). `apps/web` already has `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner`, and `radix-ui` (for the new Demo modal — see Pattern 3) — no new `apps/web` dependency is needed.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `radix-ui` | ^1.4.3 [VERIFIED: apps/web/package.json — already a listed dependency] | Unstyled `Dialog` primitive for the new Demo modal | Already imported this way elsewhere in the monorepo: `import { Dialog as DialogPrimitive } from 'radix-ui';` [VERIFIED: packages/ui/src/components/shadcn-ui/dialog.tsx:2] — `apps/web` has no dialog/modal component yet in `shared/components/`, so this is new but reuses an existing dependency, not a new package |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@nestjs/throttler` per-route guard | Reverse-proxy / edge rate limiting (e.g. Vercel, Cloudflare) | No deployment/hosting config exists yet in this repo (per project docs) — an app-level guard is the only option available today and matches D-03's "from day one" framing |
| Deriving comparison-table rows from `features[]` (D-05) | Adding structured `limits`/`comparisonRows` fields to `PricingPlan` | Explicitly rejected by D-05/D-06 — no schema change wanted this phase |

**Installation:**
```bash
pnpm --filter server add @nestjs/throttler
```

**Version verification:** Confirmed via `npm view @nestjs/throttler version` → `6.5.0` (published 2025-12-02T22:45:48Z). Peer dependencies (`npm view @nestjs/throttler peerDependencies`): `@nestjs/common`/`@nestjs/core` `^7.0.0 || ^8.0.0 || ^9.0.0 || ^10.0.0 || ^11.0.0`, `reflect-metadata` `^0.1.13 || ^0.2.0` — compatible with `apps/server`'s installed `@nestjs/common@^11.0.1`, `@nestjs/core@^11.0.1`, `reflect-metadata@^0.2.2` [VERIFIED: apps/server/package.json].

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|--------------|---------|-------------|
| `@nestjs/throttler` | npm | Published 2025-12-02 (this version); package itself has existed for years across major versions 1-6 | 3,596,335/wk | github.com/nestjs/throttler | OK | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │              apps/web (Next.js 16)            │
                    │                                               │
  Browser  ───GET──▶│  app/blog/page.tsx (Server Component)        │
                    │      │ fetch(`${API}/public/blog-posts`)     │
                    │      ▼                                        │
                    │  <BlogFilters posts={...} /> ('use client')  │──┐
                    │                                               │  │ client-side
  Browser  ───GET──▶│  app/blog/[slug]/page.tsx (Server Component) │  │ search/category
                    │      │ fetch(`${API}/public/blog-posts/:slug`)│  │ filter (D-08)
                    │      ▼ 404 → notFound()                       │  │
                    │  <PostBody /> <RelatedPosts />                │◀─┘
                    │                                               │
  Browser  ───GET──▶│  app/prices/page.tsx (Server Component)      │
                    │      │ fetch(`${API}/public/pricing-plans`)  │
                    │      ▼                                        │
                    │  <PricingCards plans={...} />                │
                    │  <ComparisonTable plans={...} />              │ derives matrix
                    │      (union of features[] — D-05/D-06)        │ client-side
                    │                                               │
  Browser  ─submit─▶│  <ContactForm /> ('use client')               │──┐
                    │  <DemoModalForm /> ('use client', D-10/D-11) │  │ POST fetch()
                    │      │ POST `${API}/leads` { source, ... }   │  │ (D-09, no
                    └──────┼────────────────────────────────────────┘  │ Server Action)
                           │                                            │
                           ▼                                            │
              ┌────────────────────────────────────────────┐          │
              │           apps/server (NestJS)               │◀────────┘
              │                                               │
              │  PublicBlogPostsController                    │
              │  PublicPricingPlansController      @Public()  │  no auth,
              │  LeadsController.create()          @Public()  │  no throttle
              │      + @UseGuards(ThrottlerGuard)              │  ◀── throttle
              │      + @Throttle({default:{limit,ttl}})        │      applied
              │           │                                    │      here only
              │           ▼                                    │
              │  {Public}*Service → Prisma (published: true    │
              │   filter for blog/pricing; plain create for    │
              │   Lead)                                        │
              └────────────────────┬──────────────────────────┘
                                    ▼
                            PostgreSQL (BlogPost,
                            PricingPlan, Lead tables
                            already exist — Phase 4)
```

### Recommended Project Structure

```
apps/server/src/
├── leads/
│   ├── leads.controller.ts        # add POST / (LEAD-01/02, @Public())
│   ├── leads.service.ts           # add create()
│   └── dto/
│       └── create-lead.dto.ts     # new — public input, source restricted to LeadSource
├── blog-posts/
│   ├── blog-posts.controller.ts   # unchanged (admin, protected)
│   ├── blog-posts.service.ts      # add findAllPublished() + findPublishedBySlug()
│   ├── public-blog-posts.controller.ts   # new — D-04
│   └── dto/
│       └── public-blog-post-response.dto.ts   # optional — see Code Examples note
├── pricing-plans/
│   ├── pricing-plans.controller.ts   # unchanged (admin, protected)
│   ├── pricing-plans.service.ts      # add findAllPublished()
│   └── public-pricing-plans.controller.ts   # new — D-04

apps/web/
├── app/blog/page.tsx              # Server Component — fetch(public blog list)
├── app/blog/[slug]/page.tsx       # Server Component — fetch(public blog by slug)
├── app/prices/page.tsx            # Server Component — fetch(public pricing plans)
├── app/demo/page.tsx              # add CTA button (D-10)
├── modules/blog/blog-filters.tsx  # unchanged logic, now receives real posts as props
├── modules/blog/_data.ts          # DELETED (CMS-02 requirement)
├── modules/prices/pricing-cards.tsx        # receives plans as props, drop local `plans` array
├── modules/prices/comparison-table.tsx     # receives plans as props, derives matrix (D-05/D-06)
├── modules/contacts/contact-form.tsx       # POST fetch() instead of setTimeout (D-09)
├── modules/demo/demo-cta-modal.tsx         # new — D-10/D-11 (naming: planner's discretion)
└── shared/components/premium-dialog.tsx    # new — Radix Dialog wrapper (no existing modal primitive)
```

### Pattern 1: PublicController alongside a protected Controller in the same module

**What:** A second, `@Public()`-only controller class in the same NestJS feature module directory, targeting a distinct route prefix (`public/blog-posts` vs `blog-posts`), registered in the same `@Module({ controllers: [...] })` array.
**When to use:** Whenever a resource needs both an authenticated admin surface (full CRUD, all records) and an unauthenticated public surface (read-only, filtered subset) — exactly D-01/D-04's stated goal of keeping public/admin concerns visible at the file level without touching the existing protected routes.
**Why it avoids accidental double-guarding:** The global `AccessTokenGuard` is `@Global()`-scoped via `APP_GUARD` and checks `@Public()` metadata with `Reflector.getAllAndOverride` at both handler and class level [VERIFIED: apps/server/src/auth/guards/access-token.guard.ts:16-25 — `const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]); if (isPublic) { return true; }`]. Putting `@Public()` on the *class* of the new `PublicController` (not scattered per-method) means every route in that controller is public by construction — a forgotten `@Public()` on a newly added method is not a risk here since the whole class carries it.

**Example:**
```typescript
// apps/server/src/blog-posts/public-blog-posts.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostResponseDto } from './dto/blog-post-response.dto';

// Entire class is public — mirrors LeadsController/BlogPostsController's existing
// "protected by default" comment convention, inverted.
@Public()
@ApiTags('public-blog-posts')
@Controller('public/blog-posts')
export class PublicBlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  @ApiOkResponse({ type: BlogPostResponseDto, isArray: true })
  findAllPublished() {
    return this.blogPostsService.findAllPublished();
  }

  @Get(':slug')
  @ApiOkResponse({ type: BlogPostResponseDto })
  findOneBySlug(@Param('slug') slug: string) {
    return this.blogPostsService.findPublishedBySlug(slug);
  }
}
```

```typescript
// apps/server/src/blog-posts/blog-posts.module.ts — register both controllers
@Module({
  controllers: [BlogPostsController, PublicBlogPostsController],
  providers: [BlogPostsService],
})
export class BlogPostsModule {}
```

Service additions follow the exact pattern already used by `BlogPostsService.findOne()`/`findAll()` [VERIFIED: apps/server/src/blog-posts/blog-posts.service.ts:15-28 — `findAll() { return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } }); }` and `async findOne(id: string) { const blogPost = await this.prisma.blogPost.findUnique({ where: { id }, ... }); if (!blogPost) { throw new NotFoundException(...); } return blogPost; }`]:

```typescript
// apps/server/src/blog-posts/blog-posts.service.ts — additions
findAllPublished() {
  return this.prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
}

async findPublishedBySlug(slug: string) {
  const blogPost = await this.prisma.blogPost.findUnique({
    where: { slug },
  });
  if (!blogPost || !blogPost.published) {
    throw new NotFoundException('Blog post not found');
  }
  return blogPost;
}
```
`findUnique({ where: { slug } })` is valid Prisma because `BlogPost.slug` carries `@unique` [VERIFIED: packages/db/prisma/schema.prisma:100-103 — `model BlogPost {\n  id        String   @id @default(cuid())\n  slug      String   @unique\n...`]. The `!blogPost.published` check (rather than adding `published: true` to the `where` clause) matters: `findUnique` requires a `@unique`/`@id` field alone in `where` — Prisma does not allow compound `findUnique` filters unless a `@@unique([slug, published])` composite exists, which the schema does not have — so the publish check must happen after the fetch, in application code.

`PublicPricingPlansController`/`findAllPublished()` on `PricingPlansService` follow the identical pattern, reusing the existing `sortOrder: 'asc'` ordering [VERIFIED: apps/server/src/pricing-plans/pricing-plans.service.ts:11-15 — `findAll() {\n    // sortOrder is the model's own intended display ordering...\n    return this.prisma.pricingPlan.findMany({ orderBy: { sortOrder: 'asc' } });\n  }`] plus a `where: { published: true }` filter.

### Pattern 2: `POST /leads` on the existing `LeadsController`, rate-limited only there

**What:** A new `create()` handler added to the existing `LeadsController` [VERIFIED: apps/server/src/leads/leads.controller.ts:24-28 — comment already anticipates this: `// No POST /leads (create) route this phase — Lead creation is Phase 6's\n// scope (apps/web's public Contacts/Demo forms).`], marked `@Public()` at the method level (not the class — every other route on this controller stays protected), with `@UseGuards(ThrottlerGuard)` + `@Throttle(...)` applied only to this one method.
**When to use:** A single new public write action bolted onto an otherwise-protected controller — exactly D-04's framing ("a genuinely new action there, not a duplicate of an existing protected route").

```typescript
// apps/server/src/leads/leads.controller.ts — addition
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';

  @Post()
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 req/min per IP — tune per D-03's "a few/minute"
  @ApiCreatedResponse({ type: LeadResponseDto })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }
```

```typescript
// apps/server/src/leads/leads.module.ts — ThrottlerModule import required even for
// a route-scoped guard; it provides ThrottlerStorage + default options that
// ThrottlerGuard resolves via DI.
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
```
[CITED: github.com/nestjs/throttler README — `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])`, `@Throttle({ default: { limit: 3, ttl: 60000 } })`, ttl unit is milliseconds, `seconds()`/`minutes()`/`hours()` helpers exported for readability; per-route-only application via `@UseGuards(ThrottlerGuard)` without global `APP_GUARD` registration is a documented supported pattern — cross-checked against docs.nestjs.com search results and github.com/nestjs/throttler issue #1900 discussing single-route throttling]

`LeadsService.create()` is a plain Prisma create — no unique-constraint conflict handling is needed (`Lead` has no `@unique` fields other than `id`), unlike `BlogPostsService.create()`'s slug-conflict `P2002` handling:
```typescript
// apps/server/src/leads/leads.service.ts — addition
create(dto: CreateLeadDto) {
  return this.prisma.lead.create({ data: dto });
}
```

**`CreateLeadDto` recommendation** (Claude's Discretion area — not locked): mirror the Prisma model's `email`/`phone` fields directly rather than inventing a combined `contact` string field, so the DTO needs no server-side parsing of "is this a phone or an email." The client already knows which one it collected (its `contact` zod field matches either a phone regex or an email regex) — have it populate whichever field matches when building the POST body. `source` should be constrained to the two values the schema actually allows:

```typescript
// apps/server/src/leads/dto/create-lead.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '@repo/db';
import {
  IsEnum, IsOptional, IsString, IsNotEmpty, ValidateIf,
} from 'class-validator';

// Never declare `status`/`updatedById`/`clinicId` here — status defaults to
// 'new' via Prisma (schema.prisma:89 `status LeadStatus @default(new)`),
// the rest are admin-only fields set elsewhere in the Lead lifecycle.
export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clinicName?: string;

  // At least one of email/phone required — mirrors contact-form.tsx's zod
  // .refine() which already enforces "contact" is a phone-or-email string.
  @ApiPropertyOptional()
  @ValidateIf((o: CreateLeadDto) => !o.phone)
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateLeadDto) => !o.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ enum: LeadSource })
  @IsEnum(LeadSource)
  source: LeadSource;
}
```
`LeadSource` enum values are `contacts | demo` only [VERIFIED: packages/db/prisma/schema.prisma:70-73 — `enum LeadSource {\n  contacts\n  demo\n}`], so `@IsEnum(LeadSource)` already rejects any other value a malicious client might send — no additional allowlist needed.

### Pattern 3: Server-side `fetch()` from Server Components (D-07)

**What:** Plain `fetch()` calls directly inside the `async` Server Component function bodies of `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, and `app/prices/page.tsx` — no client-side data library, per D-07.
**Verified project state:** `apps/web/next.config.js` has no `experimental.cacheComponents` (or `dynamicIO`) flag set [VERIFIED: apps/web/next.config.js — full file read, only `transpilePackages` and `images.remotePatterns` keys present], so the *current, non-experimental* fetch caching model documented at nextjs.org/docs/app/api-reference/functions/fetch applies as-is — no `"use cache"` directive migration is in scope for this phase.

```typescript
// apps/web/app/blog/[slug]/page.tsx — replaces getPostBySlug() import
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const res = await fetch(`${process.env.API_URL}/public/blog-posts/${slug}`, {
    next: { revalidate: 60 }, // tune per traffic; content changes infrequently
  });
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch blog post: ${res.status}`);
  }
  const post = await res.json();
  // ... rest unchanged, `post` replaces the old `getPostBySlug()` result
}
```
[CITED: nextjs.org/docs/app/api-reference/functions/fetch, version 16.3.1, fetched 2026-08-14 — `cache: 'force-cache' | 'no-store'` and `next: { revalidate: false | 0 | number }` options; default without either option is `"auto no cache"`: fetched every request in dev, once at `next build` for static routes, every request if request-time APIs are detected on the route; `next.revalidate` sets cache lifetime in seconds; GET fetches with identical URL+options are memoized once per render pass]

The list page (`app/blog/page.tsx`) fetches the full published array once and passes it to `BlogFilters` as a prop (D-08) — no query params, `blog-filters.tsx`'s existing `posts.filter(...)` local-state logic is otherwise unchanged, just fed `posts` from props instead of the static import.

**Env var needed:** No `NEXT_PUBLIC_*`/API-base-URL environment variable currently exists anywhere in `apps/web` or `apps/docs` [confirmed by repo-wide grep — no matches]. `apps/platform-admin` (a Vite app, not Next.js) uses `import.meta.env.VITE_API_URL ?? 'http://localhost:4000'` [VERIFIED: apps/platform-admin/src/lib/api/client.ts:9]. For `apps/web`, recommend `API_URL` (server-only, read in Server Components — no `NEXT_PUBLIC_` prefix needed since these `fetch()` calls run server-side only) for the read paths, and `NEXT_PUBLIC_API_URL` for the client-side `POST /leads` calls in `'use client'` form components (D-09) since those run in the browser. [ASSUMED — no existing Next.js env-var convention in this repo to verify against; this follows Next.js's standard server-vs-client env var prefixing rule.]

### Pattern 4: Demo modal reusing the Contacts form (D-10/D-11)

**What:** A new bespoke `Dialog` primitive wrapper (no existing modal component in `apps/web/shared/components/` — confirmed by directory listing) built directly on `radix-ui`'s `Dialog` export, since `apps/web`'s premium design system is intentionally NOT built on `@repo/ui` (per CLAUDE.md's Phase 01.1 pivot) but `radix-ui` itself is already a raw dependency of `apps/web` [VERIFIED: apps/web/package.json — `"radix-ui": "^1.4.3"` listed in dependencies].

```typescript
// apps/web/shared/components/premium-dialog.tsx — new, styled with dt-* tokens
'use client';
import { Dialog as DialogPrimitive } from 'radix-ui';
// ^ same import shape as packages/ui/src/components/shadcn-ui/dialog.tsx:2
//   (`import { Dialog as DialogPrimitive } from 'radix-ui';`) — proven pattern
//   in this monorepo, just re-styled with dt-* tokens instead of shadcn's.
```
The form fields, zod schema, and submit/success UX pattern in `contact-form.tsx` [VERIFIED: apps/web/modules/contacts/contact-form.tsx:14-28 — `const contactFormSchema = z.object({ name: z.string().trim().min(2, ...), clinic: z.string().trim().optional(), contact: z.string().trim().min(1, ...).refine(...), message: z.string().trim().optional() });`] is the direct template for the Demo modal's form per D-11. Whether to extract a shared `<LeadForm source="contacts" | "demo">` component or duplicate is Claude's Discretion (CONTEXT.md) — either is reversible.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Rate limiting `POST /leads` | Custom in-memory request counter / IP tracking middleware | `@nestjs/throttler` `ThrottlerGuard` + `@Throttle()` | Handles storage, sliding-window logic, `X-Forwarded-For`/proxy IP resolution edge cases, and 429 response shaping — a hand-rolled counter is exactly the kind of "few lines that hide real complexity" this gate exists to prevent |
| Modal focus trap / ESC-to-close / overlay-click-to-close for the Demo CTA | A custom `useState`-driven `<div>` overlay | Radix `Dialog` primitive (already a dependency, already proven in `packages/ui/src/components/shadcn-ui/dialog.tsx`) | Focus trapping, ARIA roles, and portal rendering are exactly the class of accessibility-correctness problems Radix exists to solve; apps/web already ships radix-ui in its bundle for other (currently-unused-as-dialog) purposes |
| "At least one of email/phone" validation | Custom cross-field validator function | `class-validator`'s `@ValidateIf()` (server) + zod's `.refine()` (client, already exists in `contact-form.tsx`) | Both are the established idiom in each framework already used elsewhere in this codebase — no need for a bespoke validator |

**Key insight:** This phase adds no new hand-rolled infrastructure beyond what's explicitly required by the two `Don't Hand-Roll` rows above — everything else (controllers, services, DTOs, Server Component fetches) directly extends already-established, already-verified patterns in this codebase.

## Common Pitfalls

### Pitfall 1: `PricingPlan.isPopular` vs the mock data's `plan.popular`

**What goes wrong:** `pricing-cards.tsx` currently reads `plan.popular` [VERIFIED: apps/web/modules/prices/pricing-cards.tsx:33,96,98,130 — `popular: true,` in the mock array, then `highlighted={plan.popular}` and `plan.popular &&` and `plan.popular ? 'coral' : 'outline'`] but the Prisma model field is `isPopular` [VERIFIED: packages/db/prisma/schema.prisma:125 — `isPopular    Boolean  @default(false)`]. A naive prop-swap without renaming every `plan.popular` reference silently breaks the "Популярний" badge and card highlighting (TypeScript will not catch this if the fetched JSON is typed loosely as `any`).
**Why it happens:** The mock data field name and the Prisma schema field name were never required to match exactly (unlike `slug`, `title`, etc. which do match).
**How to avoid:** Grep `pricing-cards.tsx` for every `.popular` reference and rename to `.isPopular` when wiring real data; type the fetched response against `PricingPlanResponseDto`'s shape (`isPopular: boolean`) rather than `any`, so a stray `.popular` reference produces a compile error.
**Warning signs:** The "Популярний" badge never renders / renders on the wrong plan after wiring real data.

### Pitfall 2: No `featured` concept exists on `BlogPost`

**What goes wrong:** `app/blog/page.tsx` currently renders a hero section from a separate `featuredPost` constant [VERIFIED: apps/web/modules/blog/_data.ts:18-65 — `export const featuredPost: Post = { slug: 'automation-increases-profit', ... }`, kept separate from the `posts: Post[]` array], but the Prisma `BlogPost` model has no boolean/flag field for "is this the featured post" [VERIFIED: packages/db/prisma/schema.prisma:100-116 — full model fields are `id, slug, title, excerpt, category, date, readTime, image, body, published, createdAt, updatedAt, updatedById` — no `featured` field].
**Why it happens:** The mock data hard-coded one specific post as "featured"; nothing in Phase 4/5's schema work carried that concept forward (D-12 only required mirroring `Post`'s per-post fields, not the split between "featured" and "regular").
**How to avoid:** Decide a derivation rule now rather than at implementation time — the simplest and most defensible is "the most recently created published post is the hero" (i.e., `posts[0]` after `orderBy: { createdAt: 'desc' }`, which `findAllPublished()` already returns in that order), with the remaining posts (`posts.slice(1)`) going to `BlogFilters`. Flag this as an explicit planning decision, not an implementation detail — it changes user-visible behavior (the hero post will now change automatically as new posts are published, rather than being a fixed hand-picked post).
**Warning signs:** Blog list page throws or shows a blank hero section after `_data.ts` is deleted if this isn't decided before writing `app/blog/page.tsx`'s fetch logic.

### Pitfall 3: `next.config.js` image `remotePatterns` only allows `images.unsplash.com`

**What goes wrong:** `apps/web/next.config.js` restricts `next/image` to `images.unsplash.com` only [VERIFIED: apps/web/next.config.js — `images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] }`], but `BlogPost.image` is a free-text URL string with no domain restriction in `apps/platform-admin`'s create/edit form [VERIFIED: apps/platform-admin/src/modules/content/blog-post-form-page.tsx:47 — `image: z.string().trim().min(1, 'Image is required.')`, no URL-domain validation]. If a PlatformAdmin creates a real blog post with an image URL from any other domain, `next/image` throws a runtime error ("Invalid src prop... hostname is not configured").
**Why it happens:** The mock data happened to only ever use `images.unsplash.com` URLs, so this constraint was never exercised until real, PlatformAdmin-authored content flows through.
**How to avoid:** Not required to fix in this phase (out of the 4 requirement IDs), but flag as an operational risk for whoever creates the first real blog post; the planner may choose to broaden `remotePatterns` (e.g., wildcard hostname, at the cost of losing Next.js's built-in image-domain allowlisting safety) or leave it as a documented content-authoring constraint.
**Warning signs:** Blog list/detail pages 500 or show a broken image icon in production for any post whose image isn't hosted on `images.unsplash.com`.

### Pitfall 4: `findUnique({ where: { slug } })` cannot also filter on `published` in the same query

**What goes wrong:** Writing `this.prisma.blogPost.findUnique({ where: { slug, published: true } })` is a TypeScript/Prisma-client type error — `findUnique`'s `where` clause only accepts `@unique`/`@id` fields (optionally combined into a `@@unique` composite, which this schema does not define for `slug`+`published`).
**Why it happens:** Natural instinct is to filter "published only" the same way `findAllPublished()` does (`where: { published: true }` inside `findMany`), but `findUnique` has a stricter `where` type.
**How to avoid:** Fetch by `slug` alone, then check `blogPost.published` in application code and throw `NotFoundException` if false (see Pattern 1's `findPublishedBySlug` example) — this also correctly returns a generic 404 rather than leaking "this post exists but is unpublished" via a different status code.
**Warning signs:** TypeScript compile error on `pnpm --filter server check-types` if this is attempted; if bypassed with a type-unsafe cast, unpublished posts leak on the public detail route.

## Code Examples

See Architecture Patterns section above — all code examples for this phase are embedded there alongside the pattern they implement (Pattern 1: public controllers/services; Pattern 2: `POST /leads` + rate limiting + DTO; Pattern 3: Server Component `fetch()`; Pattern 4: Demo modal Dialog wrapper), each with inline source citations.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|---------------|--------|
| Next.js `fetch()` implicit caching (pre-16 "Data Cache" default `force-cache`) | Next.js 16's `"auto no cache"` default (fetch on every request in dev, once at build for static routes unless request-time APIs detected) | Documented in current (v16.3.1) fetch() reference | Server Components in this phase do not need to explicitly pass `cache: 'force-cache'` to get *some* caching — the default already caches at build time for otherwise-static routes; explicit `next: { revalidate: N }` is still recommended for predictable, tunable freshness on the blog/pricing pages since their content changes via `apps/platform-admin` outside of any build step |
| `@nestjs/throttler` pre-v5 tuple syntax `@Throttle(limit, ttl)` | v5+ named-profile object syntax `@Throttle({ default: { limit, ttl } })`, `ttl` always in milliseconds | v5.0.0 (per npm version history) | Any tutorial/blog post using the old positional-args syntax (several surfaced in web search results) will not compile against the installed v6.5.0 — use the object syntax shown in Pattern 2 |

**Deprecated/outdated:**
- `@Throttle(limit, ttl)` two-argument call signature — replaced by the named-profile object form; do not follow older Medium/tutorial code samples that still show the two-arg form.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | Env var naming: `API_URL` for server-side reads, `NEXT_PUBLIC_API_URL` for client-side `POST /leads` calls | Pattern 3 | Low — this is a naming choice with no existing repo convention to contradict; wrong naming is a trivial rename, not a functional break |
| A2 | `CreateLeadDto` should send separate `email`/`phone` fields (client decides which, based on its existing regex) rather than a combined `contact` string parsed server-side | Pattern 2 | Low-medium — if the planner instead wants server-side phone/email detection, the DTO and `contact-form.tsx`'s submit handler both need a different shape; caught immediately at typecheck/integration-test time, not silently |
| A3 | Featured-post derivation rule (most recent published post = hero) | Pitfall 2 | Medium — this changes user-visible blog page behavior (hero post can now change on every new publish) compared to the current hand-picked mock; if the actual desired behavior is "PlatformAdmin manually pins a featured post," a schema field (`featured: Boolean`) would be needed, which is a locked-decision-worthy scope question the planner/discuss-phase should confirm, not something research can decide |
| A4 | 5 requests/minute per IP as the concrete `@nestjs/throttler` limit for `POST /leads` | Pattern 2 | Low — CONTEXT.md explicitly leaves the exact number to planning ("a few requests per minute... is directional, not a hard number"); the code example's `limit: 5, ttl: 60000` is a starting point, not a locked value |

## Open Questions

1. **Should the Demo modal share a literal component with `contact-form.tsx`, or be a parallel copy?**
   - What we know: CONTEXT.md explicitly defers this to planning/implementation; both are described as viable ("no explicit preference expressed beyond 'reuse the same fields and schema'").
   - What's unclear: Whether a shared `<LeadForm source="contacts" | "demo">` component is worth the small abstraction cost given only two call sites, versus a parallel `demo-lead-form.tsx` copy that's easier to diverge later (e.g., if the Demo modal ever needs different copy/fields).
   - Recommendation: Default to a shared component (`modules/leads/lead-form.tsx` or similar, parameterized by `source`) to avoid the two zod schemas drifting out of sync — but this is a planner call, not a research-locked answer.

2. **Where exactly should the "featured post" derivation live?**
   - What we know: No `featured` field exists on `BlogPost` (Pitfall 2); "most recent published" is the simplest derivation with no schema change.
   - What's unclear: Whether product intent is "always show the newest post as hero" (this recommendation) or "PlatformAdmin manually curates which post is featured" (would need a new schema field/migration, out of D-05/D-06's "no schema change" spirit but not explicitly ruled out for blog).
   - Recommendation: Confirm with the user/planner before implementation — this is a genuine scope question, not purely a research gap.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| `@nestjs/throttler` | `POST /leads` rate limiting (D-03) | ✗ (not yet installed) | — (6.5.0 to be installed) | None needed — install via `pnpm --filter server add @nestjs/throttler` |
| PostgreSQL (local dev) | All three endpoints (Lead/BlogPost/PricingPlan tables already exist from Phase 4/5 migrations) | Not probed this session — no `pg_isready`/DB connection check performed; Phase 4/5 already depend on and presumably have a working local Postgres | — | If unavailable, blocks all backend work in this phase identically to Phases 4-5, not a new risk introduced by Phase 6 |
| `apps/server` dev server on port 4000 | `apps/web`'s server-side `fetch()` calls during local dev | Not probed this session (no server running check performed) | `PORT` env defaults to 4000 [VERIFIED: apps/server/src/config/env.validation.ts:6 — `PORT: z.coerce.number().default(4000)`] | `apps/web` dev (`next dev --port 3000`) and `apps/server` dev (implied `nest start --watch` on port 4000) must both run concurrently for local testing — no change from existing project setup, root `package.json` already has separate `dev:web`/`dev:server` scripts |

**Missing dependencies with no fallback:** none — `@nestjs/throttler` is a straightforward `pnpm add`.
**Missing dependencies with fallback:** none.

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|----------------|---------|--------------------|
| V2 Authentication | No | `POST /leads` and both public read endpoints are intentionally unauthenticated by design (D-01/D-03/D-04) — not an authentication surface |
| V4 Access Control | Yes | `published: true` filtering at the Prisma-query layer (never client-side) ensures unpublished/draft content is never served publicly, regardless of what `apps/web` requests; `@Public()` scoped to specific methods/classes only, verified fail-closed default via the existing `AccessTokenGuard` reflector check |
| V5 Input Validation | Yes | `class-validator` DTOs (`CreateLeadDto`) with `whitelist: true, forbidNonWhitelisted: true, transform: true` already globally configured [VERIFIED: apps/server/src/main.ts:19-24] — any field not declared on the DTO is stripped, not silently accepted |
| V11 Business Logic / Anti-automation | Yes | `@nestjs/throttler` per-IP rate limiting on the one public write endpoint (`POST /leads`) — the standard mitigation for unauthenticated form-spam/abuse, not a custom solution |
| V6 Cryptography | No | No new cryptographic material introduced this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|------------------------|
| Public lead-form spam / scripted abuse | Denial of Service / Repudiation | `@nestjs/throttler` per-IP request-rate limiting on `POST /leads` (D-03, Pattern 2) |
| Draft/unpublished content exposure via public read endpoints | Information Disclosure | `published: true` filter enforced server-side in the Prisma query (`findAllPublished`, `findPublishedBySlug`), never trusted to `apps/web` to filter client-side |
| Over-posting on `CreateLeadDto` (client sends `status`, `updatedById`, `clinicId` to manipulate a Lead's initial state) | Tampering | Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` already strips/rejects any field not declared on the DTO — `CreateLeadDto` intentionally omits `status`/`updatedById`/`clinicId`, matching the existing convention on `CreateBlogPostDto`/`CreatePricingPlanDto` |

## Sources

### Primary (HIGH confidence)
- `packages/db/prisma/schema.prisma` — full schema read, `Lead`/`BlogPost`/`PricingPlan`/`LeadSource`/`LeadStatus` models and enums
- `apps/server/src/{leads,blog-posts,pricing-plans}/*.ts` — all controllers, services, DTOs read in full
- `apps/server/src/auth/{decorators/public.decorator.ts, guards/access-token.guard.ts}` — read in full
- `apps/server/src/main.ts`, `apps/server/src/app.module.ts` — read in full
- `apps/web/app/{blog,blog/[slug],prices,demo}/page.tsx`, `apps/web/modules/{blog,prices,contacts,demo}/*.tsx` — read in full
- `apps/web/next.config.js`, `apps/web/package.json`, `apps/server/package.json` — read in full
- `nextjs.org/docs/app/api-reference/functions/fetch` (v16.3.1, fetched 2026-08-14) — official Next.js docs
- `npm view @nestjs/throttler version/peerDependencies/versions/scripts.postinstall` — direct registry queries
- `gsd_run query package-legitimacy check` — `@nestjs/throttler` verdict OK

### Secondary (MEDIUM confidence)
- `raw.githubusercontent.com/nestjs/throttler/master/README.md` — official package README, fetched for exact `ThrottlerModule.forRoot`/`@Throttle`/`@SkipThrottle` syntax
- WebSearch cross-check of NestJS throttler per-route (non-global) guard application pattern — corroborated by github.com/nestjs/throttler issue #1900 and multiple independent tutorial sources agreeing on the same `@UseGuards(ThrottlerGuard)` + `@Throttle()` pattern

### Tertiary (LOW confidence)
- None — all findings for the four user-requested focus areas were grounded in either official docs/README or direct codebase reads.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — single new package, verified via registry + legitimacy check + peer-dependency compatibility against the exact installed NestJS version
- Architecture: HIGH — every pattern extends an already-verified, already-working pattern read directly from the codebase (controller/service/DTO shapes, `@Public()` mechanics, Server Component structure)
- Pitfalls: HIGH — all four pitfalls are grounded in direct file reads (schema fields, mock-data field names, next.config.js, admin form validation), not speculation

**Research date:** 2026-08-14
**Valid until:** 2026-09-13 (30 days — stable stack, no fast-moving dependencies; re-verify `@nestjs/throttler` version if not implemented within that window)
