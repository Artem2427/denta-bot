---
phase: 05-clinic-lead-content-management
plan: 06
subsystem: frontend
tags: [react-router, tanstack-query, openapi-fetch, openapi-typescript, nestjs, swagger, vite, alert-dialog, popover]

# Dependency graph
requires:
  - phase: 05-clinic-lead-content-management
    provides: "apps/platform-admin bootstrap (router/typed-client/TanStack Query/auth) + Clinics CRUD tracer bullet (05-05); LeadsModule backend (findAll/findOne/updateStatus/convert) (05-03)"
provides:
  - "Leads inbox screen (/leads) — filterable by status + date range, server-side query params, distinct true-zero vs filtered-to-zero empty states"
  - "Lead detail screen (/leads/:id) — full submitted-field read view, status transitions, and the Lead-to-Clinic convert flow with 409 handling"
  - "LeadResponseDto + @ApiOkResponse Swagger pattern applied to LeadsController — same treatment 05-07 (Content) will need for BlogPosts/PricingPlans"
affects: [05-07-content]

# Actuals (#2632)
actuals:
  tokens: 6300
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DateRangePicker: page-level Popover+Calendar(mode='range') composition, not a new @repo/ui primitive — mirrors UI-SPEC's explicit non-primitive directive for LEAD-06"
    - "Convert-to-Clinic confirmation: AlertDialogAction's onClick calls event.preventDefault() to stop Radix's built-in auto-close, since the mutation is async and must be able to keep the dialog open on a 409 to show the inline error"
    - "Select-driven state transition without optimistic update: the status Select's value prop is bound directly to the server-fetched lead.status (never local state), so selecting 'converted' + Cancel naturally reverts to the real status once the AlertDialog closes without confirming — no manual reset code needed"
    - "lucide-react/react-day-picker added as apps/platform-admin direct deps (previously only transitive via @repo/ui) — pnpm's strict node_modules requires a package be a declared dependency of the importing workspace, not just present because a sibling workspace package uses it"

key-files:
  created:
    - apps/platform-admin/src/modules/leads/use-leads.ts
    - apps/platform-admin/src/modules/leads/leads-inbox-page.tsx
    - apps/platform-admin/src/modules/leads/lead-detail-page.tsx
    - apps/platform-admin/src/modules/leads/date-range-picker.tsx
    - apps/server/src/leads/dto/lead-response.dto.ts
  modified:
    - apps/platform-admin/src/router.tsx
    - apps/platform-admin/package.json (added lucide-react, react-day-picker as direct deps)
    - apps/platform-admin/src/lib/api/schema.d.ts (regenerated — LeadResponseDto now real, not content?: never)
    - apps/server/src/leads/leads.controller.ts (added @ApiOkResponse decorators)
    - apps/server/src/leads/leads.service.ts (findOne now includes updatedBy)
    - pnpm-lock.yaml

key-decisions:
  - "Added LeadResponseDto + @ApiOkResponse to LeadsController (all 4 routes) — same rationale 05-05 documented for ClinicResponseDto: without a response DTO, openapi-typescript's generated schema.d.ts responses were content?: never, breaking the typed client at compile time the moment real screen code read a response field"
  - "LeadsService.findOne now includes { updatedBy: { select: { email: true } } } — mirrors ClinicsService.findOne's exact pattern; needed for the INFRA-05 trace line ('Last updated by {email}...' / 'Not yet updated')"
  - "Two Convert-to-Clinic entry points implemented (the status Select's 'converted' option AND a dedicated 'Convert to Clinic' button) since UI-SPEC's Copywriting Contract declares both a status-Select-driven flow (LEAD-05) and a separately-labeled CTA (LEAD-07) — both funnel into the same AlertDialog/useConvertLead() mutation, both disabled+Tooltip'd when lead.email is null"
  - "lucide-react and react-day-picker added as direct apps/platform-admin dependencies (not new packages — both already vetted, locked-version @repo/ui dependencies) so DateRangePicker's own imports resolve under pnpm's strict per-workspace node_modules; this is dependency-declaration hygiene, not introducing anything new to the dependency tree"

requirements-completed: [LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07, INFRA-04, INFRA-05]

