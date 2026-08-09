# Phase 2 — UI Review

**Audited:** 2026-08-09
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md exists; project uses bespoke Phase 01.1 premium design system — `dt-*` tokens in `apps/web/app/premium-theme.css`, `PremiumButton`/`PremiumCard`/`Reveal`/`StaggerGrid`, `@phosphor-icons/react`)
**Screenshots:** Captured (dev server running on :3000) — `375×812` mobile, `1440×900` desktop, Home/Contacts/Demo pages. Stored at `.planning/ui-reviews/02-20260809-143628/`

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Ukrainian copy is specific and on-brand; no generic "Submit/Click Here" labels found |
| 2. Visuals | 2/4 | Wrong hero image (stock error screen, not a dashboard mockup); static notification card lacks the motion the client asked for |
| 3. Color | 4/4 | Clean `dt-*` token usage throughout; no hardcoded hex/rgb in marketing pages, no accent overuse |
| 4. Typography | 1/4 | `text-dt-h1` is a fixed 4rem (64px) font-size with **zero responsive breakpoint override**, applied identically on Home/Contacts/Demo — causes literal text-overflow/clipping on mobile |
| 5. Spacing | 1/4 | Same root cause as Typography: fixed-size heading blows past `Container`'s `px-4` mobile gutter, causing horizontal scroll site-wide on 3 of 3 pages |
| 6. Experience Design | 3/4 | Good loading/typing/empty states in Demo bot; Contacts form has full loading→success→reset cycle; but mobile layout is fundamentally broken, which blocks task completion on phone |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Mobile horizontal overflow via fixed 64px `text-dt-h1` token** — Breaks the site for all mobile users (majority of marketing-site traffic); the h1 on Home hero, Contacts, and Demo all overflow the 375px viewport, causing horizontal scroll and clipped headline text. Fix: in `apps/web/app/premium-theme.css`, make `--text-dt-h1`/`h2`/`h3` responsive (Tailwind v4 supports `@theme` breakpoint-scoped overrides, or switch to `clamp(2.25rem, 6vw + 1rem, 4rem)`-style fluid sizing), OR add explicit responsive Tailwind classes at each of the 3 call sites (e.g. `text-4xl sm:text-5xl lg:text-dt-h1`). Also audit/add `overflow-x-hidden` as a defensive guard on `<body>` or the page root, and add `break-words`/`min-w-0` to headline wrappers.

2. **Hero uses a broken/wrong stock photo instead of a dashboard mockup** — `apps/web/modules/home/hero.tsx:63` hotlinks an Unsplash URL whose actual image (per user report) renders a Vietnamese "trang không tồn tại" (page not found) error screen on an ornate monitor frame — not a laptop showing the DentaBot admin dashboard the copy/design intends. This is the hero's primary visual and directly undermines credibility on the most important above-the-fold real estate. Fix: replace the `src` with either (a) a proper Unsplash query result showing a clean laptop/dashboard mockup, verified by opening the URL before committing, or (b) a purpose-built screenshot of the actual admin-tab dashboard (`apps/web/modules/demo/admin-tab.tsx`) composited into a laptop frame.

3. **Floating notification card is static, has no idle motion** — `apps/web/modules/home/hero.tsx:71-77`, the "Новий запис від Олени Коваль" card overlaid on the hero image has zero animation despite the project's `SignatureMark pulse` prop already being used inside it (so partial motion exists on the dot, but not the card itself). The existing motion system (`apps/web/shared/lib/motion.ts`, `Reveal`) only covers scroll-triggered reveals, not idle/looping motion — there's no established primitive for this. Fix: add a `motion.div` with an `animate={{ y: [0, -6, 0] }}` looping transition (`repeat: Infinity`, `duration: ~3s`, `ease: EASE_DT_EXPO_OUT` or a sine-like ease) wrapped in the same `useReducedMotion()` guard pattern as `Reveal` (fall back to no animation when `prefersReducedMotion` is true), likely as a small new shared primitive (e.g. `FloatingBadge` or an `idleBounce` variant added to `motion.ts`) rather than one-off inline logic, so it's reusable if other floating cards are added later.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)
- CTA labels are specific and contextual: "Спробувати демо", "Дізнатись більше", "Відкрити демо бот", "Надіслати заявку" — none are generic "Submit"/"OK"/"Click Here".
- Empty/error states: Contacts form has real inline validation errors (`apps/web/modules/contacts/contact-form.tsx:69-73`, `:100-104`) with specific messages ("Ім'я має містити щонайменше 2 символи", "Введіть коректний номер телефону або email") — good.
- Success state copy is warm and specific ("Дякуємо!", "Ваша заявка успішно надіслана...") — `contact-form.tsx:135-141`.
- Minor deduction: Demo page's admin-tab "Пацієнти"/"Налаштування" sections (`admin-tab.tsx:277-309`) are unbuilt placeholders with generic one-line filler text ("База даних пацієнтів з контактами та історією відвідувань") rather than an intentional "not implemented in demo" empty state — acceptable for a demo tab but slightly generic.

