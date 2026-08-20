---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Platform Admin API
current_phase: 6
current_phase_name: apps/web Integration
status: planning
stopped_at: Completed quick task 260820-eyj (converted all 27 text-dt-{size} usages to direct Tailwind arbitrary values; removed dead premium-theme.css tokens)
last_updated: "2026-08-20T08:15:00.000Z"
last_activity: 2026-08-20
last_activity_desc: "Completed quick task 260820-eyj: converted every text-dt-{h1,h2,h3,body,caption,eyebrow} usage (15 files) to direct Tailwind arbitrary-value classes per user preference; removed the six now-dead --text-dt-* custom properties from premium-theme.css; cn.ts's defensive fix (260820-enw) stays in place"
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 24
  completed_plans: 24
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-10)

**Core value:** A real NestJS + Prisma backend feeds `apps/platform-admin` (clinic/lead/content monitoring) and the site's CMS-backed content, so denta-bot staff can operate on real data instead of hardcoded fixtures.
**Current focus:** Phase 06.2 — single-page-landing-consolidation-i18n-apps-web-collapse-hom

## Current Position

Phase: 6 — apps/web Integration
Plan: Not started
Status: Ready to plan
Last activity: 2026-08-20 - Completed quick task 260820-eyj: converted all text-dt-{size} usages sitewide to direct Tailwind arbitrary values

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 28
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 01.1 | 4 | - | - |
| 02 | 4 | - | - |
| 3 | 2 | - | - |
| 04 | 2 | - | - |
| 05 | 7 | - | - |
| 06.2 | 7 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 8min | 2 tasks | 2 files |
| Phase 01 P02 | 10min | 3 tasks | 9 files |
| Phase 03 P01 | 25min | 3 tasks | 7 files |
| Phase 03 P02 | 20min | 3 tasks | 6 files |
| Phase 04 P02 | 50min | 2 tasks | 10 files |
| Phase 06.2 P01 | 45min | 2 tasks | 20 files |
| Phase 06.2 P02 | 12min | 2 tasks | 2 files |
| Phase 06.2 P03 | 12min | 2 tasks | 3 files |
| Phase 06.2 P04 | 5min | 3 tasks | 6 files |
| Phase 06.2 P05 | 15min | 3 tasks | 3 files |
| Phase 06.2 P06 | 6min | 2 tasks | 3 files |
| Phase 06.2 P07 | ~35min (Tasks 2-3, this session) | 3 tasks | 33 files |
| Phase quick P260820-1oe | 8min | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Full v1.0 decision log archived in PROJECT.md Key Decisions table (all marked ✓ Good or Superseded post-milestone-review) and `.planning/milestones/v1.0-ROADMAP.md`.

v1.1 roadmap-level decisions:

