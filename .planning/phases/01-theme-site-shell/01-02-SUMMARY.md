---
phase: 01-theme-site-shell
plan: 02
subsystem: ui
tags: [nextjs-app-router, next-themes, tailwind-v4, shadcn, header, footer, not-found, rsc]

requires:
  - phase: 01-theme-site-shell (Plan 01)
    provides: "Re-themed packages/ui/styles/theme.css (--brand token, semantic tokens) and the sonner.tsx 'use client' fix that this plan's <Toaster /> wiring depends on"
provides:
  - "apps/web/app/_components/logo.tsx — local DentaBot Logo (Server Component, 🦷 badge, bg-brand)"
  - "apps/web/app/_components/theme-toggle.tsx — light/dark ThemeToggle wired to next-themes"
  - "apps/web/app/_components/header.tsx — fixed/sticky nav with scroll style, exact-match active-link, mobile menu"
  - "apps/web/app/_components/footer.tsx — 4-column static footer with Logo, product/company/contact links"
  - "apps/web/app/not-found.tsx — Next.js root catch-all 404, rendered inside the shared shell"
  - "apps/web/app/layout.tsx — ThemeProvider(attribute=class, defaultTheme=light, enableSystem) wraps Header/main/Footer/Toaster for every route"
  - "next-themes and lucide-react declared as direct apps/web dependencies (previously only transitive via @repo/ui, unresolvable under pnpm's strict isolation)"
affects: [01-03, phase-02, phase-03]

tech-stack:
  added: []
  patterns:
    - "app/_components/ local component convention for app-specific, non-@repo/ui composition components (no @/ alias, relative imports)"
    - "Client/Server boundary: Header + ThemeToggle are 'use client' (scroll listener, mounted-guard, usePathname); Logo/Footer/NotFound stay Server Components"
    - "D-03 semantic-token normalization applied at the component level: bg-background/text-foreground/text-muted-foreground/border-border/bg-muted replace all literal Tailwind gray utilities from the design source"

key-files:
  created:
    - apps/web/app/_components/logo.tsx
    - apps/web/app/_components/theme-toggle.tsx
    - apps/web/app/_components/header.tsx
    - apps/web/app/_components/footer.tsx
    - apps/web/app/not-found.tsx
  modified:
    - apps/web/app/layout.tsx
    - apps/web/app/page.tsx
    - apps/web/package.json
    - pnpm-lock.yaml

key-decisions:
  - "next-themes/lucide-react added as explicit apps/web dependencies (Rule 3, not a new install — both were already pinned in pnpm-lock.yaml at the exact versions @repo/ui uses; pnpm's per-package node_modules isolation just didn't expose them to apps/web until declared directly)"
  - "Explicit React.JSX.Element return-type annotations added to Footer/Logo/NotFound/Home (apps/web/app/page.tsx) to unblock the pre-existing 'portable type / duplicate @types/react' tsc error that the known_preexisting_issue note anticipated for layout.tsx and that cascaded to every component reachable from the root layout's type-check graph once wired in"
  - "Header/Footer internal links use next/link's Link (not plain <a>) per the plan's Link-to-next/link substitution rule; external social/contact links (Telegram, Instagram, mailto) stay plain <a> with target=_blank rel=noopener noreferrer"

requirements-completed: [THEME-03, LAYOUT-01, LAYOUT-02, LAYOUT-03]

