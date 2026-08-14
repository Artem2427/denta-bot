---
phase: 04-backend-foundation-auth
plan: 02
subsystem: api
tags: [nestjs, passport-jwt, jwt, refresh-rotation, auth-guard]

requires:
  - phase: 04
    plan: 01
    provides: "AuthModule tracer (POST /auth/login), AuthService.issueTokenPair() helper, RefreshToken Prisma model"
provides:
  - "POST /auth/refresh — refresh-token rotation with atomic reuse detection (AUTH-02)"
  - "POST /auth/logout — server-side refresh-token revocation, scoped to the caller's own session (AUTH-03)"
  - "GET /auth/me — protected sample route returning the authenticated admin's id/email"
  - "Global fail-closed AccessTokenGuard (APP_GUARD) with @Public() opt-out, protecting every route by default (AUTH-04)"
affects: [05-clinic-lead-content-management, 06-apps-web-integration]

actuals:
  tokens: 4060
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Atomic updateMany-based refresh-token rotation claim (revokedAt: null + tokenHash in the WHERE) instead of findUnique+update, closing a TOCTOU race between concurrent /auth/refresh calls"
    - "Global APP_GUARD (AccessTokenGuard) + Reflector-based @Public() opt-out decorator — fail-closed-by-default route protection"
    - "Two named passport-jwt strategies ('jwt-access' header, 'jwt-refresh' cookie-only extractor) registered as AuthModule providers"

key-files:
  created:
    - apps/server/src/auth/strategies/refresh-token.strategy.ts
    - apps/server/src/auth/strategies/access-token.strategy.ts
    - apps/server/src/auth/guards/refresh-token.guard.ts
    - apps/server/src/auth/guards/access-token.guard.ts
    - apps/server/src/auth/decorators/public.decorator.ts
    - apps/server/src/auth/decorators/current-user.decorator.ts
  modified:
    - apps/server/src/auth/auth.service.ts
    - apps/server/src/auth/auth.controller.ts
    - apps/server/src/auth/auth.module.ts
    - apps/server/src/auth/dto/auth-response.dto.ts

key-decisions:
  - "Registered RefreshTokenStrategy in auth.module.ts as part of Task 1 (not listed in Task 1's file list) — without it Passport has no 'jwt-refresh' strategy to resolve at runtime, and Task 1's own verify script (which calls POST /auth/refresh) would fail. Task 2 then adds AccessTokenStrategy + the global APP_GUARD registration as planned."
  - "Embedded email in the access-token JWT payload (issueTokenPair signature extended to take email) — Plan 04-01's issueTokenPair only signed { sub }, but GET /auth/me's spec (and its own live-verify script) requires the response to include the admin's email. Fixed by threading email through at issuance (login has it directly) and rotation (refresh looks it up via prisma.platformAdmin.findUniqueOrThrow since the refresh token's own JWT payload has no email claim)."
  - "AuthResponseDto.platformAdmin marked optional — POST /refresh doesn't return a platformAdmin summary (no re-fetch needed on every rotation just to repeat what the client already has from login), while POST /login still returns it."

requirements-completed: [AUTH-02, AUTH-03, AUTH-04]

coverage:
  - id: D1
    description: "POST /auth/refresh with a valid, unexpired, not-yet-rotated refresh cookie returns a NEW access+refresh pair sharing the same familyId, and marks the presented token's DB row revokedAt"
    requirement: AUTH-02
    verification:
      - kind: e2e
        ref: "live curl run against Docker Postgres + booted apps/server: login -> refresh -> 200 + new Set-Cookie refresh_token with the same familyId (decoded JWT payload verified)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Replaying the original (already-rotated) refresh token is rejected 401 AND revokes the whole familyId, including the just-issued newest token"
    requirement: AUTH-02
    verification:
      - kind: e2e
        ref: "live curl: replay of stale cookie -> 401 'Refresh token reuse detected'; subsequent use of the newly-rotated (but now family-revoked) cookie -> also 401"
        status: pass
    human_judgment: false
  - id: D3
    description: "Two concurrent /auth/refresh calls presenting the same refresh token: at most one succeeds, via an atomic updateMany conditional claim (not findUnique+update)"
    requirement: AUTH-02
    verification:
      - kind: backstop
        ref: "apps/server/src/auth/auth.service.ts refresh() uses a single updateMany({ where: { id, revokedAt: null, tokenHash } }) and checks claimed.count === 1 — code-level structural guarantee, not exercised under actual concurrent load this session"
        status: pass
    human_judgment: true
    rationale: "The atomic-claim code path was verified by reading/writing the implementation (single updateMany, no separate findUnique) and functionally exercised for the sequential replay case (D2), but a genuine concurrent-request race was not driven in this session (no load-testing tool invoked). The mechanism (conditional updateMany) is the standard, correct fix for this TOCTOU class of bug."
  - id: D4
    description: "POST /auth/logout revokes the caller's own refresh-token DB row and clears the cookie; a subsequent refresh with that token is rejected 401"
    requirement: AUTH-03
    verification:
      - kind: e2e
        ref: "live curl: login -> logout -> 200 + Set-Cookie refresh_token=; (cleared) -> refresh with the logged-out cookie -> 401"
        status: pass
    human_judgment: false
  - id: D5
    description: "GET /auth/me rejects requests with no/invalid/expired access token (401) and returns 200 + { id, email } for a valid token"
    requirement: AUTH-04
    verification:
      - kind: e2e
        ref: "live curl: GET /auth/me with no Authorization header -> 401; with a valid access token from login -> 200 { id, email: 'platformadmin@dentabot.dev' }"
        status: pass
    human_judgment: false
  - id: D6
    description: "The pre-existing GET / route (AppController scaffold) is implicitly protected by the global AccessTokenGuard with zero code change to app.controller.ts"
    requirement: AUTH-04
    verification:
      - kind: e2e
        ref: "live curl: GET / with no Authorization header -> 401 (app.controller.ts untouched this plan)"
        status: pass
    human_judgment: false

