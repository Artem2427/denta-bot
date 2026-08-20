---
type: quick
slug: 260820-csn-fix-section-heading-tsx-stale-editor-buf
autonomous: true
files_modified:
  - apps/web/shared/components/section-heading.tsx
  - apps/web/shared/components/eyebrow.tsx
must_haves:
  truths:
    - 'apps/web/shared/components/section-heading.tsx no longer has an uncommitted stale-editor-buffer diff: the h2 renders font-extrabold (800, matching quick task 260820-1bb, commit 0c69e50), not font-bold (700)'
    - 'The description paragraph in section-heading.tsx has max-w-2xl restored (was dropped by the stale buffer)'
    - 'The Eyebrow usage inside section-heading.tsx does not carry the redundant font-dt-mono uppercase classes — eyebrowVariants cva already applies uppercase text-dt-eyebrow font-dt-mono unconditionally, so those were always dead duplication'
    - 'section-heading.tsx has no stray blank lines between the eyebrow/h2/description JSX blocks and no redundant mt-2 on the h2 (Eyebrow already supplies mb-2 spacing)'
    - 'section-heading.tsx passes `pnpm exec prettier --check` on its own (this file, not the whole project) — this was the actual root-cause bug in the original 260820-1bb commit (0c69e50 was never formatted); do not repeat it'
    - 'Eyebrow tone="on-navy" renders text-dt-coral (rgb(232,107,90) / #e86b5a) instead of text-dt-warm-white/80, matching the user devtools-inspected reference design color for the "ПРОБЛЕМА" eyebrow in ProblemSolution'
    - 'LeadSection (apps/web/modules/landing/lead-section.tsx), which also renders SectionHeading tone="navy" with an eyebrow, picks up the same coral eyebrow color automatically via the shared eyebrowVariants token — this is intentional site-wide consistency, not an unintended side-effect'
  artifacts:
    - apps/web/shared/components/section-heading.tsx
    - apps/web/shared/components/eyebrow.tsx
  key_links:
    - 'eyebrowVariants cva in eyebrow.tsx (on-navy tone) is the single source SectionHeading (tone=navy) reads via <Eyebrow tone={isNavy ? "on-navy" : "navy"}> — both ProblemSolution and LeadSection route through this one shared component/token, so the color fix propagates to both without touching either consumer file'
---

<objective>
Two independent one-file fixes bundled into a single quick task:

1. **Revert an accidental stale-editor-buffer overwrite** of `apps/web/shared/components/section-heading.tsx`. A prior quick task (260820-1bb, commit `0c69e50`) correctly changed the h2 to `font-extrabold` and kept `max-w-2xl` on the description — but that commit itself was never run through the project's Prettier formatter (import order was wrong). Separately, the user's editor had a stale buffer of this file open from before that commit; saving it (with format-on-save) silently reverted the h2 back to `font-bold`, dropped `max-w-2xl`, and left two other pre-existing rough edges in place (redundant `font-dt-mono uppercase` on the `Eyebrow` usage, a redundant `mt-2` on the `h2`, stray blank lines) — while incidentally fixing the import order the original commit got wrong. None of this was ever requested by the user in chat.
2. **New fix, not a revert:** change `Eyebrow`'s `on-navy` tone in `apps/web/shared/components/eyebrow.tsx` from `text-dt-warm-white/80` to `text-dt-coral`, per the user's own devtools inspection of the reference design's "ПРОБЛЕМА" eyebrow (`rgb(232, 107, 90)`, an exact match for `--color-dt-coral: #e86b5a` in `apps/web/app/premium-theme.css`). This eyebrow is rendered by `ProblemSolution` via `<SectionHeading tone="navy" eyebrow={t('eyebrow')} .../>`. `LeadSection` uses the same `SectionHeading tone="navy"` pattern and will pick up the identical coral color through the shared component — expected and intentional, not a side effect to work around.

Purpose: Restore lost, already-approved work without re-doing it as "new," and land a small color-token fix the user asked for from live design inspection — without repeating the exact formatting bug (unformatted commit) that caused this mess in the first place.
Output: `section-heading.tsx` matches the intended 260820-1bb state (content) while ALSO passing `prettier --check` (which 0c69e50 itself did not); `eyebrow.tsx`'s `on-navy` tone is `text-dt-coral`.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/.claude/CLAUDE.md
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/section-heading.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/eyebrow.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/premium-theme.css
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/landing/problem-solution.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/landing/lead-section.tsx

