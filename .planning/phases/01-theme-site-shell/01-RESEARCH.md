# Phase 1: Theme & Site Shell - Research

**Researched:** 2026-08-08
**Domain:** Next.js 16 App Router theming (`next-themes` + Tailwind v4 tokens), shared header/footer shell, monorepo shadcn component workflow
**Confidence:** HIGH

## Summary

This phase has almost no genuinely open technical questions — `01-CONTEXT.md` already locks the token values, the ported component source, and the Client/Server discretion boundary. The real risk in this phase is **plumbing correctness**, not design fidelity: (1) which of two divergent CSS files in `packages/ui/styles/` actually reaches `apps/web` (only `theme.css` is exported — `index.css` is a second, currently-inconsistent token source that is easy to edit by mistake), (2) Next.js's root `app/not-found.tsx` has handled all unmatched URLs app-wide since v13.3.0 (no need for the newer, heavier `global-not-found.js` convention — and using the simple form is what makes the Header/Footer wrap the 404 page, matching the design's nested-route intent), and (3) `@repo/ui`'s existing `sonner.tsx` (`Toaster`) calls `useTheme()` without a `'use client'` directive, which will break the moment it's rendered from a Server Component root layout — a latent bug that surfaces exactly when this phase wires `next-themes` in.

The Standard Stack is entirely already-installed: `next-themes` 0.4.6, `lucide-react`, `radix-ui`-based shadcn primitives are already `@repo/ui` dependencies (confirmed in `packages/ui/package.json`). No new npm packages need to be installed for this phase's success criteria.

**Primary recommendation:** Wire `next-themes`' `ThemeProvider` into `apps/web/app/layout.tsx` with `attribute="class" defaultTheme="light" enableSystem` and `suppressHydrationWarning` on `<html>`; re-theme only `packages/ui/styles/theme.css` (never `styles/index.css`, which is not part of the package's public exports); use the plain `app/not-found.tsx` convention (not `global-not-found.js`) so the 404 page renders inside the shared Header/Footer shell; and add a `'use client'` directive to `packages/ui/src/components/shadcn-ui/sonner.tsx` before wiring `<Toaster />` into the root layout, since it currently lacks one despite calling `useTheme()`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Theme tokens (light/dark CSS vars) | Frontend Server (SSR) — `packages/ui/styles/theme.css`, imported at build time | — | Tailwind v4 `@theme inline` resolves tokens at build/compile time into utility classes shipped to the browser; the source of truth is a static CSS file, not runtime JS |
| Theme toggle + persistence | Browser / Client | Frontend Server (SSR, initial script injection) | `next-themes` renders a client-only toggle (`useState`/`useEffect`), but its anti-flash mechanism injects a blocking inline `<script>` from the server-rendered `<html>` to set the class before first paint |
| Header (nav, scroll state, mobile menu) | Browser / Client | Frontend Server (SSR shell/markup) | Interactive state (`scrollY` listener, mobile menu open/close, active-link highlight via `usePathname()`) requires Client Component; the static markup (links list, logo) can still be server-rendered and passed as children where possible |
| Footer | Frontend Server (SSR) | — | Fully static content, no client state — pure Server Component |
| Not Found page routing | Frontend Server (SSR, Next.js routing layer) | — | Handled by Next.js's file-system router (`app/not-found.tsx`) at the framework level, not custom app logic |
| shadcn primitive additions | API/Backend n/a — this is a **build tooling** concern | — | `shadcn` CLI (devDependency in `packages/ui`) — a build-time code generator, not a runtime tier |

