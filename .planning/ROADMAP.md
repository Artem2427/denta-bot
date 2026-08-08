# Roadmap: denta-bot Marketing Site (apps/web)

## Overview

Replace `apps/web`'s default create-turbo starter with the real six-page marketing site migrated from the Figma-exported design archive, built on the monorepo's shared `@repo/ui` component library. Work proceeds foundation-first: re-theme `@repo/ui` and stand up the shared header/footer/theme-toggle/404 shell before any page content lands, so every subsequent page inherits the correct look and navigation from day one. Pages then land in business-priority order — Home (primary landing), Contacts & Demo (lead-gen forms and interactivity), then Prices and Blog (remaining content) — ending with all six routes rendered faithfully against mock data, production-shaped but backend-free.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Theme & Site Shell** - Re-theme `@repo/ui` with the design's tokens and stand up the shared header/footer/theme-toggle/404 layout used by every page (completed 2026-08-08)
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
**Plans:** 4 plans

Plans:

**Wave 1**

- [ ] 01.1-01-PLAN.md — Package Legitimacy Gate (motion, @phosphor-icons/react) + install + `dt-` premium token system (colors/radius/shadows/type scale) + self-hosted Inter heading/body fonts

**Wave 2** *(parallel, both depend on Wave 1)*

- [ ] 01.1-02-PLAN.md — Premium UI primitives: `PremiumButton`, `PremiumCard`, `Container`, local `cn()` helper
- [ ] 01.1-03-PLAN.md — Motion/scroll-reveal utilities: `useInView`, `motion.ts` constants, `Reveal`, `SignatureMark`

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01.1-04-PLAN.md — Shell rebuild (Logo/ThemeToggle/Header/Footer/Not-Found/root layout) on the premium system + `apps/web/components/`+`apps/web/lib/` → `apps/web/shared/` folder move

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

**Plans**: 4 plans
**UI hint**: yes

Plans:

**Wave 1** *(foundational — folder-structure move required before Wave 2's page plans can build)*

- [ ] 02-04-PLAN.md — Restructure `apps/web` into the three-layer convention (`app/` routes-only, `shared/` cross-page code, `modules/<page>/` page-scoped code): relocate Phase 1's `components/`/`lib/` into `shared/`, update `layout.tsx`/`not-found.tsx` imports

**Wave 2** *(all 3 page plans are independent vertical slices — parallel, depend on 02-04)*

- [ ] 02-01-PLAN.md — Home page (`/`): Hero, Problem, Solution, Features, CTA Banner, Testimonials sections, Unsplash images via next/image
- [ ] 02-02-PLAN.md — Demo page (`/demo`): scripted Bot-tab chat simulation + Admin-tab panel switcher, typed mock data module (`apps/web/modules/demo/_data.ts`)
- [ ] 02-03-PLAN.md — Contacts page (`/contacts`): react-hook-form + zod validated lead form, mocked confirmation, FAQ accordion (includes a blocking Package Legitimacy checkpoint before installing react-hook-form/zod/@hookform/resolvers)

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
| 1. Theme & Site Shell | 2/2 | Complete    | 2026-08-08 |
| 2. Home, Contacts & Demo | 0/3 | Not started | - |
| 3. Prices & Blog | 0/TBD | Not started | - |
</content>
