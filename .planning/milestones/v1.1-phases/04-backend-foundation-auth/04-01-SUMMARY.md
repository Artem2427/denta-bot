---
phase: 04-backend-foundation-auth
plan: 01
subsystem: api
tags: [prisma, postgres, nestjs, jwt, argon2, turborepo]

requires:
  - phase: 03
    provides: apps/web v1.0 marketing site (mock data) that this backend will eventually feed
provides:
  - "packages/db (@repo/db) — Prisma 7 schema/migration/seed for PlatformAdmin, RefreshToken, Clinic, Lead, BlogPost, PricingPlan"
  - "apps/server Prisma wiring (PrismaService/PrismaModule) with driver-adapter (@prisma/adapter-pg)"
  - "apps/server bootstrap: Swagger at /api/docs, CORS allowlist, global ValidationPipe"
  - "POST /auth/login — access token + httpOnly refresh cookie, no user enumeration"
  - "Turborepo db:generate wiring so Prisma client generation is visible to build/dev/check-types task graphs"
affects: [05-clinic-lead-content-management, 06-apps-web-integration]

actuals:
  tokens: 62000
  tasks: 4
  commits: 5

tech-stack:
  added: ["prisma@7.9.1", "@prisma/client@7.9.1", "@prisma/adapter-pg@7.9.1", "pg@8.23.0", "argon2@0.45.1", "@nestjs/swagger", "dotenv-cli", "tsx"]
  patterns: ["Prisma 7 driver-adapter pattern (PrismaService extends PrismaClient via @prisma/adapter-pg)", "packages/db as a workspace package with its own compiled dist/, consumed by apps/server via @repo/db"]

key-files:
  created:
    - packages/db/prisma/schema.prisma
    - packages/db/prisma/seed.ts
    - packages/db/prisma.config.ts
    - packages/db/src/index.ts
    - apps/server/src/prisma/prisma.service.ts
    - apps/server/src/prisma/prisma.module.ts
    - apps/server/src/auth/auth.controller.ts
    - apps/server/src/auth/auth.service.ts
    - apps/server/src/auth/dto/login.dto.ts
    - apps/server/src/auth/dto/auth-response.dto.ts
    - apps/server/src/config/env.validation.ts
    - docker-compose.yml
    - .env.example
  modified:
    - apps/server/src/main.ts
    - apps/server/src/app.module.ts
    - turbo.json
    - package.json (engines.node -> >=20.19.0)
    - README.md

key-decisions:
  - "packages/db's package.json main/types point at ./dist/src/index.js (compiled output) rather than ./src/index.ts as originally planned — apps/server's nodenext module resolution needed a real compiled entry point; requires pnpm --filter @repo/db run build before consumers build outside of turbo's ^build graph"
  - "Task 4's clean-regenerate + apps/server build verification was run via raw pnpm --filter commands with DATABASE_URL exported inline (no root .env present in this environment) — matches the plan's own verify script; turbo-mode build (which relies on a physical .env file since turbo's strict envMode blocks ad-hoc env var passthrough) was not exercised in this session"

patterns-established:
  - "@repo/db barrel re-exports the generated Prisma client (packages/db/src/index.ts) as the only import surface for consumers"
  - "AuthResponseDto/PlatformAdminSummaryDto never re-export the raw PlatformAdmin model — passwordHash never leaves the service layer"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, AUTH-01]