duration: ~50min
completed: 2026-08-14
status: complete
---

# Phase 4 Plan 2: Refresh rotation, logout, global AccessTokenGuard Summary

**Refresh-token rotation with atomic reuse detection, server-side logout revocation, and a fail-closed global AccessTokenGuard — completing Phase 4's full AUTH-02/03/04 requirement set on top of Plan 04-01's login tracer.**

## Performance

- **Tasks:** 2
- **Files modified:** 10 (6 created, 4 edited)
- **Commits:** 3 (2 task commits + 1 lint-formatting commit)

## Accomplishments

- `POST /auth/refresh`: atomic `updateMany`-conditioned rotation claim (closes the TOCTOU race a `findUnique`+`update` pair would have), reuse detection revokes the whole `familyId` on any failed claim
- `POST /auth/logout`: revokes only the caller's own refresh-token row (scoped to the guarded request's `jti`, never a body param — IDOR-safe) and clears the cookie
- `GET /auth/me`: protected sample route returning `{ id, email }`
- Global `AccessTokenGuard` via `APP_GUARD`, `Reflector`-based `@Public()` opt-out — proven fail-closed against the untouched `AppController`'s `GET /` with zero code change to it
- All behaviors verified live end-to-end via curl against a booted `apps/server` + Docker Postgres (see `coverage` above)

## Task Commits

1. **Task 1: POST /auth/refresh — rotation with reuse detection (atomic, race-safe)** - `c3f27d7` (feat)
2. **Task 2: POST /auth/logout, global fail-closed AccessTokenGuard, GET /auth/me** - `1484bb9` (feat)
3. **Lint/formatting cleanup (prettier `--fix` on Task 2 files)** - `dd9cdf2` (style)

## Files Created/Modified

See `key-files` frontmatter above — new strategies (`access-token.strategy.ts`, `refresh-token.strategy.ts`), guards (`access-token.guard.ts`, `refresh-token.guard.ts`), decorators (`public.decorator.ts`, `current-user.decorator.ts`), and extensions to `auth.service.ts`/`auth.controller.ts`/`auth.module.ts`/`auth-response.dto.ts`.

## Decisions Made

