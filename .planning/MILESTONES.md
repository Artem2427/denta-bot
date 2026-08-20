# Milestones

## v1.1 Platform Admin API (Shipped: 2026-08-20)

**Phases completed:** 5 phases, 24 plans, 54 tasks

**Key accomplishments:**

- Prisma 7 driver-adapter backend (packages/db + apps/server) with a working POST /auth/login tracer, recovered and closed out after a mid-plan session interrupt.
- Refresh-token rotation with atomic reuse detection, server-side logout revocation, and a fail-closed global AccessTokenGuard — completing Phase 4's full AUTH-02/03/04 requirement set on top of Plan 04-01's login tracer.
- `updatedById` trace-field migration on all 4 content models plus a fully working GET/POST/PATCH `/clinics(/:id)` NestJS resource module, with server-derived audit trail and DB-enforced email uniqueness
- Added `packages/ui`'s `Form` (react-hook-form binding) and `DataTable` (TanStack Table composition) primitives, giving every later Phase 5 CRUD screen one shared, audited form-binding and table-rendering primitive instead of 4 independent hand-rolled implementations.
- Unified Lead inbox backend (list/filter/detail/status) plus an atomic, race-safe Lead-to-Clinic conversion transaction — the phase's one genuinely new architectural pattern
- Full CRUD (incl. DELETE) for BlogPost and PricingPlan — NestJS resource modules mirroring ClinicsModule/LeadsModule's shape, closing CMS-01 and CMS-03's backend half and completing Phase 5's entire backend
- Bootstrapped `apps/platform-admin` from an untouched Vite scaffold into an authenticated SPA (React Router v7 + TanStack Query + openapi-fetch typed client) and shipped a fully working Clinics list/create/detail-with-inline-edit screen against the real backend — the phase's tracer bullet proving the entire new architecture end-to-end.
- Leads inbox (filterable by status + date range) and detail view with status transitions and a Lead-to-Clinic convert flow, wired against the real LeadsModule backend — including a live curl-verified 409 duplicate-email path and a new LeadResponseDto so the typed client actually carries real Lead field types.
- Blog Posts (full-page create/edit, JSON-only body editing, publish toggle, delete) and Pricing Plans (Dialog create/edit with a dynamic zero-or-more features list, delete) screens, wired against the real BlogPostsModule/PricingPlansModule backend — completing CMS-01 and CMS-03's frontend and all 14 of Phase 5's requirement IDs.
- Public rate-limited `POST /leads` (NestJS + `@nestjs/throttler`) wired end-to-end from both the Contacts form and a new Demo modal — the phase's tracer bullet proving the full public-write path before Plans 06-02/06-03 build the public-read side.
- New published-only public routes (`GET /public/blog-posts`, `GET /public/blog-posts/:slug`) on `apps/server`, wired end-to-end into `apps/web`'s Blog list/detail pages, replacing all mock data from `modules/blog/_data.ts` — closing CMS-02.
- New published-only public route (`GET /public/pricing-plans`) on `apps/server`, wired into `apps/web`'s Prices page — collapsing `pricing-cards.tsx`/`comparison-table.tsx`'s hardcoded, drift-prone duplicate plan data into a single fetched `PricingPlan[]` source with a derived comparison matrix — closing CMS-04.
- Manrope + JetBrains Mono fonts, 8 new additive `dt-` tokens, and 4 new CVA-based primitives (Section/Eyebrow/SectionHeading/Stat) proven end-to-end on Home's Problem/Hero sections and the Demo page's badge.
- Retrofitted PremiumButton/PremiumCard/motion.ts/form-field rings/Header/Footer/PremiumDialog/PremiumAccordion to the brief's exact coral/hairline/teal-ring/motion spec via existing `--dt-` custom properties, with zero prop/API changes.
- Migrated the remaining 5 Home page sections to the Section + SectionHeading primitives built in Plan 01, completing Home's full 7-section D-17 sweep with zero Ukrainian copy changes and Section's first real navy-tone usage (CtaBanner).
- Migrated Prices and Contacts routes to the Section/SectionHeading primitives from Plan 01, introducing the first two real consumers of `Section tone="muted"` and completing the D-21 hardcoded-color migration in contact-info.tsx's benefit chips.
- Migrated Demo and Blog routes to the Section/SectionHeading primitives and finished the bot-tab.tsx phone-frame chrome's D-22/D-23/D-04 token migration — completing the D-17 sweep on the last two of the phase's 5 routes.
- 1. [Rule 1 - Bug] Hero rewritten as a Server Component instead of a literal client-side port of `modules/home/hero.tsx`
- 1. [Rule 3 - Blocking verify false-positive] Reworded safety comment to avoid literal "deleteMany"/"truncate" substrings
- Authored all 9 remaining landing-page message namespaces (marquee/problemSolution/howItWorks/adminShowcase/features/pricing/reviews/lead/faq) in uk.json (canonical, ported from the DentaBot Landing design export) plus adapted ru.json/en.json translations, with 100% key-and-array-length parity verified across all 3 locale files.
- Channel marquee, dark-navy problem/solution comparison, static how-it-works explainer, and an admin-showcase section embedding the existing interactive bot/admin demo (emoji-free) — all wired to translation namespaces from Plan 03.
- Built the three remaining lower-page landing sections — 8-item Features grid, 3-item Reviews grid (initials-avatar only, no Unsplash), and the single consolidated 5-question FAQ accordion that resolves the Features/Reviews/FAQ near-duplicate FAQ problem from RESEARCH Pitfall 5.
- Built `modules/landing/pricing-section.tsx` (real PricingPlan[] data via prop, translated chrome only) and `modules/landing/lead-section.tsx` (single translated conversion form reusing contact-form.tsx's exact POST shape and `source: 'contacts'`), resolving D-07's single-funnel design by having every pricing CTA point to `#lead`.
- Composed the final 10-section single-page landing at `/`, `/ru`, `/en`; retired `/prices`/`/demo`/`/contacts` as working 307 redirects to landing anchors; and deleted every module file made dead by the consolidation — closing out Phase 06.2.

---

## v1.0 MVP (Shipped: 2026-08-10)

**Phases completed:** 4 phases, 12 plans, 26 tasks

**Key accomplishments:**

- Re-themed `packages/ui/styles/theme.css` with the design archive's light/dark palette (including a new `--brand: #1d6be4` token and previously-missing accordion keyframes/destructive-foreground mapping), and fixed a pre-existing `'use client'` boundary bug in `sonner.tsx` that would have broken Plan 01-02's `<Toaster />` wiring.
- Wired every `apps/web` route into a themeable shell — `next-themes` `ThemeProvider` + a scroll-aware Header (5-link nav, exact-match active state, mobile menu) + a 4-column Footer + a branded 404 — via a rewritten `apps/web/app/layout.tsx`, consuming Plan 01-01's `--brand` token and semantic-token normalization throughout.
- apps/web-scoped `dt-`-prefixed Tailwind v4 token set (navy/teal/coral/graphite palette, radius, layered shadows, type scale) plus self-hosted Inter heading/body fonts and the `motion`/`@phosphor-icons/react` dependencies, all coexisting with an untouched `packages/ui/styles/theme.css`.
- CVA-variant `PremiumButton` (coral/outline/ghost), `PremiumCard`, `Container` layout wrapper, and a local `cn()` helper — all built directly on Plan 01's `dt-` tokens with zero `@repo/ui` dependency, under `apps/web/shared/`.
- Site-wide motion utility layer — SSR-safe `useInView` IntersectionObserver hook, shared `motion.ts` easing/variant constants (D-32's `cubic-bezier(0.16, 1, 0.3, 1)`), a `Reveal` scroll-fade wrapper, and the `SignatureMark` recurring coral action-indicator — all `prefers-reduced-motion`-aware and `transform`/`opacity`-only per D-38.
- Retrofitted Phase 1's shipped shell (Logo, ThemeToggle, Header, Footer, root layout, 404 page) onto the Phase 01.1 premium `dt-` token system — Phosphor icons, `PremiumButton`, `AnimatePresence`-animated mobile menu — and completed the `apps/web/components/`+`apps/web/lib/` → `apps/web/shared/` folder move absorbed from Phase 2's stale plan.
- Home page (`/`) ported to Next.js as 6 section components on the Phase 01.1 premium `dt-` design system — Hero, Problem, Solution, Features, CTA Banner, Testimonials — with a reusable `StaggerGrid`/`StaggerItem` scroll-reveal primitive.
- react-hook-form + zod validated Contacts lead-capture form (mocked submit, inline errors, success-state swap), 8-item FAQ accordion, and 3-method contact-info column — first install of react-hook-form/zod/@hookform/resolvers in the monorepo
- Client-side scripted Telegram-bot chat simulation (premium system) plus an embedded @repo/ui admin-panel simulation, composed under a fade-crossfade Bot/Admin tab-switcher at `/demo`
- Closed both code-confirmed gaps from 02-VERIFICATION.md: StaggerGrid/StaggerItem now honor prefers-reduced-motion via useReducedMotion() (mirroring Reveal), and bot-tab.tsx's scenario retrigger guard now clears the inner 400ms setTimeout alongside the interval, closing the WR-01 stale-message leak.
- Shipped `/prices` — billing-toggle pricing grid, 14-row comparison table, 7-item FAQ, and two new premium primitives (`PremiumSwitch`, `PremiumBadge`) reused across the site.
- `apps/web/modules/blog/_data.ts` (featuredPost + 5 authored posts + `getPostBySlug`), `post-body.tsx` (content-block renderer), `related-posts.tsx`, and `apps/web/app/blog/[slug]/page.tsx` (async Server Component, awaits `params`, calls `notFound()` for unknown slugs). User approved this tracer slice via visual checkpoint before Task 2/3 proceeded.

---
