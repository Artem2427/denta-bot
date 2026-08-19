---
phase: quick
plan: 260820-1bb
subsystem: ui
tags: [tailwind, css-custom-properties, typography, design-tokens, apps-web]

requires:
  - phase: 06.1 (Premium Visual Restyle)
    provides: "--text-dt-h2 fluid type-scale token in premium-theme.css, section-heading.tsx shared component"
provides:
  - "--text-dt-h2 token in apps/web/app/premium-theme.css now matches the reference design prototype's exact devtools-inspected computed style"
  - "section-heading.tsx's <h2> renders font-extrabold (800) instead of font-bold (700)"
affects: [section-heading, stat, pricing-section, lead-section, blog-list, blog-error]

actuals:
  tokens: 350
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Tailwind v4 --text-<name>--letter-spacing companion token pattern (already used for --text-dt-eyebrow) extended to --text-dt-h2"

key-files:
  created: []
  modified:
    - apps/web/app/premium-theme.css
    - apps/web/shared/components/section-heading.tsx

key-decisions:
  - "Superseded this plan's own earlier hand-derived clamp(1.75rem, 2.6vw + 1.15rem, 3.25rem) with the user-supplied, devtools-inspected reference value clamp(1.9rem, 3.4vw, 2.75rem) — ground truth takes priority over independently-derived coefficients for this design-archive-port project"
  - "Font-weight bump to font-extrabold (800) scoped ONLY to section-heading.tsx, NOT added as a --text-dt-h2--font-weight token, to avoid a same-specificity conflict with the font-bold classes every other text-dt-h2 consumer (Stat, pricing price, lead-section, blog headings) already carries explicitly"

patterns-established: []

requirements-completed: []

coverage:
  - id: D1
    description: "--text-dt-h2 token (font-size clamp, line-height, new letter-spacing companion) matches the reference design prototype's exact devtools-inspected computed style"
    verification:
      - kind: unit
        ref: "node -e clamp-math verification in Task 1 <verify> block — confirms flat 30.4px floor ≤894px, scaling 894-1294px, flat 44px cap ≥1294px"
        status: pass
    human_judgment: false
  - id: D2
    description: "section-heading.tsx's <h2> renders font-extrabold (800), scoped to that component only"
    verification:
      - kind: unit
        ref: "grep -F font-extrabold apps/web/shared/components/section-heading.tsx (present) and grep -F font-bold (absent)"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-08-20
status: complete
---

# Quick Task 260820-1bb: Match --text-dt-h2 to reference design's exact computed style — Summary

**Replaced the hand-derived `--text-dt-h2` fluid clamp with the user-supplied, devtools-inspected reference value `clamp(1.9rem, 3.4vw, 2.75rem)` (line-height 1.1, new letter-spacing -0.03em companion token), and bumped `section-heading.tsx`'s own `<h2>` to `font-extrabold` (800) to match the reference's computed font-weight.**

## Performance

- **Duration:** 8 min
- **Tasks:** 2/2 completed
- **Files modified:** 2

## Accomplishments

- `--text-dt-h2` in `apps/web/app/premium-theme.css` now reads `clamp(1.9rem, 3.4vw, 2.75rem)` with `line-height: 1.1` and a new `--text-dt-h2--letter-spacing: -0.03em` companion token, exactly matching the reference design prototype's own devtools-inspected computed style. Verified via clamp-math: flat 30.4px for every width ≤~894px, scaling up between ~894-1294px, flat 44px cap from ~1294px onward.
- `section-heading.tsx`'s `<h2>` now renders `font-extrabold` (800) instead of `font-bold` (700), matching the reference's computed font-weight. Scoped to this one component only — `stat.tsx`, `pricing-section.tsx`, `lead-section.tsx`, and blog list/error headings keep `font-bold` (700) unchanged, since they all already declare their own explicit weight class and were not part of the reference's "section heading" inspection.
- Every other `text-dt-h2` consumer (Stat hero numbers, pricing plan price, lead-section heading, blog list/error headings) inherits the new font-size/line-height/letter-spacing automatically through the shared Tailwind v4 custom-property token — no consumer file besides `section-heading.tsx` needed editing.

## Task Commits

Each task was committed atomically:

1. **Task 1: Match --text-dt-h2 token to reference design's exact computed style** - `8559b83` (fix)
2. **Task 2: Bump section-heading.tsx's h2 to font-extrabold (800)** - `0c69e50` (fix)

## User-Facing Flags (carried from plan `must_haves`)

**FLAGGED SHAPE CHANGE — surfaced, not silently accepted:** Under this exact reference clamp, phone (≤430px) and tablet-portrait (up to ~894px, e.g. 768px) render **identically** at the 1.9rem/30.4px floor — there is no "phone smaller than tablet" distinction in this range. Only tablet-landscape and up (~894-1294px) actively scales toward the 2.75rem/44px desktop cap. This is a materially different shape than the original quick-task ask (a continuous 3-tier phone < tablet < desktop stepping). It is accepted here **only** because it is sourced directly from the original design prototype's own devtools-inspected computed style — the ground-truth source of visual truth for this design-archive-port project. If the original intent was strictly "phone smaller than tablet, tablet smaller than desktop" at every breakpoint, this reference value does not deliver that; it delivers exact parity with the design prototype instead.

**Desktop cap decreased:** Desktop-width (≥1294px) section headings now render at 2.75rem (44px) — smaller than the previous 3.25rem (52px) cap. This is an intentional decrease sourced from the reference design, not a regression, but it moves further from the earlier "дуже мілке" (too small) client fix's cap value (git log `9e630a6`) — even though this time the value is sourced from ground truth rather than derived by hand.

## Deviations from Plan

None - plan executed exactly as written. Both tasks matched their `<action>` and `<done>` criteria without requiring any Rule 1/2/3 auto-fixes.

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: apps/web/app/premium-theme.css (--text-dt-h2, --text-dt-h2--line-height, --text-dt-h2--letter-spacing all present and correct)
- FOUND: apps/web/shared/components/section-heading.tsx (font-extrabold present, font-bold absent)
- FOUND: commit 8559b83 (Task 1)
- FOUND: commit 0c69e50 (Task 2)
- Confirmed via `git diff --stat HEAD~2 HEAD`: exactly 2 files changed (premium-theme.css, section-heading.tsx) — no other `text-dt-h2` consumer touched.
