# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-08-10
**Phases:** 4 (1, 01.1, 2, 3) | **Plans:** 12 | **Sessions:** multiple (exact count not tracked)

### What Was Built
- Re-themed `packages/ui` and a shared site shell (header/footer/theme-provider/404) — Phase 1
- A bespoke premium `dt-*` design system for `apps/web` (own palette/typography/motion/icons) after a mid-milestone client-directed redesign — Phase 01.1
- Home, Contacts (react-hook-form + zod lead form), Demo (scripted Telegram-bot simulation + embedded `@repo/ui` admin-panel view) — Phase 2
- Prices (billing toggle, 14-row comparison table, FAQ) and Blog (functional search/filter listing, 6 posts with real authored content, dynamic detail routes with `notFound()` handling) — Phase 3
- All six routes of a Figma-exported design archive faithfully ported into Next.js 16 App Router, mock-data-only, production-shaped

### What Worked
- **Explicit "move fast" user preference for this project type paid off.** The user told the agent early (after Phase 1) to stop deliberating on optional GSD gates (research spawns, UI-SPEC generation) since this was a 1:1 design-archive port, not novel design work. Skipping those gates on Phases 2-3 kept planning overhead low without any quality regression — every phase still passed verification cleanly.
- **Tracer-first plan structure caught nothing wrong, but was cheap insurance.** Both Phase 3 plans led with a `type="tracer"` task and a blocking human-verify checkpoint before building the rest. Zero issues were found at either checkpoint, but the pattern meant a bad foundational assumption (wrong component API, wrong route structure) would have been caught before compounding across 2 more tasks.
- **Pattern-mapper + prior-phase SUMMARY.md reuse kept later phases fast.** Phase 3's planner reused Phase 2's `PremiumAccordion`/`PremiumCard`/`routes.ts`/`not-found.tsx` patterns directly via `03-PATTERNS.md`, and needed only 2 genuinely new primitives (`PremiumSwitch`, `PremiumBadge`) across the whole phase.
- **UAT/VERIFICATION/SECURITY gates never found a real defect.** Every phase's automated verification (tsc, must_haves cross-check) plus human UAT passed clean on the first pass across all 4 phases — the design-source-transcribed-verbatim-into-CONTEXT.md approach meant executors had unambiguous ground truth to build against.
- **Executor correctly preserved a user's live manual edit mid-checkpoint.** While a Phase 3 tracer checkpoint was open, the user hand-edited `pricing-cards.tsx` in their IDE (a card-height fix) without saying so. The resuming executor was explicitly briefed to treat that uncommitted diff as intentional and build on top of it rather than overwrite — it worked, and the fix landed folded into the next task's commit with an explanatory note.

### What Was Inefficient
- **A background planner agent hit a session-usage-limit mid-run** during Phase 3 planning (`gsd-planner`) and again a Phase-3 executor hit the same limit mid-plan-03-01. Both times the in-progress work was already safely on disk (git commits, partial PLAN.md), so recovery was just re-verifying state and spawning a fresh agent to continue — but it cost an extra round-trip each time, and a naive orchestrator could have re-run redundant work if it hadn't checked disk state first.
- **Checkpoint-resume required a fresh agent, not a resumed one, every time.** GSD's own protocol says "spawn continuation, not resume" for exactly this reason (resume relies on serialization that breaks under parallel tool calls) — worth remembering as a hard rule, not just a fallback.
- **ROADMAP.md's plan-list annotation step (`roadmap.annotate-dependencies`) silently no-op'd once** during Phase 3 planning, leaving a stale "TBD" placeholder that had to be manually cleaned up post-execution. Worth a closer look if this recurs in v1.1.

### Patterns Established
- **Bespoke per-app design systems are a legitimate mid-milestone pivot**, not just tech debt — Phase 01.1's insertion (client sent a full premium-redesign ТЗ mid-Phase-2) was handled cleanly by scoping it to `apps/web` only and leaving `packages/ui`/`apps/admin-panel` untouched, rather than trying to reconcile both systems into one theme.
- **Spec-less probe fallback (deterministic edge-probe + LLM prohibition-probe) is a workable substitute for a full SPEC.md** on phases where research/spec generation is deliberately skipped — Phase 3's must_haves were fully seeded this way and the plan-checker found nothing missing.
- **Quick tasks (`/gsd-quick`) are the right tool for post-hoc content/positioning additions** that don't fit the original phase scope — used repeatedly for small UI polish (card-height fixes, animation tuning, hero stat count-up) and once for a substantive new marketing section (the "unified source of truth" admin-capability highlight), all without disturbing in-flight phase execution.

