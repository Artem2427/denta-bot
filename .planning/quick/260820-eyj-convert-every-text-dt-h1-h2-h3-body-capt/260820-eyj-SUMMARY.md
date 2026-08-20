---
phase: quick
plan: 260820-eyj
subsystem: ui
tags: [tailwind, tailwind-merge, css-custom-properties, typography, apps-web]

provides:
  - All 27 text-dt-{h1,h2,h3,body,caption,eyebrow} usage sites across 15 apps/web files converted to direct Tailwind v4 arbitrary-value classes (text-[...]/leading-[...]/tracking-[...])
  - premium-theme.css's six dead --text-dt-* custom properties (and line-height/letter-spacing companions) removed
  - Defense-in-depth typography layer that is structurally immune to future tailwind-merge classGroup misconfiguration, on top of the already-shipped cn.ts fix (260820-enw)

affects: [apps/web typography, premium-theme.css, future dt- token work]

actuals:
  tokens: 5385
  tasks: 4
  commits: 4

tech-stack:
  added: []
  patterns:
    - "Typography sized via inline Tailwind arbitrary-value classes (text-[clamp(...)], leading-[...], tracking-[...]) copied 1:1 from the former --text-dt-* token values, rather than named text-dt-{size} utility classes"

key-files:
  created: []
  modified:
    - apps/web/shared/components/section-heading.tsx
    - apps/web/shared/components/eyebrow.tsx
    - apps/web/shared/components/stat.tsx
    - apps/web/shared/components/premium-dialog.tsx
    - apps/web/modules/landing/hero.tsx
    - apps/web/modules/landing/features.tsx
    - apps/web/modules/landing/how-it-works.tsx
    - apps/web/modules/landing/lead-section.tsx
    - apps/web/modules/landing/pricing-section.tsx
    - apps/web/modules/blog/blog-filters.tsx
    - apps/web/modules/blog/related-posts.tsx
    - apps/web/modules/demo/bot-tab.tsx
    - "apps/web/app/[locale]/blog/page.tsx"
    - "apps/web/app/[locale]/blog/error.tsx"
    - "apps/web/app/[locale]/blog/[slug]/page.tsx"
    - apps/web/app/premium-theme.css

key-decisions:
  - "apps/web/shared/lib/cn.ts left completely untouched, per explicit plan scope boundary — its tailwind-merge classGroup registration of the six token names stays as an intentional, inert safety net"
  - "apps/web/modules/landing/pricing-section.tsx's pre-existing unrelated console.log(plans, 'plans') debug line left exactly as-is, per plan instruction — only its two typography sites were touched"

duration: 40min
completed: 2026-08-20
status: complete
---

# Quick Task 260820-eyj: Convert text-dt-{h1,h2,h3,body,caption,eyebrow} to Arbitrary-Value Classes Summary

**Converted all 27 usage sites of the six `text-dt-*` typography utility classes across 15 `apps/web` files to direct Tailwind v4 arbitrary-value classes, then deleted the now-dead `--text-dt-*` custom properties from `premium-theme.css`.**

## Performance

- **Duration:** ~40 min
- **Started:** 2026-08-20T09:XX (session continuation)
- **Completed:** 2026-08-20T10:03:31Z
- **Tasks:** 4
- **Files modified:** 16 (15 plan-listed files + this SUMMARY)

## Accomplishments

- Converted all 5 usage sites in the 4 highest-leverage shared components (`section-heading.tsx`, `eyebrow.tsx`, `stat.tsx`, `premium-dialog.tsx`) — these fan out to every page.
- Converted all 8 usage sites in the 5 landing modules (`hero.tsx`, `features.tsx`, `how-it-works.tsx`, `lead-section.tsx` — both h3 sites — `pricing-section.tsx`), preserving the pre-existing unrelated `console.log` debug line untouched.
- Converted all 14 usage sites across blog modules, the demo bot-tab module, and the three blog app routes — including `bot-tab.tsx`'s two independent ternary-branch caption sites and `blog/page.tsx`'s four duplicated empty-state/main-heading sites plus its featured-post h2.
- Removed the six dead `--text-dt-{h1,h2,h3,body,caption,eyebrow}` custom properties (and their `--line-height`/`--letter-spacing` companions) from `premium-theme.css`, confirmed via a `--text-dt-` custom-property-reference grep (not just a class-name grep) that nothing else in `apps/web` still referenced them before deleting.
- `apps/web/shared/lib/cn.ts` confirmed unmodified throughout — verified via `git diff --name-only` at the end of Task 4.
- Live dev-server spot-check confirmed the converted classes render correctly in actual served HTML: 1 hero `<h1>`, 8 `<h2>` sites, 16 `<h3>` sites all carry their correct arbitrary-value classes on `http://localhost:3000` (see Issues Encountered for the `/uk` routing note).

## Task Commits

Each task was committed atomically:

1. **Task 1: Convert shared components** - `3b0ab6b` (refactor)
2. **Task 2: Convert landing modules** - `2756961` (refactor)
3. **Task 3: Convert blog modules, demo module, and blog app routes** - `db8c1e4` (refactor)
4. **Task 4: Remove dead --text-dt-* tokens from premium-theme.css** - `a0991f5` (refactor)

