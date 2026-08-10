# Milestones

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
