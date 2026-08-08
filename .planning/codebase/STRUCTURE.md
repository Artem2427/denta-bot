# Codebase Structure

**Analysis Date:** 2026-08-08

## Directory Layout

```
denta-bot/
├── apps/
│   ├── web/              # Next.js 16 app (App Router), primary frontend, port 3000
│   ├── docs/              # Next.js 16 app (App Router), docs site, port 3001
│   ├── admin-panel/       # Vite + React SPA (Tailwind v4), admin frontend
│   └── server/             # NestJS 11 backend API (unmodified starter)
├── packages/
│   ├── ui/                # @repo/ui — shared shadcn/ui component library
│   ├── eslint-config/      # @repo/eslint-config — shared flat ESLint configs
│   └── typescript-config/  # @repo/typescript-config — shared tsconfig bases
├── .planning/              # GSD planning artifacts (this document lives here)
├── .vscode/                 # Editor settings
├── turbo.json                # Turborepo pipeline definitions (build/dev/lint/check-types)
├── pnpm-workspace.yaml        # Workspace globs: apps/*, packages/*
├── package.json                # Root scripts (turbo run ...), workspace root deps
├── pnpm-lock.yaml
├── .prettierrc / .prettierignore
└── README.md
```

## Directory Purposes

**`apps/web/`:**
- Purpose: Primary Next.js frontend application
- Contains: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/page.module.css`, `app/fonts/`, `public/`
- Key files: `apps/web/app/page.tsx` (home route), `apps/web/next.config.js`

**`apps/docs/`:**
- Purpose: Secondary Next.js app (documentation), structurally identical to `web`
- Contains: `app/layout.tsx`, `app/page.tsx`, `app/fonts/`, `public/`
- Key files: `apps/docs/app/page.tsx`, `apps/docs/next.config.js`

**`apps/admin-panel/`:**
- Purpose: Vite-bundled React SPA for admin tooling, Tailwind v4 via `@tailwindcss/vite`
- Contains: `src/main.tsx` (entry), `src/App.tsx` (root component), `src/index.css`, `src/assets/`, `index.html` (Vite entry HTML)
- Key files: `apps/admin-panel/vite.config.ts`, `apps/admin-panel/src/main.tsx`

**`apps/server/`:**
- Purpose: NestJS backend API — currently the unmodified `nest new` scaffold
- Contains: `src/main.ts` (bootstrap), `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts`, `src/app.controller.spec.ts`, `test/` (e2e tests)
- Key files: `apps/server/src/main.ts`, `apps/server/src/app.module.ts`

**`packages/ui/`:**
- Purpose: Shared design-system component package consumed by all three frontends
- Contains: `src/components/shadcn-ui/*.tsx` (~35 shadcn/ui primitives: button, dialog, table, sidebar, form inputs, etc.), `src/components/logo/Logo.tsx`, `src/hooks/use-mobile.ts`, `src/lib/utils.ts` (className helper), `styles/theme.css`
- Key files: `packages/ui/index.tsx` (package entry, referenced by `main`/`exports` in `package.json`)

**`packages/eslint-config/`:**
- Purpose: Centralized ESLint flat-config presets
- Contains: `base.js`, `next.js`, `react-internal.js`
- Key files: `packages/eslint-config/package.json` (defines `./base`, `./next-js`, `./react-internal` exports)

**`packages/typescript-config/`:**
- Purpose: Centralized `tsconfig.json` bases for different project types (base, Next.js, React library)
- Contains: `base.json`, `nextjs.json`, `react-library.json` (typical turborepo-starter layout; verify exact filenames if extending)

## Key File Locations

**Entry Points:**
- `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`: Next.js web app root
- `apps/docs/app/layout.tsx`, `apps/docs/app/page.tsx`: Next.js docs app root
- `apps/admin-panel/src/main.tsx`: Vite/React SPA entry (mounts `App.tsx`)
- `apps/server/src/main.ts`: NestJS bootstrap

**Configuration:**
- `turbo.json`: Task pipeline (build/dev/lint/check-types) shared across workspace
- `pnpm-workspace.yaml`: Declares `apps/*` and `packages/*` as workspace packages
- `.prettierrc` / `.prettierignore`: Formatting rules (uses `@trivago/prettier-plugin-sort-imports`)
- Per-app `eslint.config.js` (flat config) in each `apps/*` directory, extending `@repo/eslint-config`
- Per-app `tsconfig.json` extending `@repo/typescript-config`

**Core Logic:**
- `apps/server/src/app.controller.ts`, `apps/server/src/app.service.ts`: Only backend logic present (Nest "Hello World" example)
- `packages/ui/src/components/shadcn-ui/`: Reusable UI primitives

**Testing:**
- `apps/server/src/app.controller.spec.ts`: Unit test (Jest, co-located with source)
- `apps/server/test/`: Nest e2e test directory (`jest-e2e.json` config)

## Naming Conventions

**Files:**
- React components: PascalCase (`Logo.tsx`, `App.tsx`)
- shadcn/ui primitives: kebab-case matching the component name (`button.tsx`, `dropdown-menu.tsx`, `alert-dialog.tsx`)
- NestJS files: `<name>.<type>.ts` (`app.controller.ts`, `app.service.ts`, `app.module.ts`), specs as `<name>.<type>.spec.ts`
- Config files: lowercase with dots (`next.config.js`, `vite.config.ts`, `eslint.config.js`)

**Directories:**
- Workspace packages: lowercase, hyphenated (`admin-panel`, `eslint-config`, `typescript-config`)
- Feature/UI grouping inside `packages/ui/src/components/`: lowercase folder per concern (`shadcn-ui/`, `logo/`)

## Where to Add New Code

**New Feature (frontend, web or docs):**
- Primary code: new route folder/file under `apps/web/app/` or `apps/docs/app/` following Next.js App Router conventions (`app/<route>/page.tsx`)
- Shared components: add to `packages/ui/src/components/` if reused across apps; keep app-specific components local to the app if single-use

**New Feature (admin-panel):**
- Primary code: `apps/admin-panel/src/` — no existing sub-structure beyond `App.tsx`; introduce `src/pages/` or `src/features/` as the app grows
- Tests: none currently configured for `admin-panel` — add a test runner (Vitest recommended given Vite) before adding tests

**New Backend Module (server):**
- Primary code: `apps/server/src/<feature>/` following Nest convention — `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`
- Register new module in `apps/server/src/app.module.ts` imports array
- Tests: co-locate `<feature>.controller.spec.ts` next to source; e2e tests go in `apps/server/test/`

**New Shared UI Component:**
- Implementation: `packages/ui/src/components/<name>/` (for composite/custom components) or directly in `packages/ui/src/components/shadcn-ui/` (for shadcn primitives)
- Export path: update `packages/ui/index.tsx` if the package uses explicit re-exports

**Utilities:**
- Shared helpers: `packages/ui/src/lib/utils.ts` for UI-related helpers; no general-purpose shared utils package exists yet — create `packages/utils` or similar if non-UI shared logic emerges (e.g., API types/contracts shared between `server` and frontends)

## Special Directories

**`apps/*/node_modules/`, root `node_modules/`:**
- Purpose: pnpm-managed dependencies (hoisted via workspace)
- Generated: Yes
- Committed: No (`.gitignore`)

**`.turbo/` (implied, git-ignored):**
- Purpose: Turborepo cache
- Generated: Yes
- Committed: No

**`.next/`, `dist/`, `build/`, `out/`:**
- Purpose: Build output for Next.js apps (`.next`), Nest server (`dist`), Vite admin-panel (`dist`/`build`)
- Generated: Yes
- Committed: No

**`.claude/worktrees/`:**
- Purpose: Isolated agent worktree containing a mirrored copy of `apps/` and `packages/` (used by Claude Code agent tooling, not part of the shipped app)
- Generated: Yes (agent-managed)
- Committed: Not verified — treat as tooling artifact, exclude from structural analysis of the actual product

**`.planning/`:**
- Purpose: GSD workflow planning documents (requirements, roadmap, codebase maps)
- Generated: Partially (some files hand-written, some agent-generated)
- Committed: Yes (typically)

---

*Structure analysis: 2026-08-08*
