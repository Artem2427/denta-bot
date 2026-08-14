---
phase: 05-clinic-lead-content-management
plan: 03
subsystem: api
tags: [nestjs, prisma, postgres, jwt, class-validator, swagger, transactions]

# Dependency graph
requires:
  - phase: 05-01
    provides: "updatedById nullable FK trace fields on Lead (INFRA-05), the reusable NestJS resource-module shape (ClinicsModule) this plan mirrors, and the global AccessTokenGuard/@CurrentUser()/whitelist ValidationPipe conventions"
provides:
  - "LeadsModule: GET /leads (status + createdAt date-range filter, createdAt desc default order), GET /leads/:id (404 on miss, never omits null fields), PATCH /leads/:id/status (idempotent, updatedById server-derived) — LEAD-03 through LEAD-06"
  - "POST /leads/:id/convert — atomic Lead-to-Clinic conversion inside a single prisma.$transaction, with pre-transaction validation (missing email 400, already-converted 409) and P2002-to-409 translation for email collisions — LEAD-07"
affects: [05-05, 05-06, 05-07]

actuals:
  tokens: 3305
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns:
    - "First $transaction usage in apps/server/src — interactive transaction (prisma.$transaction(async (tx) => {...})), with pre-transaction validation before opening the transaction AND a re-fetch/re-check inside the transaction to close the race window between the pre-check and the transaction start"
    - "TDD RED/GREEN cycle applied to a Prisma-transaction service method — leads.service.spec.ts mocks PrismaService with a fake $transaction(fn) => fn(tx) implementation and per-call tx.lead/tx.clinic mocks, avoiding a real DB dependency for the unit-level behavior contract"

key-files:
  created:
    - apps/server/src/leads/leads.controller.ts
    - apps/server/src/leads/leads.service.ts
    - apps/server/src/leads/leads.module.ts
    - apps/server/src/leads/leads.service.spec.ts
    - apps/server/src/leads/dto/update-lead-status.dto.ts
    - apps/server/src/leads/dto/lead-query.dto.ts
  modified:
    - apps/server/src/app.module.ts

key-decisions:
  - "Added a defensive re-check of freshLead.email !== null inside the transaction (not required by the plan's literal action spec, but consistent with the plan's 'hardened' framing and the pre-transaction check's TypeScript-narrowed non-null guarantee not surviving the tx re-fetch)"
  - "Wrote a Jest unit-test spec (leads.service.spec.ts) with a mocked PrismaService for Task 2's tdd=\"true\" requirement, rather than a live-DB integration test — this repo has no existing service-level spec convention to follow (05-01's tasks were tdd=\"false\"), so the mock shape (fake $transaction(fn) => fn(tx)) was hand-derived to isolate LeadsService.convert()'s pre-transaction/in-transaction branching without requiring Postgres"
  - "Used the already-running Postgres container (agent-a8976498097c8c381-postgres-1) for live verification, matching Plan 05-01's precedent; seeded/cleaned up test Lead/Clinic rows directly via a temporary Prisma script (no POST /leads endpoint exists this phase to create test data through the API) since a POST /leads (create) endpoint is explicitly out of this phase's scope (Phase 6)"

patterns-established:
  - "Interactive-transaction pattern (RESEARCH.md Pattern 3) proven end-to-end — the only genuinely new architectural pattern this phase introduces, no repo analog existed before this plan"

requirements-completed: [LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07, INFRA-05]

coverage:
  - id: D1
    description: "GET /leads returns all leads ordered by createdAt descending by default, tagged by source (contacts/demo); empty DB returns []; a malformed from date returns 400"
    requirement: "LEAD-03, LEAD-06"
    verification:
      - kind: integration
        ref: "live curl against http://localhost:4000/leads with/without ?from=not-a-date and ?status=new (this session)"
        status: pass
    human_judgment: false
  - id: D2
    description: "GET /leads/:id returns every submitted field including nulls (clinicName/email/phone/message never omitted from the JSON body); unknown id returns 404"
    requirement: "LEAD-04"
    verification:
      - kind: integration
        ref: "live curl against a seeded lead with null clinicName/phone/message and a nonexistent id (this session)"
        status: pass
    human_judgment: false
  - id: D3
    description: "PATCH /leads/:id/status is idempotent — calling it twice with the same status both return 200; a client-supplied updatedById in the body is rejected 400 by the global ValidationPipe"
    requirement: "LEAD-05"
    verification:
      - kind: integration
        ref: "live curl PATCH called twice with identical status, and once with a forged updatedById field (this session)"
        status: pass
    human_judgment: false
  - id: D4
    description: "POST /leads/:id/convert atomically creates a Clinic and marks the Lead converted inside a single prisma.$transaction; missing email returns 400 before any write; an already-converted Lead returns 409 without a second Clinic; an email collision with an existing Clinic returns 409 leaving the Lead unmodified"
    requirement: "LEAD-07"
    verification:
      - kind: unit
        ref: "apps/server/src/leads/leads.service.spec.ts — 4 tests (RED in b992dfa, GREEN in 69067e3), mocked PrismaService/$transaction"
        status: pass
      - kind: integration
        ref: "live curl: valid conversion (verified new Clinic + Lead linkage), missing-email 400 (0 clinics created), already-converted 409, email-collision 409 (Lead left status=new, clinicId=null, still only 1 clinic total) (this session)"
        status: pass
    human_judgment: false

