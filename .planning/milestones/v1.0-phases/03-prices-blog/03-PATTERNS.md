# Phase 3: Prices & Blog - Pattern Map

**Mapped:** 2026-08-09
**Files analyzed:** 12 (3 routes, ~6 module composition files, 1 data file, 2 new premium primitives, 1 lib addition)
**Analogs found:** 12 / 12 (all have strong same-repo analogs from Phase 2)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/web/app/prices/page.tsx` | route (page composition) | request-response | `apps/web/app/contacts/page.tsx` | exact |
| `apps/web/app/blog/page.tsx` | route (page composition) | request-response + client filter | `apps/web/app/contacts/page.tsx` + `apps/web/modules/contacts/contact-form.tsx` (client state pattern) | role-match |
| `apps/web/app/blog/[slug]/page.tsx` | route (dynamic, notFound) | request-response | `apps/web/app/not-found.tsx` (notFound trigger target) + `apps/web/app/contacts/page.tsx` (composition) | role-match |
| `apps/web/modules/prices/pricing-cards.tsx` | component (page section) | CRUD (static list render) | `apps/web/modules/home/features.tsx` (grid of `PremiumCard`) | exact |
| `apps/web/modules/prices/comparison-table.tsx` | component (page section) | transform (static table render) | none direct — plain `<table>`, use `apps/web/modules/home/features.tsx` for `dt-*` token conventions | role-match |
| `apps/web/modules/prices/faq-accordion.tsx` (or reuse-in-place) | component | CRUD (static list render) | `apps/web/modules/contacts/faq-accordion.tsx` | exact |
| `apps/web/modules/blog/_data.ts` | data/mock module | static data | `apps/web/modules/demo/_data.ts` | exact |
| `apps/web/modules/blog/blog-filters.tsx` | component (client, filter state) | event-driven (search + filter) | `apps/web/modules/contacts/contact-form.tsx` (client component w/ `useState`, `'use client'`) | role-match |
| `apps/web/modules/blog/post-card.tsx` | component | CRUD (static render, Link) | `apps/web/modules/contacts/contact-info.tsx` (`PremiumCard` + icon row list) | role-match |
| `apps/web/modules/blog/related-posts.tsx` | component | CRUD (static render) | `apps/web/modules/home/features.tsx` (grid + `PremiumCard`) | exact |
| `apps/web/shared/components/premium-switch.tsx` | component (new primitive) | n/a (UI control) | `packages/ui/src/components/shadcn-ui/switch.tsx` (behavior/radix wiring) + `apps/web/shared/components/premium-input.tsx` (dt-token styling convention) | role-match |
| `apps/web/shared/components/premium-badge.tsx` | component (new primitive) | n/a (UI control) | `packages/ui/src/components/shadcn-ui/badge.tsx` (cva variant shape) + `apps/web/shared/components/premium-button.tsx` (cva + dt-token convention) | role-match |
| `apps/web/shared/lib/routes.ts` | config/lib | n/a | itself — already has `prices`, `blog`, `blogPost(slug)` | exact (no change needed) |

## Pattern Assignments

### `apps/web/app/prices/page.tsx` (route, request-response)

**Analog:** `apps/web/app/contacts/page.tsx` (full file read, 46 lines)

**Composition pattern** (whole file):
```tsx
import { ContactForm } from '@/modules/contacts/contact-form';
import { ContactInfo } from '@/modules/contacts/contact-info';
import { FaqAccordion } from '@/modules/contacts/faq-accordion';
import { Container } from '@/shared/components/container';
import { Reveal } from '@/shared/components/reveal';

