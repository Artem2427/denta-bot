# Deferred Items — Phase 01.1

Items discovered during execution that are out of scope for the current plan/task (pre-existing, unrelated to the changes being made) and therefore not auto-fixed per the executor's scope-boundary rule.

## Plan 01.1-01

- **`pnpm --filter web check-types` fails on pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict** (Task 3 verify step)
  - All 5 `tsc` errors are confined to `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` — none reference `apps/web/app/fonts.ts` or any file this plan created/modified.
  - Already documented as a known blocker in `.planning/STATE.md` ("Blockers/Concerns") and `.planning/PROJECT.md` ("Active" requirements) since Phase 1: "requires a monorepo-wide `pnpm.overrides` fix, out of scope for Phase 1 — recommended before/during Phase 2."
  - No new instance of this error was introduced by this plan; `apps/web/app/fonts.ts` itself is error-free, and the `cyrillic` Google Fonts subset was accepted without a subset-validation error (confirms Task 3's D-08/A1 risk did not materialize).
  - Not fixed here — remains tracked at the project level for a `pnpm.overrides` fix.

## Plan 01.1-02

- **`pnpm --filter web check-types` fails on the same pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict** (Task 2 verify step)
  - Identical error set to Plan 01.1-01's entry above, confined to `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` — none reference `apps/web/shared/lib/cn.ts`, `apps/web/shared/components/premium-button.tsx`, `premium-card.tsx`, or `container.tsx`.
  - No new instance introduced by this plan; all 4 new files this plan created are error-free.
  - Not fixed here — remains tracked at the project level for a `pnpm.overrides` fix.

## Plan 01.1-03

- **Same pre-existing `csstype` conflict reappears in `pnpm --filter web check-types`** (Task 2 verify step) — identical 5 errors, same 3 files (`button-group.tsx`, `calendar.tsx`, `sidebar.tsx`), none touched by this plan. `apps/web/shared/hooks/use-in-view.ts`, `apps/web/shared/lib/motion.ts`, `apps/web/shared/components/reveal.tsx`, and `apps/web/shared/components/signature-mark.tsx` are all error-free. Not fixed here for the same reason as above.

## Plan 01.1-04

- **Same pre-existing `csstype@3.1.3`/`3.2.3` duplicate-resolution conflict now also fails `pnpm --filter web build`** (Task 3 verify step), not just `check-types` — this is the first plan where the full `apps/web` app is built end-to-end, so the `tsc` step inside `next build`'s type-check phase surfaces the same identical 5 errors (confirmed via `pnpm --filter web check-types` run separately: same error signature, same 3 files, same line numbers as Plans 01.1-01/02/03).
  - Confined to `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` — none reference `apps/web/shared/components/{logo,theme-toggle,header,footer}.tsx`, `apps/web/app/layout.tsx`, or `apps/web/app/not-found.tsx` (this plan's own files).
  - `pnpm --filter web lint` exits 0 (confirms no new lint issues from this plan's rebuild).
  - Per this plan's own action text, this exact known error signature is treated as an acceptable non-blocking condition for Task 3's "done" status — build is not clean, but the failure is 100% attributable to the pre-existing, project-wide `csstype` blocker, unrelated to this phase's work.
  - Still not fixed here — remains tracked at the project level for a `pnpm.overrides` fix; now blocking a genuinely clean production build of `apps/web`, so priority should increase for landing this fix early in Phase 2.
