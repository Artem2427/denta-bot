# Technology Stack

**Analysis Date:** 2026-08-08

## Languages

**Primary:**
- TypeScript 5.9.2 (root, `apps/web`, `apps/docs`, `packages/ui`) / TypeScript ~6.0.2 (`apps/admin-panel`) / TypeScript ^5.7.3 (`apps/server`) - used across all apps and packages

## Runtime

**Environment:**
- Node.js >=18 (per root `package.json` `engines.node`)
- No `.nvmrc` or `.node-version` file present

**Package Manager:**
- pnpm 9.0.0 (`packageManager: "pnpm@9.0.0"` in `package.json`)
- Workspace config: `pnpm-workspace.yaml` (packages: `apps/*`, `packages/*`)
- Lockfile: present (`pnpm-lock.yaml`)
- Empty `.npmrc` at root

## Monorepo Tooling

- Turborepo ^2.10.5 - task orchestration (`turbo.json`), tasks: `build`, `lint`, `check-types`, `dev`
- Root scripts in `package.json`: `dev:web`, `dev:server`, `dev:admin`, `dev:docs` (filtered turbo dev commands)

## Frameworks (per app)

**`apps/server` (API backend):**
- NestJS ^11.0.1 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) - HTTP framework
- Express (via `@nestjs/platform-express`) - underlying HTTP adapter
- RxJS ^7.8.1 - reactive utilities (Nest dependency)
- Entry point: `apps/server/src/main.ts`
- Root module: `apps/server/src/app.module.ts`

**`apps/web` (Next.js app, port 3000):**
- Next.js 16.2.0
- React ^19.2.0 / React DOM ^19.2.0
- Tailwind CSS ^4.3.3 via `@tailwindcss/postcss`
- Uses workspace package `@repo/ui`

**`apps/docs` (Next.js app, port 3001):**
- Next.js 16.2.0
- React ^19.2.0 / React DOM ^19.2.0
- Uses workspace package `@repo/ui`

**`apps/admin-panel` (Vite SPA):**
- Vite ^8.1.1
- React ^19.2.7 / React DOM ^19.2.7
- Tailwind CSS ^4.2.0 via `@tailwindcss/vite`
- React Compiler babel plugin (`babel-plugin-react-compiler`, `@rolldown/plugin-babel`)
- Uses workspace package `@repo/ui`

**`packages/ui` (shared component library, `@repo/ui`):**
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

**Testing:**
- Jest ^30.0.0 + ts-jest ^29.2.5 - `apps/server` only (unit tests via `jest`, e2e via `test/jest-e2e.json`)
- Supertest ^7.0.0 - HTTP assertions for `apps/server` e2e tests
- No test framework configured in `apps/web`, `apps/docs`, `apps/admin-panel`, or `packages/ui`

**Linting/Formatting:**
- ESLint (v9 in `apps/web`/`apps/docs`/`packages/ui`, v10 in `apps/admin-panel`, v9 in `apps/server`) with shared config `@repo/eslint-config` (`packages/eslint-config`)
- Prettier ^3.7.4 (root) with `@trivago/prettier-plugin-sort-imports` - config in `.prettierrc`, ignore rules in `.prettierignore`
- Shared TypeScript config: `packages/typescript-config`

## Key Dependencies

**Critical:**
- `@nestjs/*` (server) - core backend framework
- `next` 16.2.0 (web, docs) - React framework/SSR
- `vite` (admin-panel, ui package) - dev server/bundler
- `radix-ui` (ui package) - accessible UI primitive foundation for the design system

**Infrastructure:**
- None detected — no database client, cache client, or queue library present in any `package.json`

## Configuration

**Environment:**
- No `.env*` files present in the repository (correctly gitignored per `.gitignore`)
- No environment variable usage detected in `apps/server/src` (only default NestJS starter files: `main.ts`, `app.module.ts`, `app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`)

**Build:**
- `turbo.json` - defines `build`, `lint`, `check-types`, `dev` pipelines; `build` outputs `.next/**` (excludes cache/dev) and depends on upstream builds (`^build`)
- Each app has its own `tsconfig.json` extending `packages/typescript-config`
- `apps/web/next dev --port 3000`, `apps/docs/next dev --port 3001` - fixed dev ports to avoid collision

## Platform Requirements

**Development:**
- Node.js >=18
- pnpm 9.0.0 (via corepack or global install)

**Production:**
- No deployment/hosting configuration detected (no Dockerfile, `vercel.json`, or CI/CD workflow files found)
- `apps/web`/`apps/docs` are Next.js apps well-suited to Vercel (per `.gitignore` `.vercel` entry) but no explicit Vercel project config present
- `apps/server` builds to `dist/main` via `nest build` for `node dist/main` production start

---

*Stack analysis: 2026-08-08*
</content>