**IMPORTANT — do not blindly copy any "before/after" transcription you may have seen for this task verbatim.** The literal committed-HEAD version of `section-heading.tsx` (commit `0c69e50`, the "target" content this task restores semantically) has the WRONG import order — that's the actual root cause of this whole mess: that commit was never run through Prettier. The CURRENT on-disk import order (`import { cn } from '@/shared/lib/cn';` then `import * as React from 'react';`, no blank line between them, then a blank line, then `import { Eyebrow } from './eyebrow';`) is already Prettier-correct and confirmed via `pnpm exec prettier --check` — do not change the import order. Only change the JSX body back to the intended semantic state (font-extrabold, max-w-2xl, drop the redundant Eyebrow classes, drop stray blank lines and the redundant `mt-2`).

**Confirmed exact final content for `apps/web/shared/components/section-heading.tsx`** (independently verified in this planning session: content changes applied on top of the current, already-Prettier-correct import order, then re-verified with `pnpm exec prettier --check` — passes):

```tsx
import { cn } from '@/shared/lib/cn';
import * as React from 'react';

import { Eyebrow } from './eyebrow';

type SectionHeadingTone = 'warm-white' | 'navy';

function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'warm-white',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: SectionHeadingTone;
  className?: string;
}) {
  const isNavy = tone === 'navy';

  return (
    <div data-slot="section-heading" className={cn('mb-dt-48', className)}>
      {eyebrow ? (
        <Eyebrow tone={isNavy ? 'on-navy' : 'navy'} className="mb-2 block">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={cn(
          'text-dt-h2 font-dt-heading font-extrabold text-balance',
          isNavy ? 'text-dt-warm-white' : 'text-dt-navy',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 max-w-2xl text-dt-body text-pretty',
            isNavy ? 'text-dt-warm-white/80' : 'text-dt-graphite',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { SectionHeading };
```