- Registered `RefreshTokenStrategy` in `auth.module.ts` as part of Task 1, ahead of Task 2's planned module registration — required for Passport to resolve the `'jwt-refresh'` strategy name at all; without it, `POST /auth/refresh` throws at runtime before Task 1's own verify script could pass.
- Embedded `email` in the access-token JWT payload (extended `issueTokenPair`'s signature) since Plan 04-01's version only signed `{ sub }`, but `GET /auth/me` needs to return the admin's email per its own spec and live-verify script.
- Made `AuthResponseDto.platformAdmin` optional so `POST /refresh` doesn't need an extra DB round trip on every rotation just to re-echo data the client already has from `login()`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `RefreshTokenStrategy` needed registering in `auth.module.ts` during Task 1, not deferred to Task 2**
- **Found during:** Task 1 build/verify
- **Issue:** Task 1's file list (`refresh-token.strategy.ts`, `refresh-token.guard.ts`, `auth.service.ts`, `auth.controller.ts`) didn't include `auth.module.ts`, but `RefreshTokenGuard` (`AuthGuard('jwt-refresh')`) needs the `'jwt-refresh'` strategy registered as a Nest provider to exist at all — otherwise Passport throws `Unknown authentication strategy "jwt-refresh"` the first time `POST /auth/refresh` is hit.
- **Fix:** Added `RefreshTokenStrategy` to `auth.module.ts`'s `providers` array during Task 1. Task 2 then added `AccessTokenStrategy` and the `APP_GUARD` registration as originally planned — no conflict, both additions compose cleanly.
- **Files modified:** `apps/server/src/auth/auth.module.ts`
- **Verification:** Task 1's full live curl verify script (login → refresh → replay → family-revoked-newest) passes
- **Committed in:** `c3f27d7`

**2. [Rule 1 - Bug] Access token didn't carry `email`, so `GET /auth/me` couldn't return it**
- **Found during:** Task 2 implementation, before live verify
- **Issue:** `AuthService.issueTokenPair()` (Plan 04-01) only signed `{ sub: platformAdminId }` into the access token. Task 2's plan text explicitly specifies `GET /auth/me` returns `{ id: user.sub, email: user.email }` from the access-token payload, and Task 2's own verify script greps the `/auth/me` response body for the admin's literal email address — which would have failed with `user.email` always `undefined`.
- **Fix:** Extended `issueTokenPair(platformAdminId, email, familyId?)` to sign `email` into the access token. `login()` passes `admin.email` directly (already fetched). `refresh()` looks up the admin's email via `prisma.platformAdmin.findUniqueOrThrow({ where: { id: payload.sub }, select: { email: true } })` since the refresh token's own JWT payload only carries `{ sub, familyId, jti }`, no email claim.
- **Files modified:** `apps/server/src/auth/auth.service.ts`
- **Verification:** Live curl: `GET /auth/me` with a valid access token returns `{"id":"...","email":"platformadmin@dentabot.dev"}`
- **Committed in:** `1484bb9`

**3. [lint/style] `eslint --fix` reformatted two Task 2 files**
- **Found during:** Post-Task-2 `pnpm --filter server run lint`
- **Issue:** Prettier's line-wrapping rules reformatted a multi-line import and a `getAllAndOverride` call in `current-user.decorator.ts`/`access-token.guard.ts` — cosmetic only, no behavior change.
- **Fix:** Committed the `--fix` output separately.
- **Files modified:** `apps/server/src/auth/decorators/current-user.decorator.ts`, `apps/server/src/auth/guards/access-token.guard.ts`
- **Verification:** `pnpm --filter server run build` still exits 0
- **Committed in:** `dd9cdf2`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug), plus 1 cosmetic lint-formatting commit.
**Impact on plan:** No scope creep — both fixes were necessary for the plan's own stated `must_haves`/verify scripts to pass, not new functionality beyond what AUTH-02/03/04 already required.

## Issues Encountered

- **Docker port 5432 already bound by a leftover container from Plan 04-01's orphaned worktree session** (`agent-a8976498097c8c381-postgres-1`, still running/healthy). `docker compose up -d postgres` failed with a port-allocation conflict since this repo's own `docker-compose.yml` also binds `5432`. Resolved by removing the newly-created (never-started) `denta-bot-postgres-1` container and using the already-running, already-migrated, already-seeded leftover container directly for all live verification in this session — schema and seed data (`platformadmin@dentabot.dev`) were already present and correct. No `.env` file was read or written (permission-restricted per this session's environment); all `DATABASE_URL`/JWT secret env vars were exported inline in each verify command, matching the pattern established in 04-01-SUMMARY.md.
- Task 1's D3 (concurrent-request race safety) was verified at the code level (single atomic `updateMany`, no separate `findUnique`) and functionally exercised for the sequential-replay case, but a true concurrent-load test (two simultaneous requests) was not driven this session — flagged `human_judgment: true` in the coverage table above.

## User Setup Required

None — no new external service configuration. The leftover Docker Postgres container used for verification should eventually be cleaned up (`docker rm agent-a8976498097c8c381-postgres-1` after confirming `docker-compose.yml`'s own `denta-bot-postgres-1` container can take over on a clean `docker compose up -d postgres`), but this is operational housekeeping, not a phase blocker.

## Next Phase Readiness

- Phase 4's full requirement set (INFRA-01/02/03, AUTH-01/02/03/04) is now complete across Plans 04-01 and 04-02.
- `apps/server`'s `AuthModule` is a complete, verified session-lifecycle implementation: login, refresh (rotation + reuse detection), logout, and a fail-closed global guard other Phase 5 controllers can build behind without any per-route opt-in.
- Recommended before Phase 5: a genuine concurrent-load test of `POST /auth/refresh` (two truly simultaneous requests against the same token) to close out D3's `human_judgment: true` flag with an actual race exercised, not just a code-level guarantee.

---
*Phase: 04-backend-foundation-auth*
*Completed: 2026-08-14*