coverage:
  - id: D1
    description: "Theme toggle flips light/dark via next-themes, persists via localStorage, mounted-guard prevents hydration flash"
    requirement: THEME-03
    verification:
      - kind: manual_procedural
        ref: "pnpm dev:web, click theme toggle in header, confirm whole page re-themes and choice survives client-side navigation (human-check in plan's <verification>)"
        status: unknown
    human_judgment: true
    rationale: "Visual theme-switch correctness and cross-tab/localStorage persistence require a human browser check per workflow.human_verify_mode=end-of-phase; not scriptable via grep/build alone."
  - id: D2
    description: "Header renders on every route with 5 nav links, scroll-triggered style change at scrollY>20, exact-match active-link highlight, and a working mobile hamburger menu"
    requirement: LAYOUT-01
    verification:
      - kind: automated_ui
        ref: "Task 1 grep-based acceptance criteria (usePathname present, no useLocation, scrollY > 20 exact boundary, text-brand active state, 0 literal gray utilities) — all passed"
        status: pass
      - kind: manual_procedural
        ref: "pnpm dev:web — resize under 1024px, confirm hamburger opens/closes and closes after link click (human-check in plan's <verification>)"
        status: unknown
    human_judgment: true
    rationale: "Grep-verified static/behavioral correctness is proven, but the mobile-menu open/close interaction and scroll-blur visual effect need a human browser check per workflow.human_verify_mode=end-of-phase."
  - id: D3
    description: "Footer renders 4 columns (Logo+description, Продукт, Компанія, Контакти) with D-05-preserved /about and /privacy links and secure external anchors"
    requirement: LAYOUT-02
    verification:
      - kind: automated_ui
        ref: "Task 2 grep-based acceptance criteria (0 'use client', exactly 2 target=_blank + 2 rel=noopener noreferrer, /about and /privacy present, Logo imported, 0 literal gray utilities) — all passed"
        status: pass
    human_judgment: false
  - id: D4
    description: "Any unmatched URL (e.g. /nonexistent, /about, /privacy) renders apps/web/app/not-found.tsx inside the shared Header/Footer shell via Next.js's automatic root not-found.tsx routing, no client-side redirect"
    requirement: LAYOUT-03
    verification:
      - kind: automated_ui
        ref: "Task 2 grep-based acceptance criteria (0 useRouter/redirect(, text-brand heading) — passed; live smoke test: curl http://localhost:3000/does-not-exist returned HTTP 404 with both 'Сторінку не знайдено' and 'DentaBot' (shell) present in the response body"
        status: pass
    human_judgment: false
  - id: D5
    description: "apps/web/app/layout.tsx wraps every route in next-themes ThemeProvider(attribute=class, defaultTheme=light, enableSystem) with Header above {children} and Footer below it, Toaster mounted site-wide"
    requirement: THEME-03
    verification:
      - kind: automated_ui
        ref: "Task 3 grep-based acceptance criteria (lang=uk, suppressHydrationWarning, next-themes import, exactly one each of <Header/<Footer/<Toaster, attribute=class/defaultTheme=light/enableSystem) — all passed; Turbopack 'Compiled successfully' for all 6 changed/created files; live pnpm dev:web smoke test on / and /does-not-exist both returned 200/404 with the branded shell rendered"
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-08-08
status: complete
---

# Phase 1 Plan 2: Site Shell (Header/Footer/ThemeToggle/Not-Found) Summary

**Wired every `apps/web` route into a themeable shell — `next-themes` `ThemeProvider` + a scroll-aware Header (5-link nav, exact-match active state, mobile menu) + a 4-column Footer + a branded 404 — via a rewritten `apps/web/app/layout.tsx`, consuming Plan 01-01's `--brand` token and semantic-token normalization throughout.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-08-08T11:37:12Z
- **Completed:** 2026-08-08T11:47:05Z
- **Tasks:** 3 completed
- **Files modified:** 9 (5 created, 4 modified)

## Accomplishments
- Built `apps/web/app/_components/logo.tsx`, `theme-toggle.tsx`, and `header.tsx` — the header is a single `'use client'` component (scroll listener at the exact `scrollY > 20` boundary from the design source, `usePathname()`-based exact-match active-link highlighting, inline collapsible mobile menu) reusing `@repo/ui`'s `Button` and consuming only semantic tokens (`bg-background`, `text-brand`, `text-muted-foreground`, `border-border`) — zero literal Tailwind gray utilities or raw `#1d6be4` hex literals anywhere
- Built `apps/web/app/_components/footer.tsx` (Server Component, static 4-column grid) and `apps/web/app/not-found.tsx` (Next.js root catch-all, no manual `*` route) — footer preserves D-05's dead `/about`/`/privacy` links exactly as designed and keeps `target="_blank" rel="noopener noreferrer"` on both external social anchors (T-01-03 mitigation)
- Rewrote `apps/web/app/layout.tsx`: `lang="uk"` + `suppressHydrationWarning`, `next-themes`' `ThemeProvider(attribute="class" defaultTheme="light" enableSystem)` wrapping `Header`/`main`/`Footer`/`Toaster`, DentaBot metadata — every route (including 404) now renders inside the branded, theme-toggleable shell
- Live-verified with `pnpm dev:web`: `GET /` → 200 with "DentaBot" branding present twice (header + footer); `GET /does-not-exist` → 404 with the branded 404 content nested inside the same Header/Footer shell

## Task Commits

1. **Task 1: Build Logo, ThemeToggle, and Header shell components** - `69c3fe7` (feat)
2. **Task 2: Build Footer and the Not Found route** - `04bb42a` (feat)
3. **Task 3: Wire the root layout — ThemeProvider, Header, Footer, Toaster** - `33a9e41` (feat)

**Plan metadata:** (pending — final commit below)

