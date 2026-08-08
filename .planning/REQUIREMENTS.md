# Requirements: denta-bot Marketing Site (apps/web)

**Defined:** 2026-08-08
**Core Value:** The migrated site must render all six pages from the design faithfully — content, layout, and theme — using `@repo/ui` components and Next.js App Router conventions, so the marketing site is production-shaped even though it currently runs entirely on mock data.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Theme & Components

- [ ] **THEME-01**: Site renders using `@repo/ui` components re-themed with the design archive's light/dark color tokens (`packages/ui/styles/theme.css` updated), replacing the current default shadcn/neutral theme
- [ ] **THEME-02**: Any shadcn primitive the pages require that's missing from `@repo/ui` is added to `@repo/ui` via its existing shadcn-CLI pattern — not duplicated locally in `apps/web`
- [ ] **THEME-03**: User can toggle light/dark theme from the header, and the choice persists across navigation (via `next-themes`)

### Layout

- [ ] **LAYOUT-01**: User sees a consistent header with navigation to Home, Prices, Demo, Blog, Contacts on every page
- [ ] **LAYOUT-02**: User sees a consistent footer on every page
- [ ] **LAYOUT-03**: User navigating to an unmatched URL sees a Not Found page

### Home

- [ ] **HOME-01**: User can view the Home page at `/` with all sections from the design (hero, features, etc.) ported with `@repo/ui` components and the original Ukrainian copy

### Prices

- [ ] **PRICE-01**: User can view the Prices page at `/prices` with all pricing tiers from the design ported with `@repo/ui` components and original copy

### Demo

- [ ] **DEMO-01**: User can view the Demo page at `/demo` and interact with the scripted chat-bot simulation (client-side, local state, no real API)
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
| New or duplicate component library | All UI must route through the existing `@repo/ui`, not a new one scoped to `apps/web` |
| Zustand added pre-emptively | Only introduce if a genuine cross-component client state need emerges (e.g. `next-themes` and local `useState` already cover known needs) |
| Real backend/API wiring for forms or demo | No `apps/server` endpoint exists yet for this; see v2 INTEG-01/INTEG-02 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| THEME-01 | Phase 1 | Pending |
| THEME-02 | Phase 1 | Pending |
| THEME-03 | Phase 1 | Pending |
| LAYOUT-01 | Phase 1 | Pending |
| LAYOUT-02 | Phase 1 | Pending |
| LAYOUT-03 | Phase 1 | Pending |
| HOME-01 | Phase 2 | Pending |
| DEMO-01 | Phase 2 | Pending |
| DEMO-02 | Phase 2 | Pending |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 2 | Pending |
| PRICE-01 | Phase 3 | Pending |
| BLOG-01 | Phase 3 | Pending |
| BLOG-02 | Phase 3 | Pending |
| BLOG-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16 (roadmap created — 3 phases)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-08*
*Last updated: 2026-08-08 after roadmap creation*
</content>
