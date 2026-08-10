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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | multiple | 4 (1, 01.1, 2, 3) | First milestone — established "move fast" project preference after Phase 1, spec-less probe fallback used from Phase 3 onward |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 (no test framework in `apps/web`) | N/A | `react-hook-form`, `zod`, `@hookform/resolvers`, `motion`, `@phosphor-icons/react` |

### Top Lessons (Verified Across Milestones)

1. Tracer-first + blocking human checkpoint before expansion tasks — zero false positives so far, cheap insurance against compounding a wrong foundation.
2. Explicit user process preferences ("move fast for this kind of work") should be applied consistently, not re-confirmed per phase.
