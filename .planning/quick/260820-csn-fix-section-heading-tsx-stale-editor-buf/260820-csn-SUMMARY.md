---
type: quick
slug: 260820-csn-fix-section-heading-tsx-stale-editor-buf
status: complete
tags: [apps-web, bugfix, formatting, design-token]
dependency-graph:
  requires: []
  provides: []
  affects:
    - apps/web/modules/landing/problem-solution.tsx
    - apps/web/modules/landing/lead-section.tsx
key-files:
  created: []
  modified:
    - apps/web/shared/components/section-heading.tsx
    - apps/web/shared/components/eyebrow.tsx
decisions:
  - "Restored section-heading.tsx to its intended 260820-1bb content (font-extrabold, max-w-2xl, no redundant Eyebrow classes, no redundant mt-2, no stray blank lines) while deliberately keeping the current, already-Prettier-correct import order rather than reverting to committed HEAD's unformatted order — avoids repeating the exact root-cause bug (an unformatted commit) that caused the stale-editor-buffer overwrite in the first place."
  - "Changed Eyebrow's on-navy tone from text-dt-warm-white/80 to text-dt-coral per user's devtools-inspected reference color (rgb(232,107,90) / #e86b5a) — propagates to both ProblemSolution and LeadSection automatically via the shared eyebrowVariants token, which is intentional site-wide consistency."
metrics:
  duration: 8min
  completed: 2026-08-20
---

# Fix section-heading.tsx stale editor buffer + eyebrow on-navy color Summary

Restored `section-heading.tsx` to its intended post-260820-1bb content (accidentally reverted by a stale editor buffer save) without reintroducing that commit's unformatted-import-order bug, and changed `Eyebrow`'s `on-navy` tone to `text-dt-coral` to match the user's devtools-inspected reference design color.

## What Was Built

**Task 1 — `apps/web/shared/components/section-heading.tsx` (commit `0b057f1`):**
Replaced the file's full contents with the plan's pre-verified content. Relative to the stale-buffer state found on disk:
- `h2` reverted from `font-bold` back to `font-extrabold` (matching commit `0c69e50`'s original intent)
- `max-w-2xl` restored on the description `<p>`
- Removed redundant `font-dt-mono uppercase` from the `<Eyebrow>` usage (dead duplication — `eyebrowVariants` already applies these unconditionally)
- Removed redundant `mt-2` on the `h2` (Eyebrow's own `mb-2` already supplies that spacing)
- Removed stray blank lines between the eyebrow/h2/description JSX blocks
- Import order left untouched (already Prettier-correct on disk: `cn` then `React`, no blank line, then blank line, then `Eyebrow` from `./eyebrow`)

**Task 2 — `apps/web/shared/components/eyebrow.tsx` (commit `c7d4285`):**
Changed `eyebrowVariants`'s `tone.on-navy` value from `text-dt-warm-white/80` to `text-dt-coral`, matching the user's devtools inspection of the reference design's "ПРОБЛЕМА" eyebrow (`rgb(232, 107, 90)` = `--color-dt-coral: #e86b5a`). `ProblemSolution` renders this via `<SectionHeading tone="navy" eyebrow={...}>` → `<Eyebrow tone="on-navy">`; `LeadSection` uses the identical pattern and picks up the same color automatically through the shared token — intentional, not a side effect.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing import-order Prettier violation in `eyebrow.tsx`**
- **Found during:** Task 2 verification (`pnpm exec prettier --check apps/web/shared/components/eyebrow.tsx` failed)
- **Issue:** The committed `eyebrow.tsx` already had `cn` imported last (after `cva`/`React` with a blank-line group), which violates this project's `@trivago/prettier-plugin-sort-imports` ordering rule. This was a pre-existing condition unrelated to the one-line color-value change — confirmed by running `prettier --check` against the untouched `git show HEAD:apps/web/shared/components/eyebrow.tsx` content, which also fails.
- **Fix:** Ran `pnpm exec prettier --write apps/web/shared/components/eyebrow.tsx`, which reordered the imports (`cn` moved to the top, no blank-line separation) with no other content change.
- **Files modified:** `apps/web/shared/components/eyebrow.tsx`
- **Commit:** `c7d4285`

## Verification Results

- `pnpm exec prettier --check apps/web/shared/components/section-heading.tsx apps/web/shared/components/eyebrow.tsx` — **PASS**
- Task 1 automated verify (`font-extrabold` present, `font-bold`/`font-dt-mono uppercase`/`mt-2` absent, `max-w-2xl` present) — **PASS**
- Task 2 automated verify (`'on-navy': 'text-dt-coral'` present, `text-dt-warm-white/80` absent, `text-dt-navy` present) — **PASS**
- `grep -rF 'SectionHeading tone="navy"' apps/web/modules/landing/` — no matches; both `problem-solution.tsx` and `lead-section.tsx` pass `tone="navy"` via a differently-formatted call (multi-line JSX props), not this exact single-line grep pattern. Manually confirmed via file inspection during planning that both consumers route through `SectionHeading tone="navy"` unmodified — neither file was touched by this task.
- `pnpm --filter web check-types` — **FAILS**, but on a pre-existing, unrelated `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict confined to `packages/ui/src/components/shadcn-ui/button-group.tsx` (documented blocker in STATE.md, open since Phase 1). Not caused by this task's changes.
- `pnpm --filter web lint` — **FAILS**, but on a pre-existing, unrelated warning in `apps/web/shared/lib/api-url.ts` (`API_URL is not listed as a dependency in turbo.json`). Not caused by this task's changes.

Only `apps/web/shared/components/section-heading.tsx` and `apps/web/shared/components/eyebrow.tsx` were modified. Several other files were already modified/untracked in the working tree at task start (`pricing-section.tsx`, `header.tsx`, `reviews.tsx`, `lead-section.tsx`, `premium-theme.css`) — these were explicitly out of scope per the task instructions and were left untouched and unstaged throughout.

## Self-Check: PASSED

- FOUND: apps/web/shared/components/section-heading.tsx
- FOUND: apps/web/shared/components/eyebrow.tsx
- FOUND: commit 0b057f1
- FOUND: commit c7d4285
