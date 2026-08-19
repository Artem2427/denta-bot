---
type: quick
slug: 260819-oyk-make-locale-the-true-top-level-route-wra
autonomous: true
files_modified:
  - apps/web/proxy.ts
  - apps/web/app/[locale]/blog/page.tsx
  - apps/web/app/[locale]/blog/[slug]/page.tsx
  - apps/web/app/[locale]/blog/error.tsx
  - apps/web/app/[locale]/prices/page.tsx
  - apps/web/app/[locale]/demo/page.tsx
  - apps/web/app/[locale]/contacts/page.tsx
  - apps/web/shared/components/locale-switcher.tsx
  - apps/web/shared/components/header.tsx
  - apps/web/modules/blog/blog-filters.tsx
  - apps/web/modules/blog/related-posts.tsx
  - apps/web/app/layout.tsx
must_haves:
  truths:
    - 'Switching locale via LocaleSwitcher on any page — landing, blog list, or a blog post detail page — keeps the visitor on the equivalent-locale version of that SAME page, never redirects to the homepage'
    - "/blog, /prices, /demo, /contacts (and their ru/en locale-prefixed equivalents) all resolve through the [locale] segment; none of them sit outside next-intl's routing/middleware anymore"
    - "Header's Blog nav link correctly highlights as active on /blog regardless of which locale prefix (none/ru/en) is currently active"
    - 'The 3 retired stub routes (prices/demo/contacts) still redirect to their landing-page anchors, now sourcing locale from the URL segment instead of the NEXT_LOCALE cookie'
    - 'Blog post content stays Ukrainian-only — only the URL/routing structure changed, no translation was introduced'
  artifacts:
    - apps/web/app/[locale]/blog/page.tsx
    - apps/web/app/[locale]/blog/[slug]/page.tsx
    - apps/web/app/[locale]/blog/error.tsx
    - apps/web/app/[locale]/prices/page.tsx
    - apps/web/app/[locale]/demo/page.tsx
    - apps/web/app/[locale]/contacts/page.tsx
    - apps/web/shared/components/locale-switcher.tsx
    - apps/web/proxy.ts
  key_links:
    - "apps/web/proxy.ts's middleware matcher now covers every route (no per-route exclusions), so next-intl's locale detection/redirect runs on blog and the 3 stub routes too"
    - "LocaleSwitcher's Link (href=current pathname, explicit locale prop, from @/i18n/navigation) is what keeps the visitor on the same page across a locale switch, including on dynamic blog-post routes"
    - "Header's Blog Link and usePathname both come from @/i18n/navigation so active-state highlighting compares against the locale-agnostic pathname, matching on every locale prefix"
---

<objective>
Make `[locale]` the true top-level route wrapper for the entire apps/web site instead of just the landing page: move `app/blog`, `app/prices`, `app/demo`, `app/contacts` inside `app/[locale]/`, widen `proxy.ts`'s middleware matcher to cover them, and fix every internal navigation path (LocaleSwitcher, Header's Blog link, blog's internal links) that currently drops the locale prefix when clicked.

Purpose: Two real client-reported bugs stem from the same root cause — only the landing page currently participates in next-intl's locale routing, so LocaleSwitcher hardcodes '/', '/ru', '/en' targets (dumping visitors on /blog back to the homepage when they switch language) and locale behavior is inconsistent depending on which page a visitor is on.
Output: `/blog`, `/prices`, `/demo`, `/contacts` all live under `app/[locale]/...`; every internal Link in the nav/blog surface is locale-aware; LocaleSwitcher preserves the current page across a locale switch.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/artemdanko/Developer/denta-bot/.claude/CLAUDE.md
@/Users/artemdanko/Developer/denta-bot/apps/web/proxy.ts
@/Users/artemdanko/Developer/denta-bot/apps/web/app/[locale]/layout.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/layout.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/locale-switcher.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/components/header.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/i18n/navigation.ts
@/Users/artemdanko/Developer/denta-bot/apps/web/i18n/routing.ts
@/Users/artemdanko/Developer/denta-bot/apps/web/app/prices/page.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/demo/page.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/contacts/page.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/blog/page.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/blog/[slug]/page.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/app/blog/error.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/blog/blog-filters.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/modules/blog/related-posts.tsx
@/Users/artemdanko/Developer/denta-bot/apps/web/shared/lib/routes.ts

