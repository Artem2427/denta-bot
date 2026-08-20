---
type: quick
slug: 260820-eyj-convert-every-text-dt-h1-h2-h3-body-capt
autonomous: true
files_modified:
  - apps/web/shared/components/section-heading.tsx
  - apps/web/shared/components/eyebrow.tsx
  - apps/web/shared/components/stat.tsx
  - apps/web/shared/components/premium-dialog.tsx
  - apps/web/modules/landing/hero.tsx
  - apps/web/modules/landing/features.tsx
  - apps/web/modules/landing/how-it-works.tsx
  - apps/web/modules/landing/lead-section.tsx
  - apps/web/modules/landing/pricing-section.tsx
  - apps/web/modules/blog/blog-filters.tsx
  - apps/web/modules/blog/related-posts.tsx
  - apps/web/modules/demo/bot-tab.tsx
  - apps/web/app/[locale]/blog/page.tsx
  - apps/web/app/[locale]/blog/error.tsx
  - apps/web/app/[locale]/blog/[slug]/page.tsx
  - apps/web/app/premium-theme.css
must_haves:
  truths:
    - "All 27 usage sites across the 14 component/page files use direct Tailwind arbitrary-value classes (text-[...], leading-[...], tracking-[...]) instead of the six named text-dt-{h1,h2,h3,body,caption,eyebrow} utility classes — every rendered heading/body/caption/eyebrow element keeps the exact same visual font-size/line-height/letter-spacing it had before this conversion (values are copied 1:1 from the current --text-dt-* custom properties, not redesigned)."
    - "No component/page file (the 14 files) contains the literal utility-class strings text-dt-h1, text-dt-h2, text-dt-h3, text-dt-body, text-dt-caption, or text-dt-eyebrow anywhere in a className/cva/cn call, confirmed via a sitewide grep across apps/web (excluding .next/ and excluding shared/lib/cn.ts's intentionally-retained classGroup config)."
    - "premium-theme.css no longer defines the six --text-dt-{h1,h2,h3,body,caption,eyebrow} custom properties nor their --line-height/--letter-spacing companion properties — every other token in that file (colors, radius, shadows, spacing scale, --dt-container-max, --dt-ease-expo-out, etc.) is byte-identical to before."
    - "apps/web/shared/lib/cn.ts is NOT modified in this plan — its tailwind-merge classGroup registration of the six token-name strings (from quick task 260820-enw) stays in place as an intentional, inert, belt-and-suspenders safety net per explicit user direction, even though no component will ever pass those six strings to cn() again after this change."
    - "On the live dev server (http://localhost:3000/uk), a hero <h1>, a SectionHeading-rendered <h2>, and a card <h3> all render with their correct arbitrary-value font-size/leading/tracking classes present in the actual served HTML class attribute — not just present in source."
    - "pnpm --filter web check-types and pnpm --filter web lint produce no NEW errors/warnings that reference any of the 15 files this plan touches (the repo's pre-existing, unrelated csstype duplicate-resolution error and turbo/no-undeclared-env-vars warning are untouched and remain acceptable, per STATE.md's documented open blocker)."
    - "Every one of the 15 touched files passes prettier --check with this project's actual .prettierrc (including its import-sort plugin, where relevant)."
  artifacts:
    - apps/web/shared/components/section-heading.tsx
    - apps/web/shared/components/eyebrow.tsx
    - apps/web/shared/components/stat.tsx
    - apps/web/shared/components/premium-dialog.tsx
    - apps/web/modules/landing/hero.tsx
    - apps/web/modules/landing/features.tsx
    - apps/web/modules/landing/how-it-works.tsx
    - apps/web/modules/landing/lead-section.tsx
    - apps/web/modules/landing/pricing-section.tsx
    - apps/web/modules/blog/blog-filters.tsx
    - apps/web/modules/blog/related-posts.tsx
    - apps/web/modules/demo/bot-tab.tsx
    - apps/web/app/[locale]/blog/page.tsx
    - apps/web/app/[locale]/blog/error.tsx
    - apps/web/app/[locale]/blog/[slug]/page.tsx
    - apps/web/app/premium-theme.css
  key_links:
    - "Every converted className stays fully cn()/twMerge-mergeable — Tailwind arbitrary values (text-[...], leading-[...], tracking-[...]) compose through cn() exactly like any other utility class with zero special handling, and the existing 260820-enw cn.ts classGroup fix keeps protecting any other still-registered dt- token pairing independently of this change."
    - "premium-theme.css's six removed custom properties are confirmed to have zero remaining consumers anywhere in apps/web — verified via a --text-dt- custom-property-REFERENCE grep (not just a utility-class-NAME grep) before deletion, so no other CSS file or var(--text-dt-...) arbitrary-value reference silently breaks."