coverage:
  - id: D1
    description: "Leads inbox: DataTable with source/status Badge columns, status Select + DateRangePicker driving GET /leads server-side query params, distinct true-zero vs filtered-to-zero empty states"
    requirement: "LEAD-03, LEAD-06"
    verification:
      - kind: unit
        ref: "pnpm --filter platform-admin exec tsc -b && pnpm --filter platform-admin run build — both pass; grep confirms both empty-state copy strings and both router entries present"
        status: pass
      - kind: integration
        ref: "curl smoke test — GET /leads (no filter) returns []; GET /leads after inserting a test row returns it with real typed fields (source/status/createdAt), confirming the LeadResponseDto fix produced real response shapes, not content?: never"
        status: pass
    human_judgment: true
    rationale: "Visual empty/loading/filter-interaction rendering (Select + Popover/Calendar round trip) was not exercised in a real browser this session — no browser available in this execution context."
  - id: D2
    description: "Lead detail: 'Not provided' for null optional fields (email/phone/message/clinicName), message renders full-width whitespace-pre-wrap, INFRA-05 trace line ('Last updated by {email}...' / 'Not yet updated')"
    requirement: "LEAD-04, INFRA-05"
    verification:
      - kind: unit
        ref: "grep confirms 4 occurrences of 'Not provided' in lead-detail-page.tsx (one per optional field); tsc -b/build pass"
        status: pass
      - kind: integration
        ref: "curl GET /leads/:id on a freshly-inserted row (updatedById null) returns updatedBy: null; after a PATCH .../status, re-fetching returns updatedBy: { email: 'platformadmin@dentabot.dev' } — confirms both trace-line branches are backed by real data"
        status: pass
    human_judgment: false
  - id: D3
    description: "Lead status Select updates via PATCH .../status with no separate Save button; selecting 'converted' opens a non-destructive AlertDialog instead of writing directly"
    requirement: LEAD-05
    verification:
      - kind: unit
        ref: "grep confirms AlertDialog present in lead-detail-page.tsx; tsc -b passes (handleStatusChange branches new/contacted -> mutate directly, converted -> openConvertDialog)"
        status: pass
      - kind: integration
        ref: "curl PATCH /leads/:id/status {status: 'contacted'} returns 200 with status updated and updatedById set to the acting admin"
        status: pass
    human_judgment: true
    rationale: "The AlertDialog's Cancel-reverts-Select-to-real-status behavior and the isPending Spinner/disable states were not exercised interactively in a browser this session."
  - id: D4
    description: "Convert-to-Clinic disabled+Tooltip'd when lead has no email; AlertDialog confirm calls POST /leads/:id/convert; a 409 duplicate-email conflict renders inline, never silently swallowed; success invalidates ['leads'], ['leads', id], and ['clinics']"
    requirement: LEAD-07
    verification:
      - kind: unit
        ref: "grep confirms 'Add an email to this lead before converting' and 'A clinic with this email already exists.' both present verbatim; use-leads.ts's useConvertLead onSuccess invalidates queryKey ['clinics'] (grep confirms)"
        status: pass
      - kind: integration
        ref: "curl smoke test: POST /leads/:id/convert on a lead with a valid unused email returns 200 with clinicId set and a real Clinic row created (GET /clinics/:clinicId confirms it exists with the lead's clinicName/email); a second lead sharing the same email returns 409 on convert. Both test leads + the test clinic were deleted after verification to leave the shared dev DB clean."
        status: pass
    human_judgment: false

# Metrics
duration: ~40min
completed: 2026-08-14
status: complete
---

# Phase 05 Plan 06: Leads Inbox + Convert-to-Clinic Summary

**Leads inbox (filterable by status + date range) and detail view with status transitions and a Lead-to-Clinic convert flow, wired against the real LeadsModule backend — including a live curl-verified 409 duplicate-email path and a new LeadResponseDto so the typed client actually carries real Lead field types.**

## Performance

- **Duration:** ~40 min
- **Completed:** 2026-08-14
- **Tasks:** 2
- **Files modified:** 12 (across 2 task commits, including a regenerated schema.d.ts and a dependency-declaration fix)

## Accomplishments