**`@/i18n/navigation`** (`apps/web/i18n/navigation.ts`) already exports `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from next-intl's `createNavigation(routing)` — this is the pathname-preserving toolkit this plan wires in everywhere `next/link`/`next/navigation` is currently used for an in-app route. `apps/web/i18n/routing.ts` has NO `pathnames` map configured, so every href stays a plain string (e.g. `routes.blog = '/blog'`) — only the rendered locale prefix changes; no href rewriting is needed anywhere in `apps/web/shared/lib/routes.ts`.

**Confirmed via `next-intl@4.13.7`'s own type declarations (no `AppConfig`/`Locale` module augmentation exists in this repo):** `Locale` resolves to plain `string`, and `redirect({ href, locale })`'s `locale` field accepts any `string` — so the 3 stub pages do NOT need to re-run `hasLocale`/`notFound` validation on the route param; `app/[locale]/layout.tsx` already guards invalid locales with `notFound()` before any child page renders.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move blog + retired stub routes inside [locale]; widen proxy.ts matcher</name>
  <files>apps/web/proxy.ts, apps/web/app/[locale]/blog/page.tsx, apps/web/app/[locale]/blog/[slug]/page.tsx, apps/web/app/[locale]/blog/error.tsx, apps/web/app/[locale]/prices/page.tsx, apps/web/app/[locale]/demo/page.tsx, apps/web/app/[locale]/contacts/page.tsx</files>
  <action>
Restructure routing so every real page lives inside the `[locale]` segment.

1. Move the whole blog route tree in one shot: `git mv apps/web/app/blog "apps/web/app/[locale]/blog"` (carries `page.tsx`, `[slug]/page.tsx`, and `error.tsx` together, since `apps/web/app/[locale]/` already exists as a directory). No content edits needed for this move — internal Link fixes happen in Task 2.

2. Create the 3 new stub route directories and move each page into them: `mkdir -p "apps/web/app/[locale]/prices" "apps/web/app/[locale]/demo" "apps/web/app/[locale]/contacts"`, then `git mv apps/web/app/prices/page.tsx "apps/web/app/[locale]/prices/page.tsx"` (same pattern for `demo` and `contacts`). `git mv` only relocates the file, not the now-empty parent directory — clean up with `rmdir apps/web/app/prices apps/web/app/demo apps/web/app/contacts` afterward so no stray empty dirs remain.

3. Rewrite each of the 3 moved stub pages (`Prices`, `Demo`, `Contacts`) to accept `params: Promise<{ locale: string }>` as its prop, destructure with `const { locale } = await params;`, then call the existing `redirect({ href: '<anchor>', locale })` from `@/i18n/navigation` exactly as before — Prices targets `/#pricing`, Demo targets `/#demo`, Contacts targets `/#lead` (unchanged target anchors; D-01/D-03 references in the existing comments stay accurate and should be kept). Drop the cookie-store lookup entirely: remove the `import { cookies } from 'next/headers';`, the `import { hasLocale } from 'next-intl';`, and the `import { routing } from '@/i18n/routing';` imports and the `NEXT_LOCALE` cookie-read logic — the only remaining import besides React's implicit JSX runtime is `import { redirect } from '@/i18n/navigation';`. Rewrite each file's leading comment to describe the new locale source (the `[locale]` route param, already validated upstream by `app/[locale]/layout.tsx`) instead of the old cookie-based rationale.

4. Update `apps/web/proxy.ts`'s `matcher` array: remove the 4 path-segment exclusions for blog/prices/demo/contacts, leaving only the standard next-intl exclusions. The full matcher array becomes a single entry: `'/((?!api/|_next/|_vercel/|.*\\..*).*)'`. Rewrite the comment block above `matcher` to explain that no per-route exclusions remain since every route now lives under `[locale]` — remove the stale WR-04 segment-boundary-anchor explanation that was specific to the now-deleted `blog(?:/|$)`-style literals.
   </action>
   <verify>
   <automated>cd /Users/artemdanko/Developer/denta-bot && test ! -e apps/web/app/blog && test ! -e apps/web/app/prices && test ! -e apps/web/app/demo && test ! -e apps/web/app/contacts && test -f "apps/web/app/[locale]/blog/page.tsx" && test -f "apps/web/app/[locale]/blog/[slug]/page.tsx" && test -f "apps/web/app/[locale]/blog/error.tsx" && test -f "apps/web/app/[locale]/prices/page.tsx" && test -f "apps/web/app/[locale]/demo/page.tsx" && test -f "apps/web/app/[locale]/contacts/page.tsx" && grep -Fq "'/((?!api/|\_next/|\_vercel/|._\\.._).\*)'" apps/web/proxy.ts && for f in "apps/web/app/[locale]/prices/page.tsx" "apps/web/app/[locale]/demo/page.tsx" "apps/web/app/[locale]/contacts/page.tsx"; do grep -Fq "params: Promise<{ locale: string }>" "$f" || { echo "MISSING params shape in $f"; exit 1; }; done && echo TASK1_OK</automated>
   </verify>
   <done>apps/web/app/blog, apps/web/app/prices, apps/web/app/demo, apps/web/app/contacts no longer exist as standalone route folders; their content lives under apps/web/app/[locale]/...; all 3 stub pages source locale from the route param (no cookie/hasLocale/next/headers import remains); apps/web/proxy.ts's matcher only excludes api/, \_next/, \_vercel/, and dotted-filename paths.</done>
   </task>