## Files Created/Modified
- `apps/web/app/_components/logo.tsx` - New: Server Component, `next/link` badge+label logo (D-06/D-07: local to `apps/web`, keeps 🦷 emoji, `@repo/ui`'s `Logo.tsx` untouched)
- `apps/web/app/_components/theme-toggle.tsx` - New: Client Component, `next-themes` `useTheme()` + mounted-guard, `@repo/ui`'s `Button`
- `apps/web/app/_components/header.tsx` - New: Client Component, scroll state, mobile menu, `usePathname()` active-link, D-03-normalized tokens
- `apps/web/app/_components/footer.tsx` - New: Server Component, 4-column static grid, `next/link` for internal nav, secure external anchors
- `apps/web/app/not-found.tsx` - New: Next.js root catch-all 404 route, no redirect logic
- `apps/web/app/layout.tsx` - Rewrote: DentaBot metadata, `lang="uk"` + `suppressHydrationWarning`, `ThemeProvider`+`Header`+`main`+`Footer`+`Toaster` wiring, explicit `React.JSX.Element` return type
- `apps/web/app/page.tsx` - Same explicit return-type fix applied (pre-existing starter file, now reachable from the same type-check graph as `layout.tsx`)
- `apps/web/package.json` - Added `next-themes`/`lucide-react` as direct dependencies (previously only transitive via `@repo/ui`)
- `pnpm-lock.yaml` - Regenerated after the dependency declaration (no new versions resolved, same pinned versions `@repo/ui` already uses)

## Decisions Made
- `next-themes`/`lucide-react` declared as direct `apps/web` dependencies rather than relying on `@repo/ui`'s transitive install — pnpm's per-package `node_modules` isolation does not expose a workspace dependency's own dependencies to a consumer unless declared directly; confirmed via `node -e "require.resolve('next-themes')"` failing before the fix and succeeding after. No new package versions were fetched (both already pinned in `pnpm-lock.yaml` via `packages/ui`).
- Footer/logo internal links use `next/link`'s `Link` (matching the plan's explicit `Link`→`next/link` port instruction), while external anchors (Telegram/Instagram/mailto) stay plain `<a>` tags since they're not internal routes.
- Added explicit `React.JSX.Element` return-type annotations to `Footer`, `Logo`, `NotFound`, and `Home` (`apps/web/app/page.tsx`) — the same one-line mitigation the plan's `<known_preexisting_issue>` note prescribed for `layout.tsx`'s "portable type" `tsc` error, which turned out to cascade to every component reachable from the root layout's type-check graph once wired together (not just `layout.tsx` itself).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Declared `next-themes`/`lucide-react` as direct `apps/web` dependencies**
- **Found during:** Task 1 (writing `theme-toggle.tsx`/`header.tsx`, which import `next-themes` and `lucide-react` directly)
- **Issue:** `apps/web/package.json` only declared `@repo/ui`, `next`, `react`, `react-dom`. `next-themes` and `lucide-react` are dependencies of `@repo/ui`, but pnpm's strict per-package `node_modules` isolation does not hoist a workspace package's own dependencies into a *consumer's* `node_modules` — confirmed via `node -e "require.resolve('next-themes')"` failing from `apps/web` before the fix.
- **Fix:** Added `"next-themes": "^0.4.6"` and `"lucide-react": "^0.575.0"` to `apps/web/package.json`'s `dependencies` (matching the exact versions already pinned in `packages/ui/package.json` and `pnpm-lock.yaml`), then ran `pnpm install --filter web...`. No new registry fetch occurred — `pnpm-lock.yaml` already resolved both packages at these versions.
- **Files modified:** `apps/web/package.json`, `pnpm-lock.yaml`
- **Verification:** `node -e "require.resolve('next-themes')"`/`require.resolve('lucide-react')` succeed from `apps/web` after the fix; this exclusion is explicitly carved out of Rule 3's package-manager-install ban since no new/unvetted package was introduced (both were already legitimate, already-locked transitive dependencies).
- **Committed in:** `69c3fe7` (Task 1 commit)

**2. [Rule 3 - Blocking] Explicit `React.JSX.Element` return-type annotations on Footer/Logo/NotFound/Home**
- **Found during:** Task 3 (wiring `layout.tsx`, which pulls every component into one type-check graph)
- **Issue:** The plan's own `<known_preexisting_issue>` note anticipated this exact `tsc` error ("inferred type ... cannot be named without a reference to ... @types+react ...", a duplicate `@types/react` version in the pnpm tree) for `layout.tsx`. Applying the prescribed fix there revealed the same error cascading to `footer.tsx`, `logo.tsx`, `not-found.tsx`, and the pre-existing (untouched-this-plan) `page.tsx`, once each was reachable from `layout.tsx`'s type-check graph.
- **Fix:** Added the same one-line `React.JSX.Element` return-type annotation to each function's signature, exactly as the known-issue note prescribed for `layout.tsx`.
- **Files modified:** `apps/web/app/_components/footer.tsx`, `apps/web/app/_components/logo.tsx`, `apps/web/app/not-found.tsx`, `apps/web/app/page.tsx`, `apps/web/app/layout.tsx`
- **Verification:** `pnpm --filter web build`'s TypeScript step advanced past all five files without re-raising this error class.
- **Committed in:** `33a9e41` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking issues, both explicitly anticipated or carved out by the plan/prompt itself)
**Impact on plan:** No scope creep — both fixes were narrowly scoped, one-line-per-file mitigations required to make this plan's own new/wired files buildable. No behavior changes, no new dependencies beyond what was already vetted and locked.

