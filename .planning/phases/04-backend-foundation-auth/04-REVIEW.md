---
phase: 04-backend-foundation-auth
reviewed: 2026-08-14T09:55:52Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - .env.example
  - apps/server/src/app.module.ts
  - apps/server/src/auth/auth.controller.ts
  - apps/server/src/auth/auth.module.ts
  - apps/server/src/auth/auth.service.ts
  - apps/server/src/auth/decorators/current-user.decorator.ts
  - apps/server/src/auth/decorators/public.decorator.ts
  - apps/server/src/auth/dto/auth-response.dto.ts
  - apps/server/src/auth/dto/login.dto.ts
  - apps/server/src/auth/guards/access-token.guard.ts
  - apps/server/src/auth/guards/refresh-token.guard.ts
  - apps/server/src/auth/strategies/access-token.strategy.ts
  - apps/server/src/auth/strategies/refresh-token.strategy.ts
  - apps/server/src/config/env.validation.ts
  - apps/server/src/main.ts
  - apps/server/src/prisma/prisma.module.ts
  - apps/server/src/prisma/prisma.service.ts
  - docker-compose.yml
  - package.json
  - packages/db/prisma.config.ts
  - packages/db/prisma/schema.prisma
  - packages/db/prisma/seed.ts
  - packages/db/src/index.ts
  - README.md
  - turbo.json
findings:
  critical: 0
  warning: 7
  info: 6
  total: 13
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-14T09:55:52Z
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

This phase builds the NestJS auth foundation: JWT access/refresh tokens, cookie-scoped refresh rotation with reuse detection (atomic `updateMany` claim), argon2 password hashing, a fail-closed global `AccessTokenGuard`, and env validation via zod. The core rotation-with-reuse-detection design is sound — the atomic claim correctly closes the TOCTOU race a `findUnique` + separate `update` would have, IDOR is correctly prevented on logout (jti is taken only from the caller's own verified token), and no raw Prisma models leak through response DTOs. Prisma is used exclusively through its query builder, so there is no SQL-injection surface in the reviewed files.

No Critical-severity findings (SQL/command injection, hardcoded secrets, auth bypass) were found. However, several security-adjacent robustness gaps exist around the login/session boundary — no brute-force protection on `/auth/login`, a timing side-channel that partially undermines the "no user enumeration" design, and a cookie-security flag that depends on an env var (`NODE_ENV`) that isn't validated by the zod schema. These, plus a handful of maintainability/dead-code issues, are detailed below.

## Warnings

### WR-01: No rate limiting / brute-force protection on `POST /auth/login`

**File:** `apps/server/src/auth/auth.controller.ts:60-73`
**Issue:** `login()` has no throttling guard, account lockout, or backoff. An attacker can send unlimited password guesses against any known admin email. Given this is the *only* admin auth surface for the platform (`PlatformAdmin` — a high-value account), this is a meaningful gap for a phase whose stated focus is auth/session security.
**Fix:** Add `@nestjs/throttler` (or equivalent) scoped to the login route, e.g.:
```ts
import { Throttle } from '@nestjs/throttler';

@Public()
@Throttle({ default: { limit: 5, ttl: 60_000 } })
@Post('login')
```

### WR-02: Login response timing leaks whether an email exists (partial user-enumeration)

**File:** `apps/server/src/auth/auth.service.ts:66-82`
**Issue:** When `admin` is not found, the function throws immediately without calling `argon2.verify`. When `admin` is found, `argon2.verify` runs (which is deliberately slow — that's the point of argon2). The two code paths therefore return in measurably different times, even though the error message is identical. This partially defeats the documented "no user enumeration" goal (the comment at line 71 claims parity, but only the message is identical — the timing isn't).
**Fix:** Always perform a hash comparison, even for unknown emails, using a fixed dummy hash so timing is constant:
```ts
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$c29tZWhhc2h0aGF0aXNsb25n'; // precomputed constant

const admin = await this.prisma.platformAdmin.findUnique({ where: { email } });
const passwordValid = await argon2.verify(
  admin?.passwordHash ?? DUMMY_HASH,
  password,
);
if (!admin || !passwordValid) {
  throw invalidCredentials();
}
```

### WR-03: Refresh-cookie `Secure` flag is gated on `NODE_ENV`, which is not part of the validated env schema

**File:** `apps/server/src/auth/auth.controller.ts:34,48`
**Issue:** `secure: process.env.NODE_ENV === 'production'` is the only thing that decides whether the httpOnly refresh-token cookie requires HTTPS. `NODE_ENV` is never validated by `envSchema` (`apps/server/src/config/env.validation.ts`), so a misconfigured deployment (e.g. staging served over HTTPS but `NODE_ENV` left unset or set to something other than `'production'`) silently downgrades the session cookie to non-Secure, meaning it would also be sent over plaintext HTTP. This is exactly the class of bug the rest of the module is careful to close (cookie-only extraction, httpOnly, strict SameSite by default).
**Fix:** Validate `NODE_ENV` in `envSchema` (or add an explicit `COOKIE_SECURE` boolean env var) rather than relying on an unvalidated ambient variable, and derive the cookie flag from it:
```ts
NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
```

### WR-04: Refresh-cookie name is duplicated as a magic string instead of a shared constant

**File:** `apps/server/src/auth/auth.controller.ts:23` and `apps/server/src/auth/strategies/refresh-token.strategy.ts:27,39`
**Issue:** `auth.controller.ts` defines `REFRESH_COOKIE_NAME = 'refresh_token'` and uses it consistently, but `refresh-token.strategy.ts` independently hardcodes the literal `'refresh_token'` twice (extractor + `validate()`). If either string is ever changed without the other, refresh/logout silently breaks (cookie set under one name, read under another) with no compile-time signal.
**Fix:** Export the constant from a shared module (e.g. `auth/constants.ts`) and import it in both files.

### WR-05: `refresh()` can throw an unhandled `PrismaClientKnownRequestError` (500) instead of a clean 401

**File:** `apps/server/src/auth/auth.service.ts:135-138`
**Issue:** After the atomic claim succeeds (the token is already revoked at this point), `findUniqueOrThrow` is used to re-fetch the admin's email. If the `PlatformAdmin` row no longer exists (e.g. deleted out-of-band), this throws a raw `PrismaClientKnownRequestError` (P2025) that is not an `HttpException`, so it propagates as a generic 500 rather than a 401. Functionally the session is still terminated (the token was already marked revoked), but the caller gets an opaque server error instead of an actionable auth failure.
**Fix:** Catch the not-found case explicitly and translate it to `UnauthorizedException`:
```ts
const admin = await this.prisma.platformAdmin.findUnique({
  where: { id: payload.sub },
  select: { email: true },
});
if (!admin) {
  throw new UnauthorizedException('Refresh token reuse detected');
}
```

### WR-06: `LoginDto.password` has no maximum length

**File:** `apps/server/src/auth/dto/login.dto.ts:9-12`
**Issue:** Only `@IsString()`/`@IsNotEmpty()` are applied. A client can submit an arbitrarily large `password` string; argon2's hashing cost scales with input size, so this is a cheap amplification vector for CPU/memory exhaustion against the login endpoint (compounds WR-01's lack of rate limiting).
**Fix:**
```ts
@ApiProperty()
@IsString()
@IsNotEmpty()
@MaxLength(256)
password: string;
```

