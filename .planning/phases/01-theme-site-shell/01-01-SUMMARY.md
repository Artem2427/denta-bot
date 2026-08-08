---
phase: 01-theme-site-shell
plan: 01
subsystem: ui
tags: [tailwind-v4, design-tokens, theme, shadcn, css, next-themes]

requires: []
provides:
  - "Re-themed packages/ui/styles/theme.css with design archive's light/dark tokens"
  - "--brand token (#1d6be4) mapped to --color-brand utility (bg-brand/text-brand/border-brand)"
  - "accordion-down/accordion-up keyframes + utility classes (fixes pre-existing gap)"
  - "--destructive-foreground token + --color-destructive-foreground mapping (fixes pre-existing gap)"
  - "sonner.tsx 'use client' directive fix (unblocks Server Component usage of <Toaster />)"
  - "THEME-02 shadcn-primitive audit finding: Button sufficient for Phase 1 shell scope; form primitive confirmed-but-deferred to Phase 2"
affects: [01-02-PLAN, apps/web, apps/docs, apps/admin-panel]

tech-stack:
  added: []
  patterns:
    - "Tailwind v4 @theme inline token mapping: new CSS custom property in :root/.dark + --color-X: var(--X) mapping in @theme inline to generate utility classes"

key-files:
  created: []
  modified:
    - packages/ui/styles/theme.css
    - packages/ui/src/components/shadcn-ui/sonner.tsx

key-decisions:
  - "--brand: #1d6be4 added to :root only (no .dark override) per D-02 — same value both modes"
  - "shadcn form primitive NOT added this plan — react-hook-form is not yet an installed dependency; adding it requires the Package Legitimacy Gate, deferred to Phase 2 (CONT-01)"

patterns-established:
  - "Theme token additions go in :root/.dark plus a matching --color-X mapping in @theme inline, immediately generating Tailwind utility classes for consumers"

requirements-completed: [THEME-01, THEME-02]

coverage:
  - id: D1
    description: "packages/ui/styles/theme.css re-themed with design archive's light/dark token values, replacing prior neutral/grayscale shadcn defaults"
    requirement: THEME-01
    verification:
      - kind: other
        ref: "grep-based acceptance criteria in 01-01-PLAN.md Task 1 <verify><automated> (16 assertions, all passed)"
        status: pass
    human_judgment: false
  - id: D2
    description: "--brand: #1d6be4 token added to :root only, mapped to --color-brand in @theme inline"
    requirement: THEME-01
    verification:
      - kind: other
        ref: "grep -c -- '--brand: #1d6be4;' theme.css == 1 AND grep -c -- '--brand:' theme.css == 1 AND grep -c -- '--color-brand: var(--brand);' theme.css == 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "accordion-down/accordion-up @keyframes + .animate-accordion-down/.animate-accordion-up utility classes added (previously referenced by accordion.tsx but undefined)"
    verification:
      - kind: other
        ref: "grep -c '@keyframes accordion-down' theme.css == 1 AND grep -c '@keyframes accordion-up' theme.css == 1"
        status: pass
    human_judgment: false
  - id: D4
    description: "sonner.tsx begins with 'use client'; directive, no other line changed"
    requirement: THEME-01
    verification:
      - kind: other
        ref: "sed -n '1p' sonner.tsx == \"'use client';\" AND git diff confirms only the directive + blank line were added"
        status: pass
    human_judgment: false
  - id: D5
    description: "THEME-02 shadcn-primitive audit closed for Phase 1 scope: Button covers all header/footer/theme-toggle/not-found needs; form primitive confirmed missing but explicitly deferred to Phase 2 (no react-hook-form dependency added)"
    requirement: THEME-02
    verification:
      - kind: other
        ref: "test ! -f packages/ui/src/components/shadcn-ui/form.tsx && git diff --quiet packages/ui/package.json"
        status: pass
    human_judgment: false
  - id: D6
    description: "apps/docs and apps/admin-panel remain visually coherent after the global token swap (T-01-01 threat mitigation)"
    verification: []
    human_judgment: true
    rationale: "No automated visual-regression tooling installed this milestone (per threat model's documented disposition). Structural verification performed: diffed all --* custom-property keys between old and new theme.css — zero keys removed, only additive (--brand, --destructive-foreground, --font-size, --font-weight-medium/normal, --input-background, --switch-background, --color-brand, --color-destructive-foreground) plus value updates on existing keys. Both apps/docs and apps/admin-panel reference the same token names, none of which disappeared, so their component styling remains structurally intact. A human should still spot-check both apps in a browser."

