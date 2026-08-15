---
phase: 06-apps-web-integration
plan: 01
subsystem: api
tags: [nestjs, throttler, prisma, react-hook-form, zod, radix-ui, dialog, leads]

requires:
  - phase: 04-backend-foundation-auth
    provides: PlatformAdmin JWT auth, global fail-closed AccessTokenGuard, @Public() decorator, Prisma schema (Lead/LeadSource)
  - phase: 05-clinic-lead-content-management
    provides: LeadsController/LeadsService/LeadsModule scaffold (GET/PATCH/convert routes), LeadResponseDto
provides:
  - "POST /leads — public, rate-limited (5/min per client), creates real Lead rows"
  - "getServerApiUrl()/getClientApiUrl() — apps/web's backend base-URL convention, consumed by Plans 06-02/06-03"
  - "PremiumDialog primitive (apps/web's first modal/dialog component)"
  - "Demo modal lead-capture form (source=demo)"
affects: [06-02, 06-03]

actuals:
  tokens: 5200
  tasks: 2
  commits: 2

tech-stack:
  added: ["@nestjs/throttler@6.5.0"]
  patterns:
    - "Method-level @Public() + @UseGuards(ThrottlerGuard) + @Throttle() on a single new action within an otherwise-protected controller"
    - "apps/web client-side lead forms POST via plain fetch() to getClientApiUrl() + '/leads' — no Server Action wrapper"
    - "PremiumDialog: Radix Dialog re-styled with dt-* tokens, mirroring packages/ui/dialog.tsx's import shape but not its styling"

key-files:
  created:
    - apps/server/src/leads/dto/create-lead.dto.ts
    - apps/web/.env.example
    - apps/web/shared/lib/api-url.ts
    - apps/web/shared/components/premium-dialog.tsx
    - apps/web/modules/demo/demo-lead-form.tsx
    - apps/web/modules/demo/demo-cta.tsx
  modified:
    - apps/server/src/leads/leads.controller.ts
    - apps/server/src/leads/leads.service.ts
    - apps/server/src/leads/leads.module.ts
    - apps/server/package.json
    - apps/web/modules/contacts/contact-form.tsx
    - apps/web/app/demo/page.tsx
    - apps/web/.gitignore

key-decisions:
  - "apps/web/.gitignore's blanket .env* pattern was extended with !.env.example so the plan's required .env.example file (documenting API_URL/NEXT_PUBLIC_API_URL) could actually be committed — the existing .gitignore comment ('can opt-in for committing if needed') anticipated exactly this."
  - "Demo modal form (demo-lead-form.tsx) duplicates contact-form.tsx's zod schema/fetch logic verbatim rather than extracting a shared component, per 06-CONTEXT.md D-11's explicit low-risk-duplication call for two call sites."

patterns-established:
  - "New public write routes on an existing protected controller: @Public() + @UseGuards(ThrottlerGuard) + @Throttle() at the METHOD level only, never class-level — every other route stays behind the global AccessTokenGuard."

requirements-completed: [LEAD-01, LEAD-02]

coverage:
  - id: D1
    description: "POST /leads (public, rate-limited 5/min) creates a real Lead row; GET /leads (existing admin route) stays 401-protected"
    requirement: "LEAD-01"
    verification:
      - kind: integration
        ref: "live curl against running apps/server: POST /leads → 201 w/ id; POST w/o email+phone → 400; 6th POST in window → 429; GET /leads → 401"
        status: pass
    human_judgment: false
  - id: D2
    description: "Contacts form (contact-form.tsx) submits real data via fetch() to POST /leads, with loading ('Надсилаємо…'/disabled), generic-error, and 429 rate-limit toast states, preserving field values on failure"
    requirement: "LEAD-01"
    verification:
      - kind: unit
        ref: "grep assertion: getClientApiUrl usage in contact-form.tsx (>=1); tsc --noEmit clean (excl. pre-existing packages/ui csstype conflict)"
        status: pass
    human_judgment: true
    rationale: "Loading/error/429 UI states and field-preservation behavior are visual/interactive — no browser-level test exists this phase to prove the toast copy and disabled-state render correctly; a human should click through the form once."
  - id: D3
    description: "'Замовити демо' CTA on /demo opens a modal (PremiumDialog) reusing the Contacts form's field set, POSTing Leads tagged source=demo"
    requirement: "LEAD-02"
    verification:
      - kind: unit
        ref: "grep assertions: demo-cta.tsx contains 'Замовити демо' + 'PremiumDialogTrigger'; demo/page.tsx contains 'DemoCta'; demo-lead-form.tsx contains \"source: 'demo'\"; premium-dialog.tsx contains aria-label=\"Закрити\"; tsc --noEmit clean"
        status: pass
    human_judgment: true
    rationale: "Modal open/close (Radix focus trap, ESC, overlay-click), visual layout (max-w-md/p-6 sm:p-8/max-h-[90vh]), and the reused form's actual submit UX are visual/interactive — no browser-level test exists this phase; a human should open the modal once."

