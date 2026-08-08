# Phase 1: Theme & Site Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-08
**Phase:** 1-Theme & Site Shell
**Areas discussed:** Brand blue handling, Literal gray-* classes vs semantic tokens, Footer links to out-of-scope pages, Logo — rebrand shared vs local

---

## Brand blue (#1d6be4) handling

| Option | Description | Selected |
|--------|-------------|----------|
| Add as a theme token | Add `--brand` (or similar) to theme.css alongside the ported tokens, with light/dark variants if needed. One source of truth; usable as `bg-brand` / `text-brand` anywhere. | ✓ |
| Keep as raw hex classes | Port literally with `bg-[#1d6be4]` / `text-[#1d6be4]` utility classes wherever the design uses them, no new token added. | |
| You decide | Let the planner/researcher pick based on what's cleanest to implement. | |

**User's choice:** Add as a theme token
**Notes:** Design's own `--primary` token (`#030213`, dark navy) drives the default `Button`; the bright blue is a separate, previously-undefined "brand accent" used only for logo, active nav/link states, and hover accents. Design applies the same blue value in both light and dark mode — no separate dark variant needed.

---

## Literal gray-* classes vs semantic tokens

| Option | Description | Selected |
|--------|-------------|----------|
| Normalize to semantic tokens | Replace literal gray-*/white/black classes with `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, etc. | ✓ |
| Port literally as coded | Keep the exact gray-900/950/600/400 classes from the design source. | |
| You decide | Let the planner/researcher choose per-component. | |

**User's choice:** Normalize to semantic tokens
**Notes:** Applies as a general rule across header/footer/404 now and future pages, not just the three files inspected during discussion.

---

## Footer links to out-of-scope pages

| Option | Description | Selected |
|--------|-------------|----------|
| Remove both links | Drop "Про нас" and "Політика конфіденційності" from the footer entirely. | |
| Redirect to existing pages | Point "Про нас" → /contacts (or /) and handle "Політика конфіденційності" similarly. | |
| Keep as-is (will 404) | Port the footer exactly as designed, including links to routes that don't exist yet. | ✓ |

**User's choice:** Keep as-is (will 404)
**Notes:** Footer ports exactly as designed; `/about` and `/privacy` links will hit the Phase 1 Not Found page until those routes exist in a future milestone.

---

## Logo — rebrand shared @repo/ui Logo vs. build local

| Option | Description | Selected |
|--------|-------------|----------|
| Rebrand the shared Logo component | Update `packages/ui/src/components/logo/Logo.tsx` in place to DentaBot branding. Affects docs/admin-panel too. | |
| Build a local logo in apps/web | Leave `@repo/ui`'s Logo untouched; build a DentaBot-specific logo local to `apps/web`. | ✓ |
| You decide | Let the planner/researcher pick based on component structure. | |

**User's choice:** Build a local logo in apps/web
**Notes:** Follow-up question on the icon itself:

| Option | Description | Selected |
|--------|-------------|----------|
| Keep the 🦷 emoji | Exact port of the design. | ✓ |
| Swap to an SVG icon | Use an SVG tooth/dental icon (lucide-react or custom), consistent rendering, matches `@repo/ui`'s existing `Logo.tsx` pattern. | |
| You decide | Let the planner/researcher pick based on icon availability. | |

**User's choice:** Keep the 🦷 emoji, despite cross-platform rendering variance — prioritized exact visual fidelity to the design.

---

## Claude's Discretion

- Exact CSS custom property name for the new brand token (e.g. `--brand` vs `--accent-blue`).
- Client vs Server Component boundaries for the sticky/scroll header and mobile menu.
- Where the local `apps/web` logo component lives structurally (no established `app`-local component convention yet).
- Depth of the THEME-02 shadcn-primitive audit across all six pages' eventual content vs. deferring specific additions to Phase 2/3 as pages actually need them.

## Deferred Ideas

None — discussion stayed within phase scope.