### Pillar 2: Visuals (2/4)
- **BLOCKER (visual):** Hero mockup image is a broken/irrelevant stock photo, not a dashboard mockup (see Top Fix #2). This is the primary visual focal point of the entire site and it's wrong.
- **WARNING:** Floating notification card has no motion despite being an "alive" moment in the design (see Top Fix #3); currently reads as a static sticker rather than a live notification.
- Icon-only affordances checked: hamburger menu icon in header not directly audited this pass (out of phase scope — Header built in 01.1), but Demo tab icons (🤖/⚙️ emoji prefixes in `demo-tabs.tsx:28,36`) are paired with text labels, good.
- Visual hierarchy otherwise reasonable: `StaggerGrid`/`Reveal` create scroll-driven hierarchy on Problem/Features/Testimonials; badge/eyebrow pattern ("DEMO MODE", "Нова платформа") establishes clear page context.
- Testimonials mixes a real Unsplash photo with 2 emoji-avatar placeholders (`testimonials.tsx:44-49` vs `:68-70`, `:88-90`) — intentional per CONTEXT.md D-08, consistent with design archive, not a defect.

### Pillar 3: Color (4/4)
- Zero hardcoded hex/rgb literals found in `apps/web/modules/**` or `apps/web/shared/components/**` (only 1 grep hit total, and that was the container's CSS var reference, not a literal color).
- Consistent `dt-navy`/`dt-teal`/`dt-coral`/`dt-graphite`/`dt-warm-white` token usage throughout Home, Contacts, Demo bot-tab.
- Coral (`dt-coral`) correctly reserved for primary actions only (submit buttons, "Спробувати демо", DEMO MODE badge) — matches CONTEXT.md's "action-only, sparingly" directive.
- `admin-tab.tsx` correctly uses `@repo/ui`'s `bg-dt-navy`/`text-muted-foreground`/shadcn tokens per the documented admin-simulation carve-out (not a violation — this file is explicitly exempted from the `dt-*`-only rule by 02-CONTEXT.md).

### Pillar 4: Typography (1/4)
- **BLOCKER:** `--text-dt-h1: 4rem` (`apps/web/app/premium-theme.css:33`) is a single fixed value with no responsive/fluid definition. All 3 usages (`hero.tsx:31`, `contacts/page.tsx:13`, `demo/page.tsx:15`) apply `text-dt-h1` with zero `sm:`/`lg:` overrides.
- Confirmed via screenshot: at 375px viewport, the Home hero h1 ("Автоматичний запис пацієнтів через Telegram. Без дзвінків.") wraps into single-word-per-line blocks that still exceed the viewport width and get clipped on the right edge (visible in `.planning/ui-reviews/02-20260809-143628/home-mobile.png`).
- Since Contacts and Demo share the exact same unguarded `text-dt-h1` class with no override, this is not a hero-specific bug — it's systemic across all 3 pages in this phase.
- Font size/weight distribution itself (outside the h1 issue) is reasonably contained: `dt-h1/h2/h3/body/caption` tokens plus a handful of raw `text-2xl/3xl/sm/xs` and `font-bold/semibold/medium` utility classes for numerals, emoji sizing, and admin-tab stat cards — within acceptable variety for a marketing site, not the reason for the low score.

### Pillar 5: Spacing (1/4)
- **BLOCKER:** Root cause is the same fixed-size h1 (Typography pillar) — since `Container` correctly applies `px-4` on mobile (`apps/web/shared/components/container.tsx:9`), the gutter itself is fine, but the oversized h1 content ignores the container's width constraint and forces horizontal scroll on the whole page. Screenshot confirms content bleeding past the viewport edge, which is the exact "horizontal scroll should never happen" defect class.
- No `overflow-x-hidden` guard found on `<body>`/root layout as a defensive backstop — checked implicitly via the screenshot showing real scroll, not just visual clipping.
- Aside from the h1 issue, section vertical rhythm is consistent (`py-16 lg:py-24` pattern repeated across Problem/Solution/Features/Testimonials/CtaBanner) and card/grid gaps use the standard Tailwind spacing scale (`gap-6`, `gap-12`, `space-y-4/6`) — no arbitrary spacing values found outside the two `rounded-[3rem]`/`h-[600px]` phone-mockup sizes in `bot-tab.tsx:117-118`, which are legitimate device-frame conceits, not spacing drift.
- Because the h1 overflow is the literal top user-facing defect reported and independently reproduced, this pillar cannot score above 1 despite otherwise-disciplined spacing elsewhere.

### Pillar 6: Experience Design (3/4)
- Loading/typing state: Demo bot-tab has a proper animated typing indicator (`bot-tab.tsx:176-195`) and scenario playback with defensive interval-cleanup guarding against overlapping runs (`bot-tab.tsx:47-54`) — good engineering, exceeds "just make it work" bar.
- Form states: Contacts form has disabled-implicit submit flow, simulated async delay, toast + inline success card, and a reset-to-empty affordance (`contact-form.tsx:37-44`, `130-151`) — full state coverage for a mocked form.
- Admin-tab dashboard has an intentional count-up number animation and staggered bar-chart mount animation (`admin-tab.tsx:34-57`, `82-109`) — nice polish detail.
- Reduced-motion handling: `Reveal` correctly branches on `useReducedMotion()` (`reveal.tsx:19,26-29`) — but this coverage does NOT extend to the requested new idle-bounce notification card, which doesn't exist yet (see Top Fix #3) — flagged as a gap to close when that motion is added, not a current violation.
- **WARNING pulling score down:** the mobile-breaking layout bug is itself an experience-design failure — a user on a phone (the majority of marketing traffic) cannot read the primary headline without horizontal scrolling, which is a hard blocker to task completion (reading the value prop, then tapping a CTA) even though the CTAs/forms themselves are otherwise well-built.
- No error boundary found for the two external Unsplash image hotlinks (hero, testimonial) — if Unsplash is unreachable or the URL 404s, `next/image` falls back to browser default broken-image icon with no graceful fallback; CONTEXT.md explicitly left the `ImageWithFallback` port to "Claude's Discretion" and it appears to have been dropped entirely rather than replaced — minor but worth noting given Finding #2 already demonstrates the hero image is unreliable in practice.

---

## Files Audited
- `apps/web/modules/home/hero.tsx`
- `apps/web/modules/home/problem.tsx`
- `apps/web/modules/home/solution.tsx`
- `apps/web/modules/home/features.tsx`
- `apps/web/modules/home/cta-banner.tsx`
- `apps/web/modules/home/testimonials.tsx`
- `apps/web/modules/home/stagger-grid.tsx`
- `apps/web/shared/components/container.tsx`
- `apps/web/shared/components/reveal.tsx`
- `apps/web/shared/lib/motion.ts`
- `apps/web/app/premium-theme.css`
- `apps/web/app/contacts/page.tsx`
- `apps/web/modules/contacts/contact-form.tsx`
- `apps/web/modules/contacts/contact-info.tsx`
- `apps/web/modules/contacts/faq-accordion.tsx`
- `apps/web/app/demo/page.tsx`
- `apps/web/modules/demo/demo-tabs.tsx`
- `apps/web/modules/demo/bot-tab.tsx`
- `apps/web/modules/demo/admin-tab.tsx`
- `.planning/phases/02-home-contacts-demo/02-CONTEXT.md`
- `.planning/phases/02-home-contacts-demo/02-01-PLAN.md` / `02-01-SUMMARY.md` / `02-02-SUMMARY.md` / `02-03-SUMMARY.md` (referenced for scope; not re-quoted)
- Screenshots: `.planning/ui-reviews/02-20260809-143628/home-mobile.png`, `home-desktop.png`, `contacts-desktop.png`, `demo-desktop.png`