duration: 22min
completed: 2026-08-15
status: complete
---

# Phase 6 Plan 1: Lead Capture Tracer Summary

**Public rate-limited `POST /leads` (NestJS + `@nestjs/throttler`) wired end-to-end from both the Contacts form and a new Demo modal — the phase's tracer bullet proving the full public-write path before Plans 06-02/06-03 build the public-read side.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-08-15T06:50:00Z
- **Completed:** 2026-08-15T07:12:04Z
- **Tasks:** 2
- **Files modified:** 13 (7 created, 6 modified)

## Accomplishments
- `POST /leads` — new public, method-level `@Public()` route on the existing protected `LeadsController`, rate-limited to 5 requests/minute per client via `@nestjs/throttler`'s `ThrottlerGuard`/`@Throttle()`, backed by a new `CreateLeadDto` (email-or-phone required via `@ValidateIf`, `status`/`updatedById`/`clinicId` never accepted)
- `apps/web/modules/contacts/contact-form.tsx` rewired from a mocked `setTimeout` to a real `fetch()` POST against `getClientApiUrl() + '/leads'`, with loading (`Надсилаємо…`/disabled), generic-failure, and distinct 429 rate-limit toast states, preserving field values on failure
- New `apps/web/shared/lib/api-url.ts` (`getServerApiUrl`/`getClientApiUrl`) — single source of truth for the backend base URL, and `apps/web/.env.example` documenting `API_URL`/`NEXT_PUBLIC_API_URL`
- New `PremiumDialog` primitive (`apps/web`'s first modal component) — Radix `Dialog` re-styled with `dt-*` tokens, `max-w-md`/`p-6 sm:p-8`/`max-h-[90vh] overflow-y-auto`, `X` close button with `aria-label="Закрити"`
- New "Замовити демо" CTA on `/demo`'s header (visible on both bot/admin tabs) opening `DemoLeadForm` inside `PremiumDialog` — same field set/zod schema as Contacts, tagged `source: 'demo'`

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end "Contacts form persists a Lead" — POST /leads, public, rate-limited** - `728e159` (feat)
2. **Task 2: Demo modal form — "Замовити демо" CTA + PremiumDialog + Lead capture (source=demo)** - `a381b98` (feat)

_No separate plan-metadata commit yet — this worktree agent does not update STATE.md/ROADMAP.md; the orchestrator commits those centrally after merge._

## Files Created/Modified
- `apps/server/src/leads/dto/create-lead.dto.ts` - `CreateLeadDto`: name required, clinicName/message optional, email XOR phone required via `@ValidateIf`, source restricted to `LeadSource` enum
- `apps/server/src/leads/leads.service.ts` - added `create(dto)` — plain `prisma.lead.create`, no unique-constraint handling needed
- `apps/server/src/leads/leads.controller.ts` - added `POST /` handler: `@Public() @UseGuards(ThrottlerGuard) @Throttle({ default: { limit: 5, ttl: 60000 } })`; updated the file's stale header comment
- `apps/server/src/leads/leads.module.ts` - registered `ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])`
- `apps/server/package.json` - added `@nestjs/throttler@6.5.0`
- `apps/web/.env.example` - documents `API_URL` (server-side) and `NEXT_PUBLIC_API_URL` (client-side)
- `apps/web/.gitignore` - added `!.env.example` exception to the blanket `.env*` ignore rule
- `apps/web/shared/lib/api-url.ts` - `getServerApiUrl()`/`getClientApiUrl()`
- `apps/web/modules/contacts/contact-form.tsx` - real `fetch()` POST replacing the mocked `setTimeout`; loading/error/429 states; submit button disabled+relabeled while in flight
- `apps/web/shared/components/premium-dialog.tsx` - `PremiumDialog`/`PremiumDialogTrigger`/`PremiumDialogContent`/`PremiumDialogTitle`
- `apps/web/modules/demo/demo-lead-form.tsx` - `DemoLeadForm`, Contacts' schema/fetch pattern duplicated with `source: 'demo'`
- `apps/web/modules/demo/demo-cta.tsx` - `DemoCta`, composes Dialog+Trigger+Content, uncontrolled
- `apps/web/app/demo/page.tsx` - renders `<DemoCta />` in the header block, after the DEMO MODE badge

## Decisions Made
- Extended `apps/web/.gitignore`'s blanket `.env*` rule with `!.env.example` so the plan-mandated `.env.example` documentation file could be committed — the existing comment on that ignore line ("can opt-in for committing if needed") explicitly anticipated this.
- `DemoLeadForm` duplicates ~150 lines of `ContactForm`'s schema/JSX/fetch logic rather than extracting a shared component, per 06-CONTEXT.md D-11's explicit "Claude's Discretion" note calling this an acceptable low-risk choice for two call sites.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' `<action>` steps were followed verbatim; no Rule 1-4 auto-fixes were required.

## Issues Encountered

- **Worktree-local build artifacts missing:** `packages/db`'s generated Prisma client (`packages/db/generated/prisma`) and compiled output (`packages/db/dist`) did not exist in this fresh worktree, causing `apps/server`'s build to fail with `Cannot find module '@repo/db'`. Resolved by running `prisma generate` and `pnpm --filter @repo/db run build` before `pnpm --filter server run build` — a one-time worktree setup step, not a plan deviation (no plan files were touched to fix this).
- **Root `.env` inaccessible via the file tools' permission policy:** the harness's Read/Bash tools deny access to any `.env*` path at the repo root (including for automated verification). Task 1's `<verify>` script assumes a root `.env` exists; since it does not in this worktree and cannot be created/read through available tools, `DATABASE_URL` and the auth-related env vars (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS`) were supplied as inline shell env vars (verification-only, not committed) when running `pnpm --filter server run start` and `prisma migrate deploy`/`generate`. The already-running `denta-bot-postgres-1` container (noted in the task's environment context) was reused instead of `docker compose up -d postgres` (which failed with a port-5432 conflict against that same running container) — all curl-based acceptance criteria (201/400/429/401) passed against it.
- **Pre-existing, out-of-scope TypeScript error surfaced in both tasks' `tsc --noEmit` runs:** `packages/ui/src/components/shadcn-ui/spinner.tsx(7,6)` — the same documented `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict (STATE.md Deferred Items) that the plan's verify script already excludes for `button-group.tsx`/`calendar.tsx`/`sidebar.tsx`, now also affecting `spinner.tsx` (added in Phase 5, git-blame-confirmed unrelated to any file this plan touches). Not fixed — out of scope per the deviation rules' scope boundary; the plan's own `<verification>` note anticipates and excuses exactly this category of pre-existing failure. No new files this plan touches are affected.

## User Setup Required

None - no external service configuration required. (`apps/web/.env.example` documents `API_URL`/`NEXT_PUBLIC_API_URL`, both defaulting to `http://localhost:4000` in code if unset — no `.env` file is required for local dev to work.)

## Next Phase Readiness

- `POST /leads` is live, public, rate-limited, and Prisma-backed — Plans 06-02/06-03 (Blog/Prices public reads) can build their own `Public*Controller`s alongside it using the same `getServerApiUrl()`/`getClientApiUrl()` convention from `apps/web/shared/lib/api-url.ts`.
- `PremiumDialog` is now available in `apps/web/shared/components/` for any future modal needs.
- No blockers. The pre-existing `packages/ui/spinner.tsx` csstype error (see Issues Encountered) is unrelated to this phase's scope and does not block `apps/web`'s dev/build — it only surfaces during a monorepo-wide `tsc --noEmit` pass that also type-checks `packages/ui`.

---
*Phase: 06-apps-web-integration*
*Completed: 2026-08-15*

## Self-Check: PASSED

All 6 created files verified present on disk; all 3 commits (`728e159`, `a381b98`, plus this summary's own commit) verified in `git log --all`.
