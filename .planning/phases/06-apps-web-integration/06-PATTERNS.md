# Phase 6: apps/web Integration - Pattern Map

**Mapped:** 2026-08-15
**Files analyzed:** 18
**Analogs found:** 16 / 18

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `apps/server/src/blog-posts/public-blog-posts.controller.ts` | controller | request-response | `apps/server/src/blog-posts/blog-posts.controller.ts` | exact (same module, mirrored shape) |
| `apps/server/src/pricing-plans/public-pricing-plans.controller.ts` | controller | request-response | `apps/server/src/pricing-plans/pricing-plans.controller.ts` | exact |
| `apps/server/src/blog-posts/blog-posts.service.ts` (add `findAllPublished`/`findPublishedBySlug`) | service | CRUD | same file's existing `findAll`/`findOne` | exact |
| `apps/server/src/pricing-plans/pricing-plans.service.ts` (add `findAllPublished`) | service | CRUD | same file's existing `findAll` | exact |
| `apps/server/src/leads/leads.controller.ts` (add `POST /`) | controller | request-response | same file's existing `Patch(':id/status')`/`Post(':id/convert')` handlers | exact |
| `apps/server/src/leads/leads.service.ts` (add `create`) | service | CRUD | `apps/server/src/pricing-plans/pricing-plans.service.ts` `create()` (plain create, no P2002 handling) | role-match |
| `apps/server/src/leads/dto/create-lead.dto.ts` | model (DTO) | request-response | `apps/server/src/leads/dto/lead-query.dto.ts`, `apps/server/src/blog-posts/dto/create-blog-post.dto.ts` | role-match |
| `apps/server/src/blog-posts/blog-posts.module.ts` (register `PublicBlogPostsController`) | config | — | existing module file | exact |
| `apps/server/src/pricing-plans/pricing-plans.module.ts` (register `PublicPricingPlansController`) | config | — | existing module file | exact |
| `apps/server/src/leads/leads.module.ts` (add `ThrottlerModule.forRoot`) | config | — | existing module file | exact |
| `apps/web/app/blog/page.tsx` | route (Server Component) | request-response (fetch) | itself, pattern from `apps/web/app/blog/[slug]/page.tsx`'s async pattern | role-match |
| `apps/web/app/blog/[slug]/page.tsx` | route (Server Component) | request-response (fetch) | itself (already `async`, `notFound()` pattern present) | exact |
| `apps/web/app/prices/page.tsx` | route (Server Component) | request-response (fetch) | `apps/web/app/blog/page.tsx` (Server Component composing client module components) | role-match |
| `apps/web/app/demo/page.tsx` (add CTA) | route (Server Component) | request-response | itself | exact |
| `apps/web/modules/blog/blog-filters.tsx` (take `posts` prop) | component | CRUD (client filter) | itself, unchanged filter logic | exact |
| `apps/web/modules/prices/pricing-cards.tsx` (take `plans` prop) | component | transform | itself | exact |
| `apps/web/modules/prices/comparison-table.tsx` (take `plans` prop, derive matrix) | component | transform | itself + `apps/web/modules/blog/blog-filters.tsx` (client-side derive-from-props pattern) | role-match |
| `apps/web/modules/contacts/contact-form.tsx` (real fetch + loading state) | component | request-response (POST) | itself (existing `setTimeout` submit pattern) | exact |
| `apps/web/modules/demo/demo-lead-form.tsx` or `apps/web/modules/leads/lead-form.tsx` (new) | component | request-response (POST) | `apps/web/modules/contacts/contact-form.tsx` | exact |
| `apps/web/shared/components/premium-dialog.tsx` (new) | component | event-driven | `packages/ui/src/components/shadcn-ui/dialog.tsx` | role-match (cross-package, different styling system) |
| `apps/web/app/blog/error.tsx`, `apps/web/app/prices/error.tsx` (new) | component | event-driven | none in `apps/web` (no existing `error.tsx` boundary) | no analog — use Next.js convention |
| `apps/web/modules/blog/_data.ts` | — | — | DELETED (CMS-02) | n/a |

## Pattern Assignments

### `apps/server/src/blog-posts/public-blog-posts.controller.ts` (controller, request-response)