## User Constraints

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Re-theme `packages/ui/styles/theme.css` globally using the design archive's `src/styles/theme.css` tokens (light `oklch`/hex values + `.dark` overrides), preserving the existing `@theme inline` / `:root` / `.dark` Tailwind v4 structure already in `packages/ui/styles/theme.css`. This re-themes every `@repo/ui` consumer (web, docs, admin-panel), not just `apps/web` — confirmed as intentional in PROJECT.md.
- **D-02 (Brand blue token):** The design's bright accent blue (`#1d6be4`) is used for the logo badge, active nav-link state, link/icon hover states, and the 404 page's "404" heading — but it does **not** come from the design's own `theme.css` tokens (its `--primary` is `#030213`, a dark navy, which drives the default `Button` variant instead and is visually unrelated). Add `#1d6be4` as a **new** theme token (e.g. `--brand`) in `theme.css`, rather than scattering raw `bg-[#1d6be4]` / `text-[#1d6be4]` utility classes. Use the same value in both light and dark mode.
- **D-03 (Semantic tokens over literal grays):** The design's header/footer/404 source mixes literal Tailwind palette classes (`dark:bg-gray-900`, `text-gray-600`, `bg-white`, etc.) instead of theme tokens. Normalize these to the theme's semantic tokens when porting: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, etc. This rule applies generally to header/footer/404 now, and to future page phases as they land.
- **D-04:** `next-themes` handles toggle/persistence (already a `@repo/ui` dependency) — replaces the design archive's standalone `theme-provider.tsx` wrapper conceptually (same library, ported into the Next.js layout instead of a separate provider file/React Router root). Design's root `App.tsx` configures `<ThemeProvider attribute="class" defaultTheme="light" enableSystem>` — carry this default forward unless research surfaces a Next.js-specific reason to change it. *(Research found no reason to change it — see Code Examples below.)*
- **D-05 (Footer links to out-of-scope routes):** The footer links to `/about` and `/privacy` — neither exists in this milestone's 6-route scope. Port the footer exactly as designed, including these two links. They resolve to the Phase 1 Not Found page until those routes ship later. Do not remove or redirect them.
- Header is fixed/sticky with a scroll-triggered style change (background blur + shadow after `scrollY > 20`) and a collapsible inline mobile menu (not a Sheet/Drawer) — port this interactive behavior; requires a Client Component for the scroll listener and `usePathname()` (Next.js) in place of `useLocation()` (react-router) for active-link highlighting.
- Nav links (5 items: Home/Prices/Demo/Blog/Contacts), header CTAs, and footer's 4-column layout all port using existing `@repo/ui` `Button` — no missing primitive identified for header/footer/404 specifically.
- All routes map 1:1 from the design's `react-router` tree to Next.js App Router segments: `/`, `/prices`, `/demo`, `/blog`, `/blog/[slug]`, `/contacts`, plus a catch-all Not Found.
- **D-06 (Logo — build local, don't touch shared package):** `packages/ui/src/components/logo/Logo.tsx` is an unrelated "Garage Hub" placeholder shared by all three frontends — do not modify it. Build a DentaBot-specific logo component **local to `apps/web`** (used in header and footer), leaving `@repo/ui`'s `Logo` untouched.
- **D-07 (Keep emoji icon):** Keep the design's literal 🦷 emoji inside the blue badge exactly as designed — do not swap it for an SVG icon. Exact visual fidelity prioritized over cross-platform rendering consistency.

### Claude's Discretion

- Exact CSS custom property name for the new brand token (e.g. `--brand` vs `--accent-blue`) — pick what fits naturally alongside existing token naming in `theme.css`.
- How the sticky/scroll header behavior and mobile menu are structured as Client vs Server Components (Next.js App Router conventions apply — minimize `'use client'` boundary to what actually needs it).
- Where the local `apps/web` logo component lives structurally (e.g. `apps/web/app/_components/logo.tsx`) — no established `app`-local component convention exists yet in this codebase.
- Shadcn-primitive audit scope: THEME-02 requires auditing what primitives *later* pages will need and adding missing ones to `@repo/ui` via its shadcn-CLI pattern. Header/footer/404 alone don't surface any new primitive needs — the broader audit across all six pages' content is Claude's call on how deep to go in Phase 1 vs. deferring to Phase 2/3.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. No scope-creep suggestions came up.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THEME-01 | Site renders using `@repo/ui` components re-themed with the design archive's light/dark color tokens (`packages/ui/styles/theme.css` updated) | Confirmed `theme.css` (not `styles/index.css`) is the only styles file in `packages/ui/package.json`'s `exports` map and the only one imported by `apps/web/app/globals.css` and `apps/admin-panel/src/index.css` — this is the single correct edit target. See Common Pitfalls #1. |
| THEME-02 | Any shadcn primitive pages require that's missing from `@repo/ui` is added via the existing shadcn-CLI pattern, not duplicated locally | Confirmed `packages/ui/components.json` is a valid shadcn config (`shadcn` CLI 3.8.5 devDependency); documented exact CLI invocation and the manual re-export step it does NOT automate. Confirmed 38 primitives currently exist; `form` (react-hook-form wrapper) is the one confirmed gap relevant to this milestone, needed by Phase 2's CONT-01, not Phase 1. |
| THEME-03 | User can toggle light/dark theme from the header, persists across navigation via `next-themes` | Verified `next-themes` 0.4.6 already a `@repo/ui` dependency; documented App Router wiring pattern (root layout, `suppressHydrationWarning`, anti-flash inline script) from official `next-themes`/shadcn docs. |
| LAYOUT-01 | Consistent header with nav to Home/Prices/Demo/Blog/Contacts on every page | Header source fully transcribed in CONTEXT.md; only open question (Client/Server boundary) resolved below in Architecture Patterns. |
| LAYOUT-02 | Consistent footer on every page | Footer source fully transcribed in CONTEXT.md; fully static, Server Component, no research gap. |
| LAYOUT-03 | Not Found page for unmatched URLs | Verified via official Next.js docs: root `app/not-found.tsx` has handled all unmatched URLs app-wide since Next.js v13.3.0 — confirmed as the correct (and simpler) choice over the newer `global-not-found.js` (experimental, v15.4+, bypasses the root layout entirely, which would drop Header/Footer from the 404 page — the design shows 404 content nested inside the shared Layout, not standalone). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next-themes` | 0.4.6 (already installed, `@repo/ui` dependency) [VERIFIED: npm registry] | Theme toggle + persistence, class-based dark mode | De facto standard for Next.js dark mode; handles SSR/hydration flash correctly out of the box; already the design's chosen approach (D-04) |
| `next` | 16.2.0 (project pin), 16.3.0 latest on npm [VERIFIED: npm registry] | App Router, file-based routing incl. `not-found.tsx` | Framework already in use; no upgrade needed for this phase's features (root `not-found.tsx` behavior has existed since 13.3.0) |
| `lucide-react` | ^0.575.0 (already installed, `@repo/ui` dependency) [VERIFIED: npm registry — note: latest on npm is 1.30.0, but this project intentionally pins an older major; do not upgrade as part of this phase] | Icons: `Menu`, `X`, `Sun`, `Moon`, `Home` | Already used throughout `@repo/ui`; all icons needed by header/theme-toggle/not-found are standard, long-stable icons in this set |
| `tailwindcss` | ^4.3.3 (`apps/web`) / ^4.2.0 (`packages/ui`) [VERIFIED: codebase] | Token-driven utility CSS, `@theme inline` token mapping | Already the project's styling engine; Tailwind v4's `@theme inline` mechanism is exactly what `theme.css` already uses |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `shadcn` CLI | 3.8.5 (pinned devDependency in `packages/ui`, latest on npm is 4.16.2) [VERIFIED: npm registry] | Scaffolds new shadcn primitives into `packages/ui/src/components/shadcn-ui/` | Only if THEME-02's audit finds a genuinely missing primitive; run from within `packages/ui` so `components.json` aliases resolve correctly |
| `radix-ui` | ^1.4.3 (already installed) [VERIFIED: codebase] | Underlying primitive behavior for any new shadcn component | Transitive — comes bundled whenever a new shadcn primitive is added via the CLI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next-themes` | Hand-rolled `localStorage` + `data-theme` attribute + inline script | `next-themes` already solves the anti-flash problem and is already a dependency — hand-rolling would violate "Don't Hand-Roll" for zero benefit; not considered further |
| Root `app/not-found.tsx` | `global-not-found.js` (experimental, Next.js 15.4+) | `global-not-found.js` bypasses the root layout entirely (must re-import fonts/globals.css and re-declare `<html>`/`<body>` itself) — wrong fit here since the design nests the 404 page inside Header/Footer. Only relevant if the app later grows multiple root layouts or a `[country]`-style dynamic root segment, which is out of scope for this 6-route site. |

**Installation:**
No new packages required — `next-themes`, `lucide-react`, and the shadcn CLI tooling are already present in `packages/ui/package.json`. If THEME-02's audit determines a new primitive (e.g. `form`) is needed even for header/footer/404 scope (it is not, per this research), the standard invocation is:
```bash
cd packages/ui && npx shadcn@3.8.5 add <component>
```
Pin the CLI version to match the installed devDependency (`3.8.5`) rather than `@latest` (`4.16.2`), to avoid the CLI's own breaking changes silently altering `components.json` conventions or output structure mid-project.

**Version verification:** Confirmed via `npm view next-themes version` → `0.4.6` (matches installed), `npm view next version` → `16.3.0` (project pinned to `16.2.0`, no action needed), `npm view lucide-react version` → `1.30.0` (project pinned to `^0.575.0` — a deliberate major-version-behind pin already in place; this phase should not touch it), `npm view shadcn version` → `4.16.2` (project devDependency pinned to `3.8.5`).

## Package Legitimacy Audit

No new external packages are introduced by this phase. All libraries referenced above (`next-themes`, `lucide-react`, `radix-ui`, `shadcn` CLI, `tailwindcss`) are pre-existing dependencies already present in `packages/ui/package.json` and `apps/web/package.json`, installed via the existing lockfile. No `npm install` / `pnpm add` commands are required for THEME-01/02/03 or LAYOUT-01/02/03 as scoped.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

If THEME-02's audit (Claude's discretion) determines a *new* primitive must be added this phase, it is added via the shadcn CLI, which pulls files from the shadcn registry (not arbitrary npm packages) — file provenance is the shadcn/ui public registry, not third-party npm. Any *new npm dependency* that a newly-added shadcn component pulls in transitively (e.g. `embla-carousel-react` for a `carousel` component, `cmdk` for `command`) should be run through `gsd-tools query package-legitimacy check` before being added to `packages/ui/package.json`, per standard protocol — this did not come up in this phase's actual scope (Button-only for header/footer/404).