<task type="auto">
  <name>Task 2: Make LocaleSwitcher, Header, and blog internal links locale-aware</name>
  <files>apps/web/shared/components/locale-switcher.tsx, apps/web/shared/components/header.tsx, apps/web/app/[locale]/blog/page.tsx, apps/web/app/[locale]/blog/[slug]/page.tsx, apps/web/modules/blog/blog-filters.tsx, apps/web/modules/blog/related-posts.tsx, apps/web/app/layout.tsx</files>
  <action>
1. Rewrite `apps/web/shared/components/locale-switcher.tsx` using next-intl's documented locale-switcher pattern: import `{ Link, usePathname }` from `@/i18n/navigation` (drop `next/link`). Call `const pathname = usePathname();` — this returns the locale-agnostic pathname (e.g. `/blog/my-post-slug`) regardless of which locale prefix the current URL carries, and it resolves dynamic segments like `[slug]` to their concrete value, not the route template. Simplify the `locales` array to `{ code, label }` pairs only (`uk`/`UA`, `ru`/`RU`, `en`/`EN` — unchanged labels, drop the per-locale `href` field). Render each option as `<Link href={pathname} locale={code}>` instead of a hardcoded `href` — the explicit `locale` prop is what forces that Link to render as the target locale's version of the CURRENT page. Keep `useLocale()` from `next-intl` and the existing active/inactive className logic (`activeLocale === locale.code`) unchanged. Replace the stale comment (which justified hardcoded roots because only one real page existed) with a short note that `href={pathname}` + explicit `locale` preserves the current page across every route, including dynamic ones like a blog post.

2. In `apps/web/shared/components/header.tsx`: replace the separate `Link` (from `next/link`) and `usePathname` (from `next/navigation`) imports with one combined import: `import { Link, usePathname } from '@/i18n/navigation';`. Remove the comment explaining why the Blog link previously couldn't use the locale-aware Link — it now can and should, same as the rest of the nav. No other logic changes: the existing `pathname === link.href` active-state check (used for both the desktop and mobile Blog `<Link>`) keeps working correctly because `@/i18n/navigation`'s `usePathname()` already strips the locale prefix, so it returns `/blog` on `/ru/blog` and `/en/blog` too, still matching `routes.blog`.

3. In `apps/web/app/[locale]/blog/page.tsx`, `apps/web/app/[locale]/blog/[slug]/page.tsx`, `apps/web/modules/blog/blog-filters.tsx`, and `apps/web/modules/blog/related-posts.tsx`: replace `import Link from 'next/link';` with `import { Link } from '@/i18n/navigation';`. No other changes needed — every existing `href={routes.blogPost(...)}` / `href={routes.blog}` / `href={routes.demo}` / `href={routes.contacts}` stays a plain path string that `@/i18n/navigation`'s Link already resolves against the active locale automatically.

