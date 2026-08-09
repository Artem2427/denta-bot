# Deferred Items — 260809-v35

Out-of-scope discoveries logged during execution of quick task 260809-v35 (tune idle bounce animation on hero notification card). Not fixed here per the executor's scope boundary rule (pre-existing issues in unrelated files are out of scope).

## 1. Unused import warning in `hero.tsx` (pre-existing, blocks `pnpm --filter web lint`)

- **File:** `apps/web/modules/home/hero.tsx:6`
- **Issue:** `'SignatureMark' is defined but never used` (`@typescript-eslint/no-unused-vars`), which fails `pnpm --filter web lint --max-warnings 0`.
- **Pre-existing confirmation:** `hero.tsx` has zero diff from this task (`git diff --name-only -- apps/web/modules/home/hero.tsx` is empty). The warning traces to commit `9f44326` (`feat(home): remove redundant pulse dot from notification card`), which predates this task's worktree base.
- **Why deferred:** This task's scope is confined to `apps/web/shared/lib/motion.ts` per the plan objective. Fixing an unrelated unused-import warning in `hero.tsx` is out of scope for this task (SCOPE BOUNDARY rule).
- **Recommendation:** A follow-up quick task should remove the unused `SignatureMark` import (or wire it in, if it was meant to be used) from `apps/web/modules/home/hero.tsx` so `pnpm --filter web lint` passes cleanly again.