## Architecture Patterns

### System Architecture Diagram

```
Browser request (any URL)
        │
        ▼
Next.js App Router (apps/web/app/)
        │
        ├─ matches a defined route segment ─────────────► app/layout.tsx (Server Component)
        │                                                        │
        │                                                        ├─ <html suppressHydrationWarning>
        │                                                        │     └─ next-themes ThemeProvider
        │                                                        │          (Client Component, injects
        │                                                        │           blocking anti-flash script)
        │                                                        │
        │                                                        ├─ <Header /> (Client Component:
        │                                                        │     scroll listener, mobile menu state,
        │                                                        │     usePathname() active-link highlight)
        │                                                        │
        │                                                        ├─ <main>{children}</main>
        │                                                        │     └─ route's page.tsx renders here
        │                                                        │        (Phase 2/3 content — out of
        │                                                        │        scope this phase, shows
        │                                                        │        placeholder/default content)
        │                                                        │
        │                                                        └─ <Footer /> (Server Component,
        │                                                              fully static)
        │
        └─ no route matches ─────────────────────────────► app/not-found.tsx
                                                                    (renders INSIDE app/layout.tsx —
                                                                     same Header/Footer wrap, per
                                                                     Next.js's routing-level fallback
                                                                     since v13.3.0 — no separate
                                                                     html/body needed)

Theme toggle click (Browser)
        │
        ▼
ThemeToggle (Client Component) → next-themes setTheme() → writes localStorage
        │                                                  → toggles .dark class on <html>
        ▼
Tailwind v4 `dark:` variant + @theme inline tokens re-resolve → visual re-paint
(persists across client-side navigation because <html> class + localStorage
 survive App Router route transitions — no full page reload)
```

