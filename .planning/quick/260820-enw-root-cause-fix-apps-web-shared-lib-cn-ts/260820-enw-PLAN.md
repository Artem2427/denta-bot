---
type: quick
slug: 260820-enw-root-cause-fix-apps-web-shared-lib-cn-ts
autonomous: true
files_modified:
  - apps/web/shared/lib/cn.ts
must_haves:
  truths:
    - "apps/web/shared/lib/cn.ts's twMerge instance is created via tailwind-merge's extendTailwindMerge with extend.classGroups['font-size'] listing all six text-dt-h1/h2/h3/body/caption/eyebrow tokens — using extend (not override) so Tailwind's own built-in font-size utilities (text-xl, text-lg, etc., already used elsewhere in the codebase) keep working unmodified"
    - "twMerge('text-dt-h2 text-dt-navy') now returns both classes together ('text-dt-h2 text-dt-navy'), not just the color class alone — this exact string was empirically confirmed broken (returns only 'text-dt-navy') before this fix, in this repo's own node environment"
    - "Same-group conflict resolution still works correctly post-fix: twMerge('text-dt-h2 text-dt-h1') still collapses to only 'text-dt-h1' (last one wins), and twMerge('text-xl text-dt-h2') now ALSO correctly collapses to only 'text-dt-h2' — proving native Tailwind and custom dt- font-size tokens are now unified into one real conflict group, not just co-existing by accident"
    - 'On the live Next.js dev server, SectionHeading''s rendered <h2> (e.g. on the /en homepage) and Eyebrow''s rendered <span data-slot="eyebrow"> both show their text-dt-{size} token surviving alongside their text-dt-{color} token in the actual served HTML class list — both of these exact live DOM elements were empirically confirmed broken (missing text-dt-h2 / missing text-dt-eyebrow respectively) via curl against the running dev server before this fix'
    - No component file (section-heading.tsx, eyebrow.tsx, hero.tsx, features.tsx, or any other) was modified — the fix is scoped entirely to cn.ts; every component already carries the correct text-dt-{size} classes in its JSX and was only ever a victim of cn.ts silently stripping them at runtime
  artifacts:
    - apps/web/shared/lib/cn.ts
  key_links:
    - "cn.ts's twMerge instance is the single chokepoint every apps/web component's className merging passes through (imported via '@/shared/lib/cn' or a relative path) — fixing the classGroups registration here propagates the visual fix to every heading/body/caption/eyebrow sitewide without touching any consumer file"
---

<objective>
Fix a root-cause, sitewide, high-user-impact styling bug in `apps/web/shared/lib/cn.ts`. `tailwind-merge`'s default class-group matcher cannot distinguish the project's custom `text-dt-{h1,h2,h3,body,caption,eyebrow}` font-size utility classes from `text-dt-{navy,warm-white,coral,graphite}` color utility classes — it buckets both under the same implicit conflict group and, per its last-wins conflict rule, silently drops the font-size class whenever a `cn(...)` call combines one of each. Every affected element then falls back to Tailwind's default `text-xl` (20px) base-layer font-size instead of its real token value. This has been confirmed live in the browser by the user and root-caused/reproduced in isolation (not guessed) in this same repo's node environment, both before this plan and again independently during planning (see `<context>`).

The fix registers the six `text-dt-*` tokens into tailwind-merge's own built-in `'font-size'` class-group via `extendTailwindMerge({ extend: { classGroups: { 'font-size': [...] } } })`, so they correctly conflict-resolve against each other and against Tailwind's native font-size scale — while co-existing with (not overriding) `text-dt-{color}` classes, which belong to a different, separate class group.

Purpose: Stop every custom heading/body/caption/eyebrow font-size across apps/web from silently collapsing to the wrong (default 20px) size whenever combined with a color class in the same `cn()` call — a bug that has been affecting the entire visual hierarchy of the site.
Output: A corrected `apps/web/shared/lib/cn.ts`, re-proven both via a direct programmatic check against the real file and via a live check against the running dev server's actual rendered HTML — no component file touched.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/.claude/CLAUDE.md
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/lib/cn.ts
@/Users/artemdanko/Developer/denta-bot/apps/web/app/premium-theme.css
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/section-heading.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/eyebrow.tsx