## Files Created/Modified

- `apps/web/shared/components/section-heading.tsx` - h2/body tokens → arbitrary-value classes
- `apps/web/shared/components/eyebrow.tsx` - eyebrow token → arbitrary-value classes
- `apps/web/shared/components/stat.tsx` - h2 token → arbitrary-value classes
- `apps/web/shared/components/premium-dialog.tsx` - h3 token → arbitrary-value classes
- `apps/web/modules/landing/hero.tsx` - h1/body tokens → arbitrary-value classes
- `apps/web/modules/landing/features.tsx` - h3 token → arbitrary-value classes
- `apps/web/modules/landing/how-it-works.tsx` - h3 token → arbitrary-value classes
- `apps/web/modules/landing/lead-section.tsx` - both h3 sites (form title, thanks title) → arbitrary-value classes
- `apps/web/modules/landing/pricing-section.tsx` - h3/h2 tokens → arbitrary-value classes; console.log debug line untouched
- `apps/web/modules/blog/blog-filters.tsx` - body/h3 tokens → arbitrary-value classes
- `apps/web/modules/blog/related-posts.tsx` - h3 token → arbitrary-value classes
- `apps/web/modules/demo/bot-tab.tsx` - both caption ternary branches + h3 token → arbitrary-value classes
- `apps/web/app/[locale]/blog/page.tsx` - 5 sites (2× h1/body pairs, 1× h2) → arbitrary-value classes
- `apps/web/app/[locale]/blog/error.tsx` - h1 (h2-size mapping preserved) + body → arbitrary-value classes
- `apps/web/app/[locale]/blog/[slug]/page.tsx` - h1 → arbitrary-value classes
- `apps/web/app/premium-theme.css` - removed the six dead `--text-dt-*` custom properties and companions

## Decisions Made

- `apps/web/shared/lib/cn.ts` left completely untouched per explicit plan scope boundary — confirmed via `git diff --name-only` after Task 4.
- `pricing-section.tsx`'s pre-existing, unrelated `console.log(plans, 'plans')` debug line left exactly as-is per plan instruction.

## Deviations from Plan

None to the code itself - plan executed exactly as written for all 27 usage-site conversions and the CSS token removal.

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 3's `replace_all` edit on `app/[locale]/blog/page.tsx` missed a second h1/body site due to differing indentation**
- **Found during:** Task 3 verify step
- **Issue:** The empty-state block (14-space indent) and the main-heading block (12-space indent) use visually identical class strings but different surrounding whitespace, so a single `replace_all` edit with one exact old_string only matched the first occurrence; the verify grep caught the remaining `text-dt-h1`/`text-dt-body` occurrences at the second site.
- **Fix:** Applied a second, whitespace-matched edit to convert the main-heading block's h1/body sites, then re-ran prettier and the verify grep — both passed clean.
- **Files modified:** apps/web/app/[locale]/blog/page.tsx
- **Verification:** Sitewide grep and prettier --check both pass with zero remaining text-dt-* occurrences.
- **Committed in:** db8c1e4 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking, execution-mechanics only — no plan-scope or visual-intent change)
**Impact on plan:** No scope creep; all 27 usage sites converted exactly per the plan's 1:1 token mapping.

## Issues Encountered

- **`/uk` route 307-redirects to `/` in this app's pre-existing next-intl middleware configuration** (uk is the default locale with `localePrefix: 'as-needed'`) — this is pre-existing routing behavior, unrelated to this plan's changes. The plan's own Task 4 verify script curls `http://localhost:3000/uk` directly (without following redirects) to fetch HTML for the live spot-check; against this app's actual routing that returns an empty 307 response body instead of the page HTML, which would have produced a false-negative failure. Adapted the live-verification curl calls to follow redirects (`curl -L`), which correctly resolves to the same locale content and confirms the real served HTML. No code was changed to accommodate this — it is solely an adjustment to how the verification step's HTTP request was made. Confirmed via `curl -I http://localhost:3000/uk` showing `307 Temporary Redirect` → `location: /`, and `curl -L` returning `200` with the expected converted classes present in the HTML body (1 hero h1, 8 h2 sites, 16 h3 sites, all with correct arbitrary-value classes).
- Reused the dev server already running on `localhost:3000` from earlier in the session (pid unchanged throughout) — no new server was started, and it remains running exactly as it was found, per the orchestrator's instruction.

## Next Phase Readiness

- `apps/web`'s typography is now immune to any future `tailwind-merge` classGroup collision for text-size/line-height/letter-spacing, independent of `cn.ts`'s registration.
- `cn.ts`'s classGroup registration remains as an inert, belt-and-suspenders safety net for any future `dt-` token nobody remembers to convert.
- No blockers for subsequent phase work; pre-existing, unrelated `csstype` duplicate-resolution `check-types` error and `turbo/no-undeclared-env-vars` lint warning remain untouched and documented as open in STATE.md.

---
*Phase: quick*
*Completed: 2026-08-20*

## Self-Check: PASSED

All 16 modified files confirmed present on disk; all 4 task commits (`3b0ab6b`, `2756961`, `db8c1e4`, `a0991f5`) confirmed present in git log.
