---
phase: 02-home-contacts-demo
verified: 2026-08-09T10:51:23Z
status: gaps_found
score: 11/13 must-haves verified
behavior_unverified: 3
overrides_applied: 0
gaps:
  - truth: "The Problem, Features, and Testimonials card grids fade+translateY into view with an 80ms-staggered children animation on scroll entry, collapsing to a simple opacity fade when prefers-reduced-motion is set"
    status: failed
    reason: "StaggerGrid/StaggerItem never call Motion's useReducedMotion() hook and never branch their variants — they always use the full translateY(20px)+opacity revealVariants/revealContainerVariants regardless of the user's OS-level reduced-motion preference. The sibling Reveal component (used for section headers, hero, solution, etc.) DOES branch correctly (variants={prefersReducedMotion ? {hidden:{opacity:1},visible:{opacity:1}} : revealVariants}), proving this is the established, expected pattern that stagger-grid.tsx simply omits. The global CSS reduced-motion media query in premium-theme.css only forces `animation-duration`/`transition-duration` to ~0, which does not affect Framer Motion's JS/WAAPI-driven transform animations."
    artifacts:
      - path: "apps/web/modules/home/stagger-grid.tsx"
        issue: "No import of or call to useReducedMotion() from 'motion/react'; StaggerGrid/StaggerItem always render revealContainerVariants/revealVariants unconditionally"
    missing:
      - "Import useReducedMotion from 'motion/react' in stagger-grid.tsx, branch StaggerGrid's variants prop to an opacity-only hidden/visible pair (matching Reveal's pattern) when prefersReducedMotion is true, and pass a matching opacity-only variants prop into StaggerItem (or read the parent's reduced-motion state via context/prop) so the 80ms staggerChildren translateY effect fully collapses to a simple opacity fade"
  - truth: "Starting a new scenario while a previous one is still playing cancels the previous playback (no interleaved or duplicated messages)"
    status: failed
    reason: "runScenario's cleanup guard only clears intervalRef.current (the setInterval). Each interval tick that encounters a bot-type message schedules an inner, untracked setTimeout(() => { setChatMessages(...); setIsTyping(false); }, 400) at bot-tab.tsx line 75 — its id is never stored or cleared. If a user clicks a different scenario button within that 400ms window, runScenario clears the interval and resets chatMessages to the seed greetings, but the previous scenario's stale setTimeout still fires afterward and appends its (now out-of-context) bot message onto the freshly-reset conversation — directly reproducing the interleaved/duplicated-message behavior this truth explicitly promises will not happen. Independently confirmed via direct code reading; also flagged as WR-01 in 02-REVIEW.md with the identical root cause and a working fix example (track the timeout id in a second ref, clear it in both the retrigger guard and the unmount effect)."
    artifacts:
      - path: "apps/web/modules/demo/bot-tab.tsx"
        issue: "Line 75: inner setTimeout scheduled per bot-message tick is never assigned to a ref and is never cleared by runScenario's cleanup guard (lines 51-54) or the unmount effect (lines 100-107)"
    missing:
      - "Add a second ref (e.g. messageTimeoutRef) to store the inner setTimeout's id, clear it alongside intervalRef.current at the top of runScenario, and clear it in the unmount cleanup effect — exactly as described in 02-REVIEW.md's WR-01 fix"
behavior_unverified_items:
  - truth: "User can expand and collapse all 8 FAQ accordion items on /contacts, each showing its exact question and answer from the design archive"
    test: "Visit /contacts, click each of the 8 FAQAccordion items to expand, then click again to collapse"
    expected: "Each item's answer text appears/disappears with the accordion-down/accordion-up animation and only the exact 8 verbatim Q/A pairs from 02-CONTEXT.md are shown"
    why_human: "Radix Accordion's open/close state transition is runtime behavior; static analysis confirms wiring (AccordionPrimitive.Root/Item/Trigger/Content, 8 faqs entries, type=\"single\" collapsible) but cannot exercise the expand/collapse interaction itself"
  - truth: "Clicking any of the 3 scenario buttons plays back that scenario's scripted messages into the phone-mockup chat, showing a typing indicator before each bot message and smoothly auto-scrolling to the newest message"
    test: "Visit /demo, click each of the 3 scenario buttons in turn (without retriggering) and observe the chat panel"
    expected: "Each scripted message appears in order at the 800ms/message pace, a 3-dot typing indicator shows for ~400ms before each bot message, and the panel auto-scrolls smoothly to the newest message"
    why_human: "setInterval/setTimeout-driven playback pacing and the CSS/JS auto-scroll behavior are runtime effects; static analysis confirms the happy-path logic is structurally correct (each tick appends the correct message, typing state toggles, scrollIntoView is called) but cannot confirm the visual pacing/smoothness a human would judge"
  - truth: "Switching the Admin tab's sidebar section swaps the displayed content; the Dashboard section's 4 stat numbers count up and its 7-day bar chart's bars grow bottom-up with an 80ms per-bar stagger on first display"
    test: "Visit /demo, switch to the Admin tab, and observe the Dashboard section on first display, then click through all 5 sidebar sections"
    expected: "The 4 stat cards count up from 0 to their target values over ~1s; the 7 bar-chart bars grow from 0 height to their target height, each starting 80ms after the previous one; each sidebar click swaps the content panel with a 150ms fade"
    why_human: "requestAnimationFrame-driven count-up and CSS transitionDelay-driven bar stagger are runtime visual effects; static analysis confirms the hook/effect/stagger-delay code exists and is wired to the correct data, but cannot confirm the animations fire once per mount and look correct"