**Analog:** `apps/server/src/blog-posts/blog-posts.controller.ts`

**Imports pattern** (lines 1-21):
```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostResponseDto } from './dto/blog-post-response.dto';
```

**Auth pattern** — whole class carries `@Public()` (unlike the protected sibling controller, which carries the comment `// No @Public() on any route here — protected by the existing global AccessTokenGuard by default`):
```typescript
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

**Core pattern** — controller delegates to service, no business logic in controller, matching existing `findAll()`/`findOne()` delegation in `blog-posts.controller.ts:31-40`. Identical delegation style for `PublicPricingPlansController` (analog: `apps/server/src/pricing-plans/pricing-plans.controller.ts:33-36`).

---

### `apps/server/src/blog-posts/blog-posts.service.ts` — additions (service, CRUD)

**Analog:** same file, existing `findAll()`/`findOne()` (lines 14-27):
```typescript
findAll() {
  return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
}

async findOne(id: string) {
  const blogPost = await this.prisma.blogPost.findUnique({
    where: { id },
    include: { updatedBy: { select: { email: true } } },
  });
  if (!blogPost) {
    throw new NotFoundException('Blog post not found');
  }
  return blogPost;
}
```

**New methods to add, following the same shape:**
```typescript
findAllPublished() {
  return this.prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
}

async findPublishedBySlug(slug: string) {
  const blogPost = await this.prisma.blogPost.findUnique({ where: { slug } });
  if (!blogPost || !blogPost.published) {
    throw new NotFoundException('Blog post not found');
  }
  return blogPost;
}
```
Note (Pitfall 4 from RESEARCH.md): `findUnique` cannot combine `slug` + `published` in one `where` — the publish check must happen after fetch, in application code, mirroring the existing `findOne`'s post-fetch `if (!x) throw NotFoundException` idiom.

**Error handling pattern:** `NotFoundException` from `@nestjs/common`, thrown after a null-check — same idiom used in `leads.service.ts:findOne` and `pricing-plans.service.ts:findOne`.

`PricingPlansService.findAllPublished()` follows the identical shape, analog `apps/server/src/pricing-plans/pricing-plans.service.ts:11-15` (`findAll()` with `orderBy: { sortOrder: 'asc' }` — add `where: { published: true }`).

---

### `apps/server/src/leads/leads.controller.ts` — add `POST /` (controller, request-response)

**Analog:** same file's existing `Post(':id/convert')` handler (lines 51-56) for decorator/method style, and the file's own header comment which already anticipates this addition:
```typescript
// No @Public() on any route here — protected by the existing global
// AccessTokenGuard by default (AUTH-04, already active app-wide).
// No POST /leads (create) route this phase — Lead creation is Phase 6's
// scope (apps/web's public Contacts/Demo forms). POST /leads/:id/convert
// below is a state-transition action on an existing Lead, not a create.
```
This comment must be updated/removed once the route is added — it directly documents the exact spot to change.

**Imports to add:**
```typescript
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common'; // already imported? check existing import block for Body/Post etc.
import { Public } from '../auth/decorators/public.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';
```

**Core pattern — method-level `@Public()` (not class-level, since every other route on this controller stays protected):**
```typescript
@Post()
@Public()
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } })
@ApiCreatedResponse({ type: LeadResponseDto })
create(@Body() dto: CreateLeadDto) {
  return this.leadsService.create(dto);
}
```
Compare to `BlogPostsController.create()` (protected, `@CurrentUser()` injected) at `apps/server/src/blog-posts/blog-posts.controller.ts:42-48` — this new route intentionally omits `@CurrentUser()` since it's unauthenticated.

---

### `apps/server/src/leads/leads.service.ts` — add `create()` (service, CRUD)

**Analog:** `apps/server/src/pricing-plans/pricing-plans.service.ts` `create()` (lines 28-32) — plain create, no unique-constraint handling needed:
```typescript
// No P2002-to-409 translation needed here — PricingPlan.name has no
// @unique constraint, so duplicate names are allowed (each gets its own id).
create(dto: CreatePricingPlanDto, adminId: string) {
  return this.prisma.pricingPlan.create({
    data: { ...dto, updatedById: adminId },
  });
}
```
New `LeadsService.create()` (no `adminId` — public, unauthenticated caller):
```typescript
create(dto: CreateLeadDto) {
  return this.prisma.lead.create({ data: dto });
}
```
Contrast with `BlogPostsService.create()`'s P2002→`ConflictException` handling (lines 29-45 of `blog-posts.service.ts`) — NOT needed here since `Lead` has no `@unique` field besides `id`.

---

### `apps/server/src/leads/dto/create-lead.dto.ts` (model/DTO, request-response)

**Analog:** `apps/server/src/leads/dto/lead-query.dto.ts` (decorator/import style) + `apps/server/src/blog-posts/dto/create-blog-post.dto.ts` (create-DTO shape):
```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '@repo/db';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class LeadQueryDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
  // ...
}
```
Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` (already configured, `apps/server/src/main.ts:19-24`) strips any field not declared on the DTO — so `CreateLeadDto` must intentionally omit `status`/`updatedById`/`clinicId` (matches existing convention on `CreateBlogPostDto`/`CreatePricingPlanDto`).

