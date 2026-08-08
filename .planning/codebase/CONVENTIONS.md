# Coding Conventions

**Analysis Date:** 2026-08-08

## Project State

This is a fresh Turborepo monorepo starter (pnpm workspaces) with mostly unmodified boilerplate from the framework generators (Next.js, Vite, NestJS, shadcn/ui). No custom application/business logic exists yet. Conventions below reflect the tooling setup and generator defaults currently in place — future custom code should follow these baseline patterns.

**Workspace layout:**
- `apps/web` — Next.js app (App Router)
- `apps/docs` — Next.js app (App Router, docs site)
- `apps/admin-panel` — Vite + React 19 SPA, Tailwind v4
- `apps/server` — NestJS API
- `packages/ui` — shared React component library (shadcn/ui based)
- `packages/eslint-config` — shared ESLint flat configs (`base.js`, `next.js`, `react-internal.js`)
- `packages/typescript-config` — shared `tsconfig` bases (`base.json`, `nextjs.json`, `react-library.json`)

## Naming Patterns

**Files:**
- React components: PascalCase filenames not yet established (only generator defaults present, e.g. `App.tsx`, `page.tsx`, `layout.tsx`)
- NestJS: `<name>.<type>.ts` pattern (`app.controller.ts`, `app.service.ts`, `app.module.ts`), tests as `<name>.<type>.spec.ts`
- Config files: kebab/dot convention per tool (`eslint.config.js`/`.mjs`, `vite.config.ts`, `next.config.js`)

**Functions:**
- camelCase (`getHello()` in `apps/server/src/app.service.ts`)

**Classes:**
- PascalCase with role suffix: `AppController`, `AppService`, `AppModule` (`apps/server/src/`)

**Types:**
- Not yet established in custom code; shared base configs are in `packages/typescript-config`

## Code Style

**Formatting:**
- Prettier, configured at repo root `.prettierrc`:
  - `semi: true`, `singleQuote: true`, `trailingComma: "all"`, `printWidth: 80`, `tabWidth: 2`, `arrowParens: "always"`
  - Plugin: `@trivago/prettier-plugin-sort-imports` (auto-sorts import statements)
- `apps/server` has its own `.prettierrc` override (NestJS generator default) — check both when formatting server code
- Root script: `pnpm format` → `prettier --write "**/*.{ts,tsx,md}"`
- `.prettierignore` present at root

**Linting:**
- ESLint flat config (`eslint.config.*`) per app/package, all built on shared configs in `packages/eslint-config`:
  - `packages/eslint-config/base.js` — base rules
  - `packages/eslint-config/next.js` — Next.js apps (`apps/web`, `apps/docs`)
  - `packages/eslint-config/react-internal.js` — React library code (`packages/ui`)
  - `apps/admin-panel` and `apps/server` use local eslint configs (Vite/React and NestJS/TypeScript-ESLint defaults respectively)
- Run via `pnpm lint` (turbo-orchestrated across all workspaces)

**Type checking:**
- Shared `tsconfig` bases in `packages/typescript-config`; each app extends `base.json`, `nextjs.json`, or `react-library.json`
- Root script: `pnpm check-types` (turbo-orchestrated)

## Import Organization

**Order (enforced by `@trivago/prettier-plugin-sort-imports`):**
1. Third-party modules (`<THIRD_PARTY_MODULES>`)
2. Relative imports (`^[./]`)
3. Module-scoped CSS (`^./(.*).module.scss$`)

Import groups are separated by blank lines (`importOrderSeparation: true`), and named specifiers within an import are alphabetized (`importOrderSortSpecifiers: true`).

**Path Aliases:**
- Workspace package references use `workspace:*` protocol in `package.json` (e.g. `"@repo/ui": "workspace:*"` in `apps/admin-panel/package.json`)
- No custom `@/` path aliases observed yet beyond framework defaults

## Error Handling

No custom error-handling patterns established yet (no try/catch, exception filters, or error boundaries in current code). When adding NestJS logic, follow Nest conventions (exception filters, `HttpException` subclasses); for Next.js apps, use `error.tsx` boundaries per route segment.

## Logging

No logging framework introduced yet. NestJS ships with its built-in `Logger` by default and is the natural choice for `apps/server`.

## Comments

No comment conventions established in current code (generator boilerplate is uncommented). Follow standard TSDoc for exported functions/classes when adding custom logic.

## Function Design

**NestJS pattern observed** (`apps/server/src/app.controller.ts`, `apps/server/src/app.service.ts`):
```typescript
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```
- Constructor-based dependency injection with `private readonly` fields
- Controllers delegate to services; no business logic in controllers

## Module Design

**NestJS:** one `@Module` per feature area, wiring controllers/providers (currently only `AppModule` in `apps/server/src/app.module.ts`)

**React (packages/ui):** component library organized under `packages/ui/src/components` (shadcn/ui primitives), `packages/ui/src/hooks`, `packages/ui/src/lib`; entry re-export at `packages/ui/index.tsx`

**Package manager:** pnpm workspaces (`pnpm-workspace.yaml`), orchestrated by Turborepo (`turbo.json`) for `build`, `dev`, `lint`, `check-types` pipeline tasks

---

*Convention analysis: 2026-08-08*