---

# Phase 2: Home, Contacts & Demo Verification Report

**Phase Goal:** Users can view the Home landing page and complete the two primary lead-gen actions — request a demo via the scripted chat simulation and submit a contact inquiry with validated feedback.
**Verified:** 2026-08-09T10:51:23Z
**Status:** gaps_found
**Re-verification:** No — initial verification

**Note on `Mode: mvp`:** ROADMAP.md marks this phase `Mode: mvp`, but the phase goal is not phrased as a User Story (`gsd_run query user-story.validate` returns `valid: false` for the goal text). This project's Phase 2/3 roadmap entries use the older 5-Success-Criteria goal format instead of the User Story format, so standard goal-backward verification (not the narrowed MVP-mode flow) was applied — consistent with how the phase was planned and executed (02-CONTEXT.md, 02-*-PLAN.md).

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Home (`/`) renders all 6 sections in order with exact Ukrainian copy | ✓ VERIFIED | `apps/web/app/page.tsx` renders `<Hero /><Problem /><Solution /><Features /><CtaBanner /><Testimonials />` in order; spot-checked copy in hero.tsx/problem.tsx matches 02-CONTEXT.md verbatim |
| 2 | Zero `@repo/ui`/`#1d6be4` literal in new Home files | ✓ VERIFIED | `grep -rn "1d6be4\|@repo/ui" apps/web/app/page.tsx apps/web/modules/home/` → no matches |
| 3 | Hero primary CTA + CTA Banner first button both navigate to `/demo` via `routes` constant | ✓ VERIFIED | `routes.demo` used in hero.tsx:40, cta-banner.tsx:22,30 |
| 4 | Problem/Features/Testimonials grids fade+translateY-stagger on scroll, collapsing to opacity-only fade under `prefers-reduced-motion` | ✗ FAILED | `apps/web/modules/home/stagger-grid.tsx` never imports/calls `useReducedMotion()` — see Gaps |
| 5 | Hero secondary CTA scrolls to `#features` | ✓ VERIFIED | hero.tsx:46 `<a href="#features">`; features.tsx:22 `<section id="features">` |
| 6 | User can fill Contacts form and sees inline errors for name<2 chars / invalid contact | ✓ VERIFIED | `contact-form.tsx` — zod schema with `.min(2, ...)` and `.refine(...)` phone-or-email check, errors rendered via `form.formState.errors.*` |
| 7 | Valid submission shows toast + swaps to "Дякуємо!" card; reset button works | ✓ VERIFIED | `contact-form.tsx` — `toast.success('Заявку успішно надіслано!')`, `isSubmitted`-gated JSX swap, reset button calls `setIsSubmitted(false); form.reset()` |
| 8 | `react-hook-form`/`zod`/`@hookform/resolvers` installed only after human approval | ✓ VERIFIED (procedural) | 02-02-PLAN.md Task 1 is a `checkpoint:human-verify` gate; 02-02-SUMMARY.md documents pre-approval before the plan ran; `package.json` shows all 3 deps present |
| 9 | All 8 FAQ items expand/collapse with exact Q/A | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | 8 verbatim `faqs` entries confirmed in `faq-accordion.tsx`; Radix-based `PremiumAccordion` wiring confirmed; expand/collapse interaction not exercised — see Human Verification |
| 10 | User can switch Bot/Admin tabs on `/demo` with fade transition | ✓ VERIFIED | `demo-tabs.tsx` — `AnimatePresence`/`motion.div` keyed on `activeTab`, conditional `<BotTab />`/`<AdminTab />` render |
| 11 | Scenario buttons play back scripted messages with typing indicator + auto-scroll | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `bot-tab.tsx` — playback logic, typing-indicator toggle, and `scrollIntoView({behavior:'smooth'})` all present and wired; visual pacing not exercised — see Human Verification |
| 12 | Retriggering a scenario mid-playback cancels the previous one (no interleaved/duplicated messages) | ✗ FAILED | `bot-tab.tsx` line 75 — inner `setTimeout` untracked/uncleared; confirmed bug, matches 02-REVIEW.md WR-01 — see Gaps |
| 13 | Admin sidebar swaps content; Dashboard stats count up + bar chart staggers 80ms/bar | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `admin-tab.tsx` — `useCountUp` (`requestAnimationFrame`), `transitionDelay: ${index*80}ms`, 5 `setSelectedSection` call sites all confirmed; animation firing/visual correctness not exercised — see Human Verification |