- Merged research's suggested "Prisma foundation" + "server core + Auth" phases into one Phase 4 — both are pure backend/API work with no independent user-observable milestone between them
- Merged research's suggested "Clinics/Leads/Content CRUD modules" + "platform-admin data layer/screens" phases into one Phase 5 — splitting API-only CRUD from the screens that consume it would have left the screens phase with a single unique requirement (INFRA-04), violating the single-requirement-phase anti-pattern; PlatformAdmin's "can view/create/edit" requirements are only truly observable once the actual `apps/platform-admin` screens exist
- LEAD-01/LEAD-02 (Contacts/Demo submissions persisting) and CMS-02/CMS-04 (`apps/web` rendering real data) assigned to Phase 6, not Phase 5 — these requirements describe `apps/web`-side behavior that only becomes true once the marketing site's existing mocked handlers are rewired, not when the backend endpoint alone exists
- [Phase 04]: Plan 04-02: Registered RefreshTokenStrategy in auth.module.ts during Task 1 (ahead of Task 2's planned registration) — required for Passport to resolve the 'jwt-refresh' strategy at all
- [Phase 04]: Plan 04-02: Embedded email in the access-token JWT payload (issueTokenPair signature extended) — GET /auth/me needs the admin's email, which Plan 04-01's token payload didn't carry
- [Phase 04]: Plan 04-02: AuthResponseDto.platformAdmin made optional — POST /refresh omits it (no re-fetch needed), POST /login still returns it
- [Phase ?]: [Phase 06.2] Plan 06.2-01: Hero/Footer rewritten as Server Components (getTranslations) instead of client components (useTranslations) — Task 1's [locale]/layout.tsx intentionally has no NextIntlClientProvider until Task 2's root layout, so client components using useTranslations() would 500 until Task 2 ran
- [Phase ?]: [Phase 06.2] Plan 06.2-01: Added footer.hoursLabel/hoursValue translation keys beyond the plan's literal namespace list, per the task's own 'wire every string through useTranslations' instruction
- [Phase ?]: [Phase 06.2] Plan 06.2-02: Reworded seed-pricing.ts's safety comment to avoid literal 'deleteMany'/'truncate' substrings — the plan's own verify grep was false-positive-matching its own safety documentation text
- [Phase ?]: [Phase 06.2] Plan 06.2-03: marquee.channels kept byte-identical across uk/ru/en (channel/brand names, not translated); features namespace drops design's numeric mark field (Plan 05 uses Phosphor icons per index instead); lead namespace field labels/errors reuse contact-form.tsx's existing Ukrainian strings verbatim so Wave 3 can rewire to useTranslations() with zero copy drift
- [Phase ?]: [Phase 06.2] Plan 06.2-04: admin-showcase.tsx embeds existing DemoTabs inside a browser-chrome frame wrapper (not a static screenshot) — resolves CONTEXT.md's 'Claude's Discretion' interactive-demo-vs-screenshot question in favor of the already-built simulation
- [Phase ?]: [Phase 06.2] Plan 06.2-04: id="demo" moved to admin-showcase.tsx (not how-it-works.tsx) — Header/Footer's #demo anchor now targets the interactive bot/admin simulation, matching user expectation of what 'Демо' should scroll to
- [Phase ?]: [Phase 06.2] Plan 06.2-05: faq.tsx built as an async Server Component (getTranslations), not client — matches sibling landing modules' established interactive-vs-static split; PremiumAccordion's Radix internals already carry their own client boundary
- [Phase ?]: [Phase 06.2] Plan 06.2-05: features.tsx maps the SAME icon array [ChatCircleText,Calendar,Bell,ChartBar,Star,Gear,Users,Check] index-for-index onto t.raw('items') per the plan's literal ordering instruction, even though the plan's own concept-list rationale text doesn't 1:1 match past index 4
- [Phase ?]: [Phase 06.2] Plan 06.2-06: pricing-section.tsx uses a single LEAD_ANCHOR='#lead' constant for every plan CTA rather than inline literals, keeping the D-07 single-funnel target in one place
- [Phase ?]: [Phase 06.2] Plan 06.2-06: lead-section.tsx reuses t('lead.submitLabel') for the post-submission 'send another' button — the plan-03-authored lead namespace has no separate key and the task instructed sourcing all copy from the existing namespace only
- [Phase ?]: [Phase 06.2] Plan 06.2-07: Relocated modules/home/stagger-grid.tsx to shared/components/stagger-grid.tsx instead of deleting it — active cross-page dependency in 5 files (modules/landing + modules/blog), not Home-page-only dead code
- [Phase ?]: [Phase 06.2] Plan 06.2-07: Fixed proxy.ts next-intl middleware matcher to exclude /prices, /demo, /contacts alongside /blog — without this the new redirect stubs 404'd instead of redirecting
- [Phase ?]: Reviews carousel: kept plan's literal px-4 lg:px-8 edge padding (not a calc()-based pixel-perfect alignment) per plan's explicit action+verify; causes an 80px left-edge misalignment vs heading at viewports >1280px — documented as a known limitation, not fixed inline

### Pending Todos

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260809-jis | Fix card height misalignment in Home sections (Problem/Features/Testimonials) — h-full on StaggerItem + PremiumCard | 2026-08-09 | 38a5265 | [260809-jis-fix-card-height-misalignment-in-home-sec](./quick/260809-jis-fix-card-height-misalignment-in-home-sec/) |
| 260809-jr2 | Restore missing content in Home Solution section — heading, card wrapper, per-step subtext, CTA arrow icon | 2026-08-09 | 1975e35 | [260809-jr2-restore-missing-content-structure-in-hom](./quick/260809-jr2-restore-missing-content-structure-in-hom/) |
| 260809-k1r | Add one-line description to each of the 8 Features cards on Home | 2026-08-09 | 52180c8 | [260809-k1r-add-a-one-line-description-under-each-of](./quick/260809-k1r-add-a-one-line-description-under-each-of/) |
| 260809-kcz | Fix 3 BLOCKER findings from 02-UI-REVIEW.md — fluid h1/h2 tokens + overflow-x-hidden, hero image swap, idle bounce on notification card | 2026-08-09 | f83b51a | [260809-kcz-fix-3-blocker-findings-from-02-ui-review](./quick/260809-kcz-fix-3-blocker-findings-from-02-ui-review/) |
| 260809-v35 | Tune idle bounce animation on hero notification card — faster, bigger amplitude, EASE_DT_EXPO_OUT | 2026-08-09 | a0f23a0 | [260809-v35-tune-idle-bounce-animation-on-hero-notif](./quick/260809-v35-tune-idle-bounce-animation-on-hero-notif/) |
| 260809-v68 | Remove double-padding gaps between adjacent Home/Contacts sections — halved py-16/lg:py-24 across 7 sections | 2026-08-09 | 999fc6d | [260809-v68-remove-double-padding-gaps-between-adjac](./quick/260809-v68-remove-double-padding-gaps-between-adjac/) |
| 260809-vac | Switch idle bounce ease to spring/overshoot EASE_DT_BOUNCE curve for a more physical bounce feel | 2026-08-09 | bf5b359 | [260809-vac-switch-idle-bounce-animation-ease-to-a-s](./quick/260809-vac-switch-idle-bounce-animation-ease-to-a-s/) |
| 260809-vcj | Add count-up animation to Home hero stats (500+/15 000+/98%) — new useCountUp hook, animates on first load | 2026-08-09 | 713d8b1 | [260809-vcj-add-count-up-animation-to-the-3-hero-sta](./quick/260809-vcj-add-count-up-animation-to-the-3-hero-sta/) |
| 260810-ddh | Add unified-source-of-truth admin highlight block to Home page (bot+manual booking single core, role-based access, created_via analytics) | 2026-08-10 | 2b2af6c | [260810-ddh-add-a-new-dedicated-highlight-block-to-t](./quick/260810-ddh-add-a-new-dedicated-highlight-block-to-t/) |
| 260819-oyk | Make [locale] the true top-level route wrapper for apps/web — moved /blog, /prices, /demo, /contacts inside app/[locale]/, fixed LocaleSwitcher to preserve current pathname (rebuilt as a flag dropdown), fixed Header's Blog link to be locale-aware | 2026-08-19 | 89c6c11 | [260819-oyk-make-locale-the-true-top-level-route-wra](./quick/260819-oyk-make-locale-the-true-top-level-route-wra/) |
| 260820-1bb | Match --text-dt-h2 fluid token (font-size clamp, line-height, letter-spacing) to reference design's exact devtools-inspected computed style; section-heading.tsx bumped to font-extrabold | 2026-08-20 | 0c69e50 | [260820-1bb-make-all-section-heading-h2-font-sizes-r](./quick/260820-1bb-make-all-section-heading-h2-font-sizes-r/) |
| 260820-1r2 | Dedupe lead-section.tsx's inline eyebrow+h2+description block into the shared SectionHeading component (tone=navy) | 2026-08-20 | 80b634f | [260820-1r2-apps-web-modules-landing-lead-section-ts](./quick/260820-1r2-apps-web-modules-landing-lead-section-ts/) |
| 260820-1oe | Reviews carousel made full-bleed (carousel breaks out of Container, heading stays capped); shadow-clipping fix restructured to genuinely-additive pt-6/pb-16 (no negative-margin cancellation) | 2026-08-20 | e85533f | [260820-1oe-reviews-carousel-apps-web-modules-landin](./quick/260820-1oe-reviews-carousel-apps-web-modules-landin/) |
| 260820-csp | Reviews carousel card width changed from responsive percentage flex-basis to fixed 300px | 2026-08-20 | e7ef909 | [260820-csp-reviews-tsx-change-each-carousel-card-s-](./quick/260820-csp-reviews-tsx-change-each-carousel-card-s-/) |
| 260820-csn | Restored section-heading.tsx (stale editor buffer had reverted font-extrabold→font-bold, dropped max-w-2xl); eyebrow.tsx on-navy tone changed to text-dt-coral matching reference design | 2026-08-20 | c7d4285 | [260820-csn-fix-section-heading-tsx-stale-editor-buf](./quick/260820-csn-fix-section-heading-tsx-stale-editor-buf/) |
| 260820-cz1 | Land two already-verified uncommitted edits: --text-dt-body 1.125rem->1rem, lead-section.tsx import reorder | 2026-08-20 | 6e8a0e8 | [260820-cz1-land-two-already-made-verified-uncommitt](./quick/260820-cz1-land-two-already-made-verified-uncommitt/) |
| 260820-enw | Root-cause fix: cn.ts registers text-dt-{h1,h2,h3,body,caption,eyebrow} into tailwind-merge's font-size classGroup — fixes sitewide silent-drop of every size class combined with a color class in one cn() call | 2026-08-20 | 0d44f03 | [260820-enw-root-cause-fix-apps-web-shared-lib-cn-ts](./quick/260820-enw-root-cause-fix-apps-web-shared-lib-cn-ts/) |
| 260820-eyj | Converted all 27 text-dt-{h1,h2,h3,body,caption,eyebrow} usages (15 files) to direct Tailwind arbitrary-value classes; removed dead --text-dt-* tokens from premium-theme.css; cn.ts fix (260820-enw) kept as defense-in-depth | 2026-08-20 | a0991f5 | [260820-eyj-convert-every-text-dt-h1-h2-h3-body-capt](./quick/260820-eyj-convert-every-text-dt-h1-h2-h3-body-capt/) |

### Blockers/Concerns

Open items carried into v1.1 (see PROJECT.md "Active" for full detail):

- csstype@3.1.3/3.2.3 duplicate-resolution conflict blocking a clean `pnpm --filter web build` — open since Phase 1, unrelated to any phase's own changes
- 8 non-blocking code-review warnings from `03-REVIEW.md` (Phase 3) — pricing badge accuracy, accessibility, dead-end buttons by design, related-posts relevance logic, comparison-table data duplication
- Production domain/subdomain topology for `apps/web` and `apps/platform-admin` is undecided — needed before Phase 4 finalizes refresh-token cookie `SameSite` config (flagged in research/SUMMARY.md)
- `apps/server`'s Node engine floor (`>=18` at root) is below Prisma 7's requirement (`>=20.19.0`) — manifest fix needed early in Phase 4, not a real blocker since local dev already runs Node 22

### Roadmap Evolution

v1.0 roadmap evolution history archived in `.planning/milestones/v1.0-ROADMAP.md`.

- 2026-08-10: v1.1 roadmap created — Phases 4 (Backend Foundation & Auth), 5 (Clinic, Lead & Content Management), 6 (apps/web Integration). 25/25 v1 requirements mapped (REQUIREMENTS.md's stated "23 total" summary was stale against its own 25-row traceability table; corrected during roadmap creation).
- Phase 06.1 inserted after Phase 6: Premium Visual Restyle (apps/web) — client-directed urgent visual restyle to premium look before further backend integration work (URGENT)
- Phase 06.1 completed: Premium Visual Restyle (apps/web) shipped 2026-08-18 — 5 plans + 2 gap-closure commits (emoji removal per client's no-emoji constraint), gsd-verifier confirmed 16/16 truths
- Phase 06.2 inserted after Phase 6: Single-Page Landing Consolidation + i18n (apps/web) — client-directed pivot: collapse Home/Prices/Contacts/Demo into one scrolling landing page, copy sourced from DentaBot Landing design export; add uk/ru/en URL-based locale routing; Blog stays the only other route (URGENT)

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Dark mode (THEME-03 regression) | Premium `apps/web` site has no dark-mode `dt-*` token values; `ThemeToggle` removed from Header in Phase 01.1's code-review fix. `apps/web/shared/components/theme-toggle.tsx` still exists, unused. Needs a decision: design dark `dt-*` values and re-wire, or formally drop dark mode for the premium site this milestone. | Deferred — explicit user decision (2026-08-09): "skip for now" | Phase 01.1 |
| csstype dependency conflict | `pnpm --filter web check-types`/`build`'s `tsc` step fails on a pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict confined to `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` — surfaced identically across every Phase 01.1/2/3 plan's verify step, confirmed unrelated to any file any plan created/modified. Requires a monorepo-wide `pnpm.overrides` fix. | Acknowledged at v1.0 milestone close (2026-08-10) — does not block any shipped page; recommended before/during next milestone | Phase 1 (first seen), open through v1.0 close |

## Session Continuity

Last session: 2026-08-20T06:23:42.466Z
Stopped at: Completed quick task 260820-cz1 (landed --text-dt-body 1rem fix + lead-section.tsx import reorder)
Resume file: None

Next: /gsd-plan-phase 06.2 — plan Phase 06.2 (Single-Page Landing Consolidation + i18n)

## Operator Next Steps

- Run /gsd-plan-phase 06.2 to create the detailed plan for Phase 06.2 (urgent insertion, precedes Phase 4)
- Run /gsd-plan-phase 4 to create the detailed plan for Phase 4 (Backend Foundation & Auth) once 06.2 ships
