# External Integrations

**Analysis Date:** 2026-08-08

## Summary

This is a fresh Turborepo starter monorepo (NestJS server + two Next.js apps + a Vite admin panel + a shared `@repo/ui` package). No external service integrations, databases, auth providers, or third-party APIs are wired up yet. All apps contain only starter/boilerplate code:
- `apps/server/src/*` - default NestJS `AppController`/`AppService` (hello-world endpoint)
- `apps/web`, `apps/docs` - default Next.js starter pages
- `apps/admin-panel` - default Vite + React starter

## APIs & External Services

**None detected.** No SDK clients, no `fetch`/`axios`/HTTP client usage to third-party APIs found in `apps/server/src`, `apps/web`, `apps/docs`, or `apps/admin-panel` source directories.

## Data Storage

**Databases:**
- None. No ORM (Prisma, TypeORM, Mongoose, Drizzle), no `@nestjs/typeorm` / `@nestjs/mongoose`, and no database client packages in any `package.json`.

**File Storage:**
- Local filesystem only (no cloud storage SDKs present).

**Caching:**
- None.

## Authentication & Identity

**Auth Provider:**
- None implemented. No `@nestjs/passport`, `passport`, `next-auth`, `@auth/*`, `@clerk/*`, `@supabase/*`, or similar packages present in any workspace.

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, or similar SDKs detected).

**Logs:**
- Default NestJS built-in `Logger` only (via `@nestjs/common`); no external log shipping configured.

## CI/CD & Deployment

**Hosting:**
- Not configured. No Dockerfile, `vercel.json`, `netlify.toml`, or other deployment manifest found.

**CI Pipeline:**
- None. No `.github/workflows/` directory present.

## Environment Configuration

**Required env vars:**
- None detected. No `.env*` files exist in the repo, and no `process.env.*` usage was found in server source files.

**Secrets location:**
- Not applicable — no secrets management configured yet.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

## Notes for Future Integration Work

When wiring up real integrations (database, auth, external APIs), the natural entry points are:
- `apps/server/src/app.module.ts` - register new NestJS modules (e.g., `TypeOrmModule.forRoot(...)`, `ConfigModule`)
- `apps/server/src/main.ts` - bootstrap-level configuration (CORS, global pipes, Swagger, etc.)
- New `.env` file at repo root or per-app, respecting the already-gitignored `.env*` patterns in `.gitignore`

---

*Integration audit: 2026-08-08*
</content>
