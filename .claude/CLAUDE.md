<!-- GSD:project-start source:PROJECT.md -->

## Project

**denta-bot Marketing Site (apps/web)**

`apps/web` is the public marketing site for denta-bot — a SaaS product that gives dental clinics a Telegram/chat bot for patient booking automation. The site currently ships as the default `create-turbo` Next.js starter; this milestone replaces it with a real marketing site (Home, Prices, Demo, Blog, Blog Post, Contacts) migrated from a Figma-exported design prototype into Next.js 16 (App Router), built on the monorepo's shared `@repo/ui` component library.

**Core Value:** The migrated site must render all six pages from the design faithfully — content, layout, and theme — using `@repo/ui` components and Next.js App Router conventions, so the marketing site is production-shaped (typed, validated forms, proper routing) even though it currently runs entirely on mock data.

### Constraints

- **Tech stack**: Next.js 16.2 (App Router), React 19.2, Tailwind CSS v4, `@repo/ui` (Radix + shadcn + CVA) — must reuse, not replace, the existing monorepo stack
- **Component reuse**: All UI must go through `@repo/ui`; app-specific one-off components only for page composition, not primitives already covered by the design system
- **Forms**: `react-hook-form` + `zod` required for all form validation (Contacts, Demo if applicable)
- **State management**: Zustand allowed but not mandatory — add only when local/prop-drilled state genuinely becomes unmanageable
- **Data**: Mock/static data only this milestone — no real API integration
- **Styling source of truth**: Design archive's `theme.css` tokens are authoritative for the new theme; existing Tailwind v4 token plumbing in `packages/ui/styles/theme.css` must be preserved structurally

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.9.2 (root, `apps/web`, `apps/docs`, `packages/ui`) / TypeScript ~6.0.2 (`apps/admin-panel`) / TypeScript ^5.7.3 (`apps/server`) - used across all apps and packages

## Runtime

- Node.js >=18 (per root `package.json` `engines.node`)
- No `.nvmrc` or `.node-version` file present
- pnpm 9.0.0 (`packageManager: "pnpm@9.0.0"` in `package.json`)
- Workspace config: `pnpm-workspace.yaml` (packages: `apps/*`, `packages/*`)
- Lockfile: present (`pnpm-lock.yaml`)
- Empty `.npmrc` at root

## Monorepo Tooling

- Turborepo ^2.10.5 - task orchestration (`turbo.json`), tasks: `build`, `lint`, `check-types`, `dev`
- Root scripts in `package.json`: `dev:web`, `dev:server`, `dev:admin`, `dev:docs` (filtered turbo dev commands)

## Frameworks (per app)

- NestJS ^11.0.1 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) - HTTP framework
- Express (via `@nestjs/platform-express`) - underlying HTTP adapter
- RxJS ^7.8.1 - reactive utilities (Nest dependency)
- Entry point: `apps/server/src/main.ts`
- Root module: `apps/server/src/app.module.ts`
- Next.js 16.2.0
- React ^19.2.0 / React DOM ^19.2.0
- Tailwind CSS ^4.3.3 via `@tailwindcss/postcss`
- Uses workspace package `@repo/ui`
- Next.js 16.2.0
- React ^19.2.0 / React DOM ^19.2.0
- Uses workspace package `@repo/ui`
- Vite ^8.1.1
- React ^19.2.7 / React DOM ^19.2.7
- Tailwind CSS ^4.2.0 via `@tailwindcss/vite`
- React Compiler babel plugin (`babel-plugin-react-compiler`, `@rolldown/plugin-babel`)
- Uses workspace package `@repo/ui`
- React 19.2.0 component library, built with Vite
- Radix UI (`radix-ui` ^1.4.3) - unstyled UI primitives
- shadcn ^3.8.5 - component scaffolding tool
- `@tanstack/react-table` ^8.21.3 - table components
- `class-variance-authority`, `clsx`, `tailwind-merge` - styling utilities
- `date-fns`, `react-day-picker` - date handling/calendar components
- `lucide-react` - icon set
- `sonner` - toast notifications
- `vaul` - drawer component
- `next-themes` - theme switching
- Jest ^30.0.0 + ts-jest ^29.2.5 - `apps/server` only (unit tests via `jest`, e2e via `test/jest-e2e.json`)
- Supertest ^7.0.0 - HTTP assertions for `apps/server` e2e tests
- No test framework configured in `apps/web`, `apps/docs`, `apps/admin-panel`, or `packages/ui`
- ESLint (v9 in `apps/web`/`apps/docs`/`packages/ui`, v10 in `apps/admin-panel`, v9 in `apps/server`) with shared config `@repo/eslint-config` (`packages/eslint-config`)
- Prettier ^3.7.4 (root) with `@trivago/prettier-plugin-sort-imports` - config in `.prettierrc`, ignore rules in `.prettierignore`
- Shared TypeScript config: `packages/typescript-config`

