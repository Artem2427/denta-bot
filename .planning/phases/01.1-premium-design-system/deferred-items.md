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
