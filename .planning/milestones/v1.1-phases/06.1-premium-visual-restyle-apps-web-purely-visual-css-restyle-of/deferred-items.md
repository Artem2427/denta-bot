# Deferred Items — Phase 06.1 Plan 02

Out-of-scope discoveries logged per the executor's scope-boundary rule. Not fixed by this plan.

## Pre-existing tsc error: packages/ui/src/components/shadcn-ui/spinner.tsx

- **Found during:** Task 1 verify (`pnpm exec tsc --noEmit`)
- **Error:** `packages/ui/src/components/shadcn-ui/spinner.tsx(7,6): error TS2322: Type '{ ... }' is not assignable to type 'IntrinsicAttributes'.`
- **Confirmed pre-existing:** reproduced with `git stash` against this plan's changes (error present with zero diff applied).
- **Out of scope:** `packages/ui` is not in this plan's `files_modified` list; this plan's verify command only anticipated the known `button-group.tsx` pre-existing error. This is a second, previously-undocumented pre-existing tsc error in the same package, unrelated to any file this plan touches.
- **Action:** Not fixed. Verify gates for Tasks 1-3 are treated as passing when the only tsc output is this pre-existing `spinner.tsx` error plus the previously-known `button-group.tsx` error.