### WR-07: Swagger UI/schema is always registered with no environment gate

**File:** `apps/server/src/main.ts:25-34`
**Issue:** `SwaggerModule.setup('api/docs', ...)` runs unconditionally regardless of `NODE_ENV`, exposing the full API surface (routes, DTO shapes, auth scheme) to anyone who can reach the deployed server, including in production.
**Fix:** Gate registration behind an env flag:
```ts
if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('api/docs', app, document, { ... });
}
```

## Info

### IN-01: `PrismaService` reads `process.env.DATABASE_URL` directly instead of via `ConfigService`

**File:** `apps/server/src/prisma/prisma.service.ts:12`
**Issue:** Every other credential/secret in this phase (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) is read through `ConfigService.getOrThrow`, which benefits from zod validation and is easily mockable in tests. `PrismaService` instead reads `process.env.DATABASE_URL` directly in its constructor, bypassing the validated config surface and making the service harder to unit test in isolation.
**Fix:** Inject `ConfigService` and use `configService.getOrThrow<string>('DATABASE_URL')`.

### IN-02: Admin email lookup is case-sensitive; no normalization on login or seed

**File:** `apps/server/src/auth/auth.service.ts:67-69`, `packages/db/prisma/seed.ts:21-25`
**Issue:** `email` is used as-is in `findUnique`/`upsert` with no `.toLowerCase()` normalization, and Postgres's default text comparison is case-sensitive. An admin seeded with `Admin@Example.com` who later types `admin@example.com` at login will get "Invalid credentials" even with the correct password.
**Fix:** Normalize email casing consistently at the boundary (seed script and login), e.g. `email.toLowerCase().trim()`.

### IN-03: Cookie-options object duplicated between `setRefreshCookie` and `clearRefreshCookie`

**File:** `apps/server/src/auth/auth.controller.ts:31-56`
**Issue:** `httpOnly`, `secure`, `sameSite`, `domain`, `path` are repeated verbatim across both methods. Any future change to cookie policy risks being applied to only one of the two.
**Fix:** Extract a shared `baseCookieOptions()` helper and spread it in both call sites.

### IN-04: `RefreshToken.expiresAt` is stored but never read/enforced anywhere

**File:** `packages/db/prisma/schema.prisma:28`, `apps/server/src/auth/auth.service.ts:111-141`
**Issue:** The `expiresAt` column is populated on token creation but no query (`refresh()`, `logout()`) ever filters on it. Expiry is currently enforced solely by the JWT's own `exp` claim (`ignoreExpiration: false` in the passport strategy), which is correct for auth purposes, but this leaves `expiresAt` as effectively dead data with no cleanup job to prune stale rows.
**Fix:** Either use `expiresAt` as a defense-in-depth filter in the `refresh()`/`logout()` `where` clauses, or add a scheduled cleanup job for rows past `expiresAt`; document if it's intentionally reserved for a future job.

### IN-05: JWT secret minimum length (16 chars) is low for an HS256 signing key

**File:** `apps/server/src/config/env.validation.ts:7-8`
**Issue:** `z.string().min(16)` only guarantees 16 characters, which — depending on the character set chosen by whoever sets the secret — can fall well short of the ~256 bits of entropy recommended for HMAC-SHA256 keys.
**Fix:** Raise the minimum (e.g. `min(32)`) and note in `.env.example` that secrets should be generated with `openssl rand -hex 32` (the comment already recommends this, but the schema doesn't enforce the matching length).

### IN-06: `docker-compose.yml` ships default `postgres`/`postgres` credentials bound to the host port

**File:** `docker-compose.yml:5-10`
**Issue:** `POSTGRES_PASSWORD: postgres` with `ports: ["5432:5432"]` exposes a well-known default credential on all host interfaces. Acceptable for local dev (and consistent with `.env.example`'s `DATABASE_URL`), but worth a comment flagging that this file must never be reused as-is for a shared/staging environment.
**Fix:** Add a comment in `docker-compose.yml` noting local-dev-only use, or bind to `127.0.0.1:5432:5432` to avoid exposing it on the LAN by default.

---

_Reviewed: 2026-08-14T09:55:52Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