### Recommended Project Structure
```
apps/web/
├── app/
│   ├── layout.tsx              # ThemeProvider + Header + <main> + Footer + Toaster (optional this phase)
│   ├── not-found.tsx            # catch-all 404 — Server Component, renders inside layout.tsx
│   ├── globals.css              # unchanged: @import 'tailwindcss'; @import '@repo/ui/styles/theme.css';
│   ├── page.tsx                  # Home route (Phase 2 content; untouched structurally this phase)
│   ├── prices/page.tsx           # stub or Phase 3 scope
│   ├── demo/page.tsx             # stub or Phase 2 scope
│   ├── blog/page.tsx             # stub or Phase 3 scope
│   ├── blog/[slug]/page.tsx      # stub or Phase 3 scope
│   ├── contacts/page.tsx         # stub or Phase 2 scope
│   └── _components/              # app-local, non-@repo/ui components (Claude's discretion on exact path)
│       ├── header.tsx            # 'use client' — scroll state, mobile menu, usePathname()
│       ├── footer.tsx            # Server Component, static
│       ├── theme-toggle.tsx      # 'use client' — useTheme() + mounted-guard
│       └── logo.tsx              # local DentaBot logo (D-06) — Server Component (no state needed)
packages/ui/
├── styles/
│   ├── theme.css                 # ← EDIT THIS (exported, consumed by web/admin-panel)
│   └── index.css                 # ← DO NOT EDIT for this phase (not exported; diverges already, see Pitfall #1)
└── src/components/shadcn-ui/
    └── sonner.tsx                 # needs 'use client' added if Toaster is wired into root layout this phase
```