Recommended shape (per RESEARCH.md Pattern 2 — separate `email`/`phone` fields, `source` enum-validated):
```typescript
export class CreateLeadDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() clinicName?: string;
  @ValidateIf((o) => !o.phone) @IsString() @IsNotEmpty() email?: string;
  @ValidateIf((o) => !o.email) @IsString() @IsNotEmpty() phone?: string;
  @IsOptional() @IsString() message?: string;
  @IsEnum(LeadSource) source: LeadSource;
}
```

---

### `apps/web/app/blog/[slug]/page.tsx` and `apps/web/app/blog/page.tsx` (route/Server Component, request-response fetch)

**Analog:** itself — already `async`, already uses `notFound()`:
```typescript
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const post = getPostBySlug(slug);   // ← replace with fetch()
  if (!post) {
    notFound();
  }
  // ...
}
```

**New fetch pattern (from RESEARCH.md, verified against Next.js 16.3.1 docs):**
```typescript
const res = await fetch(`${process.env.API_URL}/public/blog-posts/${slug}`, {
  next: { revalidate: 60 },
});
if (res.status === 404) notFound();
if (!res.ok) throw new Error(`Failed to fetch blog post: ${res.status}`);
const post = await res.json();
```

`apps/web/app/blog/page.tsx` currently imports `featuredPost` from `_data.ts` (line 7) and passes no props to `<BlogFilters />` (fully self-contained, reading `posts` from `_data.ts` internally at `modules/blog/blog-filters.tsx:15` `import { posts } from './_data';`). Both must change: `page.tsx` becomes `async`, fetches `posts` once, derives `featuredPost = posts[0]` (D-12, since `findAllPublished()` already orders `createdAt desc`), and passes `posts={posts.slice(1)}` down to `<BlogFilters posts={...} />` as a new required prop — remove the internal `import { posts } from './_data'` in `blog-filters.tsx`.

`apps/web/app/prices/page.tsx` becomes `async`, fetches `plans` once from `/public/pricing-plans`, passes `plans={plans}` to both `<PricingCards />` and `<ComparisonTable />` (both currently self-contained with hardcoded `const plans = [...]` at the top of `pricing-cards.tsx:12-60`) — remove that local array, take as prop instead. Comparison table conditionally renders only when `plans.length >= 2` (UI-SPEC zero-one-many rule).

---

### `apps/web/modules/prices/pricing-cards.tsx` (component, transform)

**Analog:** itself. Must rename every `plan.popular` reference to `plan.isPopular` (Pitfall 1 — Prisma field is `isPopular`, mock data used `popular`) — grep shows references at lines ~33, 96, 98, 130. Also fix off-palette color: `text-green-500` → `text-dt-teal` (UI-SPEC Color section, "Fix required" note) while this file is being touched anyway.

Card grid must flex to plan count (UI-SPEC): 1 plan → `max-w-md mx-auto`, 2 → `lg:grid-cols-2`, 3+ → `lg:grid-cols-3` — currently hardcoded to `lg:grid-cols-3` for exactly 3 mock plans.

---

### `apps/web/modules/prices/comparison-table.tsx` (component, transform)

