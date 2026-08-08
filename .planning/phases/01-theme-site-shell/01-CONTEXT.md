# Phase 1: Theme & Site Shell - Context

**Gathered:** 2026-08-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Every route in `apps/web` renders inside a consistently themed layout: `@repo/ui` components restyled with the design archive's light/dark tokens, a shared header (nav + theme toggle + mobile menu) and footer on every page, and a proper Not Found page for unmatched URLs. No page *content* (Home, Prices, Demo, Blog, Contacts) is built in this phase — that's Phase 2 and Phase 3. This phase is the shell everything else hangs off.

Requirements covered: THEME-01, THEME-02, THEME-03, LAYOUT-01, LAYOUT-02, LAYOUT-03 (see `.planning/REQUIREMENTS.md`).

</domain>

<decisions>
## Implementation Decisions

### Theming

- **D-01:** Re-theme `packages/ui/styles/theme.css` globally using the design archive's `src/styles/theme.css` tokens (light `oklch`/hex values + `.dark` overrides), preserving the existing `@theme inline` / `:root` / `.dark` Tailwind v4 structure already in `packages/ui/styles/theme.css`. This re-themes every `@repo/ui` consumer (web, docs, admin-panel), not just `apps/web` — confirmed as intentional in PROJECT.md.
- **D-02 (Brand blue token):** The design's bright accent blue (`#1d6be4`) is used for the logo badge, active nav-link state, link/icon hover states, and the 404 page's "404" heading — but it does **not** come from the design's own `theme.css` tokens (its `--primary` is `#030213`, a dark navy, which drives the default `Button` variant instead and is visually unrelated). Add `#1d6be4` as a **new** theme token (e.g. `--brand`) in `theme.css`, rather than scattering raw `bg-[#1d6be4]` / `text-[#1d6be4]` utility classes. Use the same value in both light and dark mode — the design source applies it identically in both themes, no separate dark-mode variant observed.
- **D-03 (Semantic tokens over literal grays):** The design's header/footer/404 source mixes literal Tailwind palette classes (`dark:bg-gray-900`, `dark:bg-gray-950`, `text-gray-600`, `text-gray-400`, `bg-white`, `border-gray-800`) instead of theme tokens. Normalize these to the theme's semantic tokens when porting: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, etc. This rule applies generally — to header/footer/404 now, and to future page phases as they land — not just to the three files inspected during this discussion.
- **D-04:** `next-themes` handles toggle/persistence (already a `@repo/ui` dependency) — replaces the design archive's standalone `theme-provider.tsx` wrapper conceptually (same library, ported into the Next.js layout instead of a separate provider file/React Router root).
- Design's root `App.tsx` configures `<ThemeProvider attribute="class" defaultTheme="light" enableSystem>` — carry this default forward (light default, respects system preference until the user toggles) unless research surfaces a Next.js-specific reason to change it.

### Layout / Shell

- **D-05 (Footer links to out-of-scope routes):** The footer links to `/about` ("Про нас") and `/privacy` ("Політика конфіденційності") — neither exists in this milestone's 6-route scope. **Port the footer exactly as designed**, including these two links. They will resolve to the Phase 1 Not Found page until those routes ship in a future milestone. Do not remove or redirect them.
- Header is fixed/sticky with a scroll-triggered style change (background blur + shadow after `scrollY > 20`) and a collapsible inline mobile menu (not a Sheet/Drawer) — port this interactive behavior; it requires a Client Component for the scroll listener and `usePathname()` (Next.js) in place of `useLocation()` (react-router) for active-link highlighting.
- Nav links (5 items: Home/Prices/Demo/Blog/Contacts), header CTAs ("Демо" outline button → `/demo`, "Спробувати безкоштовно" primary button → `/contacts`), and footer's 4-column layout (Product links, Company links, Contact info, social icons) all port using existing `@repo/ui` `Button` — no missing primitive identified for header/footer/404 specifically.
- All routes map 1:1 from the design's `react-router` tree (`src/app/routes.ts`) to Next.js App Router segments: `/` (home), `/prices`, `/demo`, `/blog`, `/blog/[slug]`, `/contacts`, plus a catch-all Not Found.