### Pattern 1: `next-themes` root wiring in App Router
**What:** Wrap the root layout's body content in `ThemeProvider`, with `suppressHydrationWarning` on `<html>` to prevent React from warning about the class next-themes injects before hydration.
**When to use:** Always, for any Next.js App Router app using `next-themes` — this is the only supported integration pattern.
**Example:**
```tsx
// Source: https://ui.shadcn.com/docs/dark-mode/next + https://github.com/pacocoursey/next-themes
// apps/web/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```
Note: `next-themes`' `ThemeProvider` ships its own `'use client'` directive internally, so it can be imported directly into a Server Component (`layout.tsx`) without `apps/web` needing its own client wrapper file — confirmed against the package's published entry point.

### Pattern 2: Root `not-found.tsx` (not `global-not-found.js`)
**What:** A plain `app/not-found.tsx` Server Component, exported default, no special config needed.
**When to use:** Any app with a single root layout (this project's case — one `apps/web/app/layout.tsx`, no route groups with competing root layouts).
**Example:**
```tsx
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
// apps/web/app/not-found.tsx
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@repo/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="text-8xl font-bold text-brand">404</div>
        <h1 className="text-3xl font-bold">Сторінку не знайдено</h1>
        <p className="text-muted-foreground">
          Вибачте, сторінка яку ви шукаєте не існує або була переміщена.
        </p>
        <Button size="lg" asChild>
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            На головну
          </Link>
        </Button>
      </div>
    </div>
  );
}
```
No `next.config.js` changes, no `experimental.globalNotFound` flag needed. Automatically renders wrapped by `app/layout.tsx` (Header/Footer included) for BOTH thrown `notFound()` calls and any URL that doesn't match a route — this has been true since Next.js 13.3.0 and remains true in 16.2.0/16.3.0.

### Pattern 3: Header Client/Server boundary (resolves CONTEXT.md's "Claude's Discretion" item)
**What:** Push the `'use client'` boundary down to only the interactive parts.
**When to use:** The header's scroll-triggered style, mobile menu toggle state, and `usePathname()`-based active-link highlighting are all genuinely client-only concerns — there is no way to server-render them, so the entire `Header` component must be a Client Component (a partial split, e.g. a Server Component wrapper around a client "HeaderInteractive" island, is possible but adds complexity without benefit here since nearly every visual element — nav links' active state, CTA buttons inside the sticky bar — depends on client state or `next/link`, which is fine in Client Components anyway).
**Recommendation:** One `'use client'` directive at the top of `apps/web/app/_components/header.tsx`, matching the design's original single-file header structure. `Footer` and the local `Logo` component have no interactivity and should remain plain Server Components (no directive).
```tsx
// apps/web/app/_components/header.tsx
'use client';

import { usePathname } from 'next/navigation'; // Next.js equivalent of react-router's useLocation()
import Link from 'next/link';
// ...rest of D-04/D-05-informed port from CONTEXT.md's transcribed header.tsx
```

### Pattern 4: Tailwind v4 token addition (`--brand`)
**What:** Add a new custom property in `:root`/`.dark`, then map it into the `@theme inline` block so Tailwind generates `bg-brand`, `text-brand`, `border-brand`, `hover:bg-brand`, etc. utility classes.
**When to use:** Whenever a color exists in the design that isn't already a semantic token (this phase's D-02 case).
**Example:**
```css
/* packages/ui/styles/theme.css */
@theme inline {
  /* ...existing --color-* mappings... */
  --color-brand: var(--brand); /* NEW — makes bg-brand/text-brand/etc. utilities available */
}

:root {
  /* ...existing tokens... */
  --brand: #1d6be4; /* NEW */
}

.dark {
  /* ...existing tokens... */
  /* no --brand override — same value in both modes per D-02 */
}
```
Tailwind v4's `@theme inline` directive does not require a value literal in the `@theme` block itself when it's just remapping an existing custom property (`var(--brand)`) — this is the same pattern already used for every other token in this file (`--color-background: var(--background)`, etc.), so no new mechanic is introduced, just one more line following the established pattern.

