# Walking Skeleton — denta-bot Marketing Site (apps/web)

**Phase:** 1
**Generated:** 2026-08-08

## Capability Proven End-to-End

A visitor can browse to any of the six route paths and see a themed, branded header/footer shell wrapping the page, toggle light/dark theme (a real client-state read/write via `next-themes` that persists across client-side navigation, not mocked), and land on a proper Not Found page — inside that same shell — for any unmatched URL.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.2 App Router (`apps/web`, pre-existing monorepo choice) | Already the project's chosen stack; this phase activates it with real routing/theming instead of the default `create-turbo` starter content |
| Styling / theme layer | Tailwind v4 CSS-first tokens in `packages/ui/styles/theme.css`, `next-themes` for light/dark toggle | The design archive's own token system ports directly onto Tailwind v4's `@theme inline` mechanism; `next-themes` is already a `@repo/ui` dependency (D-04) |
| Component library | `@repo/ui` (Radix + shadcn + CVA), consumed via `workspace:*` | Project constraint — all UI must route through `@repo/ui`, not a new app-local library (PROJECT.md) |
| "Data layer" (adapted — no database exists in this project) | Client-side only: `next-themes`' `localStorage`-backed theme preference is the one real, non-mocked read/write this phase proves end-to-end | No database exists anywhere in this monorepo this milestone (`apps/server` is an unmodified Nest starter); theme persistence is the closest real analog to a database read/write |
| Deployment (adapted — no deploy target exists yet) | Documented local dev run: `pnpm dev:web` (port 3000) | No `Dockerfile`/`vercel.json`/CI workflow exists yet in this repo; this phase does not introduce one |
| Directory layout | App-local, non-`@repo/ui` components live under `apps/web/app/_components/` | No `_components` convention existed before this phase; established here per `01-CONTEXT.md`'s Claude's-discretion note, since no `@/` path aliases are configured |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js App Router already scaffolded by `create-turbo`; this phase replaces the starter's theming/layout with real, branded ones)
- [x] Routing — real root layout (`apps/web/app/layout.tsx`) and a real catch-all route (`apps/web/app/not-found.tsx`); all 6 route paths resolve (Home still shows the pre-existing starter content until Phase 2 replaces it; Prices/Demo/Blog/Contacts intentionally resolve to the Not Found page until Phase 2/3 land, mirroring D-05's footer `/about`/`/privacy` precedent)
- [ ] Database — N/A this project (no database exists anywhere in this stack this milestone; adapted per this phase's planning context)
- [x] "Database" adapted — real client-state read/write: `next-themes`' theme preference, persisted to `localStorage`, not mocked
- [x] UI — theme toggle button wired to real `next-themes` state; header nav wired to real `next/link` routing with active-link highlighting
- [x] Deployment — adapted to a documented local dev run command (`pnpm dev:web`); no hosting target exists yet in this repo

## Out of Scope (Deferred to Later Slices)

- All page content — Home hero/features, Prices tiers, Demo chat simulation, Blog listing/detail, Contacts form (Phase 2/3)
- The shadcn `form` primitive (react-hook-form wrapper) — deferred to Phase 2 when CONT-01 needs it; adding it now would require new `react-hook-form`/`zod` npm dependencies that haven't cleared the Package Legitimacy Gate
- Real backend/API integration (v2 `INTEG-01`/`INTEG-02` — entirely out of this milestone's scope)
- Any deploy target or hosting configuration — no `Dockerfile`/`vercel.json` exists; not introduced this phase

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Home landing page, Contacts form (`react-hook-form` + `zod` validation, mocked success confirmation, FAQ accordion), and the Demo chat-bot simulation — all rendered inside this phase's shell
- Phase 3: Prices tiers and Blog listing/detail routes — completing all six routes inside this same shell