duration: 8min
completed: 2026-08-08
status: complete
---

# Phase 1 Plan 1: Theme Token Re-theme Summary

**Re-themed `packages/ui/styles/theme.css` with the design archive's light/dark palette (including a new `--brand: #1d6be4` token and previously-missing accordion keyframes/destructive-foreground mapping), and fixed a pre-existing `'use client'` boundary bug in `sonner.tsx` that would have broken Plan 01-02's `<Toaster />` wiring.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-08T11:33:14Z
- **Completed:** 2026-08-08T11:35:50Z
- **Tasks:** 2 completed
- **Files modified:** 2

## Accomplishments
- `packages/ui/styles/theme.css`'s `:root`/`.dark` blocks now carry the design archive's light/dark token values verbatim (background/card/primary/secondary/muted/accent/destructive/border/input for both modes, plus `--sidebar-primary`), replacing the prior neutral/grayscale shadcn defaults
- Added `--brand: #1d6be4` (root-only, no `.dark` override per D-02) mapped to `--color-brand` in `@theme inline`, making `bg-brand`/`text-brand`/`border-brand` utilities available to every `@repo/ui` consumer
- Fixed two pre-existing gaps in the exported stylesheet: `accordion-down`/`accordion-up` `@keyframes` + utility classes (already referenced by `accordion.tsx` but previously undefined anywhere in the file) and `--destructive-foreground`/`--color-destructive-foreground` (missing entirely despite `--destructive` being mapped)
- Fixed `sonner.tsx`'s missing `'use client'` directive — `Toaster` calls `useTheme()` from `next-themes` in its component body with no client-boundary marker, which would break when Plan 01-02 wires `<Toaster />` into the Server Component root layout
- Closed the THEME-02 shadcn-primitive audit for this phase's scope: confirmed `Button` covers every control header/footer/theme-toggle/not-found need; the one milestone-wide gap (a `form` primitive for Phase 2's `react-hook-form`-based Contacts/Demo forms) is explicitly deferred, not added, since scaffolding it now would pull in `react-hook-form` as a new npm dependency without clearing the Package Legitimacy Gate

## Task Commits

1. **Task 1: Re-theme packages/ui/styles/theme.css with the design archive's tokens** - `c430198` (feat)
2. **Task 2: Fix sonner.tsx client boundary + close out THEME-02 shadcn-primitive audit** - `be7802a` (fix)

**Plan metadata:** (pending — final commit below)

## Files Created/Modified
- `packages/ui/styles/theme.css` - Re-themed `:root`/`.dark` token blocks, new `--brand`/`--destructive-foreground`/`--font-size`/`--font-weight-*`/`--input-background`/`--switch-background` tokens, two new `@theme inline` color mappings, `html`/typography rules in `@layer base`, accordion keyframes + utility classes appended
- `packages/ui/src/components/shadcn-ui/sonner.tsx` - Added `'use client';` as the first line; no other line changed

## Decisions Made
- `--brand` placed in `:root` only, no `.dark` override — matches D-02's explicit instruction that the design source applies the brand blue identically in both themes
- `form` shadcn primitive deliberately not scaffolded this plan — `react-hook-form` absence from `packages/ui/package.json`/`apps/web/package.json`/`pnpm-lock.yaml` was confirmed via directory/dependency check; adding it now would be an undisclosed new dependency install outside this plan's threat model (T-01-SC explicitly disposes this as "accept — no new package installs occur in this plan")

