---
phase: 05-clinic-lead-content-management
reviewed: 2026-08-14T00:00:00Z
depth: standard
files_reviewed: 58
files_reviewed_list:
  - apps/platform-admin/package.json
  - apps/platform-admin/src/index.css
  - apps/platform-admin/src/lib/api/client.ts
  - apps/platform-admin/src/lib/auth/auth-store.ts
  - apps/platform-admin/src/main.tsx
  - apps/platform-admin/src/modules/auth/login-page.tsx
  - apps/platform-admin/src/modules/clinics/clinic-detail-page.tsx
  - apps/platform-admin/src/modules/clinics/clinic-form-dialog.tsx
  - apps/platform-admin/src/modules/clinics/clinics-list-page.tsx
  - apps/platform-admin/src/modules/clinics/use-clinics.ts
  - apps/platform-admin/src/modules/content/blog-post-form-page.tsx
  - apps/platform-admin/src/modules/content/blog-posts-page.tsx
  - apps/platform-admin/src/modules/content/pricing-plan-form-dialog.tsx
  - apps/platform-admin/src/modules/content/pricing-plans-page.tsx
  - apps/platform-admin/src/modules/content/use-blog-posts.ts
  - apps/platform-admin/src/modules/content/use-pricing-plans.ts
  - apps/platform-admin/src/modules/leads/date-range-picker.tsx
  - apps/platform-admin/src/modules/leads/lead-detail-page.tsx
  - apps/platform-admin/src/modules/leads/leads-inbox-page.tsx
  - apps/platform-admin/src/modules/leads/use-leads.ts
  - apps/platform-admin/src/router.tsx
  - apps/platform-admin/src/shared/components/app-shell.tsx
  - apps/server/src/app.module.ts
  - apps/server/src/auth/auth.controller.ts
  - apps/server/src/blog-posts/blog-posts.controller.ts
  - apps/server/src/blog-posts/blog-posts.module.ts
  - apps/server/src/blog-posts/blog-posts.service.ts
  - apps/server/src/blog-posts/dto/blog-post-response.dto.ts
  - apps/server/src/blog-posts/dto/create-blog-post.dto.ts
  - apps/server/src/blog-posts/dto/update-blog-post.dto.ts
  - apps/server/src/clinics/clinics.controller.ts
  - apps/server/src/clinics/clinics.module.ts
  - apps/server/src/clinics/clinics.service.ts
  - apps/server/src/clinics/dto/clinic-query.dto.ts
  - apps/server/src/clinics/dto/clinic-response.dto.ts
  - apps/server/src/clinics/dto/create-clinic.dto.ts
  - apps/server/src/clinics/dto/update-clinic.dto.ts
  - apps/server/src/leads/dto/lead-query.dto.ts
  - apps/server/src/leads/dto/lead-response.dto.ts
  - apps/server/src/leads/dto/update-lead-status.dto.ts
  - apps/server/src/leads/leads.controller.ts
  - apps/server/src/leads/leads.module.ts
  - apps/server/src/leads/leads.service.spec.ts
  - apps/server/src/leads/leads.service.ts
  - apps/server/src/pricing-plans/dto/create-pricing-plan.dto.ts
  - apps/server/src/pricing-plans/dto/pricing-plan-response.dto.ts
  - apps/server/src/pricing-plans/dto/update-pricing-plan.dto.ts
  - apps/server/src/pricing-plans/pricing-plans.controller.ts
  - apps/server/src/pricing-plans/pricing-plans.module.ts
  - apps/server/src/pricing-plans/pricing-plans.service.ts
  - package.json
  - packages/db/prisma/migrations/20260814114304_add_updated_by_trace_fields/migration.sql
  - packages/db/prisma/schema.prisma
  - packages/ui/index.tsx
  - packages/ui/package.json
  - packages/ui/src/components/shadcn-ui/data-table.tsx
  - packages/ui/src/components/shadcn-ui/form.tsx
  - packages/ui/src/components/shadcn-ui/spinner.tsx
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-08-14
**Depth:** standard
**Files Reviewed:** 58
**Status:** issues_found

## Summary

Reviewed the 4 new NestJS resource modules (Clinics, Leads, BlogPosts, PricingPlans), the Prisma schema/migration backing them, `apps/platform-admin`'s new router/auth-store/API-client infrastructure, and its 4 CRUD screens built on the 2 new `@repo/ui` primitives (`Form`, `DataTable`).