### Anti-Patterns to Avoid
- **Editing `packages/ui/styles/index.css` instead of (or in addition to) `theme.css`:** `index.css` is not part of `packages/ui`'s public `exports` map and is not imported by `apps/web`, `apps/docs`, or `apps/admin-panel`. It currently has divergent sidebar tokens vs. `theme.css` (different color families entirely) — editing it will have zero visible effect on the marketing site and will deepen the existing inconsistency. See Common Pitfalls #1.
- **Using `global-not-found.js` for this phase:** would drop the shared Header/Footer from the 404 page (it bypasses the root layout by design) and require duplicating `<html>`/`<body>`/font/global-CSS imports — solves a problem (multiple root layouts) this app doesn't have.
- **Wrapping the entire `<body>` in `'use client'` to work around hook usage:** unnecessary — `next-themes`' `ThemeProvider` already ships its own client boundary; only `Header` and `ThemeToggle` need their own `'use client'` directives.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence + no-flash dark mode | Custom `localStorage` read/write + manual inline `<script>` in `<head>` | `next-themes`' `ThemeProvider` (`attribute="class"`) | Already solved, already installed, already the design's own choice (D-04); a hand-rolled version would need to solve the exact same SSR/hydration race that `next-themes` already handles via its blocking inline script |
| Catch-all 404 routing | A `[...catchAll]` dynamic segment page that manually calls `notFound()` | Root `app/not-found.tsx` | Next.js has handled this natively since v13.3.0; a manual catch-all route adds an unnecessary extra route segment and duplicate logic |
| Brand-color utility classes | Repeated `bg-[#1d6be4]` / `text-[#1d6be4]` arbitrary-value classes scattered across header/footer/404/logo | The `--brand` token + `@theme inline` mapping (D-02) | One source of truth; arbitrary-value classes can't be themed centrally and don't show up in `dark:` variant tooling the same way tokens do |

**Key insight:** Every "hard part" of this phase (dark mode flash prevention, catch-all routing, brand token propagation) already has a first-party, already-installed answer. The actual engineering risk in this phase is *plumbing* — making sure edits land in the file that's actually consumed downstream (`theme.css`, not `index.css`) and that client-only hooks get their `'use client'` directive before they're wired into a Server Component root layout.

## Common Pitfalls