**Already root-caused and empirically confirmed (do not re-derive — re-confirm via Task 1/2's own verify steps, then move on):**

In this repo's `apps/web` node environment, `tailwind-merge` v3.5.0 (see `apps/web/package.json`), BEFORE this fix:
- `twMerge('text-dt-h2 text-dt-navy')` returns `'text-dt-navy'` — `text-dt-h2` silently dropped.
- This is universal across the token set: every one of `text-dt-{h1,h2,h3,body,caption,eyebrow}` collides with every one of `text-dt-{navy,warm-white,coral,graphite}` the same way when passed together to a single `cn(...)`/`twMerge(...)` call.
- Live, on the running dev server (`curl http://localhost:3000/en`), two concrete rendered elements already prove real sitewide impact: `SectionHeading`'s `<h2>` (built via `cn('text-dt-h2 font-dt-heading font-extrabold text-balance', isNavy ? 'text-dt-warm-white' : 'text-dt-navy')` in `section-heading.tsx`) currently renders with `class="font-dt-heading font-extrabold text-balance text-dt-navy"` — `text-dt-h2` is missing. `Eyebrow`'s `<span data-slot="eyebrow">` (built via `cn(eyebrowVariants({ tone, className }))` in `eyebrow.tsx`, where `eyebrowVariants` is `cva('uppercase text-dt-eyebrow font-dt-mono', { variants: { tone: { navy: 'text-dt-navy', 'on-navy': 'text-dt-coral' } } })`) currently renders with `class="uppercase font-dt-mono text-dt-navy mt-1 block"` — `text-dt-eyebrow` is missing.
- Note: not every `text-dt-h*`/`text-dt-h3` usage in the codebase is currently broken — e.g. `hero.tsx`'s `<h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">` and `features.tsx`'s card `<h3 className="text-dt-h3 ...">` use a static className string literal, NOT `cn(...)`, so they never hit `twMerge` at all and render correctly today. This does not change the fix (the bug is in `cn.ts` and must be fixed there regardless), it only means Task 2's live check targets the two elements confirmed to actually go through `cn()` today (`SectionHeading`'s `<h2>` and `Eyebrow`'s `<span>`), since those are the ones that prove the bug and its fix.
- `getDefaultConfig()` from `tailwind-merge` confirms `'font-size'` is the exact existing internal class-group ID used for Tailwind's own font-size utilities (`text-xs`, `text-sm`, `text-xl`, etc.) — registering the six `dt-` tokens into that SAME group via `extend.classGroups['font-size']` (not `override`) is correct: it adds to the existing group instead of replacing Tailwind's built-ins, so `text-xl`/`text-lg`/etc. (used elsewhere in the codebase) keep working and correctly conflict-resolve both against each other and against the new `dt-` tokens.

**Confirmed exact final content for `apps/web/shared/lib/cn.ts`** (this exact text was independently written to the real file path and verified in this planning session to pass `prettier --check` AND `eslint --max-warnings 0` with zero issues, using this project's actual `.prettierrc` — including its `@trivago/prettier-plugin-sort-imports` plugin, which sorts the `clsx` named imports as `{ type ClassValue, clsx }`, NOT `{ clsx, type ClassValue }` as the current on-disk file has it. **Use this exact block verbatim — do not hand-retype the type-first/value-second import order differently, and do not skip formatting it, since this file is currently NOT itself `prettier --check`-clean and shipping another unformatted file here would repeat the exact mistake already made and fixed once this session in `section-heading.tsx`.**):

```ts
import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-dt-h1',
        'text-dt-h2',
        'text-dt-h3',
        'text-dt-body',
        'text-dt-caption',
        'text-dt-eyebrow',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix cn.ts's tailwind-merge config and re-prove the merge behavior against the real file</name>
  <files>apps/web/shared/lib/cn.ts</files>
  <action>
Replace the full contents of `apps/web/shared/lib/cn.ts` with the exact confirmed block given in `<context>` above — transcribe it verbatim, including the `{ type ClassValue, clsx }` import-specifier order (this project's `@trivago/prettier-plugin-sort-imports` sorts it that way; do not "fix" it back to `{ clsx, type ClassValue }`).

Root cause: `tailwind-merge`'s default class-group matcher cannot tell the project's custom `text-dt-{h1,h2,h3,body,caption,eyebrow}` font-size tokens apart from `text-dt-{navy,warm-white,coral,graphite}` color tokens, so it buckets them together and drops whichever comes first when both appear in one `cn(...)` call. The fix registers the six size tokens into `tailwind-merge`'s own built-in `'font-size'` class-group via `extendTailwindMerge({ extend: { classGroups: { 'font-size': [...] } } })` — `extend`, not `override`, so Tailwind's native font-size utilities (`text-xl`, `text-lg`, etc.) keep working exactly as before, now correctly conflict-resolving against the `dt-` tokens too instead of being unrelated to them.

Do not touch any other file. Do not add a test file — this task's own `<verify>` step is the test.
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot/apps/web && OUT=$(node --experimental-strip-types -e "
import { cn } from '/Users/artemdanko/Developer/denta-bot/apps/web/shared/lib/cn.ts';
const r=[cn('text-dt-h2','text-dt-navy'),cn('text-dt-h2','text-dt-h1'),cn('text-xl','text-lg'),cn('text-xl','text-dt-h2'),cn('text-dt-eyebrow','text-dt-coral')].join('|');
console.log(r);
" 2>/dev/null) && [ "$OUT" = "text-dt-h2 text-dt-navy|text-dt-h1|text-lg|text-dt-h2|text-dt-eyebrow text-dt-coral" ] && echo MERGE_BEHAVIOR_OK && pnpm exec prettier --check /Users/artemdanko/Developer/denta-bot/apps/web/shared/lib/cn.ts && echo PRETTIER_OK && pnpm exec eslint shared/lib/cn.ts --max-warnings 0 && echo ESLINT_OK && echo TASK1_OK</automated>
  </verify>
  <done>`apps/web/shared/lib/cn.ts` matches the confirmed content exactly (extendTailwindMerge with the six dt- tokens registered into the 'font-size' classGroup via extend). Against the real file: `cn('text-dt-h2','text-dt-navy')` returns `'text-dt-h2 text-dt-navy'` (both survive — was `'text-dt-navy'` alone before this fix); `cn('text-dt-h2','text-dt-h1')` still returns `'text-dt-h1'` (same-group conflict resolution intact); `cn('text-xl','text-dt-h2')` now returns `'text-dt-h2'` (native and custom font-size tokens now share one real conflict group). File passes `prettier --check` and `eslint --max-warnings 0` on its own. No other file was modified.</done>
</task>

<task type="auto">
  <name>Task 2: Prove the fix live on the running dev server (not just in isolation)</name>
  <files>apps/web/shared/lib/cn.ts</files>
  <action>
This task modifies no files — it is a live confirmation step, run after Task 1's fix is on disk.

Confirm the fix's real, sitewide effect on the actual running Next.js dev server, not just the isolated `cn()` proof from Task 1. If nothing is already listening on `http://localhost:3000`, start one in the background (`pnpm --filter web dev`) and poll until it responds with HTTP 200. Then, because Next's dev server (Turbopack) needs a moment to detect and recompile the `cn.ts` change via HMR, repeatedly fetch `http://localhost:3000/en` (retry loop, short sleep between attempts) until BOTH of the following are true, or a bounded number of attempts is exhausted:

1. At least one rendered `<h2>` tag's `class` attribute contains BOTH `text-dt-h2` AND one of `text-dt-navy`/`text-dt-warm-white` together — this is `SectionHeading`'s heading (built via `cn('text-dt-h2 ...', isNavy ? 'text-dt-warm-white' : 'text-dt-navy')`), which was empirically confirmed to be missing `text-dt-h2` in its live rendered class list before this fix.
2. At least one rendered `<span data-slot="eyebrow">` tag's `class` attribute contains BOTH `text-dt-eyebrow` AND one of `text-dt-navy`/`text-dt-coral` together — this is `Eyebrow`'s span (built via `cn(eyebrowVariants({ tone, className }))`), which was empirically confirmed to be missing `text-dt-eyebrow` in its live rendered class list before this fix.

Do not modify any component file to make these checks pass. If either check still fails after the retry window, the fix in `cn.ts` is incomplete or incorrect — investigate `cn.ts` itself, not the component markup (every component's JSX classes were already independently confirmed correct — see `<context>`).
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot && if ! curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/en 2>/dev/null | grep -q '^200$'; then nohup pnpm --filter web dev > /tmp/gsd-260820-enw-web-dev.log 2>&1 & for i in $(seq 1 60); do curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/en 2>/dev/null | grep -q '^200$' && break; sleep 2; done; fi; PASS=0; for i in $(seq 1 20); do HTML=$(curl -s http://localhost:3000/en); H2_OK=$(echo "$HTML" | grep -o '<h2[^>]*class="[^"]*"' | grep 'text-dt-h2' | grep -cE 'text-dt-navy|text-dt-warm-white'); EY_OK=$(echo "$HTML" | grep -o '<span data-slot="eyebrow"[^>]*class="[^"]*"' | grep 'text-dt-eyebrow' | grep -cE 'text-dt-navy|text-dt-coral'); if [ "${H2_OK:-0}" -gt 0 ] && [ "${EY_OK:-0}" -gt 0 ]; then PASS=1; break; fi; sleep 2; done; [ "$PASS" -eq 1 ] && echo TASK2_LIVE_FIX_VERIFIED || (echo TASK2_LIVE_FIX_FAILED; exit 1)</automated>
  </verify>
  <done>On the actual running dev server, `http://localhost:3000/en`'s rendered HTML shows at least one `SectionHeading` `<h2>` with `text-dt-h2` and its color class both present in the same class list, and at least one `Eyebrow` `<span data-slot="eyebrow">` with `text-dt-eyebrow` and its color class both present in the same class list — the exact sitewide symptom (missing font-size utility class in the live DOM) is confirmed fixed in the browser-served output, not just in an isolated node check.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None. This is a pure client-side styling utility (className string merging) with no user input, no data crossing any trust boundary, and no new dependency — `tailwind-merge` and `clsx` are already existing, unchanged dependencies; only their configuration/usage within `cn.ts` changes.

## STRIDE Threat Register

No applicable threats. The change is a config-only adjustment to an existing, already-audited dependency (`tailwind-merge`'s `extendTailwindMerge`), touching a single presentational utility function with no I/O, no network calls, and no new attack surface.
</threat_model>

<verification>
1. `apps/web/shared/lib/cn.ts` matches the confirmed content in `<context>` exactly — `git diff apps/web/shared/lib/cn.ts` shows only the `twMerge` construction changing from a bare `twMerge` import to an `extendTailwindMerge(...)`-derived instance with the `'font-size'` classGroup extension.
2. Task 1's automated check proves, against the real file (not a copy), that `cn('text-dt-h2','text-dt-navy')` now returns both classes, same-group conflict resolution among the `dt-` tokens still works, and native Tailwind font-size classes (`text-xl`/`text-lg`) still work and now correctly cross-conflict-resolve against the `dt-` tokens too.
3. `pnpm exec prettier --check apps/web/shared/lib/cn.ts` and `pnpm exec eslint shared/lib/cn.ts --max-warnings 0` both pass on the file in isolation (the repo has pre-existing, unrelated `check-types`/`lint` failures — a single `csstype` duplicate-resolution error confined to `packages/ui/src/components/shadcn-ui/button-group.tsx`, and an unrelated `turbo/no-undeclared-env-vars` warning on `apps/web/shared/lib/api-url.ts` — neither is touched by or relevant to this fix; do not attempt to fix them here).
4. Task 2's automated check proves the fix live: the actual dev-server-rendered HTML for `SectionHeading`'s `<h2>` and `Eyebrow`'s `<span data-slot="eyebrow">` both retain their `text-dt-{size}` class alongside their color class — both were confirmed broken (missing the size class) before this fix, via the same live check.
5. `git diff --stat` shows exactly one file changed: `apps/web/shared/lib/cn.ts`. No component file was touched.
</verification>

<success_criteria>
- `apps/web/shared/lib/cn.ts` uses `extendTailwindMerge` with the six `text-dt-{h1,h2,h3,body,caption,eyebrow}` tokens registered into the built-in `'font-size'` classGroup via `extend` (not `override`).
- `cn('text-dt-h2','text-dt-navy')` returns `'text-dt-h2 text-dt-navy'` against the real file (was `'text-dt-navy'` before). Same-group `dt-` conflicts and native Tailwind font-size conflicts both still resolve correctly, and native vs. `dt-` cross-conflicts now resolve correctly too (previously they didn't conflict at all, which was itself part of the bug).
- The file passes `prettier --check` and `eslint --max-warnings 0` on its own.
- On the live dev server, `SectionHeading`'s `<h2>` and `Eyebrow`'s `<span data-slot="eyebrow">` both render with their `text-dt-{size}` class intact alongside their color class — confirmed via curl against the actual running app, not just inferred.
- Exactly one file is modified: `apps/web/shared/lib/cn.ts`. No component file touched.
</success_criteria>

<output>
Create `.planning/quick/260820-enw-root-cause-fix-apps-web-shared-lib-cn-ts/260820-enw-SUMMARY.md` when done.
</output>