## Issues Encountered

- **`pnpm --filter web build`'s `tsc` step still fails** — after fixing the anticipated `layout.tsx`-class "portable type" error (deviation #2 above), the build now stops on a *different*, pre-existing error: `../../packages/ui/src/components/shadcn-ui/button-group.tsx:50` fails with the same root-cause `csstype@3.1.3` vs `csstype@3.2.3` duplicate-resolution conflict already logged in `deferred-items.md` items #1 (`calendar.tsx`/`sonner.tsx`/`spinner.tsx`, found via `pnpm --filter ui check-types`) and #3 (`apps/admin-panel`'s turbo build). Confirmed pre-existing and unrelated to this plan: `git log -- packages/ui/src/components/shadcn-ui/button-group.tsx` and `git log -- packages/ui/index.tsx` both show only the original `91f9732 Initial commit` — neither file has ever been touched by any Phase 1 plan. Root cause: `apps/web/app/page.tsx` already imported `Button` from `@repo/ui` (a source-only package, `main`/`exports` point at raw `.tsx`, not a built `.d.ts`) before this plan started, so TypeScript must fully type-check every file in `packages/ui/index.tsx`'s barrel `export *` — including `button-group.tsx` — whenever any single `@repo/ui` symbol is imported. This failure mode was already latent in the pristine pre-Phase-1 starter, not introduced by Task 3's `ThemeProvider`/`Header`/`Footer`/`Toaster` wiring. Per the plan's own `<known_preexisting_issue>` guidance ("If a different build error appears unrelated to this fix, follow the normal Scope Boundary rule"), this was logged to `deferred-items.md` (items #5/#6) rather than fixed — a real fix requires a `pnpm.overrides`/lockfile-level `csstype` version pin, a monorepo-wide dependency-resolution change affecting every `@repo/ui` consumer (`apps/web`, `apps/docs`, `apps/admin-panel`), consistent with the already-established out-of-scope disposition for a theme/shell phase.
- **Verification performed instead of a fully-passing `pnpm --filter web build`:** Turbopack's own bundling/compile step reports `✓ Compiled successfully` for every file this plan touched — confirming the `ThemeProvider`/`Header`/`main`/`Footer`/`Toaster` RSC wiring itself has no client-boundary errors (the specific correctness the acceptance criterion cared about). `pnpm --filter web exec eslint` passed with 0 warnings on every new/modified file. A live `pnpm dev:web` smoke test confirmed `GET /` → 200 (branded shell renders) and `GET /does-not-exist` → 404 (branded 404 renders inside the same shell, "DentaBot" and "Сторінку не знайдено" both present in the response body).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Every `apps/web` route now renders inside the branded, theme-toggleable Header/Footer shell, with a proper 404 for unmatched URLs — Phase 2/3 page-content plans can build directly inside `<main>{children}</main>` without touching the shell again. `next-themes`/`lucide-react` are now correctly declared as direct `apps/web` dependencies, so any future `apps/web`-local component can import them without re-discovering this pnpm-isolation issue.

**Carried-forward blocker (not introduced by this plan, not fixed by this plan):** `pnpm --filter web build`'s `tsc` type-check step fails on the pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict inside `packages/ui/src/components/shadcn-ui/button-group.tsx` (deferred-items.md #5/#6). This will continue to block a clean `pnpm --filter web build` for any future phase until a monorepo-wide `pnpm.overrides` fix is applied — recommend a dedicated maintenance task before or during Phase 2, since Phase 2's Contacts/Demo forms will add more `@repo/ui` primitive usage on top of an already-blocked type-check.
The `<human-check>` items in this plan's `<verification>` block (theme toggle persistence across navigation, mobile hamburger open/close, full visual pass) are deferred to `workflow.human_verify_mode=end-of-phase` per project config — not performed in this execution pass.

---
*Phase: 01-theme-site-shell*
*Completed: 2026-08-08*

## Self-Check: PASSED

- FOUND: apps/web/app/_components/logo.tsx
- FOUND: apps/web/app/_components/theme-toggle.tsx
- FOUND: apps/web/app/_components/header.tsx
- FOUND: apps/web/app/_components/footer.tsx
- FOUND: apps/web/app/not-found.tsx
- FOUND: apps/web/app/layout.tsx
- FOUND: 69c3fe7 (git log)
- FOUND: 04bb42a (git log)
- FOUND: 33a9e41 (git log)