**Analog:** itself, `CheckCell`/`DashCell` helper components (lines 4-10) are reused as-is:
```typescript
function CheckCell(): React.JSX.Element {
  return <Check weight="regular" className="mx-auto h-5 w-5 text-dt-teal" />;
}
function DashCell(): React.JSX.Element {
  return <span className="text-dt-graphite">—</span>;
}
```
Currently the `<table>` body is fully hand-written with hardcoded rows/columns (lines 22-80+) for exactly 3 named plans (Старт/Бізнес/Клініка). Per D-05/D-06, replace with a derived matrix: `const featureRows = Array.from(new Set(plans.flatMap((p) => p.features)))`, then for each row render one `<CheckCell />`/`<DashCell />` per plan based on `plan.features.includes(row)`. Column headers become `plans.map((p) => p.name)` instead of hardcoded `<th>` text. The `<div className="overflow-x-auto">` wrapper (line 21) stays unchanged.

---

### `apps/web/modules/contacts/contact-form.tsx` and new `demo-lead-form.tsx`/`lead-form.tsx` (component, request-response POST)

**Analog:** `contact-form.tsx` itself — full file read, this is the direct template per D-11.

**Imports pattern** (lines 1-12):
```typescript
'use client';
import { PremiumButton } from '@/shared/components/premium-button';
import { PremiumCard } from '@/shared/components/premium-card';
import { PremiumInput } from '@/shared/components/premium-input';
import { PremiumTextarea } from '@/shared/components/premium-textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from '@phosphor-icons/react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
```

**Zod schema pattern** (lines 14-28) — reuse verbatim/parameterize by `source`:
```typescript
const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Ім'я має містити щонайменше 2 символи"),
  clinic: z.string().trim().optional(),
  contact: z.string().trim().min(1, 'Вкажіть телефон або email').refine(
    (value) =>
      /^\+?[0-9\s\-()]{7,20}$/.test(value) ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    { message: 'Введіть коректний номер телефону або email' },
  ),
  message: z.string().trim().optional(),
});
```
Use this same regex to decide client-side whether `contact` populates `email` or `phone` on the `CreateLeadDto` POST body (per RESEARCH.md A2 assumption).

**Current mocked submit (lines 37-42, to be replaced):**
```typescript
const onSubmit = form.handleSubmit(() => {
  setTimeout(() => {
    setIsSubmitted(true);
    toast.success('Заявку успішно надіслано!');
  }, 500);
});
```

**New real-fetch submit pattern (per D-09/RESEARCH.md, no Server Action):**
```typescript
const onSubmit = form.handleSubmit(async (values) => {
  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        clinicName: values.clinic || undefined,
        [isEmail ? 'email' : 'phone']: values.contact,
        message: values.message || undefined,
        source: 'contacts', // or 'demo' for the modal variant
      }),
    });
    if (res.status === 429) {
      toast.error('Забагато спроб. Зачекайте хвилину і спробуйте ще раз.');
      return;
    }
    if (!res.ok) {
      toast.error('Не вдалося надіслати заявку. Спробуйте ще раз.');
      return;
    }
    setIsSubmitted(true);
  } catch {
    toast.error('Не вдалося надіслати заявку. Спробуйте ще раз.');
  }
});
```
Loading state (new, per UI-SPEC Copywriting Contract): submit button label → `Надсилаємо…`, `disabled={form.formState.isSubmitting}` — `PremiumButton`'s existing `disabled` prop, no new component needed.

**Success-state markup** (lines 122-141) reused verbatim in both forms — "Дякуємо!" block with `CheckCircle` icon.

---

### `apps/web/shared/components/premium-dialog.tsx` (new component, event-driven)

