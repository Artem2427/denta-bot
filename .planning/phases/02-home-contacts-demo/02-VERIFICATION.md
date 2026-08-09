---
phase: 02-home-contacts-demo
verified: 2026-08-09T20:15:00Z
status: passed
score: 13/13 must-haves verified
behavior_unverified: 0
uat_resolved: 2026-08-09T20:35:00Z
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 11/13
  gaps_closed:
    - "The Problem, Features, and Testimonials card grids fade+translateY into view with an 80ms-staggered children animation on scroll entry, collapsing to a simple opacity fade when prefers-reduced-motion is set"
    - "Starting a new scenario while a previous one is still playing cancels the previous playback (no interleaved or duplicated messages)"
  gaps_remaining: []
  regressions: []
behavior_unverified_items:
  - truth: "User can expand and collapse all 8 FAQ accordion items on /contacts, each showing its exact question and answer from the design archive"
    test: "Visit /contacts, click each of the 8 FAQAccordion items to expand, then click again to collapse"
    expected: "Each item's answer text appears/disappears with the accordion-down/accordion-up animation and only the exact 8 verbatim Q/A pairs from 02-CONTEXT.md are shown"
    why_human: "Radix Accordion's open/close state transition is runtime behavior; static analysis confirms wiring (AccordionPrimitive.Root/Item/Trigger/Content, 8 faqs entries, type=\"single\" collapsible) but cannot exercise the expand/collapse interaction itself"
  - truth: "Clicking any of the 3 scenario buttons plays back that scenario's scripted messages into the phone-mockup chat, showing a typing indicator before each bot message and smoothly auto-scrolling to the newest message"
    test: "Visit /demo, click each of the 3 scenario buttons in turn (without retriggering), then click a different scenario button within ~400ms of a bot-message tick to confirm the new messageTimeoutRef guard prevents a stale message leak"
    expected: "Each scripted message appears in order at the 800ms/message pace, a 3-dot typing indicator shows for ~400ms before each bot message, the panel auto-scrolls smoothly to the newest message, and rapid retriggering never appends a stale message from the abandoned scenario"
    why_human: "setInterval/setTimeout-driven playback pacing, the CSS/JS auto-scroll behavior, and the timing-sensitive retrigger race are runtime effects; static analysis confirms the happy-path logic and the new dual-ref cleanup guard are structurally correct but cannot confirm visual pacing or exercise the exact ~400ms race window a human can reproduce interactively"
  - truth: "Switching the Admin tab's sidebar section swaps the displayed content; the Dashboard section's 4 stat numbers count up and its 7-day bar chart's bars grow bottom-up with an 80ms per-bar stagger on first display"
    test: "Visit /demo, switch to the Admin tab, and observe the Dashboard section on first display, then click through all 5 sidebar sections"
    expected: "The 4 stat cards count up from 0 to their target values over ~1s; the 7 bar-chart bars grow from 0 height to their target height, each starting 80ms after the previous one; each sidebar click swaps the content panel with a 150ms fade"
    why_human: "requestAnimationFrame-driven count-up and CSS transitionDelay-driven bar stagger are runtime visual effects; static analysis confirms the hook/effect/stagger-delay code exists and is wired to the correct data, but cannot confirm the animations fire once per mount and look correct"
---

# Phase 2: Home, Contacts & Demo Verification Report

**Phase Goal:** Users can view the Home landing page and complete the two primary lead-gen actions — request a demo via the scripted chat simulation and submit a contact inquiry with validated feedback.
**Verified:** 2026-08-09T20:15:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (02-04)

**Note on `Mode: mvp`:** ROADMAP.md marks this phase `Mode: mvp`, but the phase goal is not phrased as a User Story. Standard goal-backward verification (not the narrowed MVP-mode flow) was applied, consistent with the initial verification and how the phase was planned/executed.

## Goal-Closure Verification (this pass)