### Logo

- **D-06 (Logo — build local, don't touch shared package):** `packages/ui/src/components/logo/Logo.tsx` is a leftover generic "Garage Hub" placeholder (unrelated house/garage SVG icon + hardcoded "Garage Hub" label) — **do not modify it**. It's shared by `apps/web`, `apps/docs`, and `apps/admin-panel`; rebranding it would affect all three. Instead, build a DentaBot-specific logo component **local to `apps/web`** (used in both header and footer), leaving `@repo/ui`'s `Logo` untouched.
- **D-07 (Keep emoji icon):** Keep the design's literal 🦷 emoji inside the blue badge exactly as designed — do not swap it for an SVG icon from `lucide-react` or elsewhere, despite cross-platform emoji rendering variance. Exact visual fidelity to the design was prioritized over rendering consistency.

### Claude's Discretion

- Exact CSS custom property name for the new brand token (e.g. `--brand` vs `--accent-blue` vs other) — pick what fits naturally alongside the existing token naming in `theme.css`.
- How the sticky/scroll header behavior and mobile menu are structured as Client vs Server Components (Next.js App Router conventions apply — minimize `"use client"` boundary to what actually needs it).
- Where the local `apps/web` logo component lives structurally (e.g. `apps/web/app/_components/logo.tsx` or similar) — no established `app`-local component convention exists yet in this codebase.
- Shadcn-primitive audit scope: THEME-02 requires auditing what primitives *later* pages (Home, Prices, Demo, Blog, Contacts) will need and adding any missing ones to `@repo/ui` via its shadcn-CLI pattern. Header/footer/404 alone don't surface any new primitive needs (Button already exists) — the broader audit across all six pages' content is Claude's call on how deep to go in Phase 1 vs. deferring specific additions to when Phase 2/3 pages actually need them.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level specs
- `.planning/PROJECT.md` — Core value, constraints (tech stack, component reuse, forms, state, data, styling source of truth), Key Decisions table
- `.planning/REQUIREMENTS.md` — THEME-01/02/03, LAYOUT-01/02/03 full requirement text and traceability
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, dependencies

### Codebase maps
- `.planning/codebase/CONVENTIONS.md` — naming, formatting, import order (`@trivago/prettier-plugin-sort-imports`), module design
- `.planning/codebase/STRUCTURE.md` — directory layout, where to add new code, "New Shared UI Component" guidance
- `.planning/codebase/STACK.md` — exact dependency versions (Next.js 16.2, React 19.2, Tailwind v4.3.3, `@repo/ui` deps including `next-themes`, `lucide-react`, `radix-ui`, `class-variance-authority`)

### Design archive (⚠ ephemeral scratch path — see note below)
- Design archive root (this session): `/private/tmp/claude-501/-Users-artemdanko-Developer-denta-bot/52bb8e91-fd37-4fa5-bb9e-1e8c890d8a88/scratchpad/` — **not yet re-extracted this session**; the archive was previously unzipped at a *prior* session's scratchpad path (`.../8b5d7e59-0e2d-435b-b260-ad43cb13b1c8/scratchpad/design-archive/`), which is NOT guaranteed to exist by the time this phase is planned/executed (scratch dirs are session-scoped and not persistent, per PROJECT.md's explicit warning).
- **Because of that risk, the full relevant source has been transcribed into `<code_context>` below** — treat that as the canonical source for Phase 1 planning/execution, not the scratch path. If the original zip (`Дизайн з темами.zip`) is still available, prefer re-unzipping it fresh over relying on any stale scratch path.