duration: 35min
completed: 2026-08-14
status: complete
---

# Phase 5 Plan 3: Clinic Lead Content Management Summary

**Unified Lead inbox backend (list/filter/detail/status) plus an atomic, race-safe Lead-to-Clinic conversion transaction — the phase's one genuinely new architectural pattern**

## Performance

- **Duration:** 35 min
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Built `LeadsModule` mirroring `ClinicsModule`'s exact resource-module shape: `GET /leads` (status + `createdAt` date-range filter via Prisma `where`, `createdAt desc` default order), `GET /leads/:id` (404 on miss, all fields including nulls always present in the response body), `PATCH /leads/:id/status` (idempotent — setting the same status twice both return 200, `updatedById` server-derived from `@CurrentUser().sub`)
- Registered `LeadsModule` in `app.module.ts` after `ClinicsModule`
- Implemented `LeadsService.convert()` — the repo's first Prisma interactive transaction — with 3 pre-transaction guards (not found, already converted, missing email) that reject before any write, an in-transaction re-fetch/re-check to close the race window between the pre-check and the transaction, and a `P2002`-to-409 translation for `Clinic.email` collisions
- Wired `POST /leads/:id/convert` (200) in `LeadsController`
- Followed the plan's `tdd="true"` gate for Task 2: wrote `leads.service.spec.ts` (RED, 4 failing tests against a not-yet-existing `convert()` method), then implemented `convert()` (GREEN, all 4 tests pass) — this is the first Jest unit-test spec in `apps/server/src` beyond the generator's own `app.controller.spec.ts` scaffold
- Verified all 4 conversion behaviors live end-to-end against the running server + seeded test Lead/Clinic rows, then cleaned up all test data, restoring the shared dev DB to empty `leads`/`clinics` tables

## Task Commits

Each task was committed atomically:

1. **Task 1: LeadsModule list/filter/detail + status update** - `0c8e2f8` (feat)
2. **Task 2 RED: failing tests for Lead-to-Clinic conversion** - `b992dfa` (test)
3. **Task 2 GREEN: Lead-to-Clinic conversion implementation** - `69067e3` (feat)

_Plan metadata (this SUMMARY + STATE.md) is committed separately by the parallel-worktree orchestrator after this plan's SUMMARY lands._

## TDD Gate Compliance

Task 2 (`tdd="true"`) followed the RED -> GREEN gate sequence correctly:
- RED: `b992dfa` (`test(05-03): add failing tests for Lead-to-Clinic conversion`) — all 4 tests failed with `TypeError: service.convert is not a function`
- GREEN: `69067e3` (`feat(05-03): implement Lead-to-Clinic conversion (interactive transaction)`) — all 4 tests pass
- No REFACTOR commit needed — the GREEN implementation matched the plan's `<action>` spec directly with no cleanup pass required.

## Files Created/Modified
- `apps/server/src/leads/leads.controller.ts` - `LeadsController` — `GET /leads`, `GET /leads/:id`, `PATCH /leads/:id/status`, `POST /leads/:id/convert`, all protected by the existing global `AccessTokenGuard`
- `apps/server/src/leads/leads.service.ts` - `LeadsService` — Prisma-backed list/filter/detail/status-update, plus `convert()`'s interactive transaction
- `apps/server/src/leads/leads.module.ts` - `LeadsModule`
- `apps/server/src/leads/leads.service.spec.ts` - 4 Jest unit tests covering `convert()`'s pre-transaction and in-transaction branching, with a mocked `PrismaService`
- `apps/server/src/leads/dto/update-lead-status.dto.ts` - `UpdateLeadStatusDto` (never declares `updatedById`)
- `apps/server/src/leads/dto/lead-query.dto.ts` - `LeadQueryDto` — `status` + `from`/`to` (`@IsDateString`) filters
- `apps/server/src/app.module.ts` - registers `LeadsModule` after `ClinicsModule`