---

<objective>
Convert every `text-dt-h1`/`text-dt-h2`/`text-dt-h3`/`text-dt-body`/`text-dt-caption`/`text-dt-eyebrow` utility-class usage across `apps/web` (27 usage sites across 14 component/page files) to direct Tailwind v4 arbitrary-value classes (`text-[...]`/`leading-[...]`/`tracking-[...]`), then delete the six now-dead `--text-dt-*` custom properties (and their `--line-height`/`--letter-spacing` companions) from `apps/web/app/premium-theme.css`.

This is an explicit, belt-and-suspenders user instruction (2026-08-20) layered on top of the already-shipped root-cause fix in `apps/web/shared/lib/cn.ts` (quick task 260820-enw), which registered these six token names into `tailwind-merge`'s `'font-size'` classGroup so they stop silently colliding with `text-dt-{color}` classes. That `cn.ts` fix stays in place unmodified — this plan does not touch it. The user's reasoning for this additional change: a bracketed arbitrary value (`text-[1.5rem]`) is self-describing to `tailwind-merge` — unambiguously a font-size, never confusable with a color class — so this exact class of bug can never recur for text size/line-height, even for a future token nobody remembers to register in `cn.ts`.

Every replacement value is copied 1:1 from the current `--text-dt-*` custom-property definitions in `premium-theme.css` — this is a mechanical token-to-literal substitution with zero intended visual change, not a redesign.

Purpose: Make text-size/line-height/letter-spacing styling immune to `tailwind-merge` classGroup misconfiguration sitewide, as a defense-in-depth layer on top of the already-shipped `cn.ts` fix.
Output: 14 component/page files converted to arbitrary-value typography classes; `premium-theme.css` with the six dead `--text-dt-*` custom properties (and companions) removed; `cn.ts` untouched.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/.claude/CLAUDE.md
@/Users/artemdanko/Developer/denta-bot/apps/web/app/premium-theme.css

