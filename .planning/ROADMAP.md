# Roadmap: denta-bot Marketing Site (apps/web)

## Overview

Replace `apps/web`'s default create-turbo starter with the real six-page marketing site migrated from the Figma-exported design archive, built on the monorepo's shared `@repo/ui` component library. Work proceeds foundation-first: re-theme `@repo/ui` and stand up the shared header/footer/theme-toggle/404 shell before any page content lands, so every subsequent page inherits the correct look and navigation from day one. Pages then land in business-priority order — Home (primary landing), Contacts & Demo (lead-gen forms and interactivity), then Prices and Blog (remaining content) — ending with all six routes rendered faithfully against mock data, production-shaped but backend-free.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Theme & Site Shell** - Re-theme `@repo/ui` with the design's tokens and stand up the shared header/footer/theme-toggle/404 layout used by every page (completed 2026-08-08)
- [x] **Phase 2: Home, Contacts & Demo** - Ship the Home landing page plus the two lead-gen surfaces (Contacts form, Demo chat simulation) (completed 2026-08-09)
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

**Plans**: 2/2 plans executed
**UI hint**: yes

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Re-theme `@repo/ui` design tokens (`--brand` + design archive palette), fix `sonner.tsx` client boundary, close out THEME-02 shadcn-primitive audit

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Build Logo/ThemeToggle/Header/Footer/Not-Found and wire `next-themes` + shell into the root layout

### Phase 01.1: Premium Design System (apps/web) (INSERTED)

**Goal:** Establish a bespoke premium visual system for the marketing site (`apps/web`) per the client's new ТЗ — own color palette, typography, spacing/shadow/radius scale, motion/animation primitives, icon system — scoped to `apps/web` only, with Phase 1's shipped shell (header/footer/logo/theme-toggle) retrofitted onto it. `packages/ui` (and its consumers — `apps/admin-panel` and the Demo page's embedded admin-panel simulation) stays on the existing theme; this phase does not touch it. This phase builds the design-system layer only — no page content (Home/Contacts/Demo/Prices/Blog) ships here.
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03
**Depends on:** Phase 1
**Plans:** 4/4 plans complete

Plans:

**Wave 1**

- [x] 01.1-01-PLAN.md — Package Legitimacy Gate (motion, @phosphor-icons/react) + install + `dt-` premium token system (colors/radius/shadows/type scale) + self-hosted Inter heading/body fonts

**Wave 2** *(parallel, both depend on Wave 1)*

- [x] 01.1-02-PLAN.md — Premium UI primitives: `PremiumButton`, `PremiumCard`, `Container`, local `cn()` helper
- [x] 01.1-03-PLAN.md — Motion/scroll-reveal utilities: `useInView`, `motion.ts` constants, `Reveal`, `SignatureMark`

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01.1-04-PLAN.md — Shell rebuild (Logo/ThemeToggle/Header/Footer/Not-Found/root layout) on the premium system + `apps/web/components/`+`apps/web/lib/` → `apps/web/shared/` folder move

### Phase 2: Home, Contacts & Demo

**Goal**: Users can view the Home landing page and complete the two primary lead-gen actions — request a demo via the scripted chat simulation and submit a contact inquiry with validated feedback.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: HOME-01, DEMO-01, DEMO-02, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):

  1. User can view the Home page at `/` with all sections from the design (hero, features, etc.) ported with the Phase 01.1 premium design system components and the original Ukrainian copy
  2. User can view the Demo page at `/demo`, interact with the scripted chat-bot simulation, and switch between dashboard sections as in the design (client-side, local state, no real API)
  3. User can fill and submit the Contacts form (name, clinic, contact, message) with `react-hook-form` + `zod` validation, seeing inline field errors for invalid input
  4. User sees a mocked success confirmation after submitting a valid Contacts form (no real backend call)
  5. User can view and expand the FAQ accordion on the Contacts page with all FAQ items from the design

**Plans**: 4/4 plans executed
**UI hint**: yes

Plans:

- [x] 02-04-PLAN.md

**Wave 1** *(all 3 independent — Home, Contacts, Demo touch disjoint files, no shared-infra dependency this phase)*

- [x] 02-01-PLAN.md — Home page: Hero/Problem/Solution/Features/CtaBanner/Testimonials on the premium design system
- [x] 02-02-PLAN.md — Contacts page: react-hook-form + zod validated lead form, contact-info cards, FAQ accordion
- [x] 02-03-PLAN.md — Demo page: scripted Telegram-bot chat simulation + admin-panel simulation

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

**Plans**: 1/2 plans executed
**UI hint**: yes

Plans:

**Wave 1**

- [x] 03-01-PLAN.md — Prices page: billing toggle, 3-tier pricing grid, PremiumSwitch/PremiumBadge primitives, comparison table, FAQ, closing CTA

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-02-PLAN.md — Blog: listing + detail + not-found, functional search/category filters, 6 posts with real body content

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Theme & Site Shell | 2/2 | Complete    | 2026-08-08 |
| 2. Home, Contacts & Demo | 4/4 | Complete    | 2026-08-09 |
| 3. Prices & Blog | 1/2 | In Progress|  |
</content>