## Decisions Made
- Added a defensive `if (!freshLead.email)` re-check inside the transaction (the plan's action spec only explicitly re-checks `status`) — closes a TypeScript narrowing gap between the pre-transaction check and the transaction's own re-fetch, harmless no-op in the tested paths since `Lead.email` has no write path this phase
- Used a mocked-`PrismaService` Jest unit test (not a live-DB integration test) to satisfy Task 2's `tdd="true"` requirement — no existing spec convention in this repo to follow, so the `$transaction(fn) => fn(tx)` mock shape was hand-derived specifically to isolate `convert()`'s branching logic
- Seeded/cleaned up test Lead/Clinic rows via a temporary, uncommitted Prisma script for live verification (no `POST /leads` endpoint exists this phase — Lead creation is Phase 6's scope) — all test rows removed before finishing, restoring the shared dev Postgres to its pre-plan empty state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `eslint --fix` reformatted 3 unrelated Clinics-module files outside this plan's scope**
- **Found during:** Post-implementation lint pass
- **Issue:** `pnpm --filter server run lint` (which runs `eslint --fix`) reformatted `apps/server/src/clinics/clinics.controller.ts`, `clinics.service.ts`, and `dto/create-clinic.dto.ts` (Plan 05-01's files, not in this plan's `files_modified` list) — pure import-wrapping/whitespace changes, no logic change, likely a Prettier-plugin-version drift between when 05-01 committed and this session's `pnpm install`.
- **Fix:** Reverted those 3 files with `git checkout -- <file>` (targeted, not a blanket reset) since they're out of this plan's scope per the scope-boundary rule — leaving them for whichever plan/session actually touches Clinics next to reformat as part of its own diff.
- **Files modified:** None (reverted, not committed)
- **Committed in:** N/A — reverted before any commit

---

**Total deviations:** 1 auto-fixed (1 out-of-scope lint side-effect, reverted)
**Impact on plan:** No scope creep. The plan's actual `files_modified` list was respected exactly.

## Issues Encountered
- This worktree had no `node_modules` installed and no `@repo/db` Prisma client generated/built (fresh worktree checkout) — ran `pnpm install`, `pnpm --filter @repo/db run db:generate`, and `pnpm --filter @repo/db run build` before the first server build/start, per the known-issues note; not a deviation, a one-time environment bootstrap.
- No root `.env` file exists in this worktree (sandbox-denied per known issue #2) — exported `DATABASE_URL`/`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`/`PLATFORM_ADMIN_EMAIL`/`PLATFORM_ADMIN_PASSWORD`/`CORS_ALLOWED_ORIGINS` inline in the shell before each `pnpm --filter server run start` invocation; `PLATFORM_ADMIN_EMAIL`/`PASSWORD` values are placeholders (unused elsewhere in code beyond env validation) — the actual seeded PlatformAdmin login used for live verification (`platformadmin@dentabot.dev` / `DevAdmin!2026`) predates this session.
- No `POST /leads` endpoint exists this phase (by design, Phase 6 scope), so live verification of filtering/detail/conversion required seeding test `Lead` rows directly via a temporary, uncommitted Prisma script against the shared dev Postgres container — all seeded rows (and the one Clinic created by the successful-conversion test) were deleted before finishing, confirmed via a follow-up `GET /leads` returning `[]`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `LeadsModule`'s full surface (`GET/PATCH/POST /leads(...)`) is live and matches `ClinicsModule`'s resource-module shape plus the phase's one new transaction pattern — Plans 05-05/05-06/05-07 (platform-admin frontend) can build Lead inbox/detail/convert screens against this API
- The interactive-transaction pattern (`prisma.$transaction(async (tx) => {...})`, pre-check + in-tx re-check, `P2002`-to-409 translation) is now proven end-to-end in this repo and reusable if a future phase needs another multi-write atomic operation
- No blockers for later plans in this phase

---
*Phase: 05-clinic-lead-content-management*
*Completed: 2026-08-14*

## Self-Check: PASSED

All 6 created files verified present on disk; all 3 task commits (`0c8e2f8`, `b992dfa`, `69067e3`) verified present in `git log --oneline --all`.