## Deviations from Plan

### Auto-fixed Issues

None — no bugs or missing functionality required a code-level auto-fix beyond what the plan specified.

### Plan Verification Script Discrepancy (documented, not a deviation from delivered code)

**1. Task 2's automated `grep -c 'useTheme'` assertion (expected `= 1`) does not match reality**
- **Found during:** Task 2 verification
- **Issue:** The plan's `<verify><automated>` block for Task 2 asserts `grep -c 'useTheme' sonner.tsx == 1`. The pre-existing file (before this plan touched it) already contained two occurrences of `useTheme` — the `import { useTheme } from 'next-themes';` statement and the `const { theme = 'system' } = useTheme();` usage inside the component body. This is unchanged by adding the `'use client';` directive.
- **Verification performed instead:** `git diff -- packages/ui/src/components/shadcn-ui/sonner.tsx` confirms the only change is the addition of `'use client';` plus a blank line at the top of the file — every other line, including both `useTheme` occurrences, is byte-identical to before. This satisfies the task's actual acceptance criteria ("first line is `'use client';`" and "no other line of `sonner.tsx` changed").
- **Fix:** None applied — the plan's grep count in the verify script itself is stale/incorrect, not the implementation. No code change was made or needed.
- **Files modified:** None beyond the planned `sonner.tsx` change.
- **Commit:** `be7802a` (the correct, planned change)

---

**Total deviations:** 0 code deviations; 1 documented plan-verification-script discrepancy (informational only, does not affect delivered functionality)
**Impact on plan:** No scope creep, no unplanned code changes. The stale grep assertion in the plan's own verify script was investigated and confirmed to be a pre-existing counting error unrelated to this task's actual change.

## Issues Encountered

- `pnpm --filter ui check-types` fails with pre-existing `csstype` version-resolution mismatch (`csstype@3.1.3` vs `csstype@3.2.3` both resolved in the pnpm dependency graph) causing `CSSProperties`/`alignmentBaseline` type errors in `calendar.tsx`, `sonner.tsx`, and `spinner.tsx`. Confirmed pre-existing and out of scope (Scope Boundary rule): identical errors appear in `calendar.tsx`/`spinner.tsx`, neither touched this plan, and the error is unrelated to the `'use client'` directive added. Logged to `.planning/phases/01-theme-site-shell/deferred-items.md`.
- `pnpm --filter ui lint` fails with 4 pre-existing `react/prop-types` warnings in `calendar.tsx` (untouched this plan). Logged to `.planning/phases/01-theme-site-shell/deferred-items.md`.
- Both issues predate this plan's commits (confirmed by scope: neither `theme.css` nor `sonner.tsx`'s single-line addition can produce a `csstype` version mismatch or a `calendar.tsx` prop-types warning) and are deferred rather than fixed, per the Scope Boundary rule limiting auto-fixes to issues directly caused by this plan's changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`packages/ui/styles/theme.css` now exposes `bg-brand`/`text-brand`/`border-brand` and `text-destructive-foreground` utilities, plus working accordion animations, ready for Plan 01-02's header/footer/theme-toggle/not-found components. `sonner.tsx`'s client-boundary fix unblocks wiring `<Toaster />` into `apps/web/app/layout.tsx` (a Server Component) without a build failure. THEME-02's audit finding (form primitive deferred) is recorded here for Phase 2 planning to pick up when CONT-01 needs it.

No blockers for Plan 01-02. The two pre-existing `check-types`/`lint` failures (unrelated `csstype` version conflict and `calendar.tsx` prop-types warnings) remain open in `deferred-items.md` and should be addressed in a dedicated maintenance task, not blocking Phase 1's shell work.

---
*Phase: 01-theme-site-shell*
*Completed: 2026-08-08*

## Self-Check: PASSED

- FOUND: packages/ui/styles/theme.css
- FOUND: packages/ui/src/components/shadcn-ui/sonner.tsx
- FOUND: c430198 (git log)
- FOUND: be7802a (git log)