The `updatedById` mass-assignment concern called out in the brief is handled correctly everywhere: no `CreateXDto`/`UpdateXDto` ever declares `updatedById`, and every service spreads `...dto` **before** overwriting `updatedById: adminId`, so a malicious body can never win that key even without the global `ValidationPipe`'s `whitelist`/`forbidNonWhitelisted` (which is also correctly enabled in `main.ts`, closing off broader mass-assignment of undeclared fields like `messageCount`/`bookingsCount`). Prisma query construction throughout (`clinics`, `leads`, `blog-posts`, `pricing-plans` services) uses structured `where`/enum filters exclusively — no raw SQL, no injection surface found. The Lead→Clinic `convert()` transaction itself (re-fetch-inside-`$transaction`, pre- and in-transaction guards, P2002→409 translation) is well-built and covered by `leads.service.spec.ts`.

However, two BLOCKER-level issues were found: (1) the `PATCH /leads/:id/status` endpoint has no guard against setting `status: 'converted'` directly, completely bypassing the atomic `convert()` transaction the team clearly designed to protect this exact invariant — this is reachable by any authenticated caller via the documented Swagger UI, not just a theoretical concern; and (2) `apps/platform-admin`'s 401→refresh→retry interceptor in `client.ts` calls `request.clone()` on a `Request` object whose body has already been consumed by the preceding `fetch()` call, which throws for every mutation (`POST`/`PATCH` with a JSON body) once the access token has expired — defeating the single-flight refresh mechanism `auth-store.ts` was explicitly built around for exactly this case.

Additionally, all 4 "detail"/"edit" screens (`ClinicDetailPage`, `LeadDetailPage`, `BlogPostFormPage`, `PricingPlanFormDialog`) never check `isError` on their entity-fetch query, so a failed `GET` (404, 500, network error) leaves the page stuck rendering the loading `Skeleton` forever with no way to recover short of a manual reload.

## Critical Issues

### CR-01: 401-refresh retry throws for every mutation because the Request body was already consumed

**File:** `apps/platform-admin/src/lib/api/client.ts:36-38`
**Issue:** The `onResponse` middleware retries a 401'd request by cloning it after refreshing the token:

```ts
const retryRequest = request.clone();
retryRequest.headers.set('Authorization', `Bearer ${newToken}`);
return fetch(retryRequest);
```

