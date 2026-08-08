# Roadmap: denta-bot Marketing Site (apps/web)

## Overview

Replace `apps/web`'s default create-turbo starter with the real six-page marketing site migrated from the Figma-exported design archive, built on the monorepo's shared `@repo/ui` component library. Work proceeds foundation-first: re-theme `@repo/ui` and stand up the shared header/footer/theme-toggle/404 shell before any page content lands, so every subsequent page inherits the correct look and navigation from day one. Pages then land in business-priority order — Home (primary landing), Contacts & Demo (lead-gen forms and interactivity), then Prices and Blog (remaining content) — ending with all six routes rendered faithfully against mock data, production-shaped but backend-free.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Theme & Site Shell** - Re-theme `@repo/ui` with the design's tokens and stand up the shared header/footer/theme-toggle/404 layout used by every page
- [ ] **Phase 2: Home, Contacts & Demo** - Ship the Home landing page plus the two lead-gen surfaces (Contacts form, Demo chat simulation)
- [ ] **Phase 3: Prices & Blog** - Ship the Prices page and the Blog listing/detail routes

## Phase Details

### Phase 1: Theme & Site Shell

**Goal**: Every route in the app renders inside a consistently themed layout — using `@repo/ui` components restyled with the design's light/dark tokens — with working navigation, a persistent theme toggle, and a proper Not Found page for unmatched URLs.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: THEME-01, THEME-02, THEME-03, LAYOUT-01, LAYOUT-02, LAYOUT-03
**Success Criteria** (what must be TRUE):

  1. User visiting any route sees `@repo/ui` components rendered with the design archive's light/dark color tokens (`packages/ui/styles/theme.css` updated), not the previous default shadcn/neutral theme
  2. User can toggle light/dark theme from the header, and the choice persists across navigation (via `next-themes`)
  3. User sees a consistent header (with navigation to Home, Prices, Demo, Blog, Contacts) and footer on every page
  4. User navigating to an unmatched URL sees a proper Not Found page
  5. Any shadcn primitive later pages require that's missing from `@repo/ui` has been audited and added via the existing shadcn-CLI pattern, not duplicated locally in `apps/web`

**Plans**: 1/2 plans executed
**UI hint**: yes

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Re-theme `@repo/ui` design tokens (`--brand` + design archive palette), fix `sonner.tsx` client boundary, close out THEME-02 shadcn-primitive audit

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Build Logo/ThemeToggle/Header/Footer/Not-Found and wire `next-themes` + shell into the root layout

### Phase 2: Home, Contacts & Demo

**Goal**: Users can view the Home landing page and complete the two primary lead-gen actions — request a demo via the scripted chat simulation and submit a contact inquiry with validated feedback.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: HOME-01, DEMO-01, DEMO-02, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):

  1. User can view the Home page at `/` with all sections from the design (hero, features, etc.) ported with `@repo/ui` components and the original Ukrainian copy
  2. User can view the Demo page at `/demo`, interact with the scripted chat-bot simulation, and switch between dashboard sections as in the design (client-side, local state, no real API)
  3. User can fill and submit the Contacts form (name, clinic, contact, message) with `react-hook-form` + `zod` validation, seeing inline field errors for invalid input
  4. User sees a mocked success confirmation after submitting a valid Contacts form (no real backend call)
  5. User can view and expand the FAQ accordion on the Contacts page with all FAQ items from the design

**Plans**: TBD
**UI hint**: yes

Plans:

- [ ] 02-01: TBD

### Phase 3: Prices & Blog

**Goal**: Users can view pricing tiers and browse the blog listing and individual posts, completing all six routes of the site.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: PRICE-01, BLOG-01, BLOG-02, BLOG-03
**Success Criteria** (what must be TRUE):

  1. User can view the Prices page at `/prices` with all pricing tiers from the design ported with `@repo/ui` components and original copy
  2. User can view the Blog listing page at `/blog` showing all 6 mock posts from the design
  3. User can view an individual Blog Post at `/blog/[slug]` with the post content from the design
  4. User navigating to a blog slug not present in the mock data sees a Not Found state

**Plans**: TBD
**UI hint**: yes

Plans:

- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Theme & Site Shell | 1/2 | In Progress|  |
| 2. Home, Contacts & Demo | 0/TBD | Not started | - |
| 3. Prices & Blog | 0/TBD | Not started | - |
</content>
