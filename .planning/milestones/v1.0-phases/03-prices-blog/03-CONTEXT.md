# Phase 3: Prices & Blog - Context

**Gathered:** 2026-08-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the Prices page (`/prices`, pricing tiers + monthly/yearly toggle + comparison table + FAQ) and the Blog surfaces (`/blog` listing with search/filter, `/blog/[slug]` individual post detail, Not Found for unknown slugs). Content, copy, and section structure come from the design archive (transcribed verbatim below), built on the Phase 01.1 premium design system — same as Phase 2's approach, NOT `@repo/ui`. This completes all six routes of the site (Home, Contacts, Demo already shipped in Phase 1/01.1/2).

Requirements covered: PRICE-01, BLOG-01, BLOG-02, BLOG-03 (see `.planning/REQUIREMENTS.md`).

</domain>

<decisions>
## Implementation Decisions

### Blog post body content

- **D-01:** The design archive's `blog-post.tsx` hardcodes ONE full article body (headings + paragraphs + blockquote), regardless of the `slug` param — it never actually branches on slug. Only that one post ("Як автоматизація запису підвищує прибуток стоматологічної клініки на 40%", slug `automation-increases-profit`) has real body content; the other 5 posts (from `blog.tsx`'s `posts` array) only have title/excerpt/category/date/readTime.
  - **Decision:** Write a unique short body (2-4 headings, 2-3 paragraphs each, same style/structure as the archived article — intro paragraph, a couple of `<h2>` sections, maybe a list) for each of the 5 other posts, grounded in that post's existing title/excerpt. Claude's discretion on exact wording — not a rewrite of provided copy, but original supporting content in the same voice/register (Ukrainian, professional-but-approachable dental-SaaS blog tone).
  - The featured post's real archived body content ports verbatim, unchanged.
  - All 6 posts need a `slug → post` lookup (mock data keyed by slug) so `/blog/[slug]` renders the correct post; unmatched slugs → Not Found (BLOG-03).

### Blog search & category filters

- **D-02:** The archive's search input and category filter buttons (`Всі` / `Автоматизація` / `Маркетинг` / `Управління клінікою`) render but have zero wiring (no `onChange`/`onClick`, no filter logic) — purely decorative in the source.
  - **Decision:** Make them functional. Client-side filtering over the 6 mock posts: text search matches title/excerpt (case-insensitive substring), category buttons filter by exact category match, `Всі` shows all. Combine both filters (AND). Featured post section can stay static (always shows the one featured post) or also respect filters — Claude's discretion, lean toward keeping the featured post always visible since it's a distinct "hero" slot, only the grid below filters.

### Blog "Load More" button

- **D-03:** The archive's `Завантажити ще` button under the posts grid is non-functional, and there's no pagination need (BLOG-01 requires showing all 6 posts, already all rendered in the grid).
  - **Decision:** Keep it, decorative — port as-is visually, no `onClick` handler, matches the archive exactly.

### Claude's Discretion