[No ADRs or other external specs exist for this milestone.]

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@repo/ui`'s `Button` (`packages/ui/src/components/shadcn-ui/button.tsx`) — covers all header/footer CTAs (`default` and `outline` variants), no new primitive needed for this phase's shell.
- `next-themes` is already a `@repo/ui` dependency — no new package needed for THEME-03.
- `lucide-react` (`Menu`, `X`, `Sun`, `Moon`, `Home` icons used in header/theme-toggle/not-found) is already available.

### Established Patterns
- `packages/ui/index.tsx` is the package's re-export entry — any new shared component added to `@repo/ui` must be exported there.
- No `@/` path aliases established yet beyond Next.js framework defaults (per CONVENTIONS.md) — don't introduce app-local aliases unless already configured in `apps/web/tsconfig.json`.
- Import order enforced by `@trivago/prettier-plugin-sort-imports`: third-party → relative → module CSS, each group blank-line separated, named specifiers alphabetized.

### Integration Points
- `apps/web/app/layout.tsx` is the root layout — this is where the theme provider, header, and footer get wired in for every route.
- Route segments under `apps/web/app/` map directly from the design's `routes.ts` tree (see below).

### Current `@repo/ui` theme tokens (BEFORE — `packages/ui/styles/theme.css`)
Current tokens are a neutral/grayscale default shadcn theme (`--primary: oklch(0.205 0 0)` light / `oklch(0.922 0 0)` dark, no brand color, no `--input-background`/`--switch-background`/`--font-weight-*` tokens present). Full file already exists at this path in the repo — read directly rather than duplicating here.

### Design archive theme tokens (target — to port into `packages/ui/styles/theme.css`)
```css
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  /* NEW — brand accent token (D-02), not present in design source's own theme.css,
     but required to represent the #1d6be4 blue used across header/footer/404 */
  --brand: #1d6be4;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
  /* --brand: same value as light mode — #1d6be4, no separate dark variant observed in source */
}

@theme inline {
  /* ...existing color/radius mappings ported unchanged from design source... */
  --color-brand: var(--brand); /* NEW mapping for D-02 */
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { font-size: var(--font-size); }
  h1 { font-size: var(--text-2xl); font-weight: var(--font-weight-medium); line-height: 1.5; }
  h2 { font-size: var(--text-xl); font-weight: var(--font-weight-medium); line-height: 1.5; }
  h3 { font-size: var(--text-lg); font-weight: var(--font-weight-medium); line-height: 1.5; }
  h4 { font-size: var(--text-base); font-weight: var(--font-weight-medium); line-height: 1.5; }
  label, button { font-size: var(--text-base); font-weight: var(--font-weight-medium); line-height: 1.5; }
  input { font-size: var(--text-base); font-weight: var(--font-weight-normal); line-height: 1.5; }
}

@keyframes accordion-down { from { height: 0; } to { height: var(--radix-accordion-content-height); } }
@keyframes accordion-up { from { height: var(--radix-accordion-content-height); } to { height: 0; } }
.animate-accordion-down { animation: accordion-down 0.2s ease-out; }
.animate-accordion-up { animation: accordion-up 0.2s ease-out; }
```
Note: `packages/ui/styles/theme.css` currently also defines `--radius-2xl`/`--radius-3xl`/`--radius-4xl` in its `@theme inline` block (not present in the design source) — preserve those extra radius scales when merging, since other `@repo/ui` components may already depend on them.

### Design source — root theme wiring (`src/app/App.tsx`)
```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <RouterProvider router={router} />
  <Toaster position="top-right" richColors />
</ThemeProvider>
```
`next-themes`' `ThemeProvider` takes the same `attribute`/`defaultTheme`/`enableSystem` props — port this config into `apps/web/app/layout.tsx`. The `Toaster` (sonner) is used for form-submission feedback (Contacts/Demo, Phase 2) but since it's site-wide chrome, placing it in the root layout now (even if unused until Phase 2) is a reasonable structural choice — Claude's discretion.

### Design source — routes (`src/app/routes.ts`)
```ts
createBrowserRouter([
  {
    path: "/", Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "prices", Component: Prices },
      { path: "demo", Component: Demo },
      { path: "blog", Component: Blog },
      { path: "blog/:slug", Component: BlogPost },
      { path: "contacts", Component: Contacts },
      { path: "*", Component: NotFound },
    ],
  },
]);
```
Maps to Next.js App Router: `app/page.tsx`, `app/prices/page.tsx`, `app/demo/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/contacts/page.tsx`, `app/not-found.tsx` (catch-all), with `app/layout.tsx` as the shared shell (Header + `{children}` + Footer) replacing the design's `Layout` + `<Outlet />` pattern.

### Design source — header (`src/app/components/header.tsx`)
```tsx
import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "../lib/utils";