4. In `apps/web/app/layout.tsx`, rewrite the comment directly above `const locale = await getLocale();`. It currently frames `apps/web/i18n/request.ts`'s locale-fallback behavior as load-bearing specifically for the blog route, since blog used to sit outside next-intl's matcher — that claim is now false (blog resolves its own `[locale]` segment like everything else). Rewrite the comment to state that `getLocale()`/`getMessages()` still feed the single `NextIntlClientProvider` that gives Header/Footer their translations (keep that part, it's still accurate), but drop the route-specific claim — note instead that `request.ts`'s default-locale fallback is now a purely defensive branch with no real route depending on it.

5. After all edits, run `pnpm format` from the repo root to apply the project's `@trivago/prettier-plugin-sort-imports` convention across every file touched by this task, then re-run typecheck/lint (Task 2's `<verify>` below, plus the plan-level `<verification>` block) to confirm nothing regressed.
   </action>
   <verify>
   <automated>cd /Users/artemdanko/Developer/denta-bot && grep -Fq "import { Link, usePathname } from '@/i18n/navigation';" apps/web/shared/components/locale-switcher.tsx && grep -Fq "import { Link, usePathname } from '@/i18n/navigation';" apps/web/shared/components/header.tsx && for f in "apps/web/app/[locale]/blog/page.tsx" "apps/web/app/[locale]/blog/[slug]/page.tsx" apps/web/modules/blog/blog-filters.tsx apps/web/modules/blog/related-posts.tsx; do grep -Fq "import { Link } from '@/i18n/navigation';" "$f" || { echo "MISSING Link import in $f"; exit 1; }; done && echo TASK2_OK</automated>
   </verify>
   <done>locale-switcher.tsx and header.tsx both import Link+usePathname from @/i18n/navigation (no next/link, no next/navigation import for these); blog page/slug page/blog-filters/related-posts all import Link from @/i18n/navigation; app/layout.tsx's getLocale() comment no longer claims /blog is unlocalized; LocaleSwitcher renders `<Link href={pathname} locale={code}>` per option instead of a hardcoded href.</done>
   </task>

</tasks>

<verification>
1. `pnpm --filter web check-types` — any errors must be confined exactly to the pre-existing csstype@3.1.3/3.2.3 duplicate-resolution conflict in `packages/ui/src/components/shadcn-ui/{button-group,calendar,sidebar}.tsx` (STATE.md Deferred Items, open since Phase 1, confirmed unrelated to apps/web in every prior phase's verify step). Any error outside those 3 files is a real regression introduced by this plan and must be fixed before proceeding.
2. `pnpm --filter web lint --max-warnings 0` must pass with zero errors/warnings.
3. `pnpm --filter web build` — same csstype exception as (1) is the only acceptable failure; any other build error is a real regression.
4. Behavioral spot-check against a running dev server:
   - Start `pnpm --filter web dev` in the background (fixed port 3000 per CLAUDE.md's convention); wait until it responds.
   - `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/`, `/ru`, `/en`, `/blog`, `/ru/blog`, `/en/blog` — all must return `200`.
   - `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3000/prices`, `/ru/prices`, `/en/prices` — each must return `307` with a redirect target whose hash is `#pricing` and whose path carries the matching locale prefix (none for uk, `/ru` for ru, `/en` for en).
   - Same pattern for `/demo`, `/ru/demo`, `/en/demo` — `307` redirects targeting `#demo` with the matching locale prefix.
   - Same pattern for `/contacts`, `/ru/contacts`, `/en/contacts` — `307` redirects targeting `#lead` with the matching locale prefix.
   - Locale-switcher path preservation: `curl -s http://localhost:3000/ru/blog | grep -o 'href="/en/blog"'` and `curl -s http://localhost:3000/ru/blog | grep -o 'href="/blog"'` both find a match — proves switching locale from a blog page targets the equivalent-locale blog page, not the homepage. Repeat on a real blog post URL (curl `/blog` first to find a real slug, or use any slug from the mock data) to confirm the same holds for `/blog/<slug>`.
   - Stop the dev server.
</verification>

<success_criteria>

- No routes exist outside `app/[locale]/` except the true catch-all `app/not-found.tsx` — `apps/web/app/blog`, `apps/web/app/prices`, `apps/web/app/demo`, `apps/web/app/contacts` no longer exist as standalone route folders.
- `apps/web/proxy.ts`'s matcher only excludes `api/`, `_next/`, `_vercel/`, and dotted-filename paths — no route-specific exclusions remain.
- Switching locale on `/blog`, `/ru/blog`, `/en/blog`, or a blog post detail page lands on the equivalent-locale version of the SAME page, never the homepage.
- Header's Blog nav link and its active/inactive highlighting work correctly regardless of active locale.
- The 3 retired stub routes (prices/demo/contacts) redirect correctly to their landing-page anchors under all 3 locale prefixes, now sourcing locale from the URL segment.
- `pnpm --filter web check-types`, `lint --max-warnings 0`, and `build` all pass with no new errors (the pre-existing, unrelated csstype conflict in `packages/ui` is the sole acceptable exception).
- Blog post content/copy is unchanged (still Ukrainian-only) — only routing/URL structure changed.
  </success_criteria>

<output>
Create `.planning/quick/260819-oyk-make-locale-the-true-top-level-route-wra/260819-oyk-SUMMARY.md` when done.
</output>