- Exact mock-data file location/shape for blog posts (e.g. `apps/web/modules/blog/_data.ts` or similar, following the Phase 2 `modules/<page>/` convention) — needs `slug`, `title`, `excerpt`, `category`, `date`, `readTime`, `image`, and (new, not in archive) a `body` field structured as an array of content blocks (paragraph/heading/list/quote) or a single markdown-ish string — planner/executor's call on the cleanest shape for rendering.
- Whether the pricing comparison table needs a new premium `PremiumTable` primitive or can be hand-built with plain `<table>` + `dt-*` token classes for this one use — no other page needs a data table on the marketing site (Demo's admin-simulation table is separate, `@repo/ui`-based). Lean toward plain semantic `<table>`, not a new reusable primitive, unless the planner sees a strong reuse case.
- New premium primitives likely needed and not yet built: a Switch/Toggle (for Prices' billing toggle) and a Badge (for "Популярний"/category pills) in the premium `dt-*` system — build as new `apps/web/shared/components/premium-*.tsx` following the existing `PremiumAccordion`/`PremiumInput` pattern, scoped to what's actually used (don't over-build variants not needed by these two pages).
- `ImageWithFallback` porting approach (Figma-export-specific `<img>` wrapper) — same call as Phase 2 D-08/discretion: replicate via `next/image`'s `onError` or drop the fallback, not user-facing enough to require a decision.
- Blog images are Unsplash hotlinks (same `images.unsplash.com` domain already allowlisted in `next.config.js` from Phase 2's D-08) — no new remote-pattern config needed.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level specs
- `.planning/PROJECT.md` — Core value, constraints (tech stack, forms, images), Key Decisions table
- `.planning/REQUIREMENTS.md` — PRICE-01, BLOG-01/02/03 full requirement text and traceability
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, dependencies (depends on Phase 1)
- `.planning/phases/01.1-premium-design-system/01.1-CONTEXT.md` — the premium design system's full decision record (colors, typography, motion spec, a11y, `dt-*` tokens) — authoritative for HOW to build UI on this phase
- `.planning/phases/01.1-premium-design-system/01.1-04-SUMMARY.md` — shell (Header/Footer) details this phase's pages sit under
- `.planning/phases/02-home-contacts-demo/02-CONTEXT.md` — sibling phase's premium-system decisions (`PremiumButton`/`PremiumCard`/`Container` usage, `dt-*` token rules, motion/`Reveal` usage) — same patterns apply here; read the "⚠ SUPERSEDED — Premium Design System" note at its top for the definitive component-reuse rule

### Codebase maps
- `.planning/codebase/CONVENTIONS.md` — naming, formatting, import order
- `.planning/codebase/STRUCTURE.md` — directory layout
- `.planning/codebase/STACK.md` — exact dependency versions

### Design archive (⚠ ephemeral scratch path — re-extract if missing)
- Design archive root (last known): `/private/tmp/claude-501/-Users-artemdanko-Developer-denta-bot/8b5d7e59-0e2d-435b-b260-ad43cb13b1c8/scratchpad/design-archive/` — re-extracted from the persistent source zip `/Users/artemdanko/Downloads/Дизайн з темами.zip` if this scratch path is gone by execution time.
- **The full relevant source for all three routes (Prices, Blog listing, Blog Post) has been transcribed into `<code_context>` below — treat that as the canonical source for Phase 3 planning/execution, not the scratch path.**
- [No ADRs or other external specs exist for this milestone.]

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Premium primitives (`apps/web/shared/components/`): `PremiumButton`, `PremiumCard`, `Container`, `PremiumAccordion` (built in Phase 2 for Contacts' FAQ — reuse directly for both Prices' FAQ and this phase doesn't need a new accordion), `PremiumInput`, `PremiumTextarea` (built for Contacts form — `PremiumInput` reusable for Blog's search field)
- `apps/web/shared/lib/cn.ts` — className helper (not `@repo/ui`'s)
- Motion: `Reveal`, `SignatureMark`, `useInView`, `apps/web/shared/lib/motion.ts` — apply scroll-reveal to Prices' pricing cards / comparison table / FAQ sections and Blog's post grid, per the established site-wide pattern
- `routes` const object — `apps/web/shared/lib/routes.ts` — use `routes.prices`/`routes.blog`/`routes.contacts`/`routes.demo` for all internal links; will need a `routes.blogPost(slug)` helper or similar for dynamic blog links
- Header's "Ціни" and "Блог" nav links likely already point at `/prices` and `/blog` (built in Phase 01.1's shell) — verify during planning, no header changes expected

### Established Patterns (current)
- `apps/web/app/` holds only route files (`page.tsx`, `layout.tsx`, `not-found.tsx`); cross-page shared code in `apps/web/shared/{components,lib,hooks}/`; page-specific code in `apps/web/modules/<page>/` (see `modules/contacts/`, `modules/demo/`, `modules/home/` from Phase 2)
- `dt-*` premium tokens (not `text-foreground`/`bg-brand`/literal hex) — full palette in `apps/web/app/premium-theme.css`: navy `dt-navy` (#1A2B3D), teal `dt-teal` (#2C7A7B), warm white `dt-warm-white` (#FAFAF8), coral `dt-coral` (#E86B5A, action-only), graphite `dt-graphite` (#2D3436)
- `React.JSX.Element` explicit return types on components (Phase 1 workaround for a duplicate-`@types/react` tsc error) — keep applying to new page components
- Existing not-found page (`apps/web/app/not-found.tsx`, built Phase 1/01.1) handles unmatched routes — BLOG-03's per-slug Not Found should reuse this same component/pattern (Next.js `notFound()` call from `apps/web/app/blog/[slug]/page.tsx` when slug isn't in mock data, rendering the existing not-found UI)

### Integration Points
- New routes: `apps/web/app/prices/page.tsx`, `apps/web/app/blog/page.tsx`, `apps/web/app/blog/[slug]/page.tsx`
- All internal CTAs across both pages point to `/contacts` ("Обрати план", "Напишіть нам") or `/demo` ("Спробувати демо") — reuse `routes.ts` constants

### Design source — Prices page (`src/app/pages/prices.tsx`)

Full page, 4 sections: Hero (h1 + subhead + monthly/yearly `Switch` toggle w/ "-20%" badge) → Pricing Cards (3-tier grid, "Бізнес" marked `popular` with border + badge) → Comparison Table (14-row feature matrix across 3 tiers) → FAQ (7 items, accordion) + closing CTA.

```tsx
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Link } from "react-router";

export default function Prices() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Старт",
      price: isYearly ? "499" : "599",
      description: "Для невеликих клінік",
      features: ["До 100 записів/місяць", "1 лікар", "Telegram бот", "Автонагадування", "Базова аналітика", "Email підтримка"],
      excluded: ["Декілька локацій", "API доступ", "Пріоритетна підтримка"],
    },
    {
      name: "Бізнес",
      price: isYearly ? "999" : "1199",
      description: "Для середніх клінік",
      popular: true,
      features: ["До 500 записів/місяць", "До 5 лікарів", "Telegram бот", "Автонагадування", "Розширена аналітика", "Збір відгуків", "Інтеграції", "Пріоритетна підтримка"],
      excluded: ["API доступ"],
    },
    {
      name: "Клініка",
      price: isYearly ? "1999" : "2499",
      description: "Для великих клінік",
      features: ["Необмежено записів", "Необмежено лікарів", "Telegram бот", "Автонагадування", "Повна аналітика", "Збір відгуків", "Всі інтеграції", "API доступ", "Декілька локацій", "Персональний менеджер"],
      excluded: [],
    },
  ];

  const comparisonFeatures = [
    { name: "Записи на місяць", starter: "100", business: "500", clinic: "Необмежено" },
    { name: "Кількість лікарів", starter: "1", business: "5", clinic: "Необмежено" },
    { name: "Telegram бот", starter: true, business: true, clinic: true },
    { name: "Автонагадування", starter: true, business: true, clinic: true },
    { name: "Базова аналітика", starter: true, business: false, clinic: false },
    { name: "Розширена аналітика", starter: false, business: true, clinic: true },
    { name: "Повна аналітика", starter: false, business: false, clinic: true },
    { name: "Збір відгуків", starter: false, business: true, clinic: true },
    { name: "Інтеграції", starter: false, business: true, clinic: true },
    { name: "API доступ", starter: false, business: false, clinic: true },
    { name: "Декілька локацій", starter: false, business: false, clinic: true },
    { name: "Email підтримка", starter: true, business: true, clinic: true },
    { name: "Пріоритетна підтримка", starter: false, business: true, clinic: true },
    { name: "Персональний менеджер", starter: false, business: false, clinic: true },
  ];

  const faqs = [
    { question: "Чи є безкоштовний пробний період?", answer: "Так, ми надаємо 14 днів безкоштовного тестування всіх функцій плану Бізнес. Кредитна картка не потрібна." },
    { question: "Як я можу скасувати підписку?", answer: "Ви можете скасувати підписку в будь-який момент в особистому кабінеті. Доступ до функцій збережеться до кінця оплаченого періоду." },
    { question: "Які методи оплати ви приймаєте?", answer: "Ми приймаємо оплату банківськими картками Visa/Mastercard, а також банківський переказ для юридичних осіб." },
    { question: "Чи можу я змінити тариф пізніше?", answer: "Так, ви можете підвищити або знизити тариф в будь-який момент. При підвищенні тарифу різниця буде розрахована пропорційно." },
    { question: "Чи включена технічна підтримка?", answer: "Так, всі плани включають технічну підтримку. План Бізнес та Клініка отримують пріоритетну підтримку з швидшим часом відповіді." },
    { question: "Що станеться якщо я перевищу ліміт записів?", answer: "Ми завчасно повідомимо вас про наближення до ліміту. Ви зможете оновити план або оплатити додаткові записи за потреби." },
    { question: "Чи потрібен технічний спеціаліст для налаштування?", answer: "Ні, налаштування інтуїтивне і займає до 1 години. Ми також надаємо відео інструкції та допомогу нашої команди." },
  ];

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-16">
      {/* Hero: h1 "Прості та прозорі ціни", p "Починайте безкоштовно. Платіть тільки коли відчуєте цінність.",
          billing toggle: Label "Щомісяця" + Switch(checked=isYearly) + Label "Щороку" + Badge secondary "-20%" */}

      {/* Pricing Cards: 3-col grid, max-w-6xl. Each Card: popular ? "border-2 border-[#1d6be4] relative" : "".
          popular card gets absolute-positioned Badge "Популярний" at -top-4 center.
          CardHeader: name, description, price block ("{price} ₴" + "/міс" muted).
          CardContent: features.map → Check icon (green-500) + feature text.
          CardFooter: Button full-width, variant={popular ? "default" : "outline"}, asChild Link to="/contacts", text "Обрати план". */}

      {/* Comparison Table: bg-gray-50 section, h2 "Детальне порівняння планів", overflow-x-auto wrapper,
          table max-w-5xl centered, thead "Функція"/"Старт"/"Бізнес"/"Клініка",
          tbody rows from comparisonFeatures — string values render as text, boolean true → Check icon, false → "—" muted */}

      {/* FAQ: h2 "Часті питання", Accordion (7 faqs, single/collapsible, border rounded-lg px-6 per item),
          closing: p "Залишились питання?" + Button size=lg asChild Link to="/contacts" "Напишіть нам →" */}
    </div>
  );
}
```

### Design source — Blog listing page (`src/app/pages/blog.tsx`)

Sections: Hero (h1 + subhead + search input + category filter buttons) → Featured Post (large card, links to its slug) → Posts Grid (3-col, 5 remaining posts) → Load More button (decorative, per D-03).

```tsx
import { Link } from "react-router";
import { Search, Clock, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Blog() {
  const categories = ["Всі", "Автоматизація", "Маркетинг", "Управління клінікою"];

  const featuredPost = {
    id: 1,
    title: "Як автоматизація запису підвищує прибуток стоматологічної клініки на 40%",
    excerpt: "Дослідження показує, що клініки які автоматизували запис пацієнтів отримали значне зростання доходу та задоволеності клієнтів.",
    category: "Автоматизація",
    date: "5 березня 2026",
    readTime: "8 хв читання",
    image: "https://images.unsplash.com/photo-1762625570087-6d98fca29531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkZW50YWwlMjBjbGluaWMlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzI4ODg4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    slug: "automation-increases-profit",
  };

  const posts = [
    { id: 2, title: "7 помилок у записі пацієнтів які коштують вам грошей", excerpt: "Розбираємо найпоширеніші помилки в організації запису та як їх уникнути.", category: "Управління клінікою", date: "2 березня 2026", readTime: "6 хв читання", image: "https://images.unsplash.com/photo-1620287341260-a9ecadfe7a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGRlc2slMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcyOTA1MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", slug: "common-booking-mistakes" },
    { id: 3, title: "Як Telegram боти змінюють медичний бізнес в Україні", excerpt: "Огляд тренду автоматизації через месенджери в медичній сфері.", category: "Автоматизація", date: "28 лютого 2026", readTime: "5 хв читання", image: "https://images.unsplash.com/photo-1766171359875-73155eff7f66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkYXNoYm9hcmQlMjBtb2NrdXAlMjBzY3JlZW58ZW58MXx8fHwxNzcyOTA1MjU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", slug: "telegram-bots-medical" },
    { id: 4, title: "Маркетинг для стоматологічних клінік: повний гайд 2026", excerpt: "Стратегії залучення нових пацієнтів та утримання існуючих клієнтів.", category: "Маркетинг", date: "25 лютого 2026", readTime: "10 хв читання", image: "https://images.unsplash.com/photo-1631596577204-53ad0d6e6978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50aXN0JTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyODM1MzgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", slug: "dental-marketing-guide" },
    { id: 5, title: "Чому пацієнти не приходять на прийом та як це виправити", excerpt: "Аналіз причин пропущених візитів та ефективні методи їх зменшення.", category: "Управління клінікою", date: "22 лютого 2026", readTime: "7 хв читання", image: "https://images.unsplash.com/photo-1762625570087-6d98fca29531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkZW50YWwlMjBjbGluaWMlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzI4ODg4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", slug: "missed-appointments" },
    { id: 6, title: "Як налаштувати ефективну систему нагадувань пацієнтам", excerpt: "Покрокова інструкція створення автоматичних нагадувань які працюють.", category: "Автоматизація", date: "18 лютого 2026", readTime: "6 хв читання", image: "https://images.unsplash.com/photo-1620287341260-a9ecadfe7a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd3JpdGluZyUyMGRlc2slMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcyOTA1MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", slug: "reminder-system" },
  ];

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-16">
      {/* Hero: h1 "Корисні матеріали для стоматологій", p subhead,
          Search Input (icon-left, placeholder "Пошук статей..."), category filter Buttons (Всі default-selected variant) — D-02: wire both to real client-side filtering */}

      {/* Featured Post: whole Card is a Link to /blog/{slug}, 2-col grid (image | content),
          image side: full-cover image + Badge (category) top-left overlay;
          content side: date + • + Clock icon + readTime, h2 title, p excerpt, Button "Читати статтю →" */}

      {/* Posts Grid: 3-col (md:2, lg:3), each post Card (h-full) wrapped in Link to /blog/{slug}:
          image (h-48, cover) + Badge (secondary, category) overlay,
          CardHeader: date/readTime row + CardTitle (title),
          CardContent: CardDescription (excerpt) + Button variant="link" "Читати →" */}

      {/* Load More: centered Button variant="outline" size="lg" "Завантажити ще" — D-03: keep decorative, no handler */}
    </div>
  );
}
```

### Design source — Blog Post detail page (`src/app/pages/blog-post.tsx`)

Single hardcoded article (doesn't actually branch on `slug` in the archive — see D-01). Sections: Back button → Header (category badge, h1, date/readTime/share) → Featured image → Article body (prose) → CTA card → Related posts (3-card grid).

```tsx
import { Link, useParams } from "react-router";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function BlogPost() {
  const { slug } = useParams();

  const article = {
    title: "Як автоматизація запису підвищує прибуток стоматологічної клініки на 40%",
    category: "Автоматизація",
    date: "5 березня 2026",
    readTime: "8 хв читання",
    image: "https://images.unsplash.com/photo-1762625570087-6d98fca29531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkZW50YWwlMjBjbGluaWMlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzI4ODg4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  };

  const relatedPosts = [
    { id: 1, title: "7 помилок у записі пацієнтів які коштують вам грошей", slug: "common-booking-mistakes" },
    { id: 2, title: "Як Telegram боти змінюють медичний бізнес", slug: "telegram-bots-medical" },
    { id: 3, title: "Чому пацієнти не приходять на прийом", slug: "missed-appointments" },
  ];

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button: ghost Button, ArrowLeft icon, "Назад до блогу", Link to /blog */}

          {/* Header: Badge (category), h1 (title), date + • + Clock+readTime + ml-auto Share2 icon-button */}

          {/* Featured image: rounded-2xl, full-width */}

          {/* Article body (prose): intro paragraph (larger/muted), then per this ONE archived article: */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Дослідження показує, що клініки які автоматизували запис пацієнтів отримали значне зростання доходу та задоволеності клієнтів. У цій статті ми детально розглянемо як саме автоматизація впливає на бізнес показники.
            </p>
            <h2 className="text-3xl font-bold mt-12 mb-4">Проблема традиційного запису</h2>
            <p>Більшість стоматологічних клінік досі використовують застарілу систему запису через телефон. Це призводить до втрати часу адміністраторів, пропущених дзвінків та незадоволених пацієнтів.</p>
            <h2 className="text-3xl font-bold mt-12 mb-4">Що дає автоматизація</h2>
            <ul>
              <li>Збільшення кількості записів на 25-30% завдяки доступності 24/7</li>
              <li>Зменшення пропущених візитів на 60-70% через автоматичні нагадування</li>
              <li>Економія часу адміністратора до 3 годин на день</li>
              <li>Покращення досвіду пацієнтів та лояльності</li>
            </ul>
            <blockquote className="border-l-4 border-[#1d6be4] pl-6 italic my-8">
              "Після впровадження автоматизації наша клініка побачила зростання прибутку на 42% за перші 6 місяців. Пацієнти в захваті від зручності запису."
              <footer className="text-sm mt-2 not-italic">— Олена Ковальчук, власник клініки "Посмішка"</footer>
            </blockquote>
            <h2 className="text-3xl font-bold mt-12 mb-4">Як це працює на практиці</h2>
            <p>Система автоматизації DentaBot інтегрується з вашим розкладом та дозволяє пацієнтам самостійно обирати зручний час. Бот автоматично надсилає нагадування, приймає перенесення та скасування записів.</p>
            <h2 className="text-3xl font-bold mt-12 mb-4">Висновок</h2>
            <p>Автоматизація запису — це не просто технологічне рішення, а стратегічна інвестиція в розвиток вашого бізнесу. Клініки які впроваджують такі системи отримують конкурентну перевагу та стабільне зростання прибутку.</p>
          </article>

          {/* CTA Card: bg-[#1d6be4] (→ dt-navy or dt-teal, planner's call per palette) text-white,
              h3 "Хочете автоматизувати запис у вашій клініці?", p "Спробуйте DentaBot безкоштовно протягом 14 днів",
              2 buttons: secondary "Спробувати демо" → /demo, outline-white "Зв'язатись з нами" → /contacts */}

          {/* Related Posts: h2 "Схожі статті", 3-col grid, each a Card→Link to its slug, CardTitle (title) + Button variant=link "Читати" */}
        </div>
      </div>
    </div>
  );
}
```

**For posts other than the featured one:** per D-01, write a unique ~2-4-paragraph/heading body for each of the 5 remaining posts (`common-booking-mistakes`, `telegram-bots-medical`, `dental-marketing-guide`, `missed-appointments`, `reminder-system`), grounded in their existing `title`/`excerpt` from `blog.tsx` above. Match the archived article's structure (intro paragraph, 2-3 `<h2>` sections, optionally a list) — Claude's discretion on exact content per the decision above.

</code_context>

<specifics>
## Specific Ideas

- The popular-tier border/badge treatment (`border-2 border-[#1d6be4] relative` + centered "Популярний" badge) is a strong candidate for a `PremiumCard` variant prop (e.g. `highlighted`) rather than one-off classes, matching how Phase 2 extended premium primitives with new variants when the design called for it.
- Both Prices' CTA buttons ("Обрати план") and Blog Post's CTA card buttons route to `/contacts`/`/demo` — reuse `PremiumButton`'s coral action variant where the design uses `variant="default"` on a colored background, consistent with Phase 2's established brand-CTA pattern (coral always paired with `text-dt-navy`, never white/warm-white text, per WCAG AA — see 01.1-CONTEXT.md).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. No scope-creep suggestions came up.

</deferred>

---

*Phase: 3-Prices & Blog*
*Context gathered: 2026-08-09*