## Key Dependencies

- `@nestjs/*` (server) - core backend framework
- `next` 16.2.0 (web, docs) - React framework/SSR
- `vite` (admin-panel, ui package) - dev server/bundler
- `radix-ui` (ui package) - accessible UI primitive foundation for the design system
- None detected — no database client, cache client, or queue library present in any `package.json`

## Configuration

- No `.env*` files present in the repository (correctly gitignored per `.gitignore`)
- No environment variable usage detected in `apps/server/src` (only default NestJS starter files: `main.ts`, `app.module.ts`, `app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`)
- `turbo.json` - defines `build`, `lint`, `check-types`, `dev` pipelines; `build` outputs `.next/**` (excludes cache/dev) and depends on upstream builds (`^build`)
- Each app has its own `tsconfig.json` extending `packages/typescript-config`
- `apps/web/next dev --port 3000`, `apps/docs/next dev --port 3001` - fixed dev ports to avoid collision

## Platform Requirements

- Node.js >=18
- pnpm 9.0.0 (via corepack or global install)
- No deployment/hosting configuration detected (no Dockerfile, `vercel.json`, or CI/CD workflow files found)
- `apps/web`/`apps/docs` are Next.js apps well-suited to Vercel (per `.gitignore` `.vercel` entry) but no explicit Vercel project config present
- `apps/server` builds to `dist/main` via `nest build` for `node dist/main` production start

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Project State

- `apps/web` — Next.js app (App Router)
- `apps/docs` — Next.js app (App Router, docs site)
- `apps/admin-panel` — Vite + React 19 SPA, Tailwind v4
- `apps/server` — NestJS API
- `packages/ui` — shared React component library (shadcn/ui based)
- `packages/eslint-config` — shared ESLint flat configs (`base.js`, `next.js`, `react-internal.js`)
- `packages/typescript-config` — shared `tsconfig` bases (`base.json`, `nextjs.json`, `react-library.json`)

## Naming Patterns

- React components: PascalCase filenames not yet established (only generator defaults present, e.g. `App.tsx`, `page.tsx`, `layout.tsx`)
- NestJS: `<name>.<type>.ts` pattern (`app.controller.ts`, `app.service.ts`, `app.module.ts`), tests as `<name>.<type>.spec.ts`
- Config files: kebab/dot convention per tool (`eslint.config.js`/`.mjs`, `vite.config.ts`, `next.config.js`)
- camelCase (`getHello()` in `apps/server/src/app.service.ts`)
- PascalCase with role suffix: `AppController`, `AppService`, `AppModule` (`apps/server/src/`)
- Not yet established in custom code; shared base configs are in `packages/typescript-config`

## Code Style

- Prettier, configured at repo root `.prettierrc`:
- `apps/server` has its own `.prettierrc` override (NestJS generator default) — check both when formatting server code
- Root script: `pnpm format` → `prettier --write "**/*.{ts,tsx,md}"`
- `.prettierignore` present at root
- ESLint flat config (`eslint.config.*`) per app/package, all built on shared configs in `packages/eslint-config`:
- Run via `pnpm lint` (turbo-orchestrated across all workspaces)
- Shared `tsconfig` bases in `packages/typescript-config`; each app extends `base.json`, `nextjs.json`, or `react-library.json`
- Root script: `pnpm check-types` (turbo-orchestrated)

## Import Organization

- Workspace package references use `workspace:*` protocol in `package.json` (e.g. `"@repo/ui": "workspace:*"` in `apps/admin-panel/package.json`)
- No custom `@/` path aliases observed yet beyond framework defaults

## Error Handling

## Logging

## Comments

## Function Design