coverage:
  - id: D1
    description: "packages/db owns a version-controlled, migration-driven 6-model Postgres schema (PlatformAdmin, RefreshToken, Clinic, Lead, BlogPost, PricingPlan)"
    requirement: INFRA-01
    verification:
      - kind: manual_procedural
        ref: "docker compose up -d postgres && prisma migrate dev --name init (run in original worktree session; migration committed at packages/db/prisma/migrations/20260810205834_init)"
        status: pass
    human_judgment: false
  - id: D2
    description: "apps/server imports the generated Prisma client via @repo/db (PrismaService extends PrismaClient using the driver adapter)"
    requirement: INFRA-02
    verification:
      - kind: unit
        ref: "pnpm --filter server run build (exit 0) after pnpm --filter @repo/db run build"
        status: pass
    human_judgment: false
  - id: D3
    description: "GET /api/docs serves browsable Swagger UI listing POST /auth/login"
    requirement: INFRA-03
    verification: []
    human_judgment: true
    rationale: "Not re-verified live in this session (no Docker Postgres running); originally verified in Task 2/3's automated scripts per the plan. Needs a human/agent spot-check with the server actually booted."
  - id: D4
    description: "POST /auth/login returns access token + httpOnly refresh cookie for valid credentials; identical 401 for wrong-password and unknown-email (no enumeration)"
    requirement: AUTH-01
    verification: []
    human_judgment: true
    rationale: "Not re-verified live in this session (no Docker Postgres running); originally verified in Task 3's automated script per the plan. Needs a human/agent spot-check with the server actually booted."
  - id: D5
    description: "Turborepo's build/dev/check-types task graphs depend on db:generate so Prisma client generation is never invisible to the pipeline (RESEARCH.md Pitfall 1)"
    requirement: INFRA-03
    verification:
      - kind: manual_procedural
        ref: "rm -rf packages/db/generated && pnpm --filter @repo/db run db:generate && pnpm --filter @repo/db run build && pnpm --filter server run build (all exit 0)"
        status: pass
    human_judgment: false

duration: unknown (spans an interrupted session + this recovery session)
completed: 2026-08-14
status: complete
---

# Phase 4 Plan 1: packages/db + apps/server Prisma/Auth foundation Summary

**Prisma 7 driver-adapter backend (packages/db + apps/server) with a working POST /auth/login tracer, recovered and closed out after a mid-plan session interrupt.**

## Performance

- **Tasks:** 4
- **Files modified:** ~30 (18 in Tasks 1-3, 2 in Task 4)
- **Commits:** 5 (4 task commits + 1 merge)

## Accomplishments
- `packages/db` (`@repo/db`): Prisma 7 schema (6 models, 3 enums), committed `init` migration, D-15 seed script
- `apps/server`: `PrismaService`/`PrismaModule` (driver-adapter pattern), Swagger/CORS/ValidationPipe bootstrap
- `POST /auth/login`: access token + httpOnly refresh cookie, `RefreshToken` row with hashed token + `familyId`, no user enumeration
- Turborepo `db:generate` wiring proven closed via a from-scratch delete+regenerate+build cycle
- `README.md` documents the full local bootstrap sequence for the next developer/session

## Task Commits

1. **Task 1: Docker/env/turbo scaffolding + packages/db schema, migration, seed** - `78d5b92` (feat)
2. **Task 2: apps/server Prisma wiring + main.ts bootstrap** - `1779fc6` (feat)
3. **Task 3: AuthModule — POST /auth/login** - `32588c4` (feat)
4. **Task 4: Clean-regenerate verification + local dev bootstrap docs** - `d58b386` (docs)

**Recovery merge:** `4a997e0` — integrated Tasks 1-3 from an isolated worktree (`agent-a8976498097c8c381`) whose session was interrupted before it could merge back or write this SUMMARY. Verified clean (git detected as a straight 3-way merge, no conflicts) before continuing with Task 4 in the primary working tree.

## Files Created/Modified

See `key-files` frontmatter above for the full list — the schema, seed, Prisma service/module, AuthModule (controller/service/DTOs), env validation, Docker Compose, `.env.example`, and `turbo.json`/`README.md` wiring.

## Decisions Made

