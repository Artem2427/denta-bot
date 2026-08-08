<!-- refreshed: 2026-08-08 -->
# Architecture

**Analysis Date:** 2026-08-08

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Turborepo Monorepo Root                   │
│  `turbo.json`, `pnpm-workspace.yaml`, `package.json`         │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│   web (app)  │  docs (app)  │ admin-panel  │  server (api)   │
│ `apps/web`   │ `apps/docs`  │`apps/admin-  │ `apps/server`   │
│  Next.js 16  │  Next.js 16  │  panel`      │  NestJS 11      │
│              │              │  Vite+React  │                 │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬────────┘
       │              │              │                │
       └──────────────┴──────┬───────┘                │
                              ▼                        ▼
                  ┌───────────────────────┐   ┌─────────────────┐
                  │   @repo/ui package    │   │  (no shared API │
                  │  `packages/ui`        │   │  client yet)     │
                  │  shadcn/ui components │   └─────────────────┘
                  └───────────────────────┘
                              │
                  ┌───────────────────────┐
                  │ @repo/eslint-config    │
                  │ @repo/typescript-config│
                  │ `packages/eslint-config`, `packages/typescript-config` │
                  └───────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| web | Public/primary Next.js frontend app | `apps/web` |
| docs | Secondary Next.js app (documentation site) | `apps/docs` |
| admin-panel | Vite + React SPA, Tailwind v4, admin UI | `apps/admin-panel` |
| server | NestJS backend API (skeleton, unmodified Nest starter) | `apps/server` |
| @repo/ui | Shared shadcn/ui component library consumed by web/docs/admin-panel | `packages/ui` |
| @repo/eslint-config | Shared ESLint flat configs (base, next-js, react-internal) | `packages/eslint-config` |
| @repo/typescript-config | Shared tsconfig bases (base, nextjs, react-library) | `packages/typescript-config` |

## Pattern Overview

**Overall:** Monorepo (Turborepo + pnpm workspaces) with a multi-frontend / single-backend split. This is currently the **unmodified `turborepo-starter` template plus a shadcn/ui component set** dropped into `packages/ui` — no product-specific domain logic exists yet in any app.

**Key Characteristics:**
- pnpm workspaces (`apps/*`, `packages/*`) orchestrated by Turborepo (`turbo.json`) for build/lint/dev/check-types pipelines.
- Three independent frontend surfaces (web, docs, admin-panel) share one UI package (`@repo/ui`) rather than importing from each other.
- The NestJS `server` app is the Nest CLI default scaffold (`AppController`/`AppService`/`AppModule`) — no routes, modules, or persistence beyond the "Hello World" example.
- No database, ORM, ORM migrations, ports/ or ".env" driven service wiring detected yet.
- No shared API-client or types package bridging `apps/server` and the frontends — each frontend would need to define its own fetch layer against the Nest API when built out.

## Layers

**Frontend apps (web, docs):**
- Purpose: Next.js 16 App Router applications
- Location: `apps/web/app`, `apps/docs/app`
- Contains: `layout.tsx`, `page.tsx`, global CSS, module CSS
- Depends on: `@repo/ui` (component import), Next.js/React
- Used by: end users via browser

**Frontend app (admin-panel):**
- Purpose: Vite-bundled React SPA for admin tooling
- Location: `apps/admin-panel/src`
- Contains: `main.tsx` (entry), `App.tsx` (root component), Tailwind v4 config via `@tailwindcss/vite`
- Depends on: `@repo/ui`, React, Tailwind
- Used by: end users via browser (separate build/deploy target from web/docs)

**Backend API (server):**
- Purpose: NestJS HTTP API
- Location: `apps/server/src`
- Contains: `main.ts` (bootstrap), `app.module.ts` (root module), `app.controller.ts`, `app.service.ts`, matching `.spec.ts` test
- Depends on: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- Used by: not yet wired to any frontend app (no fetch calls found)

**Shared UI package (@repo/ui):**
- Purpose: Design-system component library (shadcn/ui based)
- Location: `packages/ui/src`
- Contains: `components/shadcn-ui/*.tsx` (buttons, dialogs, forms, tables, etc.), `components/logo/Logo.tsx`, `hooks/use-mobile.ts`, `lib/utils.ts` (likely `cn()` helper), `styles/theme.css`
- Depends on: React, Radix primitives (implied by shadcn), Tailwind theme tokens
- Used by: `apps/web`, `apps/docs`, `apps/admin-panel` via `@repo/ui` workspace import (`main`/`exports` point to `./index.tsx`)

