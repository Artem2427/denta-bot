---
phase: 06-apps-web-integration
verified: 2026-08-15T12:30:00Z
status: passed
score: 4/4 must-haves verified
behavior_unverified: 0
uat: 06-UAT.md (5/5 passed, 0 issues, 2026-08-15T12:55:00Z)
overrides_applied: 0
human_verification:
  - test: "Submit the Contacts form (/contacts) with a valid name+email and observe the button label/disabled state while the request is in flight, then confirm the success panel appears"
    expected: "Button reads 'Надсилаємо…' and is disabled during the request; on success the form is replaced by the 'Дякуємо!' panel"
    why_human: "form.formState.isSubmitting-driven UI and toast rendering are visual/interactive; code inspection confirms the wiring but not the rendered result"
  - test: "Trigger a 429 by submitting the Contacts or Demo form 6 times within a minute and observe the toast copy"
    expected: "Distinct 'Забагато спроб. Зачекайте хвилину і спробуйте ще раз.' toast, field values preserved, button re-enabled"
    why_human: "Toast rendering and field-preservation on failure are visual/interactive; backend 429 behavior itself was confirmed live via curl"
  - test: "Open '/demo', click 'Замовити демо', confirm PremiumDialog opens/closes correctly (ESC, overlay click, close button) and DemoLeadForm resets on reopen"
    expected: "Modal opens centered, max-w-md, close button has visible focus/labeled 'Закрити'; reopening after a successful submit shows the pre-submit form again (unmount-remount reset)"
    why_human: "Radix focus-trap/animation/unmount behavior is interactive; not verifiable via grep/curl"
  - test: "View /blog with 0, 1, and 2+ published posts (seed/unseed via platform-admin) and confirm the empty-state, hero-only, and hero+grid layouts render as specified"
    expected: "0 posts -> 'Матеріалів поки немає' block, no hero/grid; 1 post -> hero only, no grid, no 'nothing found' filter message; 2+ posts -> hero + filterable grid with line-clamped cards"
    why_human: "Zero/one/many layout branching is code-verified (page.tsx conditionals read correctly) but the rendered visual result needs an eyeball check"
  - test: "View /prices with 0, 1, 2, and 3+ published plans and confirm the empty-state CTA, card grid (centered/2-col/3-col), and comparison table (hidden below 2 plans) render as specified"
    expected: "0 plans -> 'Тарифи тимчасово недоступні' + 'Зв'язатися з нами' CTA, no cards/table; 1 -> single centered card, no table; 2 -> 2-col grid + table; 3+ -> 3-col grid + table with a row per distinct feature string"
    why_human: "Grid/table branching logic is code-verified but the rendered visual layout at each plan count needs an eyeball check"
---

# Phase 6: apps/web Integration Verification Report

**Phase Goal:** The public marketing site (`apps/web`) is wired to the real backend — Contacts/Demo submissions persist as Leads, and the Blog and Prices pages render real CMS content instead of mock data — closing the loop from Phase 5's API/screens back to the public site.
**Verified:** 2026-08-15T12:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification (post-fix state, commit `b351b1c` and later, per orchestrator's post-execution note)

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Submitting the Contacts form on `apps/web` persists a Lead via the API, tagged `source: contacts` | ✓ VERIFIED | Live: `POST /leads {name, email, source:"contacts"}` → `201` with a real Prisma-backed row (`id: cmsu3km4k00002qp0wnuzqk17`). `contact-form.tsx` calls `fetch(getClientApiUrl()+'/leads', ...)` with `source:'contacts'`, loading/disabled state (`Надсилаємо…`), 429/generic-failure toasts, field preservation on failure — all present in code. |
| 2 | Submitting the Demo form on `apps/web` persists a Lead via the API, tagged `source: demo` | ✓ VERIFIED | Live: `POST /leads {..., source:"demo"}` → `201` real row (`id: cmsu3km5a00012qp06m4qcy0p`). `demo-cta.tsx` composes `PremiumDialog`+`PremiumDialogTrigger`("Замовити демо")+`DemoLeadForm`, rendered in `app/demo/page.tsx`'s header block; `demo-lead-form.tsx` posts `source:'demo'` via the same fetch/toast pattern as Contacts. |
| 3 | `apps/web`'s Blog list and blog post detail pages render real posts fetched from the API, with `modules/blog/_data.ts` removed | ✓ VERIFIED | Live: created one draft + one published post via the real admin `POST /blog-posts` DTO; `GET /public/blog-posts` included only the published slug, excluded the draft, and never leaked `updatedById`/`createdAt`/`updatedAt`; `GET /public/blog-posts/:slug` returned `404` for the draft and `200` for the published post. `apps/web/app/blog/page.tsx`/`[slug]/page.tsx` fetch `{getServerApiUrl()}/public/blog-posts(*)`; `apps/web/modules/blog/_data.ts` confirmed deleted from the filesystem. **CR-01 fix verified live**: a post created with `body: {"blocks":[{"kind":"paragraph","text":"..."}]}` (the only shape the real `CreateBlogPostDto`'s `@IsObject()` validator allows) round-trips through `extractPostBodyBlocks()` and is no longer silently dropped to an empty body. |
| 4 | `apps/web`'s Prices page renders real pricing plans fetched from the API, replacing hardcoded data and collapsing the `pricing-cards.tsx`/`comparison-table.tsx` duplication | ✓ VERIFIED | Live: created a draft + published pricing plan via the real admin API; `GET /public/pricing-plans` returned only the published plan with least-privilege fields (no `updatedById`). `pricing-cards.tsx` takes `plans` as a prop (no local hardcoded array), reads `plan.isPopular`, checkmark uses `text-dt-teal`. `comparison-table.tsx` derives `featureRows` via `Array.from(new Set(plans.flatMap(p => p.features)))` — no hand-curated rows — and `page.tsx` gates it on `plans.length >= 2`. |