But `request` here is the exact `Request` instance openapi-fetch already passed to `fetch(request, requestInitExt)` to produce `response` (see `openapi-fetch`'s `coreFetch`: `response = await fetch(request, requestInitExt)`). Per the Fetch spec, once a `Request`'s body has been read to send it over the network, `request.bodyUsed` is `true`, and `Request.prototype.clone()` throws `TypeError: Failed to execute 'clone' on 'Request': body is already used`. `GET` requests have no body so they're unaffected, but **every `POST`/`PATCH` with a JSON body** — `useCreateClinic`, `useUpdateClinic`, `useUpdateLeadStatus`, `useConvertLead`, `useCreateBlogPost`, `useUpdateBlogPost`, `useCreatePricingPlan`, `useUpdatePricingPlan` — will throw synchronously inside the middleware the moment a 401 occurs, instead of silently retrying with the refreshed token as designed. `openapi-fetch`'s `coreFetch` has no `try/catch` around the `onResponse` middleware loop, so this exception propagates straight out of `api.POST/PATCH(...)` as an uncaught `TypeError`, bypassing the `ApiError`/`response.ok` handling every mutation hook relies on. In practice: once the in-memory access token expires (normal, expected — it's intentionally not persisted/long-lived per the comments in `auth-store.ts`), the *next* write action a platform admin performs (edit a clinic, convert a lead, publish a blog post, etc.) fails with a generic, unrecoverable error instead of transparently refreshing and succeeding — exactly the scenario the single-flight `refreshPromise` machinery in `auth-store.ts` was built to handle gracefully.
**Fix:** Clone the request *before* the first `fetch()` call happens (not reachable from `onResponse` alone), or — simpler — construct a fresh `Request`/fetch call from the original `fetchOptions` instead of cloning the already-sent one. A minimal fix inside the existing middleware is to reconstruct a new request from `request.url`/`method`/headers plus the **original, unconsumed** body, which isn't available at this layer; the more robust fix is to retry at a layer that still has the original `body` object (e.g. wrap `api.POST/PATCH/DELETE` calls, or perform the refresh check pre-emptively before the request is sent):

```ts
// Option: read + stash the body before dispatch via onRequest, and rebuild
// the retry request from the stashed body instead of cloning the spent one.
async onRequest({ request }) {
  const token = getAccessToken();
  if (token) request.headers.set('Authorization', `Bearer ${token}`);
  return request;
},
async onResponse({ request, response }) {
  if (response.status !== 401) return response;
  const url = new URL(request.url);
  if (NO_REFRESH_RETRY_PATHS.some((p) => url.pathname.endsWith(p))) return response;

  const newToken = await refreshAccessToken();
  if (!newToken) return response;

  // Body-safe retry: reconstruct from method/url/headers + re-read body
  // BEFORE the first fetch (e.g. buffer it in onRequest and pass via a
  // WeakMap keyed by request), or fall back to a pre-flight refresh check
  // in onRequest so 401s on write requests never happen in the first place.
  ...
},
```
At minimum, add a regression test/manual check that a `PATCH`/`POST` mutation actually survives a simulated 401 → refresh → retry cycle — the current implementation has never been able to succeed for any of them.

### CR-02: `PATCH /leads/:id/status` bypasses the atomic Lead→Clinic conversion invariant

**File:** `apps/server/src/leads/leads.service.ts:45-62`, `apps/server/src/leads/dto/update-lead-status.dto.ts:7-11`
**Issue:** `UpdateLeadStatusDto.status` is validated with `@IsEnum(LeadStatus)`, and `LeadStatus` includes `'converted'` (`packages/db/prisma/schema.prisma:75-79`). `LeadsService.updateStatus()` performs a raw `prisma.lead.update({ data: { status: dto.status, updatedById } })` with **no check that `dto.status !== 'converted'`**, and no coordination with `clinicId` at all. This means:

1. Any authenticated platform admin (or a future UI reuse of `useUpdateLeadStatus`) can `PATCH /leads/{id}/status` with `{ "status": "converted" }` directly — fully bypassing the carefully-built `convert()` transaction (`leads.service.ts:64-125`) that creates the `Clinic` row and links `clinicId`. The Lead ends up with `status: 'converted'` and `clinicId: null`, violating the invariant the rest of the codebase assumes (`LeadDetailPage` only renders the "Converted to clinic" link `if (lead.status === 'converted' && lead.clinicId)`, silently hiding the corruption rather than surfacing it).
2. The same endpoint also allows moving status **away** from `'converted'` (e.g. back to `'new'`) on a Lead that *was* legitimately converted, without clearing `clinicId` — leaving a non-converted Lead still pointing at a real Clinic.
3. Today's frontend `LeadDetailPage.handleStatusChange` happens to route a `'converted'` selection through the confirmation dialog/`convertLead` mutation instead of `updateStatus` — but that's a UI-layer convention, not an API-level guarantee, and the Swagger docs (`/api/docs`) expose this endpoint directly with no such guard.

**Fix:** Reject `'converted'` as a value for this endpoint entirely — conversion has its own dedicated, transactional route:

```ts
async updateStatus(id: string, dto: UpdateLeadStatusDto, adminId: string) {
  if (dto.status === 'converted') {
    throw new BadRequestException(
      'Use POST /leads/:id/convert to mark a Lead as converted',
    );
  }
  try {
    return await this.prisma.lead.update({
      where: { id },
      data: { status: dto.status, updatedById: adminId },
    });
  } catch (error) { /* ...unchanged... */ }
}
```
Alternatively (or additionally), scope `UpdateLeadStatusDto.status` to a narrower type (`Exclude<LeadStatus, 'converted'>` equivalent via a dedicated `@IsIn(['new', 'contacted'])`) so it's unrepresentable at the DTO/Swagger level, not just runtime-checked.

## Warnings

### WR-01: Detail/edit pages never check `isError` — a failed entity fetch shows an infinite loading skeleton

**File:** `apps/platform-admin/src/modules/clinics/clinic-detail-page.tsx:45,104-112`; `apps/platform-admin/src/modules/leads/lead-detail-page.tsx:54,61-69`; `apps/platform-admin/src/modules/content/blog-post-form-page.tsx:74-76,139-147`; `apps/platform-admin/src/modules/content/pricing-plan-form-dialog.tsx:72-74,154-159`
**Issue:** All four "single entity" screens destructure only `data`/`isPending` from their `useQuery` hook (e.g. `const { data: clinic, isPending } = useClinic(id ?? '')`) and gate rendering on `if (isPending || !clinic) return <Skeleton ... />`. When the query settles with an error (deleted/invalid id → 404, 500, network failure), `isPending` becomes `false` and `data` stays `undefined`, so `!clinic` remains `true` — the component renders the loading `Skeleton` forever, with no error message, no retry action, and no way out except a manual page reload. This is the exact opposite of the list pages (`ClinicsListPage`, `LeadsInboxPage`, `BlogPostsPage`, `PricingPlansPage`), which all correctly branch on `isError` with a retry button. It's especially reachable in practice: navigating to `/clinics/:id`, `/leads/:id`, or `/content/blog/:id/edit` for a stale/bookmarked/copy-pasted id that no longer exists silently hangs the page.
**Fix:** Mirror the list pages' `isError` handling, e.g.:
```ts
const { data: clinic, isPending, isError, refetch } = useClinic(id ?? '');
...
if (isPending) return <Skeleton ... />;
if (isError || !clinic) {
  return (
    <Empty>
      <EmptyTitle>Couldn&apos;t load this clinic.</EmptyTitle>
      <EmptyContent><Button onClick={() => refetch()}>Retry</Button></EmptyContent>
    </Empty>
  );
}
```
Apply the same pattern to `LeadDetailPage`, `BlogPostFormPage` (edit mode), and `PricingPlanFormDialog` (edit mode).

### WR-02: `DataTablePagination` is exported but unusable with `DataTable` as currently wired

**File:** `packages/ui/src/components/shadcn-ui/data-table.tsx:30-44,119-169,171`
**Issue:** `DataTable` builds its own internal `useReactTable` instance with only `getCoreRowModel`/`getSortedRowModel` configured (no `getPaginationRowModel`), and never exposes that table instance to callers (no render-prop, no ref, no `table` return value). `DataTablePagination` is a separate export that takes a `table: TanstackTable<TData>` prop and calls `table.nextPage()`/`previousPage()`/`getPageCount()` — all of which are core TanStack Table state mutators that exist regardless of which row models are wired in, but which only actually change what's *rendered* if `getPaginationRowModel` is configured on that same table instance. Since `DataTable` never configures it, and there's currently no way to hand `DataTable`'s internal table to `DataTablePagination`, the two cannot be composed together as written — `DataTablePagination` is dead code today, and if a future page imports it expecting it to paginate a `DataTable`, clicking next/previous will update internal pagination state that the rendered rows never reflect (all rows always render, unpaginated).
**Fix:** Either (a) have `DataTable` accept `pagination`/`onPaginationChange` props and internally call `getPaginationRowModel()`, exposing its `table` via a render-prop or `forwardRef`, so `DataTablePagination` becomes composable; or (b) drop `DataTablePagination` from this phase's exports until a consumer actually needs it, to avoid shipping a component that silently does nothing when adopted.

### WR-03: `useFormField`'s "used outside `<FormField>`" guard is dead code

**File:** `packages/ui/src/components/shadcn-ui/form.tsx:30-32,45-53`
**Issue:** `FormFieldContext` is created with a default value of `{} as FormFieldContextValue` (line 30-32), which is a truthy empty object, not `undefined`/`null`. `useFormField()`'s guard `if (!fieldContext) { throw new Error('useFormField should be used within <FormField>'); }` (line 52-54) can therefore never actually fire — `fieldContext` is always a truthy object, even when no `<FormField>` ancestor exists. In that misuse case, `fieldContext.name` is `undefined`, and `useFormField` proceeds to call `getFieldState(undefined, formState)` on react-hook-form instead of throwing the intended developer-facing error, producing a more confusing failure mode (or silently-wrong `id`s: `` `${id}-form-item` `` etc. built from an `undefined`-derived context) for anyone who uses `FormLabel`/`FormControl`/`FormMessage` outside a `FormField` by mistake.
**Fix:** Give the context a genuinely falsy/sentinel default (`null`) and update the type accordingly:
```ts
const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);
...
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }
  ...
}
```

## Info

### IN-01: Inconsistent `include: { updatedBy: ... }` across `update()`/`updateStatus()` methods

**File:** `apps/server/src/clinics/clinics.service.ts:46-52` vs `apps/server/src/blog-posts/blog-posts.service.ts:52-61`, `apps/server/src/pricing-plans/pricing-plans.service.ts:36-42`, `apps/server/src/leads/leads.service.ts:45-52`
**Issue:** `ClinicsService.update()` passes `include: { updatedBy: { select: { email: true } } }` so its `PATCH` response includes the joined `updatedBy`, matching `ClinicResponseDto`. The equivalent `update()`/`updateStatus()` methods for `BlogPost`, `PricingPlan`, and `Lead` don't include that relation, so their `PATCH` responses omit `updatedBy` even though `BlogPostResponseDto`/`PricingPlanResponseDto`/`LeadResponseDto` all document it as part of the shape. Currently masked in the UI because every "detail" page re-fetches via `GET /{resource}/{id}` (which does join `updatedBy`) after the mutation invalidates the query cache — but any consumer relying directly on the mutation's own response (rather than the subsequent refetch) would see `updatedBy: undefined` right after a save.
**Fix:** Add `include: { updatedBy: { select: { email: true } } }` to `BlogPostsService.update()`, `PricingPlansService.update()`, and `LeadsService.updateStatus()`/`convert()`'s final `tx.lead.update()` for consistency with `ClinicsService.update()`.

---

_Reviewed: 2026-08-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