export function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Продукт" },
    { href: "/prices", label: "Ціни" },
    { href: "/demo", label: "Демо" },
    { href: "/blog", label: "Блог" },
    { href: "/contacts", label: "Контакти" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" : "bg-white dark:bg-gray-900"
      // ⚠ per D-03, normalize bg-white/dark:bg-gray-900 → bg-background (with /80 opacity + backdrop-blur variant when scrolled)
    )}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo — see D-06/D-07: build local apps/web logo, keep 🦷 emoji */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1d6be4]">
              {/* ⚠ per D-02, bg-[#1d6be4] → bg-brand */}
              <span className="text-2xl">🦷</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">DentaBot</span>
            {/* ⚠ per D-03, text-gray-900 dark:text-white → text-foreground */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className={cn(
                "text-base font-medium transition-colors hover:text-[#1d6be4]", // → hover:text-brand
                location.pathname === link.href ? "text-[#1d6be4]" : "text-gray-700 dark:text-gray-300"
                // active: text-brand ; inactive: text-foreground/text-muted-foreground (pick per D-03)
              )}>{link.label}</Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="default" asChild><Link to="/demo">Демо</Link></Button>
            <Button size="default" asChild><Link to="/contacts">Спробувати безкоштовно</Link></Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu (inline collapse, not a Sheet/Drawer) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t dark:border-gray-800"> {/* → border-border */}
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setIsMobileMenuOpen(false)} className={cn(
                  "text-base font-medium transition-colors px-2 py-2",
                  location.pathname === link.href ? "text-[#1d6be4]" : "text-gray-700 dark:text-gray-300"
                )}>{link.label}</Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="default" asChild><Link to="/demo" onClick={() => setIsMobileMenuOpen(false)}>Демо</Link></Button>
                <Button size="default" asChild><Link to="/contacts" onClick={() => setIsMobileMenuOpen(false)}>Спробувати безкоштовно</Link></Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
