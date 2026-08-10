# Phase 2: Home, Contacts & Demo - Pattern Map

**Mapped:** 2026-08-09 (REPLAN — supersedes prior PATTERNS.md, aligns to Phase 01.1's premium design system)
**Files analyzed:** 12 new/modified files (Home, Demo, Contacts pages + supporting modules/data + next.config.js)
**Analogs found:** 12 / 12

**⚠ This replaces the stale pre-01.1 PATTERNS.md.** All Home/Contacts and the Demo page's Bot-tab/outer chrome analogs come from `apps/web/shared/components/` (the premium system), NOT `@repo/ui`/`apps/web/components/` (deleted in 01.1-04). The Demo page's admin-panel-simulation tab is the sole exception and still uses `@repo/ui` (`packages/ui/src/components/shadcn-ui/*`).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|---------------|
| `apps/web/app/page.tsx` | route/page | request-response | `apps/web/app/not-found.tsx` (premium page shape) + `apps/web/shared/components/header.tsx` (section/CTA composition) | role-match |
| `apps/web/modules/home/*.tsx` (section components: hero, problem, solution, features, cta-banner, testimonials) | component | request-response | `apps/web/shared/components/header.tsx`, `premium-card.tsx`, `reveal.tsx` | role-match |
| `apps/web/app/demo/page.tsx` | route/page (client, `useState`) | event-driven | `apps/web/shared/components/header.tsx` (client component w/ local state pattern) | role-match |
| `apps/web/modules/demo/bot-tab.tsx` (chat UI, scenario buttons) | component | event-driven | `apps/web/shared/components/header.tsx` (client `'use client'` + `useState` + Motion) | role-match |
| `apps/web/modules/demo/admin-tab.tsx` (admin-simulation) | component | CRUD-display | `packages/ui/src/components/shadcn-ui/tabs.tsx`, `table.tsx`, `badge.tsx`, `card.tsx` | exact (intentional @repo/ui exception) |
| `apps/web/modules/demo/_data.ts` (mock appointments/doctors/scenarios) | utility/config | transform | none (new pattern) — plain exported const arrays | no analog needed |
| `apps/web/app/contacts/page.tsx` | route/page (client, RHF+zod form) | request-response | `apps/web/shared/components/header.tsx` (client state pattern); form itself has no in-repo RHF+zod analog | partial — new pattern (see No Analog Found) |
| `apps/web/modules/contacts/contact-form.tsx` | component | request-response | `apps/web/shared/components/premium-button.tsx` (submit button), `premium-card.tsx` (form container) | role-match |
| `apps/web/modules/contacts/faq-accordion.tsx` | component | request-response | none in premium system (Accordion not yet built) — build new primitive following `premium-card.tsx`'s cva-free style, OR use `@repo/ui`'s `accordion.tsx` only as a structural (non-visual) Radix-usage reference | no analog / build new |
| `apps/web/shared/components/premium-input.tsx` (new primitive, if planner judges needed per D-09 discretion) | component (primitive) | request-response | `apps/web/shared/components/premium-button.tsx` (cva pattern), `premium-card.tsx` (token usage) | role-match |
| `apps/web/next.config.js` | config | — | existing `apps/web/next.config.js` (add `images.remotePatterns` for `images.unsplash.com`) | exact (self-modify) |
| `apps/web/app/globals.css` / `premium-theme.css` | config | — | no change expected; reference only | n/a |

## Pattern Assignments

### `apps/web/app/page.tsx` (route, Home)

**Analog:** `apps/web/app/not-found.tsx` (page shape) + `apps/web/app/layout.tsx` (import conventions)

**Imports pattern** (`apps/web/app/not-found.tsx` lines 1-5):
```tsx
import { House } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

import { PremiumButton } from '@/shared/components/premium-button';
import { routes } from '@/shared/lib/routes';
```
Use `@phosphor-icons/react/ssr` for any icon that doesn't need client interactivity (server components); use `@phosphor-icons/react` (non-`/ssr`) only inside `'use client'` files if needed.

**Explicit return type pattern** (established convention, `apps/web/app/not-found.tsx` line 7):
```tsx
export default function Home(): React.JSX.Element {
```

**Section composition / Container usage** (`apps/web/shared/components/header.tsx` lines 44-46):
```tsx
<Container>
  <div className="flex h-16 items-center justify-between lg:h-20">
```
Home's sections should each wrap content in `<Container>` (not raw `container mx-auto px-4 lg:px-8` from the design source) — `Container` already encodes the 1280px max-width + gutter.

**Scroll-reveal wrapping** (`apps/web/shared/components/reveal.tsx` lines 21-35, full file): wrap each major Home section's content in `<Reveal>` for the fade+translateY-on-scroll spec (D-28). Example usage pattern:
```tsx
<Reveal>
  <h2 className="text-dt-h2 text-dt-navy">Знайомо?</h2>
</Reveal>
```

**Card grid pattern** (`apps/web/shared/components/premium-card.tsx`, full file, lines 5-18): use `PremiumCard` for the Problem section's 4-card grid and Features' 8-card grid instead of `@repo/ui`'s `Card`/`CardHeader`/`CardContent`/`CardTitle`. `PremiumCard` is a single flat div wrapper (no sub-components) — icon/title/description go directly inside as plain JSX, not a Card* component family.

**CTA button pattern** (`apps/web/shared/components/premium-button.tsx` lines 7-29, full variants block): hero/CTA-banner buttons use `PremiumButton` variant `coral` (primary, always paired with `text-dt-navy` — never override text color) or `outline`, sizes `default`/`lg`, `asChild` with `next/link`:
```tsx
<PremiumButton variant="coral" size="lg" asChild>
  <Link href={routes.demo}>Спробувати демо</Link>
</PremiumButton>
```

**SignatureMark for confirmation moments** (`apps/web/shared/components/signature-mark.tsx`, full file): use on the hero's floating "Новий запис від Олени Коваль" card (a confirmation-style UI moment), not decoratively elsewhere.

**Routes** (`apps/web/shared/lib/routes.ts`, full file): import `routes` and use `routes.demo`/`routes.contacts`/`routes.home`, never hardcoded path strings; `#features` anchor stays a raw string since it's not a route.

**Token palette:** replace all design-source `#1d6be4`/`text-gray-*`/`bg-blue-50` literals with `dt-*` tokens: `bg-dt-navy`, `text-dt-navy`, `text-dt-teal`, `bg-dt-warm-white`, `text-dt-graphite`, `text-dt-coral` (coral action-only). Do not use `text-foreground`/`bg-muted` (old Phase 1 pattern).

---

### `apps/web/modules/demo/*` — Bot tab + outer chrome (client component, event-driven)

**Analog:** `apps/web/shared/components/header.tsx` (client component with local `useState`, Motion-driven transitions)

**Client directive + state pattern** (`apps/web/shared/components/header.tsx` lines 1-9, 24-34):
```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';
...
const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
const prefersReducedMotion = useReducedMotion();
```
Demo's chat state (`chatMessages`, `selectedSection` in the design source) follows this same local-`useState` shape; the message-appearance animation (D-20: slide-in translateY 8px→0, 250ms, expo-out) should use `motion.div` + `EASE_DT_EXPO_OUT` from `apps/web/shared/lib/motion.ts` (lines 1, full file) exactly as Header's mobile menu does (lines 96-116), swapped for per-message enter animation instead of a menu-collapse.

**Reduced-motion branching** (`apps/web/shared/components/header.tsx` lines 97-116): every Motion animation must branch on `prefersReducedMotion` exactly like this — simplified/instant variant when true.

**Quick-reply/scenario buttons** (`apps/web/shared/components/premium-button.tsx`): scenario-select buttons use `PremiumButton` variant `outline`; the coral variant is reserved for the primary "Відкрити в Telegram" action per D-06 (action-accent, sparingly).

**SignatureMark on new bot messages** (`apps/web/shared/components/signature-mark.tsx`): render `<SignatureMark pulse />` next to a just-arrived bot message per D-34 ("new demo message" is an explicit example use case in CONTEXT.md).

---

### `apps/web/modules/demo/admin-tab.tsx` — admin-panel simulation (exception: stays on `@repo/ui`)

**Analog:** `packages/ui/src/components/shadcn-ui/tabs.tsx`, `badge.tsx`, `table.tsx`, `card.tsx`

**Imports pattern** (`packages/ui/index.tsx` barrel export, lines 1-39 — import from `@repo/ui`, not deep paths):
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge, Table, Card, CardHeader, CardTitle, CardContent } from '@repo/ui';
```

**Tabs pattern** (`packages/ui/src/components/shadcn-ui/tabs.tsx` lines 7-24, 76-87):
```tsx
function Tabs({ className, orientation = 'horizontal', ...props }: ...) {
  return <TabsPrimitive.Root data-slot="tabs" ... />;
}
```
Use `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` exactly as `@repo/ui` exports them (Radix-based, `data-slot` attributes) for the "🤖 Бот"/"⚙️ Адмін панель" tab switcher, matching the design source's structure verbatim.

**Badge variants** (`packages/ui/src/components/shadcn-ui/badge.tsx` lines 7-24): use `Badge` `default`/`secondary` variants for appointment status ("Підтверджено"/"Очікує"), matching the design source's `Badge default=/secondary=` usage. `lucide-react` icons stay acceptable here (matching `@repo/ui` usage elsewhere per CONTEXT.md), not Phosphor.

**Do not** import `PremiumButton`/`PremiumCard`/`dt-*` tokens inside this tab — it must visually read as the real `apps/admin-panel` product, per D-02/CONTEXT.md's explicit exception.

---

### `apps/web/modules/contacts/contact-form.tsx` (component, request-response, react-hook-form + zod)

**Analog:** No in-repo RHF+zod analog exists yet (new pattern for this codebase) — build using `PremiumButton` for the submit action and `PremiumCard` for the form container/success-state card, per the premium primitives above.

**Submit button pattern** (`apps/web/shared/components/premium-button.tsx` lines 7-29): submit button is `PremiumButton` variant `coral` size `lg`, `className="w-full"` (design source: `<Button type="submit" size="lg" className="w-full">`).

**Card container pattern** (`apps/web/shared/components/premium-card.tsx` lines 5-18): wrap the form and its title/description directly inside `<PremiumCard>` — no `CardHeader`/`CardTitle`/`CardContent` sub-components exist in the premium system; use plain `<h2>`/`<p>` with `dt-*` typography classes (`text-dt-h3`, `text-dt-graphite`) instead.

**Inputs:** no premium `Input`/`Textarea` primitive exists yet (confirmed — only `premium-button.tsx`, `premium-card.tsx`, `container.tsx` exist in `apps/web/shared/components/`). Per CONTEXT.md's Claude's-Discretion note, either:
  (a) build `apps/web/shared/components/premium-input.tsx`/`premium-textarea.tsx` following `premium-button.tsx`'s cva pattern (rounded `6px` per D-12's input-specific radius, not `rounded-dt-card`), styled with `dt-*` tokens (border `border-dt-navy/20`, focus ring `focus-visible:ring-dt-navy`), or
  (b) style plain `<input>`/`<textarea>` inline with `dt-*` token classes.
Either is acceptable; if (a), follow the exact `cn()` + `React.ComponentProps<'input'>` + `data-slot` shape used by `premium-button.tsx` lines 31-50.

**Toast pattern** (already wired, `apps/web/app/layout.tsx` line 3, 30):
```tsx
import { Toaster } from '@repo/ui';
...
<Toaster />
```
`sonner`'s `toast.success(...)` call itself is imported directly from `sonner` (as the design source does: `import { toast } from "sonner";`) — `Toaster` render target is already mounted in the root layout, no change needed there.

**Validation:** `react-hook-form` + `zod` — no existing schema file in the repo to pattern-match; use standard `zodResolver(schema)` + `useForm` wiring (React Hook Form's documented pattern), inline field error rendering via `formState.errors`.

---

### `apps/web/modules/contacts/faq-accordion.tsx` (component)

**Analog:** none in the premium system yet. `@repo/ui`'s `accordion.tsx` exists but CONTEXT.md's SUPERSEDED note excludes `@repo/ui` components from Home/Contacts. Build a minimal premium-token-styled accordion (native `<details>`/`<summary>` or a small local Radix `Accordion.Root` wrapper styled with `dt-*` tokens, following `premium-card.tsx`'s plain-div-plus-`cn()` structural style) — Claude's Discretion on exact implementation, not covered by an existing premium file.

---

## Shared Patterns

### `cn()` className helper
**Source:** `apps/web/shared/lib/cn.ts` (full file, 6 lines)
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
**Apply to:** every new premium-system component in `apps/web/modules/{home,demo,contacts}/` and any new `apps/web/shared/components/` primitive. Import as `import { cn } from '@/shared/lib/cn'` — never `@repo/ui`'s `lib/utils.ts` version.

### Motion / Reveal
**Source:** `apps/web/shared/lib/motion.ts` (full file, 23 lines), `apps/web/shared/components/reveal.tsx` (full file, 36 lines)
**Apply to:** all Home sections (scroll reveals per D-28), Demo's chat message entrance animation, any hover-lift on cards (`hoverLift` constant, translateY-only per D-30 — matches `premium-card.tsx`'s own hover already built in).

### PremiumButton
**Source:** `apps/web/shared/components/premium-button.tsx` (full file, 53 lines)
**Apply to:** all CTAs across Home/Demo/Contacts except the Demo admin-simulation tab (which uses `@repo/ui`'s `Button`). Variant rule: `coral` = single primary action per view, `text-dt-navy` always paired (never override), `outline`/`ghost` for secondary actions.

### Container
**Source:** `apps/web/shared/components/container.tsx` (full file, 16 lines)
**Apply to:** every page-level section wrapper on Home/Demo/Contacts, replacing the design source's `container mx-auto px-4 lg:px-8`.

### routes constant
**Source:** `apps/web/shared/lib/routes.ts` (full file, 11 lines)
**Apply to:** every internal `<Link>`/`asChild` navigation target across all three pages — never hardcode `/demo`, `/contacts`, etc.

### SignatureMark
**Source:** `apps/web/shared/components/signature-mark.tsx` (full file, 23 lines)
**Apply to:** Home hero's "new booking" floating card, Demo's new-bot-message moments, Contacts' form-success confirmation — interaction/confirmation points only, per D-34's "disciplined to interaction points, not decorative" rule.

### `React.JSX.Element` explicit return type
**Source:** `apps/web/app/not-found.tsx` line 7, `apps/web/app/layout.tsx` line 20
**Apply to:** all new page-level (`page.tsx`) components — established Phase-1 workaround convention, still active.

### `@phosphor-icons/react` (premium parts) vs `lucide-react` (admin-sim only)
**Source:** `apps/web/shared/components/header.tsx` line 3 (`@phosphor-icons/react/ssr`), design source's demo.tsx (`lucide-react`)
**Apply to:** Home/Contacts/Demo-bot-tab icons use Phosphor (`/ssr` import path for server components, non-`/ssr` inside `'use client'` files that need it); Demo's admin-simulation tab keeps `lucide-react`, matching its `@repo/ui` styling.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/web/modules/contacts/contact-form.tsx` (RHF+zod wiring specifically) | component | request-response | No existing `react-hook-form`/`zod` usage anywhere in the repo to pattern-match; first introduction of this validation stack (per PROJECT.md's Forms constraint) — use RHF/zod's own documented API conventions directly |
| `apps/web/shared/components/premium-input.tsx` / `premium-textarea.tsx` (if built) | component (primitive) | request-response | Not yet built in Phase 01.1; only `premium-button.tsx`/`premium-card.tsx`/`container.tsx` exist as primitives — extend the cva pattern from `premium-button.tsx` by analogy, not a direct copy |
| `apps/web/modules/contacts/faq-accordion.tsx` | component | request-response | No accordion primitive in the premium system; `@repo/ui`'s `accordion.tsx` is excluded from Home/Contacts scope per CONTEXT.md — build new |
| `apps/web/modules/demo/_data.ts` (mock data constants) | utility/config | transform | No existing "local mock data module" convention in `apps/web` yet — plain exported `const` arrays/objects is the natural, un-patterned choice |

## Metadata

**Analog search scope:** `apps/web/shared/components/`, `apps/web/shared/lib/`, `apps/web/app/`, `packages/ui/src/components/shadcn-ui/`, `packages/ui/index.tsx`
**Files scanned:** premium-button.tsx, premium-card.tsx, container.tsx, reveal.tsx, signature-mark.tsx, header.tsx, footer.tsx (referenced), logo.tsx (referenced), cn.ts, motion.ts, routes.ts, use-in-view.ts (referenced), not-found.tsx, layout.tsx, packages/ui/src/components/shadcn-ui/{tabs,badge}.tsx, packages/ui/index.tsx
**Pattern extraction date:** 2026-08-09
