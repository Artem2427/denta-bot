---
phase: 01-theme-site-shell
verified: 2026-08-08T13:48:49Z
status: passed
score: 11/13 must-haves verified
behavior_unverified: 2
overrides_applied: 0
behavior_unverified_items:

  - truth: "Theme toggle click cycles light↔dark, next-themes writes a single 'theme' key to localStorage (not an accumulating list), and clicking an even number of times returns the UI to its original theme."
    test: "In a browser, open devtools Application > Local Storage. Click the header theme toggle 4 times. Confirm exactly one 'theme' key exists in localStorage (its value updates in place) and the page visually returns to the original (light) theme."
    expected: "Single 'theme' localStorage key, page state matches original theme after an even number of toggles."
    why_human: "Runtime DOM/localStorage state mutation cannot be observed via static grep — ThemeToggle is wired to next-themes' setTheme() but no automated test in this codebase (apps/web has no test framework configured) exercises the toggle cycle."

  - truth: "Theme preference set in one browser tab is reflected in other open tabs of the same origin via next-themes' built-in storage-event listener."
    test: "Open the site in two browser tabs. Toggle theme in tab A. Observe tab B without refreshing."
    expected: "Tab B's theme updates automatically (next-themes' cross-tab storage-event listener)."
    why_human: "Cross-tab behavior is inherent to the next-themes library, not custom code this phase — no way to verify via source inspection alone, requires a live two-tab browser check."
human_verification:

  - test: "Click the header theme toggle 4 times (even number) and inspect localStorage for a single 'theme' key; confirm the page returns to its original theme."
    expected: "Exactly one 'theme' key in localStorage; page visually matches the original theme after an even number of toggles."
    why_human: "Runtime state mutation, not visible via grep; no test framework configured in apps/web to automate this."

  - test: "Open the site in two tabs, toggle theme in tab A, observe tab B updates without a manual refresh."
    expected: "Tab B reflects the new theme automatically."
    why_human: "Inherent next-themes library behavior across browser tabs; requires a live two-tab check."

  - test: "Load apps/docs (`pnpm dev:docs`) and apps/admin-panel (`pnpm --filter admin-panel dev`) in a browser and visually confirm neither looks broken/unstyled after the shared packages/ui/styles/theme.css token swap."
    expected: "Both apps render with coherent (not obviously broken) styling."
    why_human: "No automated visual-regression tooling exists in this monorepo (per the plan's own threat-model disposition). Verifier could not even production-build either app to inspect output — apps/docs fails on a pre-existing `@repo/ui/button` module-resolution error unrelated to this phase's changes (confirmed via `git log -- apps/docs/app/page.tsx`, untouched since the initial commit) and apps/admin-panel fails its `tsc` step on the same pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict already logged in deferred-items.md (predates Phase 1). A structural diff confirms the token swap is additive-only (no CSS custom property names removed), which supports low regression risk, but a human should still spot-check both apps once their own pre-existing build issues are resolved."

  - test: "Grep-confirm no header/footer/CTA element performs a real network call or analytics beacon (prohibition, Plan 01-02); grep-confirm not-found.tsx has no useRouter()/redirect() silent-redirect call (prohibition, Plan 01-02)."
    expected: "No fetch/axios/XMLHttpRequest/analytics calls in header.tsx/footer.tsx/logo.tsx/theme-toggle.tsx/layout.tsx/not-found.tsx; no useRouter/redirect( in not-found.tsx."
    why_human: "Both prohibitions are declared verification: test in the plan frontmatter, but apps/web has no test framework configured (no vitest/jest/playwright dependency) — there is no wired automated enforcement test for either prohibition. Per the fail-closed rule for test-tier prohibitions, an item that reaches verification with no wired enforcement is flagged as unverified rather than silently passed, even though the verifier's own manual grep found zero violations of either prohibition (0 fetch/axios/analytics calls; 0 useRouter/redirect( calls in not-found.tsx)."

  - test: "Resize the browser viewport under 1024px width; confirm the mobile hamburger menu opens/closes and auto-closes after clicking a nav link. Full visual pass on `/` confirming brand-blue logo badge, correct nav labels, and the header's scroll-triggered blur/shadow style change."
    expected: "Hamburger menu toggles correctly and closes on link click; header visually matches the design source in both scroll states."
    why_human: "Harvested from Plan 01-02's `<verification>` `<human-check>` block, deferred to end-of-phase per `workflow.human_verify_mode=end-of-phase`. Interaction/visual correctness cannot be confirmed via static grep — code presence for the mobile-menu `useState`/`onClick` handlers and the `isScrolled` conditional className was confirmed, but the actual open/close/scroll-blur behavior needs a live browser check."
