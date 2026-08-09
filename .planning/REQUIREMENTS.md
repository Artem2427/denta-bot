# Requirements: denta-bot Marketing Site (apps/web)

**Defined:** 2026-08-08
**Core Value:** The migrated site must render all six pages from the design faithfully — content, layout, and theme — using `@repo/ui` components and Next.js App Router conventions, so the marketing site is production-shaped even though it currently runs entirely on mock data.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Theme & Components

- [x] **THEME-01**: Site renders using `@repo/ui` components re-themed with the design archive's light/dark color tokens (`packages/ui/styles/theme.css` updated), replacing the current default shadcn/neutral theme
- [x] **THEME-02**: Any shadcn primitive the pages require that's missing from `@repo/ui` is added to `@repo/ui` via its existing shadcn-CLI pattern — not duplicated locally in `apps/web`
- [x] **THEME-03**: User can toggle light/dark theme from the header, and the choice persists across navigation (via `next-themes`) — **Regressed on the premium `apps/web` site as of Phase 01.1** (2026-08-09): the code-review fixer removed the header's `ThemeToggle` entirely rather than ship a broken dark mode, since the client's premium ТЗ defined no dark-mode token values for the new `dt-*` palette. `apps/web/shared/components/theme-toggle.tsx` still exists, unused. Needs a follow-up decision: either design dark-mode `dt-*` values and re-wire the toggle, or formally descope dark mode for the premium site this milestone. Still `Complete` for `apps/admin-panel` (unaffected, still on `packages/ui`/`theme.css`).

### Premium Design System

- [x] **DESIGN-01**: The marketing site (`apps/web` — excluding the Demo page's embedded admin-panel simulation) renders with a bespoke premium visual system — its own palette (deep navy/teal/warm-white/coral/sage/amber), typography scale, and spacing/radius/shadow language — replacing Phase 1's brand-blue theme on `apps/web` pages. Not built on `packages/ui` as a base; `packages/ui`/`theme.css` is unmodified and stays the basis for `apps/admin-panel` and the Demo page's admin-panel simulation.
- [x] **DESIGN-02**: Site-wide motion system implemented per spec (scroll-triggered reveals, hover micro-interactions, chat-bot typing/message animation timings, signature coral interaction-marker) using `transform`/`opacity`, respecting `prefers-reduced-motion`
- [x] **DESIGN-03**: Site meets WCAG AA text contrast, visible `focus-visible` states on all interactive elements, and a Lighthouse Performance score ≥85 with animations enabled

### Layout

- [x] **LAYOUT-01**: User sees a consistent header with navigation to Home, Prices, Demo, Blog, Contacts on every page
- [x] **LAYOUT-02**: User sees a consistent footer on every page
- [x] **LAYOUT-03**: User navigating to an unmatched URL sees a Not Found page

### Home

- [x] **HOME-01**: User can view the Home page at `/` with all sections from the design (hero, features, etc.) ported with `@repo/ui` components and the original Ukrainian copy

### Prices

- [ ] **PRICE-01**: User can view the Prices page at `/prices` with all pricing tiers from the design ported with `@repo/ui` components and original copy

### Demo

- [x] **DEMO-01**: User can view the Demo page at `/demo` and interact with the scripted chat-bot simulation (client-side, local state, no real API)
- [ ] **DEMO-02**: User can switch between dashboard sections on the Demo page as in the design

### Blog

- [ ] **BLOG-01**: User can view the Blog listing page at `/blog` showing all 6 mock posts from the design
- [ ] **BLOG-02**: User can view an individual Blog Post at `/blog/[slug]` with the post content from the design
- [ ] **BLOG-03**: User navigating to a blog slug not present in the mock data sees a Not Found state

### Contacts

- [ ] **CONT-01**: User can fill and submit the Contacts request form (name, clinic, contact, message) with `react-hook-form` + `zod` validation, seeing inline field errors for invalid input
- [ ] **CONT-02**: User sees a success confirmation after submitting a valid Contacts form (mocked — no real backend call)
- [ ] **CONT-03**: User can view the FAQ accordion on the Contacts page with all FAQ items from the design

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Integrations

- **INTEG-01**: Contacts form submits to a real `apps/server` backend endpoint
- **INTEG-02**: Demo page connects to a real bot/chat API instead of the scripted simulation

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| CMS or MDX-based blog content | Mock data in code is sufficient this milestone; no content backend exists yet |
| i18n / multi-language support | Site ships Ukrainian-only, matching the design |
| New component library for `apps/admin-panel` or the Demo page's embedded admin-panel simulation | Those stay on `@repo/ui` — they represent the real `apps/admin-panel` product. **Superseded for `apps/web` marketing pages by DESIGN-01** (2026-08-08, client-directed premium redesign): the marketing site now gets its own bespoke component system, not routed through `@repo/ui`. |
| Zustand added pre-emptively | Only introduce if a genuine cross-component client state need emerges (e.g. `next-themes` and local `useState` already cover known needs) |
| Real backend/API wiring for forms or demo | No `apps/server` endpoint exists yet for this; see v2 INTEG-01/INTEG-02 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| THEME-01 | Phase 1 | Complete |
| THEME-02 | Phase 1 | Complete |
| THEME-03 | Phase 1 | Complete |
| LAYOUT-01 | Phase 1 | Complete |
| LAYOUT-02 | Phase 1 | Complete |
| LAYOUT-03 | Phase 1 | Complete |
| DESIGN-01 | Phase 01.1 | Complete |
| DESIGN-02 | Phase 01.1 | Complete |
| DESIGN-03 | Phase 01.1 | Complete |
| HOME-01 | Phase 2 | Complete |
| DEMO-01 | Phase 2 | Complete |
| DEMO-02 | Phase 2 | Pending |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 2 | Pending |
| PRICE-01 | Phase 3 | Pending |
| BLOG-01 | Phase 3 | Pending |
| BLOG-02 | Phase 3 | Pending |
| BLOG-03 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 19 total
- Mapped to phases: 19 (roadmap has 4 phases: 1, 01.1, 2, 3)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-08*
*Last updated: 2026-08-08 — added DESIGN-01/02/03 for urgent Phase 01.1 (premium redesign)*
</content>