**Exact token-to-arbitrary-value mapping (use these exact strings everywhere — copied 1:1 from premium-theme.css's current values, do not alter):**

- `text-dt-h1` → `text-[clamp(2.25rem,6vw+1rem,4rem)] leading-[1.15]`
- `text-dt-h2` → `text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.1] tracking-[-0.03em]`
- `text-dt-h3` → `text-[1.5rem] leading-[1.15]`
- `text-dt-body` → `text-[1rem] leading-[1.5]`
- `text-dt-caption` → `text-[0.8125rem]` (no leading/tracking — none was ever defined for this token)
- `text-dt-eyebrow` → `text-[0.8125rem] tracking-[0.02em]` (no leading — none was ever defined for this token)

In every case, replace ONLY the `text-dt-{token}` segment in place with its mapped multi-class string; leave every other class in that same className/cva/cn string (color tokens like `text-dt-navy`, `font-dt-heading`, `font-bold`, `tabular-nums`, `text-balance`, `uppercase`, spacing utilities, etc.) exactly as-is, in its existing position.

**Scope boundary — do not touch:** `apps/web/shared/lib/cn.ts` (its classGroup registration of these six token-name strings is an intentional, inert safety net that stays regardless — see objective). Do not touch any i18n/translation file. Do not touch any non-typography class. Do not touch any file outside the 15 listed in this plan's frontmatter `files_modified`. `apps/web/modules/landing/pricing-section.tsx` currently has an unrelated, pre-existing uncommitted `console.log(plans, 'plans')` debug line (line ~46) from earlier session work — leave it exactly as-is; this plan only touches its two typography sites.

**Reused across every task — after editing each file, run `pnpm exec prettier --write <file>` from `apps/web/` before that task's verify step**, so this project's `.prettierrc` (including its `@trivago/prettier-plugin-sort-imports` plugin) formats the result correctly. Simple JSX `className="..."` string attributes and `cva`/`cn` string arguments are not expected to need re-wrapping since Prettier does not line-wrap inside a single string literal, but running `--write` is a safety net regardless of file length.
</context>

<!-- planner-discipline-allow: text-dt-h1 -->
<!-- planner-discipline-allow: text-dt-h2 -->
<!-- planner-discipline-allow: text-dt-h3 -->
<!-- planner-discipline-allow: text-dt-body -->
<!-- planner-discipline-allow: text-dt-caption -->
<!-- planner-discipline-allow: text-dt-eyebrow -->
<!-- planner-discipline-allow: --text-dt- -->

<tasks>

<task type="auto">
  <name>Task 1: Convert shared components (highest-leverage, fan out to every page)</name>
  <files>apps/web/shared/components/section-heading.tsx, apps/web/shared/components/eyebrow.tsx, apps/web/shared/components/stat.tsx, apps/web/shared/components/premium-dialog.tsx</files>
  <action>
Apply the token-to-arbitrary-value mapping from `<context>` to these four files (5 usage sites total):

`section-heading.tsx` (around line 32): in the `<h2>`'s `cn(...)` call, replace the h2 token segment in `'text-dt-h2 font-dt-heading font-extrabold text-balance'` with its h2 mapping — leave `font-dt-heading font-extrabold text-balance` and the tone-conditional color classes unchanged. Around line 41: in the `<p>`'s `cn(...)` call, replace the body token segment in `'mt-4 max-w-2xl text-dt-body text-pretty'` with its body mapping — leave `mt-4 max-w-2xl text-pretty` unchanged.

`eyebrow.tsx` (line 5): in the `cva(...)` base classes string `'uppercase text-dt-eyebrow font-dt-mono'`, replace the eyebrow token segment with its eyebrow mapping — leave `uppercase` and `font-dt-mono` unchanged, and leave the `tone` variants object (color classes) untouched.

`stat.tsx` (line 18): in the `<div>` className `"text-dt-h2 font-dt-heading font-bold text-dt-teal tabular-nums"`, replace the h2 token segment with its h2 mapping — leave the rest unchanged.

`premium-dialog.tsx` (line 20): in `PremiumDialogTitle`'s `cn(...)` call, replace the h3 token segment in `'text-dt-h3 font-dt-heading font-semibold text-dt-navy'` with its h3 mapping — leave the rest unchanged.

Run `pnpm exec prettier --write` on all four files from `apps/web/` after editing.
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot/apps/web && ! grep -nE 'text-dt-(h1|h2|h3|body|caption|eyebrow)' shared/components/section-heading.tsx shared/components/eyebrow.tsx shared/components/stat.tsx shared/components/premium-dialog.tsx && pnpm exec prettier --check shared/components/section-heading.tsx shared/components/eyebrow.tsx shared/components/stat.tsx shared/components/premium-dialog.tsx && echo TASK1_OK</automated>
  </verify>
  <done>All four shared component files contain zero occurrences of any text-dt-{h1,h2,h3,body,caption,eyebrow} class; each site's original color/weight/other classes are unchanged; all four files pass `prettier --check`.</done>
</task>

<task type="auto">
  <name>Task 2: Convert landing modules</name>
  <files>apps/web/modules/landing/hero.tsx, apps/web/modules/landing/features.tsx, apps/web/modules/landing/how-it-works.tsx, apps/web/modules/landing/lead-section.tsx, apps/web/modules/landing/pricing-section.tsx</files>
  <action>
Apply the token-to-arbitrary-value mapping from `<context>` to these five files (8 usage sites total):

`hero.tsx` (line 34): in the `<h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">`, replace the h1 token segment with its h1 mapping. Line 41: in `<p className="text-dt-body text-dt-graphite">`, replace the body token segment with its body mapping.

`features.tsx` (line 49): in the card `<h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">`, replace the h3 token segment with its h3 mapping.

`how-it-works.tsx` (line 32): in `<h3 className="mt-3.5 text-dt-h3 font-dt-heading font-semibold text-dt-navy">`, replace the h3 token segment with its h3 mapping — leave `mt-3.5` unchanged.

`lead-section.tsx`: two separate `<h3>` sites use the h3 token — line 121 (`text-dt-h3 font-dt-heading font-semibold text-dt-navy`, the form title) and line 209 (`text-dt-h3 font-dt-heading font-bold text-dt-navy`, the post-submit thanks title). Replace the h3 token segment with its h3 mapping at both sites independently — note the weight class differs (`font-semibold` vs `font-bold`), leave each as-is.

`pricing-section.tsx`: line 102, in the plan-name `<h3>`'s `cn(...)` call, replace the h3 token segment in `'text-dt-h3 font-dt-heading font-semibold'` with its h3 mapping. Line 119, in the price `<span>`'s `cn(...)` call, replace the h2 token segment in `'text-dt-h2 font-dt-heading font-bold tabular-nums'` with its h2 mapping. Leave every other class (including the `plan.isPopular` conditional color classes and the unrelated `console.log` debug line elsewhere in the file) untouched.

Run `pnpm exec prettier --write` on all five files from `apps/web/` after editing.
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot/apps/web && ! grep -nE 'text-dt-(h1|h2|h3|body|caption|eyebrow)' modules/landing/hero.tsx modules/landing/features.tsx modules/landing/how-it-works.tsx modules/landing/lead-section.tsx modules/landing/pricing-section.tsx && pnpm exec prettier --check modules/landing/hero.tsx modules/landing/features.tsx modules/landing/how-it-works.tsx modules/landing/lead-section.tsx modules/landing/pricing-section.tsx && echo TASK2_OK</automated>
  </verify>
  <done>All five landing module files contain zero occurrences of any text-dt-{h1,h2,h3,body,caption,eyebrow} class; each site's original color/weight/other classes and the pricing-section.tsx console.log line are unchanged; all five files pass `prettier --check`.</done>
</task>

<task type="auto">
  <name>Task 3: Convert blog modules, demo module, and blog app routes</name>
  <files>apps/web/modules/blog/blog-filters.tsx, apps/web/modules/blog/related-posts.tsx, apps/web/modules/demo/bot-tab.tsx, apps/web/app/[locale]/blog/page.tsx, apps/web/app/[locale]/blog/error.tsx, apps/web/app/[locale]/blog/[slug]/page.tsx</files>
  <action>
Apply the token-to-arbitrary-value mapping from `<context>` to these six files (14 usage sites total):

`blog-filters.tsx`: line 65, in `<p className="py-16 text-center text-dt-body text-dt-graphite">`, replace the body token segment with its body mapping — leave `py-16 text-center` unchanged. Line 94, in `<h3 className="line-clamp-2 text-dt-h3 font-dt-heading font-semibold text-dt-navy">`, replace the h3 token segment with its h3 mapping — leave `line-clamp-2` unchanged.

`related-posts.tsx` (line 34): in `<h3 className="text-dt-h3 font-dt-heading font-semibold text-dt-navy">`, replace the h3 token segment with its h3 mapping.

`bot-tab.tsx`: lines 180-181 are a ternary with TWO separate caption-token sites — `'flex items-center justify-end gap-1 text-dt-caption text-dt-navy/50'` (user branch) and `'flex items-center justify-start gap-1 text-dt-caption text-dt-navy/50'` (bot branch). Replace the caption token segment with its caption mapping in BOTH branches independently — leave the rest of each string unchanged. Line 229, in `<h3 className="text-dt-h3 font-semibold text-dt-navy">` (note: this h3 has no `font-dt-heading` class, unlike other h3 sites — do not add one), replace the h3 token segment with its h3 mapping.

`app/[locale]/blog/page.tsx`: FIVE sites. The empty-state block (line 31 `<h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">`, line 34 `<p className="mt-4 text-dt-body text-dt-graphite">`) and the main heading block (line 52, identical h1 classes; line 55, identical p classes) use the exact same class strings — replace the h1/body token segments with their mappings at all four sites independently. Line 88, in the featured-post `<h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">`, replace the h2 token segment with its h2 mapping.

`app/[locale]/blog/error.tsx`: line 23, in `<h1 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">` (note: this `<h1>` element intentionally uses the h2-size token, not h1 — keep it mapped to the h2 arbitrary values, do not change it to the h1 mapping), replace the h2 token segment with its h2 mapping. Line 26, in `<p className="mt-4 text-dt-body text-dt-graphite">`, replace the body token segment with its body mapping.

`app/[locale]/blog/[slug]/page.tsx` (line 55): in `<h1 className="mt-4 text-dt-h1 font-dt-heading font-bold text-dt-navy">`, replace the h1 token segment with its h1 mapping — leave `mt-4` unchanged.

Run `pnpm exec prettier --write` on all six files from `apps/web/` after editing.
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot/apps/web && ! grep -nE 'text-dt-(h1|h2|h3|body|caption|eyebrow)' modules/blog/blog-filters.tsx modules/blog/related-posts.tsx modules/demo/bot-tab.tsx "app/[locale]/blog/page.tsx" "app/[locale]/blog/error.tsx" "app/[locale]/blog/[slug]/page.tsx" && pnpm exec prettier --check modules/blog/blog-filters.tsx modules/blog/related-posts.tsx modules/demo/bot-tab.tsx "app/[locale]/blog/page.tsx" "app/[locale]/blog/error.tsx" "app/[locale]/blog/[slug]/page.tsx" && echo TASK3_OK</automated>
  </verify>
  <done>All six files contain zero occurrences of any text-dt-{h1,h2,h3,body,caption,eyebrow} class; bot-tab.tsx's both ternary branches and blog/page.tsx's both empty-state/main-heading duplicated sites are all converted; blog/error.tsx's h1 stays mapped to the h2-size arbitrary value (unchanged sizing intent); all six files pass `prettier --check`.</done>
</task>

<task type="auto">
  <name>Task 4: Remove dead --text-dt-* tokens from premium-theme.css and run full sitewide verification</name>
  <files>apps/web/app/premium-theme.css</files>
  <action>
First, re-confirm no other file in `apps/web` still references any `--text-dt-*` custom property (a `var(--text-dt-...)` reference, an `@apply`, or any other CSS reference — distinct from the utility-CLASS-name greps Tasks 1-3 already ran) before deleting — grep for the literal `--text-dt-` prefix across `apps/web`, not just `text-dt-` alone.

Then, in `apps/web/app/premium-theme.css`, delete the entire "Type scale (D-09/D-10)" block: the `/* Type scale (D-09/D-10) */` comment line and all twelve property declarations under it (the six `--text-dt-{h1,h2,h3,body,caption,eyebrow}` size properties plus their `--line-height`/`--letter-spacing` companion properties), plus the blank line immediately following that block — leaving exactly ONE blank line between the Shadows block's closing `;` and the `/* Spacing scale (Phase 06.1 D-03) — additive, 16px base */` comment that follows, matching the file's existing one-blank-line-between-groups convention. Do not touch any other line in the file (colors, radius, shadow tokens, the spacing scale, the `@theme inline` block, or the `:root`/media-query sections below).

Do NOT modify `apps/web/shared/lib/cn.ts` — its classGroup registration of these six token-name strings is an intentional, inert safety net that stays regardless of this cleanup (see objective).

Run `pnpm exec prettier --write app/premium-theme.css` from `apps/web/` after editing.

Then run the full verification suite below.
  </action>
  <verify>
    <automated>cd /Users/artemdanko/Developer/denta-bot && REMAINING=$(grep -rnE --include='*.tsx' --include='*.ts' --include='*.css' 'text-dt-(h1|h2|h3|body|caption|eyebrow)' apps/web 2>/dev/null | grep -v '/\.next/' | grep -v 'apps/web/shared/lib/cn\.ts'); if [ -n "$REMAINING" ]; then echo "$REMAINING"; exit 1; fi; echo GREP_ZERO_REMAINING_OK; CSSREMAINING=$(grep -rn --include='*.css' -- '--text-dt-' apps/web 2>/dev/null | grep -v '/\.next/'); if [ -n "$CSSREMAINING" ]; then echo "$CSSREMAINING"; exit 1; fi; echo CSS_TOKENS_REMOVED_OK; (cd apps/web && pnpm exec prettier --check app/premium-theme.css) || exit 1; echo PRETTIER_CSS_OK; DIFF=$(git diff --name-only); MISSING=""; for f in apps/web/app/premium-theme.css "apps/web/app/[locale]/blog/[slug]/page.tsx" "apps/web/app/[locale]/blog/error.tsx" "apps/web/app/[locale]/blog/page.tsx" apps/web/modules/blog/blog-filters.tsx apps/web/modules/blog/related-posts.tsx apps/web/modules/demo/bot-tab.tsx apps/web/modules/landing/features.tsx apps/web/modules/landing/hero.tsx apps/web/modules/landing/how-it-works.tsx apps/web/modules/landing/lead-section.tsx apps/web/modules/landing/pricing-section.tsx apps/web/shared/components/eyebrow.tsx apps/web/shared/components/premium-dialog.tsx apps/web/shared/components/section-heading.tsx apps/web/shared/components/stat.tsx; do echo "$DIFF" | grep -qxF "$f" || MISSING="$MISSING $f"; done; if [ -n "$MISSING" ]; then echo "MISSING EXPECTED CHANGES:$MISSING"; exit 1; fi; echo ALL_15_FILES_TOUCHED_OK; if echo "$DIFF" | grep -qxF 'apps/web/shared/lib/cn.ts'; then echo "cn.ts WAS MODIFIED - NOT ALLOWED"; exit 1; fi; echo CN_TS_UNTOUCHED_OK; TOUCHED='apps/web/shared/components/section-heading\.tsx|apps/web/shared/components/eyebrow\.tsx|apps/web/shared/components/stat\.tsx|apps/web/shared/components/premium-dialog\.tsx|apps/web/modules/landing/hero\.tsx|apps/web/modules/landing/features\.tsx|apps/web/modules/landing/how-it-works\.tsx|apps/web/modules/landing/lead-section\.tsx|apps/web/modules/landing/pricing-section\.tsx|apps/web/modules/blog/blog-filters\.tsx|apps/web/modules/blog/related-posts\.tsx|apps/web/modules/demo/bot-tab\.tsx|apps/web/app/\[locale\]/blog/page\.tsx|apps/web/app/\[locale\]/blog/error\.tsx|apps/web/app/\[locale\]/blog/\[slug\]/page\.tsx|apps/web/app/premium-theme\.css'; CT_OUT=$(pnpm --filter web check-types 2>&1); if echo "$CT_OUT" | grep -qE "$TOUCHED"; then echo "CHECK_TYPES_TOUCHED_FILE_ERROR"; echo "$CT_OUT"; exit 1; fi; echo CHECK_TYPES_OK_NO_NEW_ERRORS; LINT_OUT=$(pnpm --filter web lint 2>&1); if echo "$LINT_OUT" | grep -qE "$TOUCHED"; then echo "LINT_TOUCHED_FILE_ERROR"; echo "$LINT_OUT"; exit 1; fi; echo LINT_OK_NO_NEW_ERRORS; if ! curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/uk 2>/dev/null | grep -q '^200$'; then nohup pnpm --filter web dev > /tmp/gsd-260820-eyj-web-dev.log 2>&1 & for i in $(seq 1 60); do curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/uk 2>/dev/null | grep -q '^200$' && break; sleep 2; done; fi; PASS=0; for i in $(seq 1 20); do HTML=$(curl -s http://localhost:3000/uk); H1_OK=$(echo "$HTML" | grep -o '<h1[^>]*class="[^"]*"' | grep -F 'text-[clamp(2.25rem,6vw+1rem,4rem)]' | grep -cF 'leading-[1.15]'); H2_OK=$(echo "$HTML" | grep -o '<h2[^>]*class="[^"]*"' | grep -F 'text-[clamp(1.9rem,3.4vw,2.75rem)]' | grep -F 'leading-[1.1]' | grep -cF 'tracking-[-0.03em]'); H3_OK=$(echo "$HTML" | grep -o '<h3[^>]*class="[^"]*"' | grep -F 'text-[1.5rem]' | grep -cF 'leading-[1.15]'); if [ "${H1_OK:-0}" -gt 0 ] && [ "${H2_OK:-0}" -gt 0 ] && [ "${H3_OK:-0}" -gt 0 ]; then PASS=1; break; fi; sleep 2; done; if [ "$PASS" -eq 1 ]; then echo LIVE_SPOTCHECK_OK; else echo "H1_OK=$H1_OK H2_OK=$H2_OK H3_OK=$H3_OK"; exit 1; fi; echo TASK4_OK</automated>
  </verify>
  <done>premium-theme.css no longer defines any of the six --text-dt-* custom properties or their line-height/letter-spacing companions; every other token in the file is untouched; a sitewide grep confirms zero remaining text-dt-{h1,h2,h3,body,caption,eyebrow} class usages anywhere in apps/web (excluding .next/ and cn.ts) and zero remaining --text-dt- custom-property references; exactly the 15 expected files are modified and cn.ts is not among them; pnpm --filter web check-types and lint show no new errors referencing any touched file; on the live dev server, a hero h1, a SectionHeading h2, and a card h3 all render with their correct arbitrary-value classes in the actual served HTML.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

None. This is a pure presentational styling refactor (className string literal substitution and CSS custom-property deletion) with no new dependency, no user input, no data crossing any trust boundary, and no change to any existing dependency's configuration (`tailwind-merge`'s `cn.ts` config is explicitly untouched).

## STRIDE Threat Register

No applicable threats. The change touches only static className strings and a CSS token file — no I/O, no network calls, no new attack surface, no auth/data-handling code path.
</threat_model>

<verification>
1. A sitewide grep across `apps/web` (excluding `.next/` and `shared/lib/cn.ts`) finds zero occurrences of `text-dt-h1`, `text-dt-h2`, `text-dt-h3`, `text-dt-body`, `text-dt-caption`, or `text-dt-eyebrow`.
2. A sitewide grep across `apps/web` finds zero remaining `--text-dt-` custom-property references (declarations or `var()` uses) anywhere.
3. `apps/web/shared/lib/cn.ts` is unmodified — `git diff --name-only` does not include it.
4. Exactly the 15 files listed in this plan's `files_modified` frontmatter are modified.
5. `pnpm --filter web check-types` and `pnpm --filter web lint` produce no output referencing any of the 15 touched files (the repo's pre-existing, unrelated csstype/turbo warnings are untouched and acceptable — do not attempt to fix them here).
6. All 15 touched files pass `prettier --check`.
7. On the live dev server (`http://localhost:3000/uk`), the actual served HTML contains at least one `<h1>` with the h1 arbitrary-value classes, at least one `<h2>` with the h2 arbitrary-value classes, and at least one `<h3>` with the h3 arbitrary-value classes — confirming the sitewide visual conversion is live, not just present in source.
</verification>

<success_criteria>
- All 27 usage sites across the 14 component/page files use direct Tailwind arbitrary-value classes instead of `text-dt-{h1,h2,h3,body,caption,eyebrow}`.
- `premium-theme.css`'s six `--text-dt-*` custom properties (and companions) are removed; every other token in the file is unchanged.
- `apps/web/shared/lib/cn.ts` is unmodified.
- No stray file outside the 15 listed is modified.
- `check-types`, `lint`, and `prettier --check` all pass (or show only the repo's pre-existing, unrelated failures) across every touched file.
- The live dev server renders converted classes correctly on a hero h1, a section h2, and a card h3.
</success_criteria>

<output>
Create `.planning/quick/260820-eyj-convert-every-text-dt-h1-h2-h3-body-capt/260820-eyj-SUMMARY.md` when done.
</output>