### Key Lessons
1. When a user gives a durable, project-scoped preference ("move fast, we're just porting"), apply it consistently across every subsequent phase without re-litigating — re-asking "research first or skip?" every phase wastes the exact overhead the user asked to cut.
2. A blocking human-verify checkpoint after the tracer task is cheap relative to the cost of discovering a wrong foundational assumption after 3 tasks are built on it — keep this default even on "boring" mechanical-port phases.
3. Background agents can and will hit session/usage limits mid-run on longer phases; always check disk state (`git log`, existence of `SUMMARY.md`/`PLAN.md`) before assuming a stalled agent means lost work — most of the time the work already landed.
4. Uncommitted, unrelated user edits in the working tree during agent execution must be explicitly called out to the next agent (not silently overwritten or blindly `git add -A`'d) — scope every executor's staging to its own declared files when the tree isn't guaranteed clean.

### Cost Observations
- Model mix: not tracked this milestone
- Sessions: multiple (exact count not tracked)
- Notable: 2 mid-run session-limit interruptions on Phase 3, both recovered cleanly by resuming from on-disk git state rather than restarting from scratch

---

## Milestone: v1.1 — Platform Admin API

**Shipped:** 2026-08-20
**Phases:** 5 (4, 5, 6, 06.1, 06.2) | **Plans:** 24 | **Tasks:** 54 | **Commits:** 233 since `v1.0` (59 `feat`), 207 non-planning files changed (+13,104/−3,179)

### What Was Built
- `packages/db` (`@repo/db`) — Prisma 7 schema/migrations/seeds on the `@prisma/adapter-pg` driver adapter — plus `apps/server` on NestJS with full JWT auth: argon2, refresh rotation with atomic reuse detection, server-side logout revocation, fail-closed global `AccessTokenGuard`, Swagger at `/api/docs` — Phase 4
- Clinics / Leads / BlogPosts / PricingPlans resource modules with `updatedBy` trace fields and an atomic, race-guarded Lead→Clinic conversion, plus `apps/platform-admin` bootstrapped from an untouched Vite scaffold into an authenticated SPA (React Router v7 + TanStack Query + `openapi-fetch` typed client) with screens for all four — Phase 5
- `apps/web` cut over to real data — rate-limited public `POST /leads` from both forms, published-only `GET /public/blog-posts(/:slug)` and `GET /public/pricing-plans` replacing `_data.ts` and hardcoded pricing — Phase 6
- Premium `dt-*` restyle of every route (Manrope + JetBrains Mono, 8 additive tokens, 4 CVA primitives) — Phase 06.1
- Six pages collapsed into one trilingual (uk/ru/en) scrolling landing with a single `#lead` funnel; `/prices`, `/demo`, `/contacts` retired to 307 anchor redirects — Phase 06.2

### What Worked
- **Code review finally earned its slot.** v1.0's retro noted the gates "never found a real defect"; v1.1 inverted that — `06-REVIEW.md` caught two BLOCKERs (blog body never rendered due to an array-vs-object DTO mismatch; `CreateLeadDto` silently skipping all email/phone validation when both fields were present), both fixed same-session and re-verified by live round-trip against a running server, not just re-reading the diff. Backend work has real failure modes that visual porting didn't.
- **The generated typed client paid for itself.** Deriving `apps/platform-admin`'s client from the live Swagger spec via `openapi-typescript` meant Phase 6's DTO additions (e.g. `LeadResponseDto`) surfaced as compile errors instead of runtime surprises — the contract stayed enforced across a backend/frontend split built by different plans.
- **Tracer-first held under a much bigger architecture change.** Each of Phases 4/5/6 led with a tracer (login endpoint → Clinics screen end-to-end → public `POST /leads`) that proved an entire new layer before the remaining plans expanded on it. No foundational rework in any of the three.
- **Verifying fixes against a live stack, not the diff.** Phase 6's verifier re-ran the blocker paths against a running `apps/server` + Postgres. That is the standard the backend milestones should keep.

### What Was Inefficient
- **Phase bookkeeping drifted from reality for five days.** Phase 6 finished UAT 5/5 on 2026-08-15 but stayed `[ ]`/"In Progress" in ROADMAP.md and `human_needed` in `06-VERIFICATION.md` until milestone close on 08-20, while two later phases (06.1, 06.2) executed on top of it. Nothing was broken; the state files just stopped describing the repo.
- **A one-word vocabulary slip made tooling misreport a finished phase.** `06.1-VERIFICATION.md` was written `status: verified` instead of `status: passed`; `init.manager` reported the phase as `verification_status: unknown, phase_complete: false` and told the operator to re-run execution on a phase that was fully done.
- **Deferred tech debt was never re-checked and went stale.** Phase 06.1 deferred two pre-existing `packages/ui` tsc errors (`spinner.tsx`, `button-group.tsx`) as out-of-scope. At close, `pnpm exec tsc --noEmit` in `packages/ui` exits 0 — neither reproduces. The audit still surfaced them as open items five phases later.
- **Two client-directed visual insertions (06.1, 06.2) landed mid-milestone**, the second one rewriting the page structure that Phase 6 had just wired to the API. Nothing regressed, but Phase 6's per-page work (`/prices`, `/contacts`, `/demo` sections) was partly re-homed into landing sections weeks after being built.

### Patterns Established
- **Client-directed decimal insertions are now this project's normal mode, not an exception.** 01.1, 06.1, 06.2 all originated the same way: the client sends a design/scope ТЗ mid-milestone and it becomes an inserted phase rather than a milestone renegotiation. Plan for one per milestone.
- **Backend phases get live-stack verification, frontend phases get human UAT.** Both milestones now show the same split working: curl/round-trip evidence for API truths, browser eyeballs for visual/interactive truths.
- **Big client specs get archived as a `999.x` backlog document with an explicit milestone split before any planning starts** — the server ТЗ landed as `SERVER-TZ.md` with a v1.2/v1.3/v1.4 slicing and a corrections section, so the next `/gsd-new-milestone` starts from a reconciled document rather than raw chat text.

### Key Lessons
1. Run the phase-completion step immediately after UAT passes. A finished phase left marked "In Progress" silently degrades every later readiness check, and the drift compounds while later phases build on top of it.
2. GSD status fields are a controlled vocabulary — `passed`, not `verified`. A synonym reads as "unknown" to the tooling and produces a "re-run execution" recommendation for work that is already done.
3. Re-verify deferred tech debt at milestone close instead of carrying it forward on trust: two of the items in this close's audit had already fixed themselves, and one genuinely open item (`apps/docs` cannot resolve `@repo/ui/button`) was only found by actually running `pnpm check-types`.
4. When a client spec arrives that is clearly multi-milestone, split it and write the split down before planning anything — and reconcile it against the installed stack first (this one assumed Prisma `$use` middleware, removed in the Prisma 7 the repo runs).

### Cost Observations
- Model mix: not tracked this milestone
- Sessions: not tracked; at least one mid-plan interrupt (Phase 4, Plan 04-01) recovered from on-disk git state — same recovery pattern as v1.0's two interrupts
- Notable: 24 plans across 5 phases in 10 calendar days, with two unplanned client-directed insertions absorbed without a milestone reset

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | multiple | 4 (1, 01.1, 2, 3) | First milestone — established "move fast" project preference after Phase 1, spec-less probe fallback used from Phase 3 onward |
| v1.1 | not tracked | 5 (4, 5, 6, 06.1, 06.2) | First backend milestone — live-stack verification for API truths, generated OpenAPI client as the frontend/backend contract; two client-directed insertions absorbed mid-milestone |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 (no test framework in `apps/web`) | N/A | `react-hook-form`, `zod`, `@hookform/resolvers`, `motion`, `@phosphor-icons/react` |
| v1.1 | Jest specs on `apps/server` (Leads service, TDD-covered conversion) | not measured | `@prisma/client`+`@prisma/adapter-pg`, `argon2`, `@nestjs/swagger`, `@nestjs/throttler`, `@tanstack/react-query`, `react-router`, `openapi-fetch`/`openapi-typescript`, `next-intl` |

### Top Lessons (Verified Across Milestones)

1. Tracer-first + blocking human checkpoint before expansion tasks — zero false positives so far, cheap insurance against compounding a wrong foundation.
2. Explicit user process preferences ("move fast for this kind of work") should be applied consistently, not re-confirmed per phase.
3. Close a phase the moment its UAT passes — v1.1 shipped with five days of stale "In Progress" state that made every readiness check lie.
4. Verify against the running system, not the diff, wherever the phase produces an API — the only two real defects found across both milestones were caught this way.