---

# Phase 1: Theme & Site Shell Verification Report

**Phase Goal:** Every route in the app renders inside a consistently themed layout — using `@repo/ui` components restyled with the design's light/dark tokens — with working navigation, a persistent theme toggle, and a proper Not Found page for unmatched URLs.
**Verified:** 2026-08-08T13:48:49Z
**Status:** human_needed
**Re-verification:** No — initial verification

**Note on file locations:** Verified against current locations after the orchestrator-applied refactor (`b848b07`): shared components live at `apps/web/components/*` (not `apps/web/app/_components/*` as originally planned/summarized), route constants centralized in `apps/web/lib/routes.ts`, and a `@/*` path alias is configured in `apps/web/tsconfig.json`. All checks below use these current paths.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Site renders using `@repo/ui` components re-themed with design archive's light/dark tokens (ROADMAP SC1) | ✓ VERIFIED | `packages/ui/styles/theme.css` `:root`/`.dark` blocks contain the exact transcribed values from 01-CONTEXT.md (`--primary: #030213`, `--muted: #ececf0`, `--destructive: #d4183d`, dark `--card: oklch(0.145 0 0)`, etc.), replacing the prior neutral shadcn defaults |
| 2 | `--brand: #1d6be4` exists once in `:root` only, mapped to `--color-brand` | ✓ VERIFIED | `theme.css` line 85: `--brand: #1d6be4;` (only occurrence, not in `.dark`); line 30: `--color-brand: var(--brand);` in `@theme inline` |
| 3 | Accordion `animate-accordion-down`/`animate-accordion-up` classes resolve to real keyframes (pre-existing gap fixed) | ✓ VERIFIED | `theme.css` lines 168-189 contain `@keyframes accordion-down`/`accordion-up` + `.animate-accordion-down`/`.animate-accordion-up` classes |
| 4 | Shadcn primitive audit for Phase 1 scope finds zero missing primitives; `form` primitive gap documented as explicitly deferred, not silently missed (ROADMAP SC5 / THEME-02) | ✓ VERIFIED | `packages/ui/src/components/shadcn-ui/form.tsx` does not exist; `packages/ui/package.json` has no new dependency added; audit finding documented in 01-01-SUMMARY.md "Decisions Made" and this phase's deferred-items context |
| 5 | Theme toggle switches light/dark and persists across client-side navigation (ROADMAP SC2 / THEME-03) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `theme-toggle.tsx` correctly wires `useTheme()`/`setTheme()` from `next-themes` with a mounted-guard; `layout.tsx` wraps the tree in `ThemeProvider(attribute="class" defaultTheme="light" enableSystem)`. Code is present and wired, but persistence/localStorage-single-key/even-click-cycle behavior is not exercised by any automated test (apps/web has no test framework) — see Human Verification |
| 6 | Theme preference syncs across browser tabs of the same origin | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Inherent `next-themes` library behavior, no custom code this phase; not exercised by any test — see Human Verification |
| 7 | Consistent header (nav to Home/Prices/Demo/Blog/Contacts) and footer on every page, including 404 (ROADMAP SC3) | ✓ VERIFIED | Live `pnpm dev:web` smoke test: `GET /` → 200 with 7 "DentaBot" occurrences (header+footer), nav labels Продукт/Ціни/Демо/Блог/Контакти all present; `GET /does-not-exist` → 404 and `GET /prices` → 404, both still render the same Header/Footer shell (3× "Сторінку не знайдено" + 7× "DentaBot" in each response body) |
| 8 | Header scroll boundary uses exact `window.scrollY > 20` (not `>=`) | ✓ VERIFIED | `apps/web/components/header.tsx` line 27: `const handleScroll = () => setIsScrolled(window.scrollY > 20);` — single occurrence, exact boundary |
| 9 | `navLinks` is a compile-time constant, 5 entries, fixed order (Продукт/Ціни/Демо/Блог/Контакти) | ✓ VERIFIED | `header.tsx` lines 13-19: hardcoded 5-entry array in the specified order, sourced from `routes.ts` constants, not external/empty data |
| 10 | Footer 4-column grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, fixed column order (Logo, Продукт, Компанія, Контакти), non-empty | ✓ VERIFIED | `apps/web/components/footer.tsx` line 10: exact grid classes; columns hardcoded in JSX (not sourced from external/empty data) in the specified order |
| 11 | Unmatched URL renders `not-found.tsx` wrapped in the shared shell, no client-side redirect (ROADMAP SC4 / LAYOUT-03) | ✓ VERIFIED | `apps/web/app/not-found.tsx` exists as the Next.js root catch-all (no `useRouter`/`redirect(` call); live smoke test confirms it renders inside Header/Footer at both `/does-not-exist` and `/prices` |
| 12 | Root layout wraps every route in `ThemeProvider(attribute="class" defaultTheme="light" enableSystem)` with `Header` above `{children}` and `Footer` below, `Toaster` mounted site-wide | ✓ VERIFIED | `apps/web/app/layout.tsx`: `lang="uk" suppressHydrationWarning`, `ThemeProvider` with exact config, `<Header />`, `<main>{children}</main>`, `<Footer />`, `<Toaster />` each exactly once |
| 13 | `sonner.tsx` client-boundary bug fixed, unblocking `<Toaster />` in the Server Component root layout | ✓ VERIFIED | `packages/ui/src/components/shadcn-ui/sonner.tsx` line 1: `'use client';`; `layout.tsx` renders `<Toaster />` without an RSC boundary error (Turbopack "Compiled successfully"; live dev smoke test returned 200 on `/`) |

