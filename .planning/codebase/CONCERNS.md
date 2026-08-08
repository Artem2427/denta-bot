# Codebase Concerns

**Analysis Date:** 2026-08-08

## Summary

This repository is currently an unmodified Turborepo starter scaffold (single "Initial commit"). It contains four boilerplate apps (`apps/web`, `apps/docs`, `apps/admin-panel`, `apps/server`) and two shared packages (`packages/ui`, `packages/eslint-config`, `packages/typescript-config`), none of which contain product-specific business logic yet. Most "concerns" at this stage are about what is *missing* rather than existing bugs, since there is very little real functionality to break.

## Tech Debt

**No environment/config scaffolding:**
- Issue: No `.env.example`, no config validation, no secrets management anywhere in the repo. `apps/server/src/main.ts` reads `process.env.PORT` directly with no validation layer (e.g. no `@nestjs/config`, no zod/joi schema).
- Files: `apps/server/src/main.ts`
- Impact: As soon as real environment variables (DB URLs, API keys) are introduced, there is no established pattern for loading/validating them, risking ad-hoc `process.env.X` usage scattered through the codebase.
- Fix approach: Introduce `@nestjs/config` with a validation schema before adding the first real integration.

**Server app is unbuilt boilerplate:**
- Issue: `apps/server` is the default NestJS CLI output — a single `AppModule` with a hard-coded `getHello()` string, empty `imports: []`, no database module, no auth module, no DTOs/validation pipes, no global exception filter.
- Files: `apps/server/src/app.module.ts`, `apps/server/src/app.controller.ts`, `apps/server/src/app.service.ts`
- Impact: Any real API work starts from zero; there are no established conventions yet for module structure, DTO validation, or error handling in this codebase.
- Fix approach: Establish core cross-cutting concerns (global `ValidationPipe`, exception filter, config module, logging) before the first feature module is added, so later phases don't retrofit them.

**Admin panel and web/docs apps are unstyled starter shells:**
- Issue: `apps/admin-panel/src/App.tsx` is the default Vite+React counter demo; `apps/web/app/page.tsx` and `apps/docs/app/page.tsx` are the default Next.js/Turborepo landing pages referencing Turborepo marketing assets (`turborepo-dark.svg`, etc.).
- Files: `apps/admin-panel/src/App.tsx`, `apps/web/app/page.tsx`, `apps/docs/app/page.tsx`
- Impact: None functionally yet, but these files/assets should be fully replaced (not incrementally patched) once real UI work begins, otherwise dead marketing assets and demo code will linger.
- Fix approach: Delete starter page content and unused public assets in the first UI-focused phase rather than layering new code on top.

**`packages/ui` contains a full shadcn/ui component set with unclear consumption:**
- Issue: `packages/ui/src/components/shadcn-ui/` has ~15 generated shadcn components (e.g. `sidebar.tsx` at 726 lines, `menubar.tsx`, `dropdown-menu.tsx`) but neither `apps/web` nor `apps/docs` nor `apps/admin-panel` currently import from `@repo/ui` in the pages inspected.
- Files: `packages/ui/src/components/shadcn-ui/*`, `packages/ui/index.tsx`
- Impact: Unclear whether this is the intended design system for the admin panel or leftover scaffolding; risk of divergent/duplicate UI patterns if apps build their own components instead of using this package.
- Fix approach: Decide and document (e.g. in STRUCTURE.md) that `@repo/ui` is the canonical shared component source before admin-panel UI work begins.

## Known Bugs

None identified — no functional application code exists yet beyond framework defaults, so there is nothing to exhibit a bug.

## Security Considerations

