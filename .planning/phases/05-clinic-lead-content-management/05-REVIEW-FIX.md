---
phase: 05-clinic-lead-content-management
fixed_at: 2026-08-14T21:30:00Z
review_path: .planning/phases/05-clinic-lead-content-management/05-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 2
status: partial
---

# Phase 5: Code Review Fix Report

**Fixed at:** 2026-08-14T21:30:00Z
**Source review:** `.planning/phases/05-clinic-lead-content-management/05-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (both Critical + WR-01, the one warning with real user-facing/correctness impact)
- Fixed: 4
- Skipped: 2 (WR-02, WR-03 — deferred to `PROJECT.md` backlog; IN-01 also deferred, not in original scope count but noted below)

## Fixed Issues

### CR-01: 401-refresh retry throws for every mutation because the Request body was already consumed

**Files modified:** `apps/platform-admin/src/lib/api/client.ts`
**Applied fix:** Stash an unconsumed `request.clone()` in the `onRequest` middleware hook, before openapi-fetch dispatches the request through `fetch()` (i.e. before its body stream is read). `onResponse` now retrieves that pre-dispatch clone (keyed by the same `Request` object reference, which openapi-fetch preserves between `onRequest`/`onResponse`) instead of calling `.clone()` on the already-sent request, which threw `TypeError: body is already used` for every `POST`/`PATCH` mutation. Verified the exact Fetch-API mechanism in isolation (old pattern throws post-dispatch, new pattern's pre-dispatch clone stays readable) and confirmed `apps/platform-admin` still builds/lints clean.

### CR-02: `PATCH /leads/:id/status` bypasses the atomic Lead→Clinic conversion invariant

**Files modified:** `apps/server/src/leads/leads.service.ts`, `apps/server/src/leads/dto/update-lead-status.dto.ts`
**Applied fix:** `LeadsService.updateStatus()` now throws `BadRequestException` if `dto.status === 'converted'`, directing callers to `POST /leads/:id/convert` instead — the only path that atomically creates the linked `Clinic` and sets `clinicId`. Added a doc comment on the DTO explaining why `'converted'` still validates at the class-validator layer but is rejected at the service layer. Verified live: `PATCH .../status {"status":"converted"}` now returns 400; a legitimate `contacted` transition and the real `POST .../convert` flow (correctly setting `clinicId`) both still work.

### WR-01: Detail/edit pages never check `isError` — a failed entity fetch shows an infinite loading skeleton

**Files modified:** `apps/platform-admin/src/modules/clinics/clinic-detail-page.tsx`, `apps/platform-admin/src/modules/leads/lead-detail-page.tsx`, `apps/platform-admin/src/modules/content/blog-post-form-page.tsx`, `apps/platform-admin/src/modules/content/pricing-plan-form-dialog.tsx`
**Applied fix:** All four screens now destructure `isError`/`refetch` from their entity query and render the same `Empty`/`EmptyTitle`/`EmptyDescription`/`EmptyContent` + Retry-button pattern the list pages already use, instead of falling through to an infinite `Skeleton`. Confirmed the underlying hooks (`useClinic`/`useLead`/`useBlogPost`/`usePricingPlan`) are all `enabled: Boolean(id)`-gated, so create-mode (empty id) never fires the query and `isError` correctly stays `false` there. `apps/platform-admin` builds and lints clean.

## Skipped Issues (deferred to PROJECT.md backlog, not fixed this pass)

### WR-02: `DataTablePagination` is exported but unusable with `DataTable` as currently wired

**File:** `packages/ui/src/components/shadcn-ui/data-table.tsx:30-44,119-169,171`
**Reason:** Dead-code-only issue this phase — no screen imports `DataTablePagination` yet (all 4 list screens render unpaginated, which is within this phase's stated scope per UI-SPEC Gap 2's "no column-visibility toggle, no row-selection" minimal-scope guardrail). Wiring real pagination is a `packages/ui` API design decision (render-prop vs. `forwardRef` vs. dropping the export) better made when a consumer actually needs it, not as a reactive fix. Logged to `PROJECT.md` backlog.
**Original issue:** See `05-REVIEW.md` WR-02 for full detail.

### WR-03: `useFormField`'s "used outside `<FormField>`" guard is dead code

**File:** `packages/ui/src/components/shadcn-ui/form.tsx:30-32,45-53`
**Reason:** Low-severity DX guard (produces a more confusing failure mode on misuse, not a runtime correctness bug for any currently-shipped screen — every `FormField` usage in this phase is correctly nested). Fixing it (context default `{} → null`) is a one-line, low-risk change but touches a shared `packages/ui` primitive outside this review-fix pass's verified scope; logged to `PROJECT.md` backlog for a future `packages/ui` touch-up.
**Original issue:** See `05-REVIEW.md` WR-03 for full detail.

### IN-01: Inconsistent `include: { updatedBy }` across `update()`/`updateStatus()` methods

**File:** `apps/server/src/blog-posts/blog-posts.service.ts`, `apps/server/src/pricing-plans/pricing-plans.service.ts`, `apps/server/src/leads/leads.service.ts`
**Reason:** Info-severity, currently masked in the UI (every detail page refetches via `GET` after mutation, which does join `updatedBy`) — no observed user-facing symptom. Logged to `PROJECT.md` backlog as a consistency cleanup.
**Original issue:** See `05-REVIEW.md` IN-01 for full detail.

---

_Fixed: 2026-08-14_
_Fixer: Claude (orchestrator, direct fix — not gsd-code-fixer subagent)_
_Iteration: 1_