- Constructor-based dependency injection with `private readonly` fields
- Controllers delegate to services; no business logic in controllers

## Module Design

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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

- pnpm workspaces (`apps/*`, `packages/*`) orchestrated by Turborepo (`turbo.json`) for build/lint/dev/check-types pipelines.
- Three independent frontend surfaces (web, docs, admin-panel) share one UI package (`@repo/ui`) rather than importing from each other.
- The NestJS `server` app is the Nest CLI default scaffold (`AppController`/`AppService`/`AppModule`) — no routes, modules, or persistence beyond the "Hello World" example.
- No database, ORM, ORM migrations, ports/ or ".env" driven service wiring detected yet.
- No shared API-client or types package bridging `apps/server` and the frontends — each frontend would need to define its own fetch layer against the Nest API when built out.

## Layers

- Purpose: Next.js 16 App Router applications
- Location: `apps/web/app`, `apps/docs/app`
- Contains: `layout.tsx`, `page.tsx`, global CSS, module CSS
- Depends on: `@repo/ui` (component import), Next.js/React
- Used by: end users via browser
- Purpose: Vite-bundled React SPA for admin tooling
- Location: `apps/admin-panel/src`
- Contains: `main.tsx` (entry), `App.tsx` (root component), Tailwind v4 config via `@tailwindcss/vite`
- Depends on: `@repo/ui`, React, Tailwind
- Used by: end users via browser (separate build/deploy target from web/docs)
- Purpose: NestJS HTTP API
- Location: `apps/server/src`
- Contains: `main.ts` (bootstrap), `app.module.ts` (root module), `app.controller.ts`, `app.service.ts`, matching `.spec.ts` test
- Depends on: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- Used by: not yet wired to any frontend app (no fetch calls found)
- Purpose: Design-system component library (shadcn/ui based)
- Location: `packages/ui/src`
- Contains: `components/shadcn-ui/*.tsx` (buttons, dialogs, forms, tables, etc.), `components/logo/Logo.tsx`, `hooks/use-mobile.ts`, `lib/utils.ts` (likely `cn()` helper), `styles/theme.css`
- Depends on: React, Radix primitives (implied by shadcn), Tailwind theme tokens
- Used by: `apps/web`, `apps/docs`, `apps/admin-panel` via `@repo/ui` workspace import (`main`/`exports` point to `./index.tsx`)
- Purpose: Centralize lint/TS config so every app/package stays consistent
- Location: `packages/eslint-config`, `packages/typescript-config`
- Contains: flat ESLint configs, tsconfig bases
- Depends on: nothing product-specific
- Used by: all apps and packages via `workspace:*` devDependency

## Data Flow

### Primary Request Path

### Server Bootstrap Flow

- None implemented. No global store, context, or state library present in any app.

## Key Abstractions

- Purpose: Thin, unstyled-by-default React components (Radix-based) re-exported for consistent design tokens across apps
- Examples: `packages/ui/src/components/shadcn-ui/button.tsx`, `dialog.tsx`, `sidebar.tsx`, `table.tsx`
- Pattern: One file per primitive, using `cn()` from `packages/ui/src/lib/utils.ts` for className composition
- Purpose: Standard NestJS DI pattern for organizing backend features
- Examples: `apps/server/src/app.module.ts`, `app.controller.ts`, `app.service.ts`
- Pattern: Controller handles HTTP routing, delegates business logic to an injectable Service, both registered in a Module

## Entry Points

- Location: `apps/web/app/layout.tsx` (root layout), `apps/web/app/page.tsx` (home route)
- Triggers: `next dev --port 3000` / `next build && next start`
- Responsibilities: Render root HTML shell and home page
- Location: `apps/docs/app/layout.tsx`, `apps/docs/app/page.tsx`
- Triggers: `next dev --port 3001`
- Responsibilities: Same App Router pattern as `web`, separate port/deploy target
- Location: `apps/admin-panel/src/main.tsx` (Vite/React entry), `apps/admin-panel/index.html` (implied Vite HTML entry)
- Triggers: `vite` dev server / `vite build`
- Responsibilities: Mount `App.tsx` React tree into DOM
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

## Error Handling

- None custom; relies entirely on framework defaults (Nest's built-in HTTP exception handling, Next.js default error pages).

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