**Score:** 4/4 ROADMAP success criteria verified (0 present-but-behavior-unverified)

### Plan-Level Must-Haves (spot-checked beyond the 4 headline truths)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 5 | POST /leads is rate-limited (5/min per client, 429 beyond that) | ✓ VERIFIED | Live: 6th rapid request in the window returned `429`; `@Throttle({ default: { limit: 5, ttl: 60000 } })` + `ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])` present in code |
| 6 | Contact/Demo message field is a fixed 4-row textarea | ✓ VERIFIED | `rows={4}` in both `contact-form.tsx` and `demo-lead-form.tsx`'s `PremiumTextarea` |
| 7 | GET /leads, /blog-posts, /pricing-plans (admin, protected) unaffected by new public routes | ✓ VERIFIED | Live: all three returned `401` without a Bearer token during this verification run |
| 8 | Blog card title/excerpt line-clamped | ✓ VERIFIED | `line-clamp-2`/`line-clamp-3` present in `blog-filters.tsx` |
| 9 | Blog/Prices fetch failures render dedicated `error.tsx` boundaries | ✓ VERIFIED | `apps/web/app/blog/error.tsx` and `apps/web/app/prices/error.tsx` both exist, `'use client'`, matching heading/body/`Оновити` copy |
| 10 | GET /public/blog-posts orders by `createdAt desc, id desc` tie-break | ✓ VERIFIED | `orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]` in `blog-posts.service.ts` |
| 11 | `CreateLeadDto` never accepts `status`/`updatedById`/`clinicId` | ✓ VERIFIED | Fields not declared on the DTO; global `ValidationPipe({ forbidNonWhitelisted: true })` strips/rejects them |
| 12 | Blog slug is URL-encoded before use in the detail-page fetch (WR-01 fix) | ✓ VERIFIED | `fetch(\`${apiUrl}/public/blog-posts/${encodeURIComponent(slug)}\`, ...)` in `app/blog/[slug]/page.tsx` |
| 13 | `CreateLeadDto`'s email/phone validation no longer silently skips all checks when both are present (CR-02 fix) | ✓ VERIFIED | Live: `{"phone":"1234567","email":{"foo":"bar"}}` now returns `400` (`email must be an email`) instead of an unhandled 500; `email`/`phone` unconditionally decorated with `@IsOptional() @IsEmail()/@IsString() @MaxLength(...)`; the "at least one required" rule moved to `LeadsService.create()` |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/server/src/leads/dto/create-lead.dto.ts` | Public Lead input contract | ✓ VERIFIED | Present, substantive, matches spec (post-fix: `@IsEmail`/`@MaxLength` unconditional) |
| `apps/web/shared/components/premium-dialog.tsx` | Reusable Dialog primitive | ✓ VERIFIED | `PremiumDialog`/`Trigger`/`Content`/`Title` exported, dt-* tokens, `aria-label="Закрити"` |
| `apps/web/modules/demo/demo-lead-form.tsx` | Demo modal lead form | ✓ VERIFIED | Present, wired, `source:'demo'` |
| `apps/web/shared/lib/api-url.ts` | Backend base-URL convention | ✓ VERIFIED | `getServerApiUrl()`/`getClientApiUrl()`, consumed by all three plans |
| `apps/server/src/blog-posts/public-blog-posts.controller.ts` | Public Blog reads | ✓ VERIFIED | Class-level `@Public()`, `GET /`, `GET /:slug`, delegates to service |
| `apps/web/modules/blog/types.ts` | Post/PostBodyBlock types decoupled from mock data | ✓ VERIFIED | Present; also now exports `extractPostBodyBlocks()` (post-fix addition, not in original plan but required to close CR-01) |
| `apps/server/src/pricing-plans/public-pricing-plans.controller.ts` | Public Pricing reads | ✓ VERIFIED | Class-level `@Public()`, `GET /`, delegates to `findAllPublished()` |
| `apps/web/modules/prices/types.ts` | Shared PricingPlan type | ✓ VERIFIED | Present, matches `pricing-cards.tsx`/`comparison-table.tsx` usage |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `contact-form.tsx` | `LeadsController` | `fetch POST {getClientApiUrl()}/leads` | ✓ WIRED | Live 201 confirmed |
| `demo-lead-form.tsx` | `LeadsController` | `fetch POST {getClientApiUrl()}/leads`, `source:'demo'` | ✓ WIRED | Live 201 confirmed |
| `LeadsController` | `LeadsService` | `leadsService.create(dto)` | ✓ WIRED | Present, and now includes the email-or-phone guard |
| `app/demo/page.tsx` | `demo-cta.tsx` | composed in header block | ✓ WIRED | `<DemoCta />` present before `DemoTabs` |
| `app/blog/page.tsx` | `PublicBlogPostsController` | `fetch {getServerApiUrl()}/public/blog-posts` | ✓ WIRED | Live 200 confirmed, published-only |
| `app/blog/[slug]/page.tsx` | `PublicBlogPostsController` | `fetch {getServerApiUrl()}/public/blog-posts/:slug` | ✓ WIRED | Live 200/404 confirmed |
| `PublicBlogPostsController` | `BlogPostsService` | `findAllPublished()`/`findPublishedBySlug()` | ✓ WIRED | Live draft/published round-trip confirmed |
| `app/prices/page.tsx` | `PublicPricingPlansController` | `fetch {getServerApiUrl()}/public/pricing-plans` | ✓ WIRED | Live 200 confirmed, published-only |
| `PublicPricingPlansController` | `PricingPlansService` | `findAllPublished()` | ✓ WIRED | Live draft/published round-trip confirmed |
| `app/prices/page.tsx` | `comparison-table.tsx` | `plans` prop, `plans.length >= 2` gate | ✓ WIRED | `{plans.length >= 2 && <ComparisonTable plans={plans} />}` present |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `app/blog/page.tsx` | `posts` | `fetch(.../public/blog-posts)` → Prisma `findMany` | Yes (live-verified) | ✓ FLOWING |
| `app/blog/[slug]/page.tsx` | `post`, `allPosts`, `blocks` | `fetch(.../public/blog-posts/:slug)` + `extractPostBodyBlocks()` | Yes (live-verified, incl. real body content round-trip) | ✓ FLOWING |
| `app/prices/page.tsx` | `plans` | `fetch(.../public/pricing-plans)` → Prisma `findMany` | Yes (live-verified) | ✓ FLOWING |
| `contact-form.tsx`/`demo-lead-form.tsx` | POST body | `react-hook-form` values → `fetch` body | Yes (live-verified, Lead rows created) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| POST /leads creates a real Lead (contacts) | live curl against running `apps/server` (Postgres via docker-compose) | `201`, real `id`, row visible via subsequent admin query pattern | ✓ PASS |
| POST /leads creates a real Lead (demo) | same, `source:'demo'` | `201`, real `id` | ✓ PASS |
| POST /leads rejects missing email+phone | curl, no email/phone | `400` | ✓ PASS |
| POST /leads rate-limits at 5/min | 6 rapid requests | `429` on 5th/6th | ✓ PASS |
| GET /leads, /blog-posts, /pricing-plans still protected | curl, no auth header | `401` on all three | ✓ PASS |
| Draft content never leaks via public routes | admin-create draft+published, then public GET | draft absent from list, `404` on direct slug/detail lookup | ✓ PASS |
| CR-01 regression: real admin-DTO body renders | admin-create post with `{"blocks":[...]}` body, fetch via public detail route | `extractPostBodyBlocks()` returns non-empty array | ✓ PASS |
| CR-02 regression: malformed email w/ phone present | curl `{"phone":"1234567","email":{"foo":"bar"}}` | `400` (was previously an unhandled 500) | ✓ PASS |
| `pnpm --filter web exec tsc --noEmit` | tsc | Zero new errors (only the pre-existing, documented `packages/ui/button-group.tsx` csstype conflict) | ✓ PASS |
| `apps/server`'s existing Jest suite (`leads.service.spec.ts`) | `pnpm --filter server test -- leads.service.spec.ts` | 4/4 passed, no regression | ✓ PASS |
| `pnpm --filter server run build` | `nest build` | Clean build | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| LEAD-01 | 06-01 | Contacts-form submission persisted as a Lead | ✓ SATISFIED | Live `POST /leads` 201, `contact-form.tsx` wired |
| LEAD-02 | 06-01 | Demo-form submission persisted as a Lead | ✓ SATISFIED | Live `POST /leads` (source=demo) 201, `demo-lead-form.tsx`/`demo-cta.tsx` wired |
| CMS-02 | 06-02 | Blog list/detail render real posts, `_data.ts` removed | ✓ SATISFIED | Live published-only round trip; `_data.ts` deleted; CR-01 fix confirmed live |
| CMS-04 | 06-03 | Prices page renders real plans, hardcoded/duplicated data removed | ✓ SATISFIED | Live published-only round trip; `pricing-cards.tsx`/`comparison-table.tsx` share one fetched source |