**No authentication/authorization anywhere:**
- Risk: `apps/server` has zero auth middleware, guards, or strategy packages installed (no `@nestjs/passport`, `@nestjs/jwt`, etc. in `apps/server/package.json`). The only route (`GET /`) is unauthenticated by design (it's the default hello-world), but this means there is no established auth pattern to extend.
- Files: `apps/server/src/app.module.ts`, `apps/server/package.json`
- Current mitigation: None (no exposed sensitive endpoints yet).
- Recommendations: Define the auth strategy (session/JWT/OAuth) explicitly before building the first protected endpoint, given this is presumably a dental-practice-related bot/admin system (per repo name `denta-bot`) that will likely handle patient or business data.

**No input validation pipeline:**
- Risk: NestJS `ValidationPipe` is not registered globally in `apps/server/src/main.ts`. `class-validator`/`class-transformer` are not present in `apps/server/package.json` dependencies.
- Files: `apps/server/src/main.ts`, `apps/server/package.json`
- Current mitigation: None.
- Recommendations: Add global `ValidationPipe` and DTO validation conventions as part of the first real API phase, not retrofitted later.

**No secrets detected in repo (good), but no secret-management pattern established:**
- Risk: `.gitignore` correctly excludes `.env*` files, and no `.env` files exist in the working tree currently. However, there is no `.env.example` documenting what variables will be required, so future contributors may commit real secrets accidentally when creating their first `.env`.
- Files: `.gitignore`
- Current mitigation: `.env*` patterns are gitignored.
- Recommendations: Add a checked-in `.env.example` (with placeholder values only) as soon as the first environment variable is introduced.

## Performance Bottlenecks

None applicable — no data-processing, database, or high-traffic code paths exist yet.

## Fragile Areas

**Monorepo package boundaries not yet exercised:**
- Files: `pnpm-workspace.yaml`, `turbo.json`, `packages/ui/package.json`
- Why fragile: Workspace dependency wiring (`@repo/ui`, `@repo/eslint-config`, `@repo/typescript-config`) has not been proven under real cross-package changes (e.g. editing `packages/ui` and confirming `apps/admin-panel` picks up the change via `turbo dev`). Since no app currently imports `@repo/ui`, this path is untested.
- Safe modification: Verify the turbo pipeline (`turbo.json` tasks: build/dev/lint/check-types) actually propagates changes across packages before relying on it in later phases.
- Test coverage: No tests exist for build/dev pipeline behavior (this is inherently hard to unit test, but should be manually verified early).

## Scaling Limits

Not applicable at this stage — no persistence layer, no traffic, no deployed infrastructure exists yet.

## Dependencies at Risk

**`packageManager: pnpm@9.0.0` pinned but no lockfile-integrity check enforced in scripts:**
- Risk: `package.json` pins `pnpm@9.0.0`, but there's no CI configuration in the repo (`.github/` not found) enforcing `pnpm install --frozen-lockfile`, so lockfile drift could go unnoticed.
- Impact: Low right now (single dev), but will matter once collaborators or CI are introduced.
- Migration plan: Add CI (GitHub Actions or similar) running `pnpm install --frozen-lockfile` before this becomes a multi-contributor risk.

## Missing Critical Features

**No CI/CD pipeline:**
- Problem: No `.github/workflows/`, no CI config of any kind found in the repo root or app directories.
- Blocks: Automated lint/test/build/type-check on PRs; safe collaboration; deployment automation.

**No testing beyond NestJS CLI defaults:**
- Problem: The only test files are the NestJS scaffold's `apps/server/src/app.controller.spec.ts` and `apps/server/test/app.e2e-spec.ts`, both testing the default "Hello World" behavior. `apps/web`, `apps/docs`, and `apps/admin-panel` have zero test files or test framework configuration.
- Blocks: Confidence in any future frontend logic; regressions in `apps/web`/`apps/admin-panel` would go undetected.

**No database/persistence layer:**
- Problem: No ORM, no database client, no migration tooling present in `apps/server/package.json` or elsewhere.
- Blocks: Any feature requiring durable storage (users, appointments, messages — presumably central to a "denta-bot" product) cannot be built until this is chosen and wired in.

## Test Coverage Gaps

**Entire frontend apps untested:**
- What's not tested: All of `apps/web`, `apps/docs`, `apps/admin-panel` (no test files, no test runner configured in their `package.json` files).
- Files: `apps/web/`, `apps/docs/`, `apps/admin-panel/`
- Risk: As real UI/logic is added, there is no established testing pattern (no Vitest/Jest/RTL config) to extend, increasing the chance tests are skipped altogether under time pressure.
- Priority: Medium — establish a frontend test setup (e.g. Vitest + React Testing Library) in the first phase that adds real UI logic, not after.

**Server tests only cover framework boilerplate:**
- What's not tested: Nothing beyond the default `getHello()` string. No tests exist for config loading, error handling, or any real endpoint (because none exist yet).
- Files: `apps/server/src/app.controller.spec.ts`, `apps/server/test/app.e2e-spec.ts`
- Risk: Low right now; becomes relevant as soon as real controllers/services are added.
- Priority: Low until first feature module lands, then High.

---

*Concerns audit: 2026-08-08*