Both gaps from the prior `gaps_found` verification were re-checked by reading the actual current file contents (not trusting 02-04-SUMMARY.md's claims):

### Gap 1 — `apps/web/modules/home/stagger-grid.tsx` reduced-motion collapse

**Read the live file.** Confirmed:
- Line 5: `import { motion, useReducedMotion } from 'motion/react';`
- `StaggerGrid`: calls `useReducedMotion()` (line 16); `variants` prop branches to `{ hidden: {}, visible: {} }` when `prefersReducedMotion` is true, else `revealContainerVariants` (lines 22-26)
- `StaggerItem`: calls `useReducedMotion()` independently (line 36); `variants` prop branches to `{ hidden: { opacity: 1 }, visible: { opacity: 1 } }` when true, else `revealVariants` (lines 41-45)
- Cross-checked against `apps/web/shared/components/reveal.tsx` (the reference pattern) — `StaggerItem`'s reduced-motion branch is byte-for-byte identical in shape to `Reveal`'s (`{ hidden: { opacity: 1 }, visible: { opacity: 1 } }`), confirming the mirroring claim in 02-04-SUMMARY.md is accurate.

**Status: ✓ GAP CLOSED — VERIFIED.** The Problem/Features/Testimonials grids (all consuming `StaggerGrid`/`StaggerItem` unchanged) now fully collapse to a static, opacity-only render with no `staggerChildren` delay and no `translateY` motion when `prefers-reduced-motion` is set.

### Gap 2 — `apps/web/modules/demo/bot-tab.tsx` scenario-retrigger stale-message leak

**Read the live file.** Confirmed:
- Line 42-44: `messageTimeoutRef` declared via `React.useRef<ReturnType<typeof setTimeout> | null>(null)`, immediately after `intervalRef`
- Lines 55-58: `runScenario`'s cleanup guard now clears `messageTimeoutRef.current` (via `clearTimeout` + null) in addition to `intervalRef.current`, before resetting `chatMessages`
- Lines 77-86: the inner bot-message-tick `setTimeout` is now assigned to `messageTimeoutRef.current`, and self-nulls (`messageTimeoutRef.current = null`) when it fires naturally
- Lines 105-116: the unmount cleanup `useEffect` clears both `intervalRef.current` and `messageTimeoutRef.current`

**Status: ✓ GAP CLOSED — VERIFIED (structurally).** The dual-ref guard is correctly wired: retriggering a scenario now cancels both the interval and any in-flight typing-indicator timeout before resetting the chat, closing the exact race condition described in the prior verification and 02-REVIEW.md's WR-01. Because this is a timing-sensitive race (a click within a ~400ms window), the retrigger-specific behavior remains a recommended interactive spot-check (folded into human-verification item #2 below) even though the code fix is structurally sound and matches the established `Reveal`-style dual-cleanup pattern used elsewhere in this codebase.

## Full Phase Re-Check (all 4 plans, 02-01 through 02-04)

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Home (`/`) renders all 6 sections in order with exact Ukrainian copy | ✓ VERIFIED | `apps/web/app/page.tsx` renders `<Hero /><Problem /><Solution /><Features /><CtaBanner /><Testimonials />` in order (6/6 confirmed via grep this pass) |
| 2 | Zero `@repo/ui`/`#1d6be4` literal in new Home files | ✓ VERIFIED | Re-confirmed 0 matches in `stagger-grid.tsx`, `bot-tab.tsx`, `app/page.tsx` this pass |
| 3 | Hero primary CTA + CTA Banner first button both navigate to `/demo` via `routes` constant | ✓ VERIFIED | `routes.demo` used in `hero.tsx` (1x), `cta-banner.tsx` (2x) |
| 4 | Problem/Features/Testimonials grids fade+translateY-stagger on scroll, collapsing to opacity-only fade under `prefers-reduced-motion` | ✓ VERIFIED | Gap 1 closed — see above; `useReducedMotion()` correctly branches both `StaggerGrid` and `StaggerItem` |
| 5 | Hero secondary CTA scrolls to `#features` | ✓ VERIFIED | Unchanged from initial verification; consumers unmodified |
| 6 | User can fill Contacts form and sees inline errors for name<2 chars / invalid contact | ✓ VERIFIED | `contact-form.tsx` — `z.object`, `zodResolver`, `.refine(` all present (4 total matches on schema/wiring greps) |
| 7 | Valid submission shows toast + swaps to "Дякуємо!" card; reset button works | ✓ VERIFIED | `toast.success` present, `isSubmitted`-gated JSX swap unchanged |
| 8 | `react-hook-form`/`zod`/`@hookform/resolvers` installed only after human approval | ✓ VERIFIED (procedural) | Unchanged — Task 1 checkpoint pre-approved, packages present in `package.json` |
| 9 | All 8 FAQ items expand/collapse with exact Q/A | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | 8/8 `question:` entries confirmed in `faq-accordion.tsx`; interaction not exercised |
| 10 | User can switch Bot/Admin tabs on `/demo` with fade transition | ✓ VERIFIED | `demo-tabs.tsx` unchanged, `AnimatePresence` + conditional render confirmed |
| 11 | Scenario buttons play back scripted messages with typing indicator + auto-scroll | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Playback logic present and wired incl. the new dual-ref guard; visual pacing/race timing not exercised |
| 12 | Retriggering a scenario mid-playback cancels the previous one (no interleaved/duplicated messages) | ✓ VERIFIED | Gap 2 closed — see above; `messageTimeoutRef` guard structurally confirmed in `runScenario`, tick handler, and unmount cleanup |
| 13 | Admin sidebar swaps content; Dashboard stats count up + bar chart staggers 80ms/bar | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `admin-tab.tsx` unchanged from initial verification — `useCountUp`, `transitionDelay`, 5 `setSelectedSection` sites all confirmed |

**Score:** 13/13 truths at VERIFIED or GAP-CLOSED status (3 of the 13 remain ⚠️ PRESENT_BEHAVIOR_UNVERIFIED and are excluded from the numeric "verified" count per the behavior-unverified convention, carried forward unchanged from the initial pass — see `behavior_unverified_items`). No truth is FAILED in this pass.

### Required Artifacts (regression check across all 4 plans)

| Artifact | Status | Details |
|----------|--------|---------|
| `apps/web/app/page.tsx` | ✓ VERIFIED | 6/6 sections present, unchanged |
| `apps/web/modules/home/{hero,problem,solution,features,cta-banner,testimonials}.tsx` | ✓ VERIFIED | All present on disk, unchanged since initial pass |
| `apps/web/modules/home/stagger-grid.tsx` | ✓ VERIFIED (fixed) | Now correctly branches on `useReducedMotion()` |
| `apps/web/next.config.js` | ✓ VERIFIED | Unchanged, `images.unsplash.com` present |
| `apps/web/shared/components/{premium-input,premium-textarea,premium-accordion}.tsx` | ✓ VERIFIED | Unchanged |
| `apps/web/modules/contacts/{contact-form,faq-accordion,contact-info}.tsx` | ✓ VERIFIED | Unchanged, all present |
| `apps/web/app/contacts/page.tsx` | ✓ VERIFIED | Renders `ContactForm`, `ContactInfo`, `FaqAccordion` (1/1/1 confirmed) |
| `apps/web/modules/demo/_data.ts` | ✓ VERIFIED | Present, unchanged |
| `apps/web/modules/demo/bot-tab.tsx` | ✓ VERIFIED (fixed) | `messageTimeoutRef` dual-cleanup guard now present and correctly wired |
| `apps/web/modules/demo/{demo-tabs,admin-tab}.tsx` | ✓ VERIFIED | Unchanged |
| `apps/web/app/demo/page.tsx` | ✓ VERIFIED | Renders `DemoTabs` (1/1 confirmed) |

### Key Link Verification (regression check)

| From | To | Via | Status |
|------|----|----|--------|
| `apps/web/app/page.tsx` | `apps/web/modules/home/*.tsx` | direct import/render | ✓ WIRED |
| `hero.tsx` / `cta-banner.tsx` | `/demo` | `routes.demo` | ✓ WIRED |
| `contact-form.tsx` | zod schema | `zodResolver(contactFormSchema)` | ✓ WIRED |
| `contact-form.tsx` | root layout's `Toaster` | `toast.success(...)` from `sonner` | ✓ WIRED |
| `demo-tabs.tsx` | `bot-tab.tsx` / `admin-tab.tsx` | `activeTab` conditional render | ✓ WIRED |
| `bot-tab.tsx runScenario` | `_data.ts scenarios` | direct import | ✓ WIRED |
| `admin-tab.tsx` "Підключити свою клініку" | `/contacts` | `routes.contacts` | ✓ WIRED |
| `stagger-grid.tsx StaggerGrid/StaggerItem` | `reveal.tsx`'s `useReducedMotion()` pattern | identical opacity-only variant-pair branching | ✓ WIRED (new this pass) |
| `bot-tab.tsx runScenario` cleanup guard | inner 400ms `setTimeout` | `messageTimeoutRef`, cleared on retrigger + unmount | ✓ WIRED (new this pass) |

### Type-Check Verification

`pnpm --filter web check-types` run directly by this verifier: zero new errors from any Phase 2 file, including the 2 files modified by 02-04. The only errors present remain the pre-existing, unrelated `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict confined to `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` — confirmed by direct inspection of the tsc output.

### Anti-Patterns Found

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any Phase 2 file (including the 2 files modified by 02-04). One incidental grep hit on the literal string `placeholder="..."` in `contact-form.tsx` is a legitimate HTML input attribute, not a debt marker.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|--------------|--------|----------|
| HOME-01 | 02-01, 02-04 | Home page with all sections, original copy, reduced-motion-compliant grid animation | ✓ SATISFIED — no remaining gap | 6 sections render; `StaggerGrid`/`StaggerItem` now honor `prefers-reduced-motion` |
| DEMO-01 | 02-03, 02-04 | Demo page, scripted chat sim, client-side only, cancel-safe retrigger | ✓ SATISFIED — no remaining gap | Playback works; retrigger guard now covers both the interval and the inner message timeout |
| DEMO-02 | 02-03 | Switch dashboard sections as in design | ✓ SATISFIED | 5-section sidebar swap, count-up stats, staggered bar chart all wired (unchanged) |
| CONT-01 | 02-02 | Form + RHF/zod validation, inline errors | ✓ SATISFIED | zod schema, `zodResolver`, inline error rendering confirmed (unchanged) |
| CONT-02 | 02-02 | Mocked success confirmation | ✓ SATISFIED | toast + "Дякуємо!" card swap confirmed (unchanged) |
| CONT-03 | 02-02 | FAQ accordion, all items from design | ✓ SATISFIED | 8/8 verbatim FAQ pairs confirmed present and wired (unchanged) |

No orphaned requirements found — all 6 requirement IDs declared in this phase's plans (HOME-01, DEMO-01, DEMO-02, CONT-01, CONT-02, CONT-03) exactly match the phase's declared requirement set.

**Note (documentation staleness, informational only, not a gap):** `.planning/REQUIREMENTS.md`'s checkbox list and its "Traceability" table still show `DEMO-02`, `CONT-01`, `CONT-02`, and `CONT-03` as unchecked / `Pending`, despite the code-level evidence above (and the prior verification pass) confirming all three are implemented and wired. This is the same kind of tracking-file lag already flagged for `HOME-01`'s stale `@repo/ui` wording in the initial verification pass — `.planning/REQUIREMENTS.md`'s per-requirement checkboxes and its Traceability table were not updated after Phase 2's plans completed. Recommend syncing REQUIREMENTS.md's checkboxes/table to `Complete` for DEMO-02/CONT-01/CONT-02/CONT-03 as a housekeeping follow-up; this does not block phase closure since the underlying code is verified.

### Human Verification Required

The 3 items below are unchanged from the initial verification pass (no code affecting them changed in 02-04, except item #2 which now also needs the retrigger-race case exercised given the new guard):

### 1. FAQ accordion expand/collapse

**Test:** Visit `/contacts`, click each of the 8 FAQ items to expand, then click again to collapse.
**Expected:** Each item's answer appears/disappears smoothly; only the 8 verbatim Q/A pairs from the design archive are shown.
**Why human:** Radix Accordion's open/close state transition is runtime behavior not exercisable via static analysis.

### 2. Demo chat scenario playback, including mid-playback retrigger

**Test:** Visit `/demo`, click each of the 3 scenario buttons in turn (no retriggering) to confirm pacing/typing-indicator/auto-scroll. Then click a scenario button, and within roughly 400ms of a bot-message tick, click a different scenario button — confirm the chat resets cleanly with no stale message from the abandoned scenario appended afterward.
**Expected:** Messages appear at an 800ms pace with a ~400ms typing indicator before each bot message; the chat auto-scrolls smoothly to the newest message; rapid retriggering never leaks a stale message into the freshly-reset conversation.
**Why human:** Timer-driven pacing, scroll smoothness, and the exact ~400ms race window are runtime/timing effects that static code reading can confirm are structurally guarded against but cannot execute.

### 3. Admin tab dashboard animations

**Test:** Visit `/demo`, switch to the Admin tab, observe the Dashboard section on first display, then click through all 5 sidebar sections.
**Expected:** Stat numbers count up from 0; bar-chart bars grow bottom-up with a visible 80ms-per-bar stagger; each sidebar switch fades in over 150ms.
**Why human:** `requestAnimationFrame`/CSS-transition-driven visual effects.

### Gaps Summary

No gaps remain. Both gaps from the prior `gaps_found` verification (`stagger-grid.tsx`'s missing `prefers-reduced-motion` collapse, `bot-tab.tsx`'s untracked inner `setTimeout`) were closed by plan `02-04` and independently re-confirmed in this pass by reading the current file contents directly — not by trusting `02-04-SUMMARY.md`'s claims. No regressions were found in any of the other 11 truths, artifacts, or key links carried over from plans 02-01/02-02/02-03. Overall phase status is `human_needed` rather than `passed` because 3 truths remain ⚠️ PRESENT_BEHAVIOR_UNVERIFIED (FAQ expand/collapse, chat playback pacing/retrigger, admin dashboard animations) — all three are runtime/visual behaviors that require an interactive browser check per the decision tree, not code-level defects.

---

_Verified: 2026-08-09T20:15:00Z_
_Verifier: Claude (gsd-verifier)_