### Pitfall 1: Editing the wrong theme CSS file
**What goes wrong:** `packages/ui/styles/` contains two CSS files — `theme.css` and `index.css`. `index.css` `@import`s `theme.css` and then re-declares its OWN `:root`/`.dark` sidebar tokens with *different* values (`hsl(...)` blue-tinted sidebar colors vs. `theme.css`'s grayscale `oklch(...)` sidebar colors) — these two files are already inconsistent in the current codebase.
**Why it happens:** `components.json`'s `tailwind.css` field points to `"styles/index.css"` — this is the file the `shadcn` CLI would target if asked to scaffold Tailwind config, which makes it *look* like the canonical file. It is not: `packages/ui/package.json`'s `exports` map only exposes `"./styles/theme.css"`, and `apps/web/app/globals.css` / `apps/admin-panel/src/index.css` both `@import '@repo/ui/styles/theme.css'` directly — never `index.css`.
**How to avoid:** Make all THEME-01/D-01/D-02/D-03 token edits exclusively in `packages/ui/styles/theme.css`. Treat `index.css` as out of scope for this phase (it appears to be an unused artifact from an earlier `shadcn init` run, not currently wired into any consuming app's build).
**Warning signs:** If a token change doesn't show up when running `apps/web`'s dev server, check whether it was made in `index.css` instead of `theme.css`.

### Pitfall 2: `Toaster` (`sonner.tsx`) missing `'use client'`
**What goes wrong:** `packages/ui/src/components/shadcn-ui/sonner.tsx` calls `useTheme()` from `next-themes` directly in its component body but has no `'use client'` directive at the top of the file (verified by direct inspection — confirmed as one of only two files in `packages/ui/src/components/shadcn-ui/` using a stateful hook without the directive). If `<Toaster />` is rendered from `apps/web/app/layout.tsx` (a Server Component) as CONTEXT.md's discretion note suggests might happen this phase ("site-wide chrome... reasonable structural choice"), Next.js's RSC compiler will fail to build (or throw a runtime error) because a hook is being called from a module that isn't marked as a client boundary.
**Why it happens:** `packages/ui`'s `components.json` has `"rsc": false` (it's built/previewed via Vite, which has no Server/Client Component distinction) — so the package was never validated against Next.js's stricter module-boundary rules until a Next.js app actually imports and renders this specific component.
**How to avoid:** If this phase wires `<Toaster />` into the root layout (optional per CONTEXT.md — Toaster's actual usage is Phase 2's form feedback), add `'use client';` as the first line of `packages/ui/src/components/shadcn-ui/sonner.tsx` before rendering it anywhere in `apps/web`. This is a correctness fix to a pre-existing `@repo/ui` bug, not a design decision — it does not conflict with D-06 (which only protects `Logo.tsx` from being modified for branding reasons).
**Warning signs:** Build-time error resembling "You're importing a component that needs `useState`. This React hook only works in a Client Component" pointing at `sonner.tsx`, or the toaster silently failing to theme itself correctly at runtime.

### Pitfall 3: `usePathname()` returns the path without trailing route groups — active-link matching for `/` vs. nested routes
**What goes wrong:** The design's header used `location.pathname === link.href` for exact-match active-link highlighting (works fine for a flat 5-link nav with no nested active states). In Next.js, `usePathname()` from `next/navigation` returns the same kind of plain string (e.g. `/prices`), so a direct port of the same equality check works as-is — but it's worth being explicit that `/blog` will NOT be highlighted as active when the user is on `/blog/[slug]`, since the nav only has a `/blog` link and the design's own logic never accounted for prefix-matching either.
**Why it happens:** Direct port assumption — easy to silently "fix" this during the port (e.g. switching to `startsWith`) and unintentionally diverge from the design's actual (simpler) behavior.
**How to avoid:** Keep the exact-match (`pathname === link.href`) comparison as ported from the design; do not upgrade to prefix-matching unless a future phase's CONTEXT.md explicitly asks for it.
**Warning signs:** None functionally — this is a fidelity note, not a bug, flagged so the planner doesn't "improve" it away from the locked design behavior.

## Code Examples

### `next-themes` ThemeProvider — package-level entry confirms client boundary
```
// Verified: next-themes ships its own 'use client' directive in its published
// dist/index.mjs entry point (checked via local node_modules resolution),
// so importing { ThemeProvider } from 'next-themes' directly into a Server
// Component file (apps/web/app/layout.tsx) is safe and is the documented
// pattern — no local wrapper file is required.
```

### shadcn CLI invocation for a future missing primitive (not needed this phase, documented for THEME-02 discretion)
```bash
# Source: packages/ui/components.json aliases + shadcn CLI conventions
# Run from inside packages/ui so components.json resolves relative aliases correctly:
cd packages/ui
npx shadcn@3.8.5 add form   # example: the one confirmed-missing primitive, needed by Phase 2's CONT-01

# Manual step the CLI does NOT do for this monorepo:
# add `export * from './src/components/shadcn-ui/form';` to packages/ui/index.tsx
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Manual `*` catch-all route (react-router, or Next.js `pages/404.js` in the old Pages Router) | `app/not-found.tsx` handles both thrown `notFound()` AND all unmatched URLs automatically | Since Next.js 13.3.0 (App Router) | No manual catch-all route needed; this project's design source (react-router `*` route) maps directly and simply to one file |
| Single 404 convention | `global-not-found.js` (experimental) added as a second convention for apps with multiple root layouts | Next.js 15.4.0 | Not applicable to this project (single root layout) — noted only to explicitly rule it out as the wrong choice here |

**Deprecated/outdated:** None relevant — `next-themes` 0.4.6 and the `attribute="class"` pattern remain the current, unchanged recommended approach per the library's own docs and shadcn's official Next.js dark-mode guide.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `next-themes`' published entry ships its own `'use client'` directive (verified by resolving a local `node_modules/next-themes/dist/index.mjs` path on this machine, not from this project's own `node_modules`) | Pattern 1 / Code Examples | If the project's actually-installed copy somehow differs, `ThemeProvider` might need a local `'use client'` wrapper file in `apps/web`; low risk since this is standard, long-stable `next-themes` behavior documented across multiple official/community sources |
| A2 | The `Home` icon exists in the installed `lucide-react` ^0.575.0 version (not independently version-checked against that exact pinned version's export list) | Standard Stack | Extremely low risk — `Home` is one of the most stable, long-standing icons in `lucide-react`; if missing, any similar house-glyph icon in the same package works as a substitute |

**If this table is empty:** N/A — two low-risk assumptions logged above; both are standard, well-established library behaviors, not compliance/security-sensitive claims.

## Open Questions

None blocking. The questions raised in this phase's research brief (App Router + `next-themes` integration specifics, Client/Server boundary conventions, the shadcn-CLI monorepo pattern, Tailwind v4 token-merging mechanics, and `not-found.tsx` vs. `global-not-found.js`) are all resolved above with codebase-verified or official-docs-cited answers.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js dev/build | ✓ | v22.20.0 (project requires >=18) | — |
| pnpm | Workspace install/scripts | ✓ | 9.0.0 (matches `packageManager` pin) | — |
| `next-themes` | THEME-03 | ✓ (already in `packages/ui/package.json`) | 0.4.6 | — |
| `lucide-react` | Header/theme-toggle/404 icons | ✓ (already in `packages/ui/package.json`) | ^0.575.0 | — |
| `shadcn` CLI | THEME-02 audit (only if a gap is found) | ✓ (devDependency in `packages/ui/package.json`) | 3.8.5 | — |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** none — everything this phase needs is already installed

## Security Domain

`security_enforcement` is enabled (`security_asvs_level: 1`, `security_block_on: high`) per `.planning/config.json`. This phase is a static theming/shell phase with no user input processing, authentication, or data persistence — most ASVS categories are not applicable yet (they become relevant starting Phase 2's Contacts form).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth surface in this phase |
| V3 Session Management | No | No sessions; theme preference is a non-sensitive client-side `localStorage` value managed entirely by `next-themes` |
| V4 Access Control | No | All routes are public marketing pages |
| V5 Input Validation | No | No user-submitted input in this phase (forms land in Phase 2 with `react-hook-form` + `zod`, per PROJECT.md constraints) |
| V6 Cryptography | No | No secrets/crypto surface |
| V14 Configuration | Marginally | External footer links (`t.me/dentabot`, `instagram.com/dentabot`) already use `target="_blank" rel="noopener noreferrer"` in the design source (per CONTEXT.md's transcribed footer.tsx) — preserve this attribute pair exactly when porting, since it prevents reverse-tabnabbing (the target page gaining `window.opener` access to this site) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Reverse tabnabbing via external `target="_blank"` links (footer social/Telegram links) | Tampering / Spoofing | `rel="noopener noreferrer"` on every external anchor — already present in the design source; verify it survives the port |
| Theme value XSS via unsanitized `localStorage` read | Tampering | Not applicable — `next-themes` only ever writes/reads its own constrained enum (`"light"`/`"dark"`/`"system"`), never renders the stored value as HTML |

## Sources

### Primary (HIGH confidence)
- Next.js official docs — `not-found.js` file convention (fetched directly, version 16.3.0, last updated 2026-07-10) — `https://nextjs.org/docs/app/api-reference/file-conventions/not-found`
- npm registry (`npm view`) — `next-themes@0.4.6`, `next@16.3.0`, `lucide-react@1.30.0`, `shadcn@4.16.2` — direct registry queries run in this session
- Direct codebase inspection — `packages/ui/package.json` (`exports` map), `packages/ui/components.json`, `packages/ui/styles/theme.css` vs. `packages/ui/styles/index.css`, `packages/ui/src/components/shadcn-ui/sonner.tsx` (missing `'use client'`), `apps/web/app/globals.css`, `apps/admin-panel/src/index.css`, `apps/web/next.config.js` (`transpilePackages`)

### Secondary (MEDIUM confidence)
- WebSearch, cross-referenced with shadcn's official Next.js dark-mode guide (`ui.shadcn.com/docs/dark-mode/next`) and the `next-themes` GitHub README (`github.com/pacocoursey/next-themes`) — App Router `ThemeProvider` + `suppressHydrationWarning` wiring pattern

### Tertiary (LOW confidence)
- None — all findings in this research were either verified against the local codebase, the npm registry, or official Next.js/next-themes documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and version-verified against npm registry; no new packages introduced
- Architecture: HIGH — Client/Server boundary and not-found routing behavior confirmed against official Next.js docs (fetched this session, version 16.3.0) and direct codebase inspection
- Pitfalls: HIGH — all three pitfalls (index.css divergence, sonner.tsx missing `'use client'`, active-link exact-match) verified by direct file inspection, not inferred

**Research date:** 2026-08-08
**Valid until:** 2026-09-07 (30 days — stable Next.js/next-themes APIs, no fast-moving dependencies in scope)
</content>