**Analog:** `packages/ui/src/components/shadcn-ui/dialog.tsx` — same `radix-ui` import shape, different styling (dt-* tokens instead of shadcn tokens):
```typescript
import { Dialog as DialogPrimitive } from 'radix-ui';
import * as React from 'react';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}
function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}
function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}
```
Do NOT import shadcn's `cn()` from `packages/ui/src/lib/utils` — use `apps/web`'s own `cn()` helper (per CLAUDE.md Phase 01.1 pivot: apps/web is NOT built on `@repo/ui`). Restyle overlay to `bg-dt-navy/40 backdrop-blur-sm`, content to `bg-dt-warm-white rounded-dt-card shadow-[var(--shadow-dt-hover)] border border-dt-navy/10 max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto` per UI-SPEC's `PremiumDialog` contract. Close button: Phosphor `X` icon + `PremiumButton variant="ghost" size="icon" aria-label="Закрити"` — pattern for icon-only buttons already established at `apps/web/app/blog/[slug]/page.tsx` (`<PremiumButton variant="ghost" size="icon" aria-label="Поділитися">`).

---

### `apps/web/app/demo/page.tsx` — add CTA (route/Server Component)

**Analog:** itself. Current header block (lines 8-15) renders the "DEMO MODE" badge and hero copy. Add `PremiumButton variant="coral"` reading "Замовити демо" adjacent to the badge, which triggers the new `PremiumDialog` wrapping the demo lead form. Since `page.tsx` itself is a Server Component (no `'use client'`), the CTA + modal trigger must live in a small `'use client'` wrapper component (e.g. `modules/demo/demo-cta.tsx`) composed into `page.tsx`, matching the existing split where `<DemoTabs />` (also presumably client) is imported into the server page.

---

## Shared Patterns

### `@Public()` decorator (auth/guard)
**Source:** `apps/server/src/auth/decorators/public.decorator.ts` (full file, 8 lines):
```typescript
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```
**Apply to:** `PublicBlogPostsController`, `PublicPricingPlansController` (class-level), `LeadsController.create()` (method-level only — rest of class stays protected).

### NestJS module/controller/service structure
**Source:** `apps/server/src/blog-posts/`, `apps/server/src/pricing-plans/`, `apps/server/src/leads/` — each `Controller`/`Service`/`dto/` folder shape.
**Apply to:** All new backend files — follow the same directory convention, constructor DI with `private readonly`, controllers delegate to services with zero business logic inline.

### Global ValidationPipe (whitelist/forbidNonWhitelisted/transform)
**Source:** `apps/server/src/main.ts:19-24` (verified in RESEARCH.md, not re-read here — already cited).
**Apply to:** `CreateLeadDto` — never declare `status`/`updatedById`/`clinicId` fields, they get silently stripped/rejected already; no need for manual omission logic.

### Server Component → client "module" component fetch-then-props split
**Source:** existing split already present in `apps/web/app/blog/page.tsx` → `<BlogFilters />`, `apps/web/app/prices/page.tsx` → `<PricingCards />`/`<ComparisonTable />`.
**Apply to:** All three fetch-driven pages — Server Component does the `fetch()`, passes plain-object props down, `'use client'` components stay presentational/interactive only.

### react-hook-form + zod + sonner submit pattern
**Source:** `apps/web/modules/contacts/contact-form.tsx` (full file).
**Apply to:** Both `contact-form.tsx` (modified in place) and the new Demo modal form — same schema shape, same success-state markup, same `toast` usage, new: real `fetch()`, loading state, and two distinct error-toast copies (generic vs 429).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/web/app/blog/error.tsx`, `apps/web/app/prices/error.tsx` | component (Next.js error boundary) | event-driven | No `error.tsx` boundary exists anywhere in `apps/web` yet — use Next.js App Router's standard `error.tsx` convention (`'use client'`, `{ error, reset }` props, call `reset()` on retry) per UI-SPEC copy: heading "Щось пішло не так", body "Не вдалося завантажити дані. Спробуйте оновити сторінку.", button "Оновити" |
| `apps/server/src/leads/leads.module.ts` `ThrottlerModule.forRoot(...)` wiring | config | — | First use of `@nestjs/throttler` anywhere in the monorepo — no prior module registers a rate-limit provider to copy from; follow RESEARCH.md's Pattern 2 code example directly (`ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])`) |

## Metadata

**Analog search scope:** `apps/server/src/{leads,blog-posts,pricing-plans,auth}`, `apps/web/{app,modules,shared}`, `packages/ui/src/components/shadcn-ui/dialog.tsx`
**Files scanned:** ~24 (controllers, services, DTOs, page.tsx routes, module components, dialog primitive)
**Pattern extraction date:** 2026-08-15