**Score:** 11/13 truths verified (3 present, behavior-unverified; 2 failed)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/app/page.tsx` | Home route, 6 sections | ✓ VERIFIED | All 6 sections rendered in order |
| `apps/web/modules/home/{hero,problem,solution,stagger-grid,features,cta-banner,testimonials}.tsx` | Home section components | ✓ VERIFIED | All present, correct exports, correct card/button counts (4/8/2/3) |
| `apps/web/next.config.js` | `images.unsplash.com` remote pattern | ✓ VERIFIED | Present, scoped, `transpilePackages` preserved |
| `apps/web/shared/components/{premium-input,premium-textarea,premium-accordion}.tsx` | dt-token form/accordion primitives | ✓ VERIFIED | All present, correct exports, `cn()` import confirmed |
| `apps/web/modules/contacts/{contact-form,faq-accordion,contact-info}.tsx` | Contacts form, FAQ, info column | ✓ VERIFIED | All present, correct field/entry counts |
| `apps/web/app/contacts/page.tsx` | Contacts route | ✓ VERIFIED | Renders `ContactForm`, `ContactInfo`, `FaqAccordion` |
| `apps/web/modules/demo/_data.ts` | Mock data constants | ✓ VERIFIED | 3 scenarios, 5 appointments, 3 doctors, 4 dashboard stats, 7 bar-chart entries |
| `apps/web/modules/demo/{bot-tab,demo-tabs,admin-tab}.tsx` | Demo Bot/Admin tabs | ✓ VERIFIED (with the WR-01 defect noted above) | All present, correctly wired, correct component-source split (Bot/switcher = premium, Admin = `@repo/ui`) |
| `apps/web/app/demo/page.tsx` | Demo route | ✓ VERIFIED | Renders `DemoTabs` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `apps/web/app/page.tsx` | `apps/web/modules/home/*.tsx` | direct import/render | ✓ WIRED | 6/6 imports confirmed |
| `hero.tsx` / `cta-banner.tsx` | `/demo` | `routes.demo` | ✓ WIRED | Confirmed, no hardcoded path strings |
| `contact-form.tsx` | zod schema | `zodResolver(contactFormSchema)` | ✓ WIRED | Confirmed |
| `contact-form.tsx` | root layout's `Toaster` | `toast.success(...)` from `sonner` | ✓ WIRED | Confirmed, `Toaster` already mounted in `layout.tsx` (Phase 1) |
| `demo-tabs.tsx` | `bot-tab.tsx` / `admin-tab.tsx` | `activeTab` conditional render | ✓ WIRED | Confirmed |
| `bot-tab.tsx runScenario` | `_data.ts scenarios` | direct import | ✓ WIRED | Confirmed |
| `admin-tab.tsx` "Підключити свою клініку" | `/contacts` | `routes.contacts` | ✓ WIRED | Confirmed |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|--------------|--------|----------|
| HOME-01 | 02-01 | Home page with all sections, original copy | ✓ SATISFIED (with 1 associated gap on the reduced-motion sub-requirement) | 6 sections render; reduced-motion collapse not implemented in StaggerGrid — see Gaps |
| DEMO-01 | 02-03 | Demo page, scripted chat sim, client-side only | ✓ SATISFIED (with 1 associated gap on the cancellation guarantee) | Playback works on the happy path; mid-playback retrigger leaks a stale message — see Gaps |
| DEMO-02 | 02-03 | Switch dashboard sections as in design | ✓ SATISFIED | 5-section sidebar swap, count-up stats, staggered bar chart all wired |
| CONT-01 | 02-02 | Form + RHF/zod validation, inline errors | ✓ SATISFIED | zod schema, `zodResolver`, inline error rendering confirmed |
| CONT-02 | 02-02 | Mocked success confirmation | ✓ SATISFIED | toast + "Дякуємо!" card swap confirmed |
| CONT-03 | 02-02 | FAQ accordion, all items from design | ✓ SATISFIED | 8/8 verbatim FAQ pairs confirmed present and wired |

**Note:** REQUIREMENTS.md's HOME-01 text still reads "...ported with `@repo/ui` components..." — this wording is stale/superseded by the Phase 01.1 premium-redesign pivot, explicitly documented in `.planning/PROJECT.md`'s Key Decisions and `02-CONTEXT.md`'s "⚠ SUPERSEDED" section. Not treated as a gap; flagged here for traceability only, in case REQUIREMENTS.md's wording is ever updated to match the pivot.

No orphaned requirements found — all 6 requirement IDs declared in this phase's plans (HOME-01, DEMO-01, DEMO-02, CONT-01, CONT-02, CONT-03) exactly match the phase's declared requirement set in the task prompt and ROADMAP.md.

### Type-Check / Build Verification

`pnpm --filter web check-types` run directly by this verifier: zero new errors from any Phase 2 file. The only errors present are the pre-existing, unrelated `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict confined to `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` (confirmed via `grep 'error TS' | grep -v 'button-group.tsx\|calendar.tsx\|sidebar.tsx'` → empty output), matching all three plans' own verify-gate claims.

### Anti-Patterns Found

No blocking debt markers (`TBD`/`FIXME`/`XXX`) found in any Phase 2 file. Two real logic defects were found and are captured as gaps above (not anti-pattern-scan matches — found via direct code reading, corroborated by 02-REVIEW.md's WR-01). 02-REVIEW.md also documents three additional Warning-level findings (WR-02 SSR hydration timestamp risk, WR-03 no submit-guard on Contacts form, WR-04 both CTA-Banner buttons routing to the same `/demo` tab) and four Info-level items — these are real robustness/polish issues but do not falsify any must-have truth from the phase's plans, so they are not elevated to gaps here; they remain available in 02-REVIEW.md for a future cleanup pass.

### Human Verification Required

### 1. FAQ accordion expand/collapse

**Test:** Visit `/contacts`, click each of the 8 FAQ items to expand, then click again to collapse.
**Expected:** Each item's answer appears/disappears smoothly; only the 8 verbatim Q/A pairs from the design archive are shown.
**Why human:** Radix Accordion's open/close state transition is runtime behavior not exercisable via static analysis.

### 2. Demo chat scenario playback (happy path)

**Test:** Visit `/demo`, click each of the 3 scenario buttons in turn (no retriggering).
**Expected:** Messages appear at an 800ms pace with a ~400ms typing indicator before each bot message; the chat auto-scrolls smoothly to the newest message.
**Why human:** Timer-driven pacing and scroll smoothness are visual/runtime effects.

### 3. Admin tab dashboard animations

**Test:** Visit `/demo`, switch to the Admin tab, observe the Dashboard section on first display, then click through all 5 sidebar sections.
**Expected:** Stat numbers count up from 0; bar-chart bars grow bottom-up with a visible 80ms-per-bar stagger; each sidebar switch fades in over 150ms.
**Why human:** `requestAnimationFrame`/CSS-transition-driven visual effects.

### Gaps Summary

Two must-have truths from this phase's own plans are demonstrably not met, found via direct code inspection (not merely "untested" — the broken behavior is provable by reading the logic):

1. **Reduced-motion collapse missing on Home's staggered grids** (`apps/web/modules/home/stagger-grid.tsx`). The plan explicitly required the Problem/Features/Testimonials card grids to collapse to a simple opacity fade under `prefers-reduced-motion`, matching the already-established `Reveal` component's pattern. `StaggerGrid`/`StaggerItem` never call `useReducedMotion()` and always animate translateY regardless of the user's OS preference — a straightforward accessibility/motion-sensitivity requirement that was simply not carried over from `Reveal` to the new `StaggerGrid` primitive.

2. **Demo chat scenario retrigger leaks a stale message** (`apps/web/modules/demo/bot-tab.tsx`). The plan explicitly required that starting a new scenario while a previous one is playing must not interleave or duplicate messages. The `setInterval` cleanup guard was implemented correctly, but a second, untracked `setTimeout` (used for the typing-indicator-then-reveal split) was left unguarded — so a user who retriggers a scenario within a ~400ms window can see a stale message from the abandoned scenario appended onto the newly-reset conversation. This exact defect (with the same root cause and fix) is independently documented as WR-01 in `02-REVIEW.md`.

Both gaps are narrowly scoped, single-file fixes with a clear, already-drafted remediation path (WR-01's fix snippet for the timeout gap; `Reveal`'s existing `useReducedMotion()` branch as the template for the stagger-grid gap). Everything else — all 6 Home sections, the full Contacts form/validation/FAQ, the Demo route/tab-switcher/admin-panel simulation, dependency legitimacy gate, and requirements traceability — is verified working and correctly wired.

---

_Verified: 2026-08-09T10:51:23Z_
_Verifier: Claude (gsd-verifier)_