export default function Contacts(): React.JSX.Element {
  return (
    <div>
      <section className="pb-12 pt-24 lg:pb-16 lg:pt-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-dt-h1 font-dt-heading font-bold text-dt-navy">...</h1>
            <p className="mt-4 text-dt-body text-dt-graphite">...</p>
          </div>
        </Container>
      </section>
      <section className="pb-8 lg:pb-12">
        <Container>{/* body content */}</Container>
      </section>
      <section className="bg-dt-navy/5 py-8 lg:py-12">
        <Container>
          <Reveal>
            <h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy text-center mb-12">
              Часті питання
            </h2>
          </Reveal>
          <div className="mx-auto max-w-3xl"><FaqAccordion /></div>
        </Container>
      </section>
    </div>
  );
}
```

**Apply to Prices:** Root `<div>` (no `min-h-screen`/`pt-24` — that pattern actually lives on `apps/web/app/demo/page.tsx`'s wrapper `min-h-screen pb-16 pt-24 lg:pt-32`; use that wrapper class instead, matching the design source's `min-h-screen pt-24 lg:pt-32 pb-16`). Sections: Hero (h1 + subhead + `PremiumSwitch` toggle, centered `max-w-2xl`) → Pricing Cards section → Comparison Table section (`bg-dt-navy/5` alt-background per Contacts' FAQ section convention, replacing archive's `bg-gray-50`) → FAQ section (identical structure to Contacts' FAQ section, reusing `Reveal` + centered h2 + `max-w-3xl` wrapper) + closing CTA.

**Root wrapper** — copy from `apps/web/app/demo/page.tsx` line 8:
```tsx
<div className="min-h-screen pb-16 pt-24 lg:pt-32">
```

---

### `apps/web/modules/prices/pricing-cards.tsx` (component, CRUD)

**Analog:** `apps/web/modules/home/features.tsx` (full file, 105 lines)

**Grid + PremiumCard pattern** (lines 20-33):
```tsx
<section id="features" className="py-8 lg:py-12">
  <Container>
    <Reveal>
      <div className="mb-12 text-center">
        <h2 className="text-dt-h2 font-dt-heading font-bold text-dt-navy">...</h2>
      </div>
    </Reveal>
    <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StaggerItem>
        <PremiumCard>
          {/* icon, h3, p */}
        </PremiumCard>
      </StaggerItem>
      {/* ...repeat per item */}
    </StaggerGrid>
  </Container>