```
Port notes: `Link`/`useLocation` (react-router) → `next/link`'s `Link` / `usePathname()` (`next/navigation`). Requires `"use client"` (scroll listener, mobile menu state, active-link highlighting).

### Design source — theme toggle (`src/app/components/theme-toggle.tsx`)
```tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import * as React from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-10 w-10"><Sun className="h-5 w-5" /></Button>;
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-10 w-10">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Перемкнути тему</span>
    </Button>
  );
}
```
Binary light/dark toggle (no explicit "system" option in the UI, even though `enableSystem` is set on the provider — toggle just flips between the two). Ports as-is; no `useLocation`/router dependency, works identically in Next.js.

### Design source — footer (`src/app/components/footer.tsx`)
```tsx
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800"> {/* → bg-muted or bg-card, border-border — pick per D-03 */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 — Logo + description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1d6be4]"> {/* → bg-brand */}
                <span className="text-2xl">🦷</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">DentaBot</span> {/* → text-foreground */}
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400"> {/* → text-muted-foreground */}
              Автоматизація запису пацієнтів у стоматологічні клініки через Telegram бот
            </p>
            <div className="flex gap-3">
              <a href="https://t.me/dentabot" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1d6be4] hover:text-white transition-colors">
                {/* → bg-muted, hover:bg-brand */}
                <span className="text-lg">✈️</span>
              </a>
              <a href="https://instagram.com/dentabot" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1d6be4] hover:text-white transition-colors">
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Column 2 — Product links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Продукт</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#1d6be4] transition-colors">Головна</Link></li>
              <li><Link to="/prices" className="...">Ціни</Link></li>
              <li><Link to="/demo" className="...">Демо</Link></li>
              <li><Link to="/blog" className="...">Блог</Link></li>
            </ul>
          </div>

          {/* Column 3 — Company links (per D-05: keep /about and /privacy as-is, will 404) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Компанія</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="...">Про нас</Link></li>
              <li><Link to="/contacts" className="...">Контакти</Link></li>
              <li><Link to="/privacy" className="...">Політика конфіденційності</Link></li>
            </ul>
          </div>

          {/* Column 4 — Contact info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Контакти</h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-600 dark:text-gray-400">
                <span className="block font-medium text-gray-900 dark:text-white mb-1">Email</span>
                <a href="mailto:hello@dentabot.ua" className="hover:text-[#1d6be4] transition-colors">hello@dentabot.ua</a>
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400">
                <span className="block font-medium text-gray-900 dark:text-white mb-1">Telegram</span>
                <a href="https://t.me/dentabot_support" className="hover:text-[#1d6be4] transition-colors">@dentabot_support</a>
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400">
                <span className="block font-medium text-gray-900 dark:text-white mb-1">Робочі години</span>
                Пн-Пт: 9:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t dark:border-gray-800"> {/* → border-border */}
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">© 2026 DentaBot by Dankohub</p>
        </div>
      </div>
    </footer>
  );
}
```

### Design source — Not Found (`src/app/pages/not-found.tsx`)
```tsx
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold text-[#1d6be4]">404</div> {/* → text-brand */}
        <h1 className="text-3xl font-bold">Сторінку не знайдено</h1>
        <p className="text-gray-600 dark:text-gray-400">Вибачте, сторінка яку ви шукаєте не існує або була переміщена.</p> {/* → text-muted-foreground */}
        <Button size="lg" asChild><Link to="/"><Home className="mr-2 h-5 w-5" />На головну</Link></Button>
      </div>
    </div>
  );
}
```
Ports to `apps/web/app/not-found.tsx` (Next.js convention for the catch-all 404 route — no manual `*` route needed like react-router's).

### Design source — layout wrapper (`src/app/pages/layout.tsx`)
```tsx
import { Outlet } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* → bg-background text-foreground, per D-03 */}
      <Header />
      <main><Outlet /></main>
      <Footer />
    </div>
  );
}
```
Maps directly to `apps/web/app/layout.tsx`'s `<body>` structure: `<Header /> <main>{children}</main> <Footer />`.

### `@repo/ui`'s current Logo component (DO NOT MODIFY — per D-06)
```tsx
// packages/ui/src/components/logo/Logo.tsx
type LogoProps = { withLabel?: boolean };
export function Logo({ withLabel = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2 group">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary-foreground">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      {withLabel && <span className="font-semibold text-lg">Garage Hub</span>}
    </div>
  );
}
```
Confirms this is unrelated placeholder content ("Garage Hub", house icon) from a prior starter template — left untouched per D-06. The new `apps/web`-local logo should follow a similar structural shape (badge + optional label) but with DentaBot content (🦷 emoji, `bg-brand`, "DentaBot" label).

</code_context>

<specifics>
## Specific Ideas

- Brand accent color `#1d6be4` should become a first-class theme token, not an inline arbitrary-value class — this was the most consequential decision in this discussion since it changes what "re-theme with design tokens" (THEME-01) actually means: the design's *own* token set is incomplete relative to what its components actually use.
- The user explicitly prioritized visual fidelity over token/rendering purity in two places: keeping dead footer links (D-05) and keeping the 🦷 emoji instead of an SVG (D-07) — both decisions favor "port exactly as designed" over "clean it up." Contrast this with D-03 (semantic tokens), where the user favored correctness/consistency over literal porting. Read as: fidelity wins on *content and specific visual choices*, but the underlying *styling mechanism* (tokens vs. hardcoded classes) should be done right.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. No scope-creep suggestions came up (all four areas were about how to implement the already-scoped theme/shell work).

</deferred>

---

*Phase: 1-Theme & Site Shell*
*Context gathered: 2026-08-08*