**Shared config packages:**
- Purpose: Centralize lint/TS config so every app/package stays consistent
- Location: `packages/eslint-config`, `packages/typescript-config`
- Contains: flat ESLint configs, tsconfig bases
- Depends on: nothing product-specific
- Used by: all apps and packages via `workspace:*` devDependency

## Data Flow

### Primary Request Path

Not applicable yet — no frontend app currently calls the `server` API. Each Next.js/Vite app currently only renders static starter content (`apps/web/app/page.tsx`, `apps/admin-panel/src/App.tsx`).

### Server Bootstrap Flow

1. Nest app bootstraps (`apps/server/src/main.ts`) — creates `AppModule`, listens on port (default Nest starter, port 3000).
2. `AppModule` wires `AppController` + `AppService` (`apps/server/src/app.module.ts`).
3. `AppController.getHello()` calls `AppService.getHello()` and returns a plain string response (`apps/server/src/app.controller.ts`, `apps/server/src/app.service.ts`).

**State Management:**
- None implemented. No global store, context, or state library present in any app.

## Key Abstractions

**shadcn/ui component wrappers:**
- Purpose: Thin, unstyled-by-default React components (Radix-based) re-exported for consistent design tokens across apps
- Examples: `packages/ui/src/components/shadcn-ui/button.tsx`, `dialog.tsx`, `sidebar.tsx`, `table.tsx`
- Pattern: One file per primitive, using `cn()` from `packages/ui/src/lib/utils.ts` for className composition

**Nest module/controller/service triad:**
- Purpose: Standard NestJS DI pattern for organizing backend features
- Examples: `apps/server/src/app.module.ts`, `app.controller.ts`, `app.service.ts`
- Pattern: Controller handles HTTP routing, delegates business logic to an injectable Service, both registered in a Module

## Entry Points

**web app:**
- Location: `apps/web/app/layout.tsx` (root layout), `apps/web/app/page.tsx` (home route)
- Triggers: `next dev --port 3000` / `next build && next start`
- Responsibilities: Render root HTML shell and home page

**docs app:**
- Location: `apps/docs/app/layout.tsx`, `apps/docs/app/page.tsx`
- Triggers: `next dev --port 3001`
- Responsibilities: Same App Router pattern as `web`, separate port/deploy target

**admin-panel app:**
- Location: `apps/admin-panel/src/main.tsx` (Vite/React entry), `apps/admin-panel/index.html` (implied Vite HTML entry)
- Triggers: `vite` dev server / `vite build`
- Responsibilities: Mount `App.tsx` React tree into DOM

**server app:**
- Location: `apps/server/src/main.ts`
- Triggers: `nest start --watch` (dev) / `node dist/main` (prod)
- Responsibilities: Bootstrap NestJS HTTP server

## Architectural Constraints

- **Threading:** Node.js single-threaded event loop for both Nest server and Next.js/Vite dev servers — no worker threads detected.
- **Global state:** None — no singletons or module-level mutable state found beyond standard Nest DI-managed service instances.
- **Circular imports:** None detected; the codebase is too minimal for cross-module cycles to exist yet.
- **Workspace coupling:** All three frontends declare `@repo/ui` as `workspace:*`; changes to `packages/ui` propagate to all consumers on next install/build — there is no versioning/publishing boundary.
- **No shared types/contracts package:** When `server` grows real endpoints, there is currently no `packages/api-types` or similar to keep frontend/backend contracts in sync — plan for one before building real API integration.

## Anti-Patterns

None observed — the codebase is a fresh, unmodified starter template with minimal custom logic, so no anti-patterns have been introduced yet. Flag this section for re-analysis once domain code is added.

## Error Handling

**Strategy:** Not yet established. NestJS default exception filters are active implicitly (no custom `ExceptionFilter` registered in `apps/server/src`). Frontend apps have no error boundaries or try/catch patterns beyond framework defaults.

**Patterns:**
- None custom; relies entirely on framework defaults (Nest's built-in HTTP exception handling, Next.js default error pages).

## Cross-Cutting Concerns

**Logging:** None configured — no logger service, Winston/Pino, or custom Nest Logger usage found in `apps/server/src`.
**Validation:** None — no `class-validator`/`class-transformer` or Zod schemas present; `@nestjs/common` is installed but no `ValidationPipe` is registered in `main.ts`.
**Authentication:** None implemented in any app.

---

*Architecture analysis: 2026-08-08*