- `packages/db`'s `main`/`types` point at compiled `./dist/src/index.js` rather than raw `./src/index.ts` as originally planned in Task 1 — `apps/server`'s `nodenext` module resolution requires a real compiled entry point. This means `pnpm --filter @repo/db run build` must run before `apps/server` builds outside of Turborepo's `^build` dependency graph (raw `pnpm --filter server run build` alone is NOT sufficient without this). Documented here since it wasn't caught in any prior SUMMARY (the deviation predates this session).
- Task 4's verification used inline-exported `DATABASE_URL`/JWT env vars rather than a physical root `.env` file, since this session's environment blocks reading/writing `.env*` files. The plan's own Task 4 verify script (raw `pnpm --filter` commands) still passes fully. Turbo-mode build (`turbo run build`), which depends on a physical `.env` file for `db:generate` (Turborepo's strict `envMode` blocks ad-hoc shell env var passthrough), was not exercised — worth a follow-up spot-check before Phase 5.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `packages/db` needed an explicit `build` step before `apps/server` could resolve `@repo/db`**
- **Found during:** Task 4 (clean-regenerate verification)
- **Issue:** `packages/db/package.json`'s `main`/`types` already pointed at `./dist/src/index.js`/`./dist/src/index.d.ts` (a Task 1/2/3-era deviation from the plan's original "point at `./src/index.ts`" instruction, made by the interrupted worktree session with no SUMMARY to record it). Running the plan's literal Task 4 verify script (`pnpm --filter server run build` right after `db:generate`) failed with `TS2307: Cannot find module '@repo/db'` because `dist/` didn't exist.
- **Fix:** Ran `pnpm --filter @repo/db run build` (tsc) before `pnpm --filter server run build`. No code changes — this is a documented required step now captured in this SUMMARY.
- **Files modified:** None (build-only)
- **Verification:** `pnpm --filter server run build` exits 0 after the `@repo/db` build
- **Committed in:** N/A (no file changes; verification-only step)

---

**Total deviations:** 1 auto-fixed (1 blocking). Plus 1 pre-existing, now-documented deviation from the interrupted prior session (dist-based `main`/`types` instead of raw-`src`).
**Impact on plan:** No scope creep. The `dist`-based package resolution is arguably more correct for a `nodenext`-resolution consumer than the originally planned raw-`src` re-export; future phases should just remember `packages/db` needs `pnpm --filter @repo/db run build` (or a turbo-orchestrated build) before `apps/server` builds standalone.

## Issues Encountered

- **Orphaned worktree from an interrupted execute-phase session:** A prior session dispatched Plan 04-01's execution into an isolated git worktree (`agent-a8976498097c8c381`) and completed Tasks 1-3 there, but the session ended before merging back, writing SUMMARY.md, or updating STATE.md/ROADMAP.md. This left `main` unaware of 3 completed tasks' worth of work. Resolved this session by: verifying the worktree's branch was a clean ancestor-safe merge candidate (no conflicts with `main`'s subsequent unrelated commits), merging it in (`4a997e0`), removing the worktree, then completing Task 4 in the primary working tree. No work was lost or duplicated.
- **`.env*` file access blocked by this environment's permission settings:** Could not read or write the root `.env` file. Worked around for Task 4's verification by exporting `DATABASE_URL`/JWT env vars inline in the shell rather than via a persisted `.env` file — sufficient for the plan's literal verify script (raw `pnpm --filter` commands, not turbo-orchestrated). A human or a differently-permissioned session should do one live end-to-end check (Docker Postgres up, real `.env`, `db:seed`, `POST /auth/login` via curl/Swagger) before Phase 5 relies on this foundation — see coverage items D3/D4 above, both flagged `human_judgment: true` for this reason.

## User Setup Required

None - no external service configuration required beyond the locally-documented Docker Postgres + `.env` steps in `README.md`.

## Next Phase Readiness

- Plan 04-01's tracer (schema + migration + seed + Prisma wiring + `POST /auth/login`) is complete and merged to `main`.
- Plan 04-02 (refresh rotation + reuse detection, logout, global `AccessTokenGuard`, `GET /auth/me`) is next — builds directly on this plan's `AuthService.issueTokenPair()` helper and `RefreshToken` model.
- Recommended before Phase 5: one live end-to-end auth smoke test (Docker Postgres + real `.env` + seed + `curl POST /auth/login`) to close out D3/D4's `human_judgment: true` flags, since this session's environment couldn't do it.

---
*Phase: 04-backend-foundation-auth*
*Completed: 2026-08-14*