**Note:** `.planning/REQUIREMENTS.md`'s checkbox list and requirement-status table still show LEAD-01/LEAD-02/CMS-02/CMS-04 as unchecked/"Pending" as of this verification — this is a **documentation-sync gap**, not a functional gap. The underlying code satisfies all four requirements per the live testing above. Recommend updating REQUIREMENTS.md's checkboxes/status table to "Complete" as part of phase close-out.

No orphaned requirements found — all four IDs declared in the three plans' frontmatter match exactly the four requirements ROADMAP.md maps to Phase 6.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any of the 25 phase-touched files | — | None |

**Open (non-blocking) findings from `06-REVIEW.md`, left unfixed by design** (only CR-01/CR-02/WR-01 were required to close before shipping, per the post-execution note):
- WR-02 (partial): `name`/`clinicName`/`message` on `CreateLeadDto` still lack `@MaxLength` (unbounded string DoS risk on a public endpoint) — `email`/`phone` were hardened as part of the CR-02 fix, but this wasn't extended to the remaining fields.
- WR-03: Blog category filter list (`blog-filters.tsx`) is still a hardcoded 4-category constant, disconnected from real CMS `category` values — an admin-authored post with a novel category becomes unreachable via any filter button. Cosmetic/UX gap, not a data-integrity issue.
- WR-04/WR-05: Production hardening items (env-var fallback safety, `trust proxy` for accurate rate-limit keying) — explicitly deployment-topology concerns, out of scope for a milestone that ships no production infra yet.
- IN-01/02/03: minor duplication/Swagger-doc/React-key nits, no functional impact.