</section>
```

**Apply to Prices:** 3-col grid (`lg:grid-cols-3`, `max-w-6xl mx-auto`) of `PremiumCard`, each mapped from a `plans` array (define inline in the component, matching the archive's `plans` const shown in CONTEXT.md — no separate `_data.ts` needed, this is page-specific and small). For the "Бізнес" (popular) card, extend `PremiumCard` via a `highlighted` boolean prop (per CONTEXT.md's Specific Idea) — add a variant to `apps/web/shared/components/premium-card.tsx` similar to how `premium-button.tsx` handles `variant` via `cva`, OR pass extra `className`/conditional styling directly in `pricing-cards.tsx` (`border-2 border-dt-teal` + absolutely-positioned `PremiumBadge` "Популярний"). Favor the CVA-variant route since PremiumCard is currently a plain non-cva component — this is the one new prop it needs.

**PremiumCard current shape** (`apps/web/shared/components/premium-card.tsx`, full file):
```tsx
export function PremiumCard({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="premium-card"
      className={cn(
        'h-full rounded-dt-card border border-dt-navy/10 bg-dt-warm-white p-6 shadow-[var(--shadow-dt-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-dt-hover)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```
Not CVA-based (plain `cn`) — simplest extension is likely a `highlighted?: boolean` prop toggling an extra class string via `cn()`, not a full CVA rewrite.

**CTA button pattern (coral variant)** — from `apps/web/shared/components/premium-button.tsx` lines 12-16 (variants) and used in `not-found.tsx` line 16 (`asChild` + `Link`):
```tsx
<PremiumButton variant="coral" size="lg" asChild>
  <Link href={routes.contacts}>Обрати план</Link>
</PremiumButton>
```
For non-popular tiers use `variant="outline"` (see `premium-button.tsx` line 13-14).

---

### `apps/web/modules/prices/comparison-table.tsx` (component, transform)

**No direct table analog exists in the codebase.** Per CONTEXT.md discretion, build a plain semantic `<table>` styled with `dt-*` tokens — no new `PremiumTable` primitive. Follow section-wrapper conventions from `apps/web/modules/home/features.tsx` (`<section className="py-8 lg:py-12"><Container><Reveal>...` — use `bg-dt-navy/5` background per Contacts' alt-section, see `apps/web/app/contacts/page.tsx` line 31) and use `Check` icon from `@phosphor-icons/react/ssr` (already used in `features.tsx` line 7) for boolean cells, `text-dt-graphite` for "—".

---

### `apps/web/modules/prices/faq-accordion.tsx` or reuse

**Analog:** `apps/web/modules/contacts/faq-accordion.tsx` (full file, 62 lines — exact structural copy, only `faqs` array content changes)

```tsx
import {
  PremiumAccordion,
  PremiumAccordionContent,
  PremiumAccordionItem,
  PremiumAccordionTrigger,
} from '@/shared/components/premium-accordion';

const faqs = [ /* 7 items from CONTEXT.md's Prices faqs array */ ];

export function FaqAccordion(): React.JSX.Element {
  return (
    <PremiumAccordion type="single" collapsible className="space-y-4">
      {faqs.map((faq, index) => (
        <PremiumAccordionItem key={index} value={`item-${index}`}>
          <PremiumAccordionTrigger>{faq.question}</PremiumAccordionTrigger>
          <PremiumAccordionContent>{faq.answer}</PremiumAccordionContent>
        </PremiumAccordionItem>
      ))}
    </PremiumAccordion>
  );
}
```
Create as a distinct file under `apps/web/modules/prices/` (do not import Contacts' module cross-page) — same name, different directory, matching the `modules/<page>/` convention.

---

### `apps/web/app/blog/page.tsx` + `apps/web/modules/blog/blog-filters.tsx` (route + client component, event-driven)

**Analog for `'use client'` + `useState` pattern:** `apps/web/modules/contacts/contact-form.tsx` (full file, 156 lines)

**Client component + state shape** (lines 1-12, 32-44):
```tsx
'use client';

import * as React from 'react';
// ...

export function ContactForm(): React.JSX.Element {
  const form = useForm<ContactFormValues>({ /* ... */ });
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = form.handleSubmit(() => { /* ... */ });

  return ( /* ... */ );
}
```

**Apply to blog filters:** `blog-filters.tsx` is a `'use client'` component holding `useState` for `search: string` and `activeCategory: string`, filtering the imported `posts` array from `apps/web/modules/blog/_data.ts` and rendering the filtered grid + the search `PremiumInput` + category `PremiumButton`s directly (this component owns both the filter UI controls AND the grid output, since state must live above both). The static Hero and featured-post sections stay in the (server) `apps/web/app/blog/page.tsx`; only the filterable grid + controls need to be a client boundary — matches the project's existing pattern of isolating `'use client'` to the smallest necessary subtree (see `apps/web/modules/demo/demo-tabs.tsx` sibling pattern, and `header.tsx` isolating client state at the component level).

**Search input pattern** — `PremiumInput` used directly with icon overlay; see `apps/web/shared/components/premium-input.tsx` (full file, 18 lines) — plain styled `<input>`, no built-in icon slot, so wrap in a relative `div` with an absolutely positioned `MagnifyingGlass` icon from `@phosphor-icons/react/ssr` (same icon-in-input pattern doesn't exist yet in this codebase; closest icon+card composition reference is `apps/web/modules/contacts/contact-info.tsx` lines 48-53 for icon-with-container layout conventions).

**Category filter buttons:** `PremiumButton` with conditional `variant` (`coral` when active category, `outline` when inactive) driven by local state — same conditional-className-by-state pattern as `header.tsx` lines 53-57 (`pathname === link.href ? ... : ...`).

---

### `apps/web/modules/blog/_data.ts` (data/mock module)

**Analog:** `apps/web/modules/demo/_data.ts` (full file, 165 lines)

**Pattern** (lines 1-2, 70-71, 113-114, 139-140):
```ts
export const scenarios = [ /* ... */ ];
export type ChatScenario = (typeof scenarios)[number];

export const appointments = [ /* ... */ ];
export type Appointment = (typeof appointments)[number];

export const doctors = [ /* ... */ ];
export type Doctor = (typeof doctors)[number];
```
Convention: plain exported `const` array literals (no external schema/zod), each paired with a derived `export type X = (typeof arr)[number]` type alias, `as const` on literal-union fields (e.g. `status: 'confirmed' as const`). Apply identically for `apps/web/modules/blog/_data.ts`: export `posts` (array of 6, including the featured one, each with `slug`, `title`, `excerpt`, `category`, `date`, `readTime`, `image`, `body`), `export type Post = (typeof posts)[number]`, and a helper `export function getPostBySlug(slug: string) { return posts.find((p) => p.slug === slug); }` for the `[slug]` route and BLOG-03's not-found branch. `body` field: array of typed content blocks (`{ type: 'paragraph' | 'heading' | 'list' | 'quote'; ... }`) rendered by a small switch/map in `blog-post-body.tsx` — keeps `_data.ts` pure data, matches the "data only, no JSX" convention already used in `demo/_data.ts`.

---

### `apps/web/app/blog/[slug]/page.tsx` (dynamic route, request-response)

**Analog for `notFound()` trigger + not-found UI:** `apps/web/app/not-found.tsx` (full file, 26 lines) is the target UI Next.js renders automatically for both unmatched routes AND any `notFound()` call within a route segment — no separate `app/blog/[slug]/not-found.tsx` is needed unless a blog-specific not-found UI is wanted (CONTEXT.md says reuse the existing one).

**Not-found UI reference** (full file):
```tsx
import { House } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

import { PremiumButton } from '@/shared/components/premium-button';
import { routes } from '@/shared/lib/routes';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="text-8xl font-bold text-dt-navy">404</div>
        <h1 className="text-3xl font-bold">Сторінку не знайдено</h1>
        <p className="text-dt-graphite">...</p>
        <PremiumButton variant="coral" size="lg" asChild>
          <Link href={routes.home}>...</Link>
        </PremiumButton>
      </div>
    </div>
  );
}
```

**Apply to `[slug]/page.tsx`:**
```tsx
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/modules/blog/_data';

export default function BlogPostPage({ params }: { params: { slug: string } }): React.JSX.Element {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  // ... render
}
```
This triggers Next.js to render `apps/web/app/not-found.tsx` automatically (App Router convention — no import needed in the page itself beyond calling `notFound()`).

**Page composition analog:** same as Prices — `apps/web/app/contacts/page.tsx` for `Container`/section-wrapper pattern (back button + header section, image, prose article body, CTA card section styled `bg-dt-navy` or `bg-dt-teal` per CONTEXT.md's palette note, related posts grid section reusing `apps/web/modules/home/features.tsx`'s `StaggerGrid`/`PremiumCard` grid pattern).

---

### `apps/web/shared/components/premium-switch.tsx` (new primitive)

**Behavioral analog:** `packages/ui/src/components/shadcn-ui/switch.tsx` (full file, read above) — Radix `Switch.Root`/`Switch.Thumb` wiring, `data-slot`, `data-state` attribute selectors for checked/unchecked.

**Styling convention analog:** `apps/web/shared/components/premium-input.tsx` (full file) — `cn()` from `@/shared/lib/cn`, `dt-*` token classes, no CVA needed for this simple a component (matches `premium-input.tsx`'s plain-function-with-cn style rather than `premium-button.tsx`'s CVA style, since Switch only needs on/off states, not size/variant permutations beyond what CONTEXT.md scopes).

**Pattern to write:**
```tsx
import { cn } from '@/shared/lib/cn';
import { Switch as SwitchPrimitive } from 'radix-ui';
import * as React from 'react';

function PremiumSwitch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="premium-switch"
      className={cn(
        'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-2 focus-visible:ring-dt-navy disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-dt-teal data-[state=unchecked]:bg-dt-navy/20',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="premium-switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-dt-warm-white ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { PremiumSwitch };
```
`radix-ui` is already a dependency (used by `premium-accordion.tsx`), so `import { Switch as SwitchPrimitive } from 'radix-ui'` is the correct import path (matches `packages/ui`'s import from the same consolidated `radix-ui` package, not `@radix-ui/react-switch`).

---

### `apps/web/shared/components/premium-badge.tsx` (new primitive)

**Variant-shape analog:** `packages/ui/src/components/shadcn-ui/badge.tsx` (full file, read above) — CVA-based, `asChild`/`Slot.Root` support, `rounded-full px-2 py-0.5 text-xs font-medium`.

**dt-token CVA convention analog:** `apps/web/shared/components/premium-button.tsx` (full file, 53 lines) — `cva()` from `class-variance-authority`, `Slot.Root` from `radix-ui` for `asChild`, `data-slot`, variant keys mapped to `dt-*` classes.

**Pattern to write:**
```tsx
import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/shared/lib/cn';

const premiumBadgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        teal: 'bg-dt-teal/10 text-dt-teal',
        coral: 'bg-dt-coral text-dt-navy',
        navy: 'bg-dt-navy text-dt-warm-white',
        outline: 'border border-dt-navy/20 text-dt-navy',
      },
    },
    defaultVariants: { variant: 'teal' },
  },
);

function PremiumBadge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof premiumBadgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      data-slot="premium-badge"
      className={cn(premiumBadgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { PremiumBadge, premiumBadgeVariants };
```
Needed variants (per CONTEXT.md scope only): `-20%` discount pill on Prices toggle, "Популярний" pill on the highlighted pricing card, category pills on blog post cards/featured post overlay — 3-4 color variants covers all uses, no need to over-build.

---

## Shared Patterns

### Section/Container/Reveal composition
**Source:** `apps/web/app/contacts/page.tsx`, `apps/web/modules/home/features.tsx`
**Apply to:** All new page files (Prices, Blog listing, Blog Post) — every section is `<section className="py-8 lg:py-12"><Container>...<Reveal>{heading}</Reveal>...</Container></section>`, alternating `bg-dt-navy/5` for visually distinct sections (comparison table, FAQ).

### PremiumButton CTA usage
**Source:** `apps/web/shared/components/premium-button.tsx`
**Apply to:** All CTA buttons across Prices/Blog/Blog Post — `variant="coral"` for primary action (paired with `text-dt-navy`, already baked into the coral variant, never override to white text per CONTEXT.md's WCAG note), `variant="outline"` for secondary, `variant="ghost"` for icon-only (e.g. Share2, back button), always `asChild` + `<Link href={routes.x}>` for navigation.
```tsx
const premiumButtonVariants = cva(/* variant.coral = 'bg-dt-coral text-dt-navy hover:bg-dt-coral/90 hover:-translate-y-0.5' */);
```

### PremiumCard for all grid items
**Source:** `apps/web/shared/components/premium-card.tsx`, `apps/web/modules/home/features.tsx`
**Apply to:** Pricing tier cards, blog post cards (listing grid + related posts), always wrapped in `StaggerGrid`/`StaggerItem` from `apps/web/modules/home/stagger-grid.tsx` for the site-wide scroll-stagger motion pattern.

### routes.ts — already complete
**Source:** `apps/web/shared/lib/routes.ts` (full file, 10 lines)
```ts
export const routes = {
  home: '/',
  prices: '/prices',
  demo: '/demo',
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  contacts: '/contacts',
  about: '/about',
  privacy: '/privacy',
} as const;
```
**No changes needed** — `prices`, `blog`, and `blogPost(slug)` all already exist. Use `routes.blogPost(post.slug)` for all internal blog links.

### Header nav — already complete
**Source:** `apps/web/shared/components/header.tsx` lines 15-21
```ts
const navLinks = [
  { href: routes.home, label: 'Продукт' },
  { href: routes.prices, label: 'Ціни' },
  { href: routes.demo, label: 'Демо' },
  { href: routes.blog, label: 'Блог' },
  { href: routes.contacts, label: 'Контакти' },
];
```
**No changes needed** — "Ціни" → `/prices` and "Блог" → `/blog` are already wired (confirms CONTEXT.md's "verify during planning, no header changes expected").

### `'use client'` boundary discipline
**Source:** `apps/web/modules/contacts/contact-form.tsx` line 1, `apps/web/shared/components/header.tsx` line 1, `apps/web/shared/components/reveal.tsx` line 1
**Apply to:** Only `blog-filters.tsx` (owns search/category `useState`) and any component using `PremiumSwitch`'s controlled state (Prices' billing toggle, likely inline `useState` in `apps/web/app/prices/page.tsx` itself or a small `pricing-hero.tsx` client component) need `'use client'`. Route files (`page.tsx`) stay server components by default; only the smallest necessary subtree opts into client.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `apps/web/modules/prices/comparison-table.tsx` | component | transform | No existing `<table>` usage anywhere in `apps/web`; build fresh with `dt-*` tokens per CONTEXT.md discretion (plain table, not a new reusable primitive) |
| Blog post `body` block renderer (e.g. `apps/web/modules/blog/post-body.tsx`) | component | transform | No prior structured rich-content renderer in the codebase; nearest precedent is the plain JSX `<article className="prose ...">` from the design source itself — CONTEXT.md leaves shape to executor's discretion |

## Metadata

**Analog search scope:** `apps/web/app/`, `apps/web/modules/`, `apps/web/shared/components/`, `apps/web/shared/lib/`, `packages/ui/src/components/shadcn-ui/` (switch.tsx, badge.tsx only, for behavioral/variant reference)
**Files scanned:** ~15 read in full (all ≤ 165 lines, single-pass reads, no re-reads)
**Pattern extraction date:** 2026-08-09
