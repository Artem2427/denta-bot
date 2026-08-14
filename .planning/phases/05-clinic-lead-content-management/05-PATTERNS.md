# Phase 5: Clinic, Lead & Content Management - Pattern Map

**Mapped:** 2026-08-14
**Files analyzed:** ~30 (4 backend resource modules x 4 files + shared infra, `apps/platform-admin` bootstrap, 2 `@repo/ui` primitives)
**Analogs found:** 27 / 30 (backend: exact matches against Phase 4's `auth` module; frontend/UI: no repo precedent — RESEARCH.md Pattern 2/3 and shadcn's public source stand in)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/server/src/clinics/clinics.controller.ts` | controller | CRUD/request-response | `apps/server/src/auth/auth.controller.ts` | role-match (auth has extra cookie logic; use the `me()` handler shape, not login/refresh) |
| `apps/server/src/clinics/clinics.service.ts` | service | CRUD | `apps/server/src/auth/auth.service.ts` | role-match (constructor-injects `PrismaService`) |
| `apps/server/src/clinics/clinics.module.ts` | config/module | — | `apps/server/src/auth/auth.module.ts` | role-match (simpler — no `APP_GUARD`/`JwtModule` needed) |
| `apps/server/src/clinics/dto/create-clinic.dto.ts` | model/DTO | CRUD | `apps/server/src/auth/dto/login.dto.ts` | exact (class-validator + `@ApiProperty`) |
| `apps/server/src/clinics/dto/update-clinic.dto.ts` | model/DTO | CRUD | none in repo — `PartialType(CreateClinicDto)` per RESEARCH.md Pattern 1 | no analog (new pattern, but fully specified in RESEARCH.md) |
| `apps/server/src/clinics/dto/clinic-query.dto.ts` | model/DTO | request-response (filter) | none in repo | no analog — `IsEnum(ClinicStatus)` query DTO, new pattern |
| `apps/server/src/leads/leads.controller.ts` / `.service.ts` / `.module.ts` / `dto/*` | controller/service/module/DTO | CRUD + event-driven (convert) | same as clinics; `convert()` transaction is genuinely new (Pattern 3, RESEARCH.md) | role-match; no direct analog for `$transaction` usage anywhere in repo |
| `apps/server/src/blog-posts/*` (controller/service/module/dto) | controller/service/module/DTO | CRUD | `apps/server/src/clinics/*` (sibling module, same phase) | exact (once clinics module exists, copy its shape directly) |
| `apps/server/src/pricing-plans/*` | controller/service/module/DTO | CRUD | `apps/server/src/clinics/*` | exact |
| `packages/db/prisma/schema.prisma` (migration: `updatedById`) | model/migration | — | existing `Clinic`/`Lead`/`BlogPost`/`PricingPlan` models + `RefreshToken`'s `@relation` field on `PlatformAdmin` | role-match — schema already has an FK-to-`PlatformAdmin` precedent to copy the `@relation` syntax from |
| `apps/platform-admin/src/main.tsx` | provider/config | — | current scaffold (`apps/platform-admin/src/main.tsx`, unmodified Vite default) | exact file to modify — needs `QueryClientProvider` + `RouterProvider` wrap |
| `apps/platform-admin/src/router.tsx` | route/config | request-response | none in repo (first React Router usage in monorepo) | no analog — RESEARCH.md's "React Router v7 auth-guarded layout route" code example is the reference |
| `apps/platform-admin/src/lib/api/client.ts` | service/utility | request-response | none in repo (first `openapi-fetch` usage) | no analog — RESEARCH.md Pattern 2 code example is the reference |
| `apps/platform-admin/src/lib/api/schema.d.ts` | model (generated) | — | n/a — codegen output | no analog |
| `apps/platform-admin/src/lib/auth/auth-store.ts` | store | — | none in repo | no analog — RESEARCH.md Pitfall 2's shared in-flight-refresh-promise pattern is the reference |
| `apps/platform-admin/src/modules/clinics/use-clinics.ts` (+ leads/content equivalents) | hook | CRUD (query/mutation) | none in repo (first TanStack Query usage) | no analog — RESEARCH.md Pattern 2 hook example is the reference |
| `apps/platform-admin/src/modules/clinics/clinics-list-page.tsx` (+ detail/form, and leads/content equivalents) | component | CRUD/request-response | `apps/web/modules/contacts/contact-form.tsx` for RHF+zod form shape only (styling NOT reused — web uses bespoke `dt-*`/Premium* components, platform-admin uses raw `@repo/ui`) | partial (form-validation pattern only) |
| `apps/platform-admin/src/shared/components/app-shell.tsx` | component | — | `packages/ui/src/components/shadcn-ui/sidebar.tsx` (consumed, not copied — compose `SidebarProvider`/`Sidebar`/`SidebarInset`) | role-match (composition target) |
| `apps/platform-admin/src/index.css` | config | — | itself — delete scaffold `#root`/`--text`/`--accent` rules, keep `@import '@repo/ui/styles/theme.css'` line | exact (surgical edit, not a new-file analog) |
| `packages/ui/src/components/shadcn-ui/form.tsx` | component | — | shadcn's official public `form.tsx` registry source (hand-port, per UI-SPEC Gap 1) + `packages/ui/src/components/shadcn-ui/label.tsx` for the `cn()`/Radix `Label` composition convention already in this package | role-match (label.tsx for local convention) + external (shadcn upstream for the RHF binding logic itself) |
| `packages/ui/src/components/shadcn-ui/data-table.tsx` | component | — | `packages/ui/src/components/shadcn-ui/table.tsx` (composed primitive) + `packages/ui/src/components/shadcn-ui/pagination.tsx` (footer) | role-match (composition of two existing primitives, per UI-SPEC Gap 2) |
| `packages/ui/index.tsx` | config (barrel) | — | itself — append `export * from './src/components/shadcn-ui/form'` and `.../data-table` lines in the existing alphabetized list | exact |

## Pattern Assignments

### Backend: `apps/server/src/clinics/*` (controller, service, module, DTOs — data flow: CRUD)

**Analog:** `apps/server/src/auth/*`

**Imports pattern** (controller — `apps/server/src/auth/auth.controller.ts` lines 1-13):
```typescript
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
```
For `clinics.controller.ts`, the relevant subset is `Body, Controller, Get, Param, Patch, Post, Query`, plus `CurrentUser` from `../auth/decorators/current-user.decorator` and `AccessTokenPayload` from `../auth/strategies/access-token.strategy` (no `Public`, no cookie helpers — those are auth-specific).

**Protected-by-default pattern** (`auth.controller.ts` lines 118-124, the `me()` handler — this is the shape every Clinics/Leads/BlogPosts/PricingPlans handler should follow, NOT the `login`/`refresh`/`logout` handlers which are deliberately `@Public()`):
```typescript
// No @Public() — protected by the global AccessTokenGuard by default
// (AUTH-04). Returns a minimal DTO-shaped object, never a raw Prisma model.
@Get('me')
@ApiBearerAuth('access-token')
me(@CurrentUser() user: AccessTokenPayload): { id: string; email?: string } {
  return { id: user.sub, email: user.email };
}
```

**Core CRUD controller pattern** (RESEARCH.md Pattern 1, already verified against this exact repo's conventions):
```typescript
@ApiTags('clinics')
@ApiBearerAuth('access-token')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  findAll(@Query() query: ClinicQueryDto) {
    return this.clinicsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClinicDto, @CurrentUser() user: AccessTokenPayload) {
    return this.clinicsService.create(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClinicDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.clinicsService.update(id, dto, user.sub);
  }
}
```

**Service constructor-injection pattern** (`apps/server/src/auth/auth.service.ts` lines 1-20):
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    // clinics/leads/blog-posts/pricing-plans services only need PrismaService —
    // no JwtService/ConfigService (those are auth-specific)
  ) {}
}
```
No `PrismaModule` import needed in `clinics.module.ts` — it's `@Global()` (`apps/server/src/prisma/prisma.module.ts`, full file, 6 lines):
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Module pattern** (`apps/server/src/auth/auth.module.ts` — simplify: drop `PassportModule`/`JwtModule`/`APP_GUARD`/strategies, those are auth-only):
```typescript
import { Module } from '@nestjs/common';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService],
})
export class ClinicsModule {}
```

**DTO pattern** (`apps/server/src/auth/dto/login.dto.ts`, full file):
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
```
Apply the same shape to `CreateClinicDto` (`name: IsString`, `email: IsEmail`, `phone: IsOptional() IsString()`, `status: IsOptional() IsEnum(ClinicStatus)`, `plan: IsString()`). **Never add `updatedById` as a DTO field** — the Security Domain section of RESEARCH.md and the global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` (`apps/server/src/main.ts` lines 17-23) together mean any unlisted field is stripped/rejected; `updatedById` must only ever be set server-side from `@CurrentUser()`.

**Update DTO pattern** (no repo analog — new pattern from RESEARCH.md Pattern 1, `@nestjs/swagger`'s `PartialType`, not `@nestjs/mapped-types`):
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateClinicDto } from './create-clinic.dto';

export class UpdateClinicDto extends PartialType(CreateClinicDto) {}
```

**Auth guard is implicit, not per-file** — no `@Public()` decorator appears anywhere in the 4 new modules; every route is protected by the existing global `{ provide: APP_GUARD, useClass: AccessTokenGuard }` registration in `apps/server/src/auth/auth.module.ts` (already active app-wide, nothing new to wire).

---

### Backend: `apps/server/src/leads/leads.service.ts` — `convert()` (event-driven, transaction — no repo analog)

**Source:** RESEARCH.md Pattern 3 (Prisma interactive transaction), directly informed by the actual schema (`packages/db/prisma/schema.prisma` lines 45-60, `Clinic.email @unique`):
```typescript
async convert(leadId: string, adminId: string) {
  return this.prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });
    if (lead.status === 'converted') {
      throw new ConflictException('Lead already converted');
    }
    const clinic = await tx.clinic.create({
      data: {
        name: lead.clinicName ?? lead.name,
        email: lead.email ?? `${lead.id}@unknown.dentabot.dev`,
        plan: 'trial',
        updatedById: adminId,
      },
    });
    return tx.lead.update({
      where: { id: leadId },
      data: { status: 'converted', clinicId: clinic.id, updatedById: adminId },
    });
  });
}
```
Validate `lead.email` presence before conversion (400 if missing) and catch Prisma `P2002` → translate to 409 "clinic with this email already exists" per RESEARCH.md Pitfall 3 and UI-SPEC's Convert-flow copy contract.

---

### Backend: Prisma migration — `updatedById` trace fields (INFRA-05)

**Analog:** existing `Lead` model's FK-to-related-model pattern is the closest schema precedent for adding a nullable FK + inverse relation. Full new-field pattern (RESEARCH.md Pattern 4, schema addition, apply identically to `Clinic`, `Lead`, `BlogPost`, `PricingPlan`):
```prisma
model Clinic {
  // ...existing fields...
  updatedById String?
  updatedBy   PlatformAdmin? @relation(fields: [updatedById], references: [id])
}

model PlatformAdmin {
  // ...existing fields...
  updatedClinics      Clinic[]      @relation("ClinicUpdatedBy")
  updatedLeads        Lead[]        @relation("LeadUpdatedBy")
  updatedBlogPosts    BlogPost[]    @relation("BlogPostUpdatedBy")
  updatedPricingPlans PricingPlan[] @relation("PricingPlanUpdatedBy")
}
```
Run via `pnpm --filter @repo/db run db:migrate`.

---

### Frontend: `apps/platform-admin` bootstrap (provider/route/store/hook — no repo analog, first usage of this stack)

**`main.tsx`** — analog is the file itself (`apps/platform-admin/src/main.tsx`, current scaffold, 9 lines) — wrap `App`/router with providers:
```typescript
// Current scaffold (to be replaced):
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
Target shape per RESEARCH.md's system diagram: `main.tsx` → `QueryClientProvider` → `RouterProvider(router)`, `router.tsx` exporting `createBrowserRouter([...])` with an `authLoader` (RESEARCH.md's "React Router v7 auth-guarded layout route" code example, verbatim-usable).

**`lib/api/client.ts`** — RESEARCH.md Pattern 2:
```typescript
import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
});
```

**`modules/clinics/use-clinics.ts`** — RESEARCH.md Pattern 2 hook example (`useQuery`/`useMutation` wrapping `api.GET`/`api.PATCH`), copy verbatim shape for `leads`/`blog-posts`/`pricing-plans` equivalents.

**`lib/auth/auth-store.ts`** — no code example given in RESEARCH.md beyond the constraint (Pitfall 2): implement as a module-level `let refreshPromise: Promise<...> | null` shared across all 401-handlers; every concurrent 401 awaits the same in-flight promise instead of independently calling `/auth/refresh` (this is the one place this phase's frontend code must NOT follow a "copy pattern" — it's a from-scratch concurrency-safety requirement).

**`index.css` cleanup** — surgical edit to the existing file (`apps/platform-admin/src/index.css`, current scaffold, lines 71-81 contain the offending rules):
```css
/* DELETE this block (Vite starter leftover, UI-SPEC "Foundation cleanup required"): */
#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
```
Keep line 2 (`@import '@repo/ui/styles/theme.css';`) untouched — it is already correct and is the sole token source per UI-SPEC.

---

### Frontend: Forms (`modules/clinics/clinic-form.tsx` etc. — RHF + zod, data flow: CRUD)

**Analog:** `apps/web/modules/contacts/contact-form.tsx` — **reuse the RHF/zod wiring pattern only** (schema definition, `useForm({ resolver: zodResolver(schema) })`, `form.handleSubmit`, `form.formState.errors`); **do NOT reuse its JSX/styling** — that file uses `apps/web`'s bespoke `Premium*` components and `dt-*` classes, which are explicitly out of scope for `apps/platform-admin` (CLAUDE.md, UI-SPEC's locked directive). For `platform-admin`, once Gap 1's `Form`/`FormField`/`FormItem`/`FormControl`/`FormMessage` exist in `@repo/ui`, use those instead of manual `form.register()` + manual error `<p>` tags.

**Schema + hook pattern to copy** (`apps/web/modules/contacts/contact-form.tsx` lines 14-36):
```typescript
const contactFormSchema = z.object({
  name: z.string().trim().min(2, '...'),
  contact: z.string().trim().min(1, '...').refine(/* ... */),
  message: z.string().trim().optional(),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm(): React.JSX.Element {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', clinic: '', contact: '', message: '' },
  });
  const onSubmit = form.handleSubmit(() => { /* mutate + toast */ });
  // ...
}
```
Adapt: `CreateClinicDto`/`UpdateLeadStatusDto`/etc. shaped zod schemas mirroring the backend DTOs' `class-validator` rules field-for-field (keep frontend/backend validation semantically aligned even though there's no shared-types package yet — RESEARCH.md's known architectural gap).

---

### `packages/ui` — Gap 1: `Form` primitive (component, no data flow — pure UI binding)

**Analog:** `packages/ui/src/components/shadcn-ui/label.tsx` for this package's `cn()` + Radix composition convention (every primitive in `packages/ui/src/components/shadcn-ui/*` follows the same `data-slot` + `cn(...)` + named-export shape — see the `Table`/`Button` excerpts below as the canonical local convention to match).

**Local convention to match** (`packages/ui/src/components/shadcn-ui/button.tsx`, full file pattern — `cva` variants + `cn()` + `data-slot`):
```typescript
import { cn } from '../../lib/utils';

function Button({ className, variant = 'default', size = 'default', asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```
`form.tsx` must be hand-ported from shadcn's official public registry source (standard, unmodified `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`, built on `react-hook-form`'s `Controller`/`FormProvider` + Radix `Label`/`Slot` — both already `packages/ui` deps per `packages/ui/package.json`), then wired into `packages/ui/src/lib/utils.ts`'s `cn()` the same way every other primitive in this directory is. Add `react-hook-form` (`^7`, matching `apps/web`'s pin) to `packages/ui/package.json` dependencies first.

**Barrel export pattern** (`packages/ui/index.tsx`, insert alphabetically):
```typescript
export * from './src/components/shadcn-ui/form';
```

---

### `packages/ui` — Gap 2: `DataTable` composition (component, data flow: CRUD list rendering)

**Analog:** `packages/ui/src/components/shadcn-ui/table.tsx` (full file, 105 lines, already read in full) — compose `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` with `@tanstack/react-table`'s `useReactTable`/`getCoreRowModel`/`getSortedRowModel`/`flexRender` per RESEARCH.md's TanStack Table setup example:
```typescript
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './table';

const columnHelper = createColumnHelper<Clinic>();
const columns = [
  columnHelper.accessor('name', { header: 'Clinic' }),
  columnHelper.accessor('status', { header: 'Status' }),
];
const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
```
Footer wraps the existing `packages/ui/src/components/shadcn-ui/pagination.tsx` primitive (`DataTablePagination`) — do not build a new pagination control. Scope strictly to `DataTable` + `DataTableColumnHeader` (sort button, `lucide-react` chevron icon) + `DataTablePagination` per UI-SPEC Gap 2's explicit "do not over-build" scope (no column-visibility, no row-selection, no drag-reorder).

---

## Shared Patterns

### Auth/Guard (backend)
**Source:** `apps/server/src/auth/guards/access-token.guard.ts` (full file) + `apps/server/src/auth/auth.module.ts` lines 20-24 (`{ provide: APP_GUARD, useClass: AccessTokenGuard }`)
**Apply to:** All 4 new controller files — no code change needed in the controllers themselves to be protected; only add `@ApiBearerAuth('access-token')` + `@ApiTags('<resource>')` class decorators for Swagger doc parity with `AuthController`. Never add `@Public()` to any Clinics/Leads/BlogPosts/PricingPlans route.

### Current-user extraction (backend)
**Source:** `apps/server/src/auth/decorators/current-user.decorator.ts` (full file, 10 lines) — reads `req.user` populated by whichever guard ran.
**Apply to:** every `create`/`update`/status-change handler across all 4 modules, to derive `updatedById` server-side — never accept it as a request body field.

### DTO validation + mass-assignment protection (backend)
**Source:** `apps/server/src/main.ts` lines 17-23 — global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
**Apply to:** every DTO in `clinics/dto`, `leads/dto`, `blog-posts/dto`, `pricing-plans/dto` — already active app-wide; DTOs just need to declare fields correctly (never `updatedById`, `id`, `createdAt` as writable fields).

### `@repo/ui` primitive composition convention (frontend)
**Source:** `packages/ui/src/components/shadcn-ui/table.tsx` and `button.tsx` (both read in full this session) — every primitive: `data-slot="<name>"` attribute, `cn(...)` className composition from `../../lib/utils`, named function + named export (no default exports), CVA for variants when the primitive has variants.
**Apply to:** `form.tsx` and `data-table.tsx` (Gaps 1 and 2) — match this shape exactly so the two new primitives are indistinguishable in style from the 33 existing ones.

### Status/Badge color mapping (frontend, cross-cutting UI-SPEC contract, not a code analog but load-bearing for every list/detail screen)
**Source:** UI-SPEC.md "Color" section, lines 127-140 — prescriptive `ClinicStatus`/`LeadStatus`/`LeadSource`/`published` → `Badge` variant table.
**Apply to:** every `DataTable` column rendering a status/source/published field across Clinics, Leads, Blog Posts, Pricing Plans list and detail screens.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/platform-admin/src/router.tsx` | route/config | request-response | First React Router usage in the monorepo — RESEARCH.md's code example is the only reference |
| `apps/platform-admin/src/lib/api/client.ts`, `schema.d.ts` | service/model | request-response | First `openapi-fetch`/`openapi-typescript` usage — no prior typed-client codegen in the repo |
| `apps/platform-admin/src/lib/auth/auth-store.ts` | store | event-driven (refresh coordination) | No prior client-side auth-token store in the repo; must implement Pitfall 2's single-in-flight-promise pattern from scratch |
| `apps/server/src/leads/leads.service.ts::convert()` | service (transaction) | event-driven / batch | No prior `$transaction` usage anywhere in `apps/server/src` to copy from — RESEARCH.md Pattern 3 is hand-derived from Prisma docs |
| `packages/ui/src/components/shadcn-ui/form.tsx` | component | — | No RHF-binding primitive exists yet in `packages/ui`; must hand-port from shadcn's upstream public registry |
| `packages/ui/src/components/shadcn-ui/data-table.tsx` | component | — | No TanStack-Table wrapper exists yet in `packages/ui`; hand-composed from `table.tsx` + `pagination.tsx`, no single analog file |

## Metadata

**Analog search scope:** `apps/server/src/{auth,prisma}`, `apps/server/src/main.ts`, `packages/db/prisma/schema.prisma`, `apps/platform-admin/src` (full scaffold), `packages/ui/src/components/shadcn-ui/{table,button,sidebar,label}.tsx`, `packages/ui/index.tsx`, `packages/ui/package.json`, `apps/web/modules/contacts/contact-form.tsx`
**Files scanned:** ~20 read directly, full-file for all files under 120 lines
**Pattern extraction date:** 2026-08-14