**Current on-disk `eyebrow.tsx`** — only one line changes (the `'on-navy'` value inside `eyebrowVariants`'s `variants.tone` map):
```ts
const eyebrowVariants = cva('uppercase text-dt-eyebrow font-dt-mono', {
  variants: {
    tone: {
      navy: 'text-dt-navy',
      'on-navy': 'text-dt-warm-white/80',
    },
  },
  defaultVariants: { tone: 'navy' },
});
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restore section-heading.tsx to its intended (260820-1bb) content without reintroducing the formatting bug</name>
  <files>apps/web/shared/components/section-heading.tsx</files>
  <action>
Replace the full contents of `apps/web/shared/components/section-heading.tsx` with the exact content shown in the `<context>` block above. Do not hand-retype it from memory of the committed HEAD version — use the transcription given here, which has already been verified against Prettier in this planning session.

Specifically, relative to the current on-disk (stale-buffer) state:
- Keep the current, already-correct import order exactly as-is (`cn` then `React`, no blank line between them, then a blank line, then `Eyebrow`) — do NOT revert to the committed HEAD's import order, since that version is what was never formatted and caused this bug originally.
- On the `<Eyebrow>` usage: remove the `font-dt-mono uppercase` classes from its `className` (leaving just `"mb-2 block"`) — `eyebrowVariants` in `eyebrow.tsx` already applies `uppercase text-dt-eyebrow font-dt-mono` unconditionally, so those classes are dead duplication, not new-vs-old content.
- On the `<h2>`: change `font-bold` back to `font-extrabold`; remove the `mt-2` utility (the `Eyebrow`'s own `mb-2` already provides that spacing).
- On the `<p>` (description): add `max-w-2xl` back into the `cn(...)` call, immediately after `'mt-4'`.
- Remove the two stray blank lines the stale buffer introduced (one between the `Eyebrow`/`h2` JSX blocks, one between the `h2`/`p` JSX blocks) — the intended JSX has no blank lines between these three sibling blocks.

Do not touch anything else in the file (component signature, `SectionHeadingTone` type, tone-conditional class branches for navy/non-navy on `h2`/`p`, `data-slot`, exports).
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot && pnpm exec prettier --check apps/web/shared/components/section-heading.tsx && grep -F "font-extrabold" apps/web/shared/components/section-heading.tsx > /dev/null && ! grep -F "font-bold" apps/web/shared/components/section-heading.tsx > /dev/null && grep -F "max-w-2xl" apps/web/shared/components/section-heading.tsx > /dev/null && ! grep -F "font-dt-mono uppercase" apps/web/shared/components/section-heading.tsx > /dev/null && ! grep -F "mt-2" apps/web/shared/components/section-heading.tsx > /dev/null && echo TASK1_OK</automated>
  </verify>
  <done>section-heading.tsx exactly matches the confirmed content in `<context>`: Prettier-correct import order preserved (unchanged), h2 is font-extrabold, description has max-w-2xl, Eyebrow usage has no redundant font-dt-mono/uppercase classes, no mt-2 on h2, no stray blank lines between JSX blocks. `pnpm exec prettier --check apps/web/shared/components/section-heading.tsx` passes.</done>
</task>

<task type="auto">
  <name>Task 2: Change Eyebrow's on-navy tone color to text-dt-coral</name>
  <files>apps/web/shared/components/eyebrow.tsx</files>
  <action>
In `apps/web/shared/components/eyebrow.tsx`, inside the `eyebrowVariants` cva's `variants.tone` map, change the `'on-navy'` value from `'text-dt-warm-white/80'` to `'text-dt-coral'`.

This is a new fix (not a revert), per the user's devtools inspection of the reference design's "ПРОБЛЕМА" (Problem) section eyebrow, which reads `color: rgb(232, 107, 90)` — an exact match for `--color-dt-coral: #e86b5a` defined in `apps/web/app/premium-theme.css`. `ProblemSolution` (`apps/web/modules/landing/problem-solution.tsx`) renders `<SectionHeading tone="navy" eyebrow={t('eyebrow')} .../>`, which routes through `SectionHeading` → `<Eyebrow tone="on-navy">` — this is exactly the instance the user inspected.

Do not touch the `navy` tone value (`'text-dt-navy'`), the base classes (`'uppercase text-dt-eyebrow font-dt-mono'`), `defaultVariants`, or any other part of the file. Do not edit `problem-solution.tsx` or `lead-section.tsx` — both consume the color change automatically through the shared `eyebrowVariants` token via `SectionHeading`, which is the intended, expected propagation (site-wide consistency), not a side effect to guard against.
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot && grep -F "'on-navy': 'text-dt-coral'" apps/web/shared/components/eyebrow.tsx > /dev/null && ! grep -F "text-dt-warm-white/80" apps/web/shared/components/eyebrow.tsx > /dev/null && grep -F "text-dt-navy" apps/web/shared/components/eyebrow.tsx > /dev/null && pnpm exec prettier --check apps/web/shared/components/eyebrow.tsx && echo TASK2_OK</automated>
  </verify>
  <done>eyebrow.tsx's eyebrowVariants on-navy tone reads text-dt-coral; navy tone (text-dt-navy) and all other lines in the file are unchanged. No consumer file (problem-solution.tsx, lead-section.tsx, section-heading.tsx) was modified in this task.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None — this is a pure presentational styling/formatting fix to two shared React components with no user input, no data crossing a trust boundary, and no new dependency.

## STRIDE Threat Register

No applicable threats. Both changes are static Tailwind className edits (font-weight, max-width, redundant-class removal, a text-color token swap) in already-existing, non-input-handling presentational components. No new attack surface is introduced.
</threat_model>

<verification>
1. `git diff apps/web/shared/components/section-heading.tsx` shows only the intended semantic changes relative to the pre-task on-disk state (font-bold→font-extrabold, max-w-2xl restored, redundant Eyebrow classes removed, mt-2 removed, stray blank lines removed) — import order is unchanged from its current (already-correct) state.
2. `pnpm exec prettier --check apps/web/shared/components/section-heading.tsx apps/web/shared/components/eyebrow.tsx` passes — the specific bug class that caused this whole task (an unformatted commit) is not repeated.
3. `pnpm --filter web check-types` passes.
4. `pnpm --filter web lint` passes.
5. `grep -F "'on-navy': 'text-dt-coral'" apps/web/shared/components/eyebrow.tsx` confirms the color fix; `grep -rF "SectionHeading tone=\"navy\"" apps/web/modules/landing/` confirms both `problem-solution.tsx` and `lead-section.tsx` still route through the shared component unmodified (no direct edits needed there).
</verification>

<success_criteria>
- `apps/web/shared/components/section-heading.tsx` matches the confirmed content in `<context>` exactly: h2 is `font-extrabold`, description has `max-w-2xl`, no redundant `font-dt-mono uppercase` on the `Eyebrow` usage, no redundant `mt-2` on the `h2`, no stray blank lines — AND it passes `prettier --check` on its own (the root-cause bug from 260820-1bb's commit `0c69e50` is not repeated).
- `apps/web/shared/components/eyebrow.tsx`'s `on-navy` tone is `text-dt-coral`, matching the user's devtools-inspected reference color (`#e86b5a` / `rgb(232,107,90)`); the `navy` tone is unchanged.
- `ProblemSolution`'s "ПРОБЛЕМА" eyebrow and `LeadSection`'s eyebrow both render coral, via the shared `Eyebrow`/`SectionHeading` components — neither consumer file was edited directly.
- `pnpm --filter web check-types` and `pnpm --filter web lint` both pass with no new errors.
- Only `apps/web/shared/components/section-heading.tsx` and `apps/web/shared/components/eyebrow.tsx` are modified; no other file touched.
</success_criteria>

<output>
Create `.planning/quick/260820-csn-fix-section-heading-tsx-stale-editor-buf/260820-csn-SUMMARY.md` when done.
</output>