**Score:** 11/13 truths verified (2 present, behavior-unverified — see `behavior_unverified_items`)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/ui/styles/theme.css` | Re-themed tokens + `--brand` + accordion keyframes | ✓ VERIFIED | Exists, substantive (190 lines, all planned tokens present), wired (imported by `apps/web/app/globals.css`) |
| `packages/ui/src/components/shadcn-ui/sonner.tsx` | Client-boundary fix | ✓ VERIFIED | `'use client';` first line, no other line changed |
| `apps/web/components/logo.tsx` (moved from `app/_components/`) | DentaBot logo, reused by Header/Footer | ✓ VERIFIED | Server Component, `bg-brand` badge, imported by both `header.tsx` and `footer.tsx` |
| `apps/web/components/theme-toggle.tsx` | Light/dark toggle wired to `next-themes` | ✓ VERIFIED | Client Component, `useTheme`/`setTheme` wired, mounted-guard present, imported by `header.tsx` |
| `apps/web/components/header.tsx` | Fixed/sticky nav, scroll style, active-link, mobile menu | ✓ VERIFIED | Client Component, all behaviors present and wired, imported by `layout.tsx` |
| `apps/web/components/footer.tsx` | 4-column static footer | ✓ VERIFIED | Server Component, imported by `layout.tsx` |
| `apps/web/app/not-found.tsx` | Root catch-all 404 | ✓ VERIFIED | Default export, no redirect logic, renders inside shell (curl-confirmed) |
| `apps/web/app/layout.tsx` | Root layout wiring | ✓ VERIFIED | `ThemeProvider`+`Header`+`Footer`+`Toaster` wired exactly once each |
| `apps/web/lib/routes.ts` (orchestrator refactor, not in original plan) | Centralized route constants | ✓ VERIFIED | Exists, exports `routes` object with all 8 route paths (`home`, `prices`, `demo`, `blog`, `blogPost`, `contacts`, `about`, `privacy`); consumed by header/footer/logo/not-found via `@/lib/routes` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `packages/ui/styles/theme.css` | `apps/web/app/globals.css` | `@import` | ✓ WIRED | Pre-existing import wiring unchanged, tokens flow through |
| `packages/ui/styles/theme.css` (`--color-brand`) | `apps/web/components/*` | Tailwind `@theme inline` → `bg-brand`/`text-brand` utilities | ✓ WIRED | `text-brand` used in header.tsx (active nav link), not-found.tsx (404 heading); `bg-brand` used in logo.tsx |
| `apps/web/app/layout.tsx` | `apps/web/components/header.tsx`, `footer.tsx` | Direct import + render inside `ThemeProvider` | ✓ WIRED | `import { Header } from '@/components/header'`, `import { Footer } from '@/components/footer'`, both rendered exactly once |
| `apps/web/components/header.tsx`, `footer.tsx` | `apps/web/components/logo.tsx` | Shared `Logo` import | ✓ WIRED | `import { Logo } from './logo'` in both files |
| `apps/web/components/theme-toggle.tsx` | `packages/ui/styles/theme.css` | `next-themes` `setTheme()` toggles `.dark` class | ✓ WIRED | `setTheme(theme === 'dark' ? 'light' : 'dark')` present in `theme-toggle.tsx` |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Home route renders branded shell | `curl -s http://localhost:3000/` | HTTP 200, 7× "DentaBot", all 5 nav labels present | ✓ PASS |
| Unmatched route renders themed 404 inside shell | `curl -s http://localhost:3000/does-not-exist` | HTTP 404, "Сторінку не знайдено" ×3 + "DentaBot" ×7 (shell wraps 404) | ✓ PASS |
| Not-yet-built route (`/prices`) also 404s inside shell (expected — Phase 3 not yet built) | `curl -s http://localhost:3000/prices` | HTTP 404, same shell-wrapped content | ✓ PASS |
| `/about` and `/privacy` footer links preserved (D-05) | `grep -o 'href="/about"\|href="/privacy"' /tmp/home.html` | Both present, 1 occurrence each | ✓ PASS |
| No real network calls wired in shell components | `grep -n "fetch(\|axios\|XMLHttpRequest\|analytics\|gtag\|track(" header/footer/logo/theme-toggle/layout/not-found` | 0 matches | ✓ PASS (manual check; see prohibition flag below re: no automated enforcement) |
| `apps/web` lint | `pnpm --filter web lint` | 0 warnings/errors | ✓ PASS |
| `apps/web` production build (full, incl. type-check) | `pnpm --filter web build` | Turbopack bundling "Compiled successfully"; `tsc` step fails on pre-existing unrelated `csstype@3.1.3`/`3.2.3` conflict in `packages/ui/src/components/shadcn-ui/button-group.tsx` (confirmed untouched since initial commit `91f9732`, logged in `deferred-items.md` #5/#6) | ⚠️ PARTIAL — see Anti-Patterns/Info below |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| THEME-01 | 01-01 | Site re-themed with `@repo/ui` design tokens | ✓ SATISFIED | `theme.css` token diff confirmed against 01-CONTEXT.md |
| THEME-02 | 01-01 | Missing shadcn primitives audited/added via shadcn-CLI, not duplicated locally | ✓ SATISFIED | Audit finding documented; no `form.tsx` added, no local duplicate primitive created in `apps/web` |
| THEME-03 | 01-02 | User can toggle light/dark from header, persists across navigation | ⚠️ SATISFIED (implementation verified; runtime persistence behavior needs human confirmation) | `ThemeToggle`/`ThemeProvider` wired correctly; persistence itself is `next-themes` inherent behavior, not exercised by an automated test — see Human Verification #1 |
| LAYOUT-01 | 01-02 | Consistent header with nav to Home/Prices/Demo/Blog/Contacts on every page | ✓ SATISFIED | Live smoke test confirms nav on `/`, `/does-not-exist`, `/prices` |
| LAYOUT-02 | 01-02 | Consistent footer on every page | ✓ SATISFIED | Same smoke test, footer rendered via root layout on every route |
| LAYOUT-03 | 01-02 | Unmatched URL shows proper Not Found page | ✓ SATISFIED | Live 404 smoke test, no redirect logic present |

No orphaned requirements — all 6 requirement IDs declared in the two plans' frontmatter match REQUIREMENTS.md's Phase 1 traceability rows exactly.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/placeholder markers found in any phase-modified file | — | None |
| `apps/web` (production build) | `packages/ui/src/components/shadcn-ui/button-group.tsx:50` | Pre-existing `csstype@3.1.3` vs `csstype@3.2.3` duplicate-resolution `tsc` failure blocks `pnpm --filter web build`'s type-check step | ℹ️ Info (pre-existing, documented) | Confirmed via `git log -- packages/ui/src/components/shadcn-ui/button-group.tsx` — file untouched since initial commit `91f9732`. Already logged in `deferred-items.md` items #1, #3, #5, #6, spanning `apps/ui`, `apps/admin-panel`, and now `apps/web`. Not caused by this phase; Turbopack's own bundling step (the actual RSC-boundary concern the plan's acceptance criterion cared about) compiles successfully, and the live dev-server smoke test confirms the shell works end-to-end. This remains a real risk to shipping a production build and should be prioritized as a dedicated maintenance task (a `pnpm.overrides` csstype pin) before/during Phase 2. |
| `apps/docs` | `apps/docs/app/page.tsx:2` | `Module not found: '@repo/ui/button'` blocks `pnpm --filter docs build` | ℹ️ Info (pre-existing, unrelated) | Confirmed via `git log -- apps/docs/app/page.tsx` — untouched since initial commit. Unrelated to Phase 1's `theme.css` changes; prevented a full visual-coherence build-check of `apps/docs` (see Human Verification #3) |
| `apps/admin-panel` | multiple `packages/ui/src/components/shadcn-ui/*.tsx` | Same pre-existing `csstype` conflict blocks `pnpm --filter admin-panel build` | ℹ️ Info (pre-existing, documented in `deferred-items.md` #3) | Prevented a full visual-coherence build-check of `apps/admin-panel` (see Human Verification #3) |

### Human Verification Required

See `human_verification` in frontmatter for the full structured list (5 items). Summary:

1. **Theme toggle even-click cycle / single localStorage key** — runtime state, needs live browser + devtools check.
2. **Cross-tab theme sync** — inherent `next-themes` behavior, needs live two-tab check.
3. **`apps/docs`/`apps/admin-panel` visual coherence after the token swap** — both currently fail to build for pre-existing, unrelated reasons, so a full visual spot-check is blocked until those are separately fixed; structural token diff (additive-only) supports low risk in the meantime.
4. **Two test-tier prohibitions (no real network calls; no silent 404 redirect)** — both are `verification: test` in the plan frontmatter, but `apps/web` has no test framework configured, so there is no wired automated enforcement. Per the fail-closed rule for test-tier prohibitions, these are flagged rather than silently passed, even though this verifier's own manual grep found zero violations of either.
5. **Mobile hamburger menu open/close/auto-close, full visual pass on `/`** — harvested from Plan 01-02's `<human-check>` block, deferred to end-of-phase per `workflow.human_verify_mode=end-of-phase`.

### Gaps Summary

No gaps found — no truth failed, no artifact is missing/stub, no key link is unwired, and no debt markers exist in phase-modified files. The phase status is `human_needed` rather than `passed` solely because of the items above: two behavior-dependent truths (theme persistence, cross-tab sync) that are correctly wired but not exercised by any automated test, one judgment-tier prohibition that can't be fully visually confirmed because the two other `@repo/ui` consumer apps currently fail to build for pre-existing unrelated reasons, two test-tier prohibitions with no wired automated enforcement (fail-closed per policy, despite passing manual inspection), and one deferred interactive/visual human-check block from the plan itself.

Separately noted as an ℹ️ Info-level risk (not blocking this phase's goal): `pnpm --filter web build`'s full type-check still fails on a pre-existing, confirmed-unrelated `csstype` version conflict inherited from `packages/ui`. This does not affect the dev-server behavior verified above but will block a clean production build until a monorepo-wide `pnpm.overrides` fix lands — recommend prioritizing this before/during Phase 2.

---

*Verified: 2026-08-08T13:48:49Z*
*Verifier: Claude (gsd-verifier)*