These do not block the phase goal (real backend wiring + CMS content rendering) and were consciously scoped out of the required fix set.

## Human Verification Required

5 items need human testing — all are visual/interactive UI states that code inspection and live API testing cannot directly observe in a browser (see frontmatter `human_verification` for full detail):

1. **Contacts form loading/success UI** — submit with valid data, observe button label/disabled state and success panel.
2. **429 rate-limit toast** — trigger 6 rapid submissions, observe the distinct toast copy and field preservation.
3. **Demo modal open/close** — click "Замовити демо", verify Radix Dialog open/close/reset behavior.
4. **Blog zero/one/many layout** — view `/blog` with 0, 1, and 2+ published posts.
5. **Prices zero/one/two/three+ layout** — view `/prices` with 0, 1, 2, and 3+ published plans.

## Gaps Summary

No blocking gaps. Both BLOCKER-severity findings from `06-REVIEW.md` (CR-01: blog body never renders due to array-vs-object DTO mismatch; CR-02: `CreateLeadDto` silently skipped all email/phone validation when both fields were present) were verified as genuinely fixed in commit `b351b1c` — confirmed via live round-trip testing against a running `apps/server` + Postgres, not just code inspection. WR-01 (slug URL-encoding) was also confirmed fixed. All four ROADMAP success criteria and all four requirement IDs (LEAD-01, LEAD-02, CMS-02, CMS-04) are satisfied by the current codebase.

The only outstanding item is a documentation-sync gap: `.planning/REQUIREMENTS.md` has not been updated to reflect Phase 6's completion (still shows "Pending"/unchecked for all four IDs). This should be corrected but does not represent a functional gap in the phase goal.

Status was initially `human_needed` rather than `passed` solely because several UI/UX behaviors (loading states, modal interaction, toast copy, responsive grid/empty-state layouts) are inherently visual and were verified only by code inspection, not by rendering in a browser — per the verification process's mandatory human-verification triggers for visual/interactive behavior.

## Addendum — human verification closed (2026-08-20)

All five human-verification items listed in this report's frontmatter were run through conversational UAT on 2026-08-15 and recorded in `06-UAT.md`: `status: complete`, total 5, **passed 5, issues 0**, no gaps. Status updated `human_needed` → `passed` at v1.1 milestone close; no code changes were required to close them.

---

_Verified: 2026-08-15T12:30:00Z_
_Verifier: Claude (gsd-verifier)_