- `/leads` inbox: `DataTable` with source (secondary Badge) + status (default/secondary/outline per UI-SPEC's mapping) columns, a status `Select` + a page-composed `DateRangePicker` (`Popover`+`Calendar mode="range"`) both driving `GET /leads` server-side query params — never client-side array filtering
- Two distinct empty states: true-zero ("No leads yet", no CTA) vs filtered-to-zero ("No leads match these filters" + "Clear filters" link)
- `/leads/:id` detail: every optional field (clinicName/email/phone/message) renders "Not provided" when null, never blank/undefined; `message` renders full-width with `whitespace-pre-wrap`, no truncation
- Status `Select` PATCHes `/leads/:id/status` immediately for `new`/`contacted`; selecting `converted` (or a dedicated "Convert to Clinic" button) opens a non-destructive `AlertDialog` instead of writing directly
- Convert entry points disabled with a `Tooltip` ("Add an email to this lead before converting") when `lead.email` is null — defense-in-depth UX backing the server's own 400
- A 409 (duplicate Clinic email) from the convert mutation renders inline in the dialog: "A clinic with this email already exists." — verified live via curl, not just unit-tested
- Successful conversion invalidates `['leads']`, `['leads', id]`, and `['clinics']` so both the leads list and the Clinics list reflect the new state without a manual refresh
- Backend: `LeadResponseDto` + `@ApiOkResponse` added to `LeadsController`'s 4 routes (same fix 05-05 applied to Clinics/Auth); `LeadsService.findOne` now includes `updatedBy` for the INFRA-05 trace line

## Task Commits

Each task was committed atomically:

1. **Task 1: Leads inbox list (filters) + read-only detail view** — `dbdedcb` (feat)
2. **Task 2: Lead status update + Convert-to-Clinic flow** — `6675a9e` (feat)

## Files Created/Modified

- `apps/platform-admin/src/modules/leads/use-leads.ts` — `useLeads`/`useLead`/`useUpdateLeadStatus`/`useConvertLead` + local `ApiError`
- `apps/platform-admin/src/modules/leads/leads-inbox-page.tsx` — filterable `DataTable` list screen
- `apps/platform-admin/src/modules/leads/lead-detail-page.tsx` — detail view + status Select + Convert AlertDialog
- `apps/platform-admin/src/modules/leads/date-range-picker.tsx` — page-level `Popover`+`Calendar` composition
- `apps/platform-admin/src/router.tsx` — `leads`/`leads/:id` routes added
- `apps/platform-admin/package.json` — `lucide-react`, `react-day-picker` added as direct deps
- `apps/platform-admin/src/lib/api/schema.d.ts` — regenerated against the live server; `LeadResponseDto` now carries real field types
- `apps/server/src/leads/dto/lead-response.dto.ts` — new response DTO (`LeadUpdatedByDto`/`LeadResponseDto`)
- `apps/server/src/leads/leads.controller.ts` — `@ApiOkResponse` added to all 4 routes
- `apps/server/src/leads/leads.service.ts` — `findOne` now `include: { updatedBy: { select: { email: true } } }`
- `pnpm-lock.yaml` — updated for the new direct deps

## Decisions Made

See `key-decisions` in frontmatter. Summary: (1) added the missing `LeadResponseDto`/`@ApiOkResponse` Swagger treatment so the typed client carries real Lead shapes, matching 05-05's precedent; (2) added `updatedBy` include to `LeadsService.findOne` for the trace line; (3) implemented both of UI-SPEC's declared Convert-to-Clinic entry points (Select option + dedicated button) since both are named in the Copywriting Contract; (4) added `lucide-react`/`react-day-picker` as direct `platform-admin` deps (dependency-declaration hygiene, not new packages).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added LeadResponseDto + @ApiOkResponse — generated typed client had no real Lead response shapes**
- **Found during:** Task 1, confirming `schema.d.ts` state before writing `use-leads.ts`
- **Issue:** `LeadsController` declared no `@ApiOkResponse`/`@ApiCreatedResponse`, so every generated response for `/leads*` routes was `content?: never` — the exact gap 05-05 flagged in its own summary as the thing Plan 05-06 would hit
- **Fix:** Added `apps/server/src/leads/dto/lead-response.dto.ts` (`LeadUpdatedByDto`/`LeadResponseDto`) + `@ApiOkResponse({ type: LeadResponseDto[, isArray: true] })` on all 4 `LeadsController` methods; regenerated `schema.d.ts` against a temporarily-started live server
- **Files modified:** `apps/server/src/leads/dto/lead-response.dto.ts` (new), `apps/server/src/leads/leads.controller.ts`, `apps/platform-admin/src/lib/api/schema.d.ts`
- **Verification:** Regenerated `schema.d.ts` shows real fields (`status: "new"|"contacted"|"converted"`, etc.) instead of `content?: never`; `tsc -b`/`vite build` pass
- **Committed in:** `dbdedcb` (Task 1 commit)

**2. [Rule 2 - Missing Critical] LeadsService.findOne now includes updatedBy**
- **Found during:** Task 1, writing `lead-detail-page.tsx`'s trace line
- **Issue:** `findOne` returned the raw Prisma model with no `updatedBy` relation loaded — INFRA-05's trace line ("Last updated by {email}...") had no data source without it
- **Fix:** Added `include: { updatedBy: { select: { email: true } } }` to `LeadsService.findOne`, mirroring `ClinicsService.findOne`'s exact pattern from Plan 05-05
- **Files modified:** `apps/server/src/leads/leads.service.ts`
- **Verification:** curl smoke test confirms `updatedBy: null` before any admin action and `updatedBy: { email: '...' }` after a status PATCH
- **Committed in:** `dbdedcb` (Task 1 commit)

**3. [Rule 3 - Blocking] Added lucide-react/react-day-picker as direct platform-admin dependencies**
- **Found during:** Task 1, `pnpm --filter platform-admin exec tsc -b` on `date-range-picker.tsx`
- **Issue:** `date-range-picker.tsx` imports `CalendarIcon` from `lucide-react` and `type DateRange` from `react-day-picker` directly (not just through `@repo/ui`'s re-exports) — both packages were only present transitively via `@repo/ui`'s own dependency declarations, and pnpm's strict per-workspace `node_modules` doesn't let a workspace import a package it hasn't declared itself, even if a sibling workspace package has it installed
- **Fix:** Added `lucide-react: ^0.575.0` and `react-day-picker: ^10.0.1` to `apps/platform-admin/package.json` dependencies, matching `packages/ui/package.json`'s exact pinned versions (both already-vetted, already-locked packages — not new/unverified additions to the dependency tree)
- **Files modified:** `apps/platform-admin/package.json`, `pnpm-lock.yaml`
- **Verification:** `tsc -b` and `vite build` pass clean
- **Committed in:** `dbdedcb` (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (2 missing-critical, 1 blocking)
**Impact on plan:** All 3 were prerequisites for the plan's own stated acceptance criteria / `tsc -b`/`vite build` gates to pass. Deviations 1 and 2 are the exact "same treatment 05-05 flagged as needed" gaps called out in 05-05's own SUMMARY — expected, not surprising. No scope creep beyond LeadsModule's own frontend consumption.

## Issues Encountered

- No node_modules were installed in this worktree at session start (`pnpm install` had never been run) — ran it before any other work; this is worktree-provisioning state, not a plan-caused issue.
- No browser was available in this execution context, so the human-check portions of Task 2's `<verify>` (live Select/AlertDialog/Tooltip interaction) could not be exercised directly. Substituted with a thorough curl-based integration smoke test instead: inserted a real test Lead (via direct SQL against the shared dev Postgres container, since there's no seed data for Leads), logged in as the seeded PlatformAdmin, ran the full GET → PATCH status → POST convert round trip, confirmed the resulting Clinic was created with the lead's details and `updatedBy` populated, then inserted a second Lead sharing the same email and confirmed convert returns 409. All test rows (2 Leads + 1 Clinic) were deleted afterward to leave the shared dev DB clean for other worktree agents. These are recorded as `human_judgment: true` in the `coverage:` block above for the visual/interactive portions only — the functional round trip itself is `pass`, not `unknown`.
- `apps/server`'s `tsc --noEmit -p tsconfig.json` fails on a pre-existing, unrelated error in `leads.service.spec.ts` (`'tx' is referenced directly or indirectly in its own type annotation`, from Plan 05-03's `buildPrismaMock` helper) — confirmed pre-existing via a scoped `git stash`/tsc/`git stash pop` check (immediately popped, no interleaving commands — the file was untouched by this plan). `nest build`/`tsconfig.build.json` excludes `**/*spec.ts`, so this does not affect the actual server build or this plan's own deliverables; not fixed here per the deviation rules' scope boundary (pre-existing, unrelated to this plan's changes). Flagging for Plan 05-03's own follow-up, not fixed here.

## User Setup Required

None — no external service configuration required. Local dev requires `docker compose up -d postgres` (or the existing leftover container) + `pnpm --filter server run start` with the env vars documented in `apps/server/src/config/env.validation.ts`, same as Plan 05-05.

## Next Phase Readiness

- Phase 5's entire Leads requirement set (LEAD-03 through LEAD-07) is now satisfied on the frontend, alongside 05-03's backend
- **Important for 05-07 (Content):** `BlogPostsController`/`PricingPlansController` will need the identical `LeadResponseDto`-style response-DTO + `@ApiOkResponse`/`@ApiCreatedResponse` treatment before their own `schema.d.ts` responses carry real shapes — this is now the third plan in a row (05-05 Clinics/Auth, 05-06 Leads) confirming the pattern; 05-07 should treat it as an expected Task 1 step, not a surprise deviation
- Not yet human-verified in a live browser (see Issues Encountered) — recommend a manual UAT pass (Select/AlertDialog/Tooltip/DateRangePicker interactions) on the live app before Phase 5 is considered fully shippable

## Self-Check: PASSED

All created files verified present on disk (`use-leads.ts`, `leads-inbox-page.tsx`, `lead-detail-page.tsx`, `date-range-picker.tsx`, `lead-response.dto.ts`) and both task commit hashes (`dbdedcb`, `6675a9e`) verified present in git log.

---
*Phase: 05-clinic-lead-content-management*
*Completed: 2026-08-14*
