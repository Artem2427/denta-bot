# Phase 2: Home, Contacts & Demo - Pattern Map

**Mapped:** 2026-08-08
**Files analyzed:** 8 (3 route pages, 1 layout-scoped client component set, 2 data/const files, 1 config, 1 dependency addition)
**Analogs found:** 8 / 8 (all resolve to Phase 1 files; no cross-app analogs needed)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|---------------|
| `apps/web/app/page.tsx` (rewrite) | route/component | request-response (static render) | `apps/web/app/not-found.tsx` (existing route composing `@repo/ui` + `routes`) | role-match |
| `apps/web/app/demo/page.tsx` | route/component (client, stateful) | event-driven (chat playback, tab/section state) | `apps/web/components/header.tsx` (existing `'use client'` + `useState` + conditional render pattern) | role-match |
| `apps/web/app/demo/_data.ts` | data/const module | transform (static mock data) | `apps/web/lib/routes.ts` (existing `as const` data module) | exact |
| `apps/web/app/contacts/page.tsx` | route/component (client, form) | CRUD-like (form submit, mocked) / request-response | `apps/web/components/header.tsx` (client component with local state) + new RHF/zod pattern (no existing analog) | partial |
| `apps/web/components/section-heading.tsx` (optional shared helper, discretion) | component | transform (presentational) | `apps/web/components/logo.tsx` (small presentational component) | role-match |
| `apps/web/next.config.js` (edit: add `images.remotePatterns`) | config | n/a | itself (existing file, additive edit) | exact |
| `apps/web/package.json` (edit: add `react-hook-form`, `zod`, `@hookform/resolvers`) | config | n/a | itself (existing dependency block) | exact |
| `apps/web/app/globals.css` / brand tokens | config (no changes expected) | n/a | `packages/ui/src/components/shadcn-ui/button.tsx` (brand token source) | reference only |

## Pattern Assignments

### `apps/web/app/page.tsx` (route, request-response)

**Analog:** `apps/web/app/not-found.tsx` (full file already read — 25 lines) and `apps/web/components/header.tsx` for nav/Button/Link conventions.

**Imports pattern** (`apps/web/app/not-found.tsx` lines 1-4):
```tsx
import { routes } from '@/lib/routes';
import { Button } from '@repo/ui';
import { Home } from 'lucide-react';
import Link from 'next/link';
```
Apply the same import grouping to `page.tsx`: `@/lib/routes` for internal links, `@repo/ui` named imports (`Button`, `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`, `Badge`), `lucide-react` icons, `next/link`, `next/image` (new — for the two Unsplash hotlinks per D-08).

**Route-file shape** (`apps/web/app/not-found.tsx` lines 6-24): default export function, explicit `React.JSX.Element` return type (established Phase 1 convention — no import needed, `React` is global JSX namespace via `tsconfig`), no `'use client'` (Home page is fully static/server — no interactivity beyond the `#features` anchor, which needs no client JS).

**Link-to-internal-route pattern** (`apps/web/app/not-found.tsx` lines 15-20):
```tsx
<Button size="lg" asChild>
  <Link href={routes.home}>
    <Home className="mr-2 h-5 w-5" />
    На головну
  </Link>
</Button>
```
Use `asChild` + `<Link href={routes.demo}>` for all Home page internal CTAs (never `<a href="/demo">` or react-router `<Link to>` from the archive). For the `#features` same-page anchor, per CONTEXT.md discretion, use a plain `<Link href="#features">` or `<a href="#features">` since it's a same-page hash, not a `routes` entry.

**Brand-token normalization** (already applied in `apps/web/components/header.tsx` lines 64-69 and `apps/web/app/not-found.tsx` line 10):
```tsx
<Button variant="brand" size="default" asChild>
  <Link href={routes.contacts}>Спробувати безкоштовно</Link>
</Button>
```
and
```tsx
<div className="text-8xl font-bold text-brand">404</div>
```
Apply this exact rule to every `#1d6be4` / `bg-[#1d6be4]` / `text-[#1d6be4]` occurrence in the Home page source: stat numbers → `text-brand`, hero button → `variant="brand"`/`variant="brand-outline"`, CTA banner section → `bg-brand`, CTA banner buttons → `variant="secondary"` stays (already semantic on a brand bg) but the outline one becomes `variant="brand-outline"`-style override (`border-white text-white hover:bg-white hover:text-brand` — replace only the `#1d6be4` in `hover:text-[#1d6be4]` with `hover:text-brand`, the white/border-white styling is intentionally literal for on-brand-bg contrast and has no token).

**Gray-token normalization** (Phase 1 established rule, D-03, no local Phase 2 file demonstrates it yet but rule is explicit in CONTEXT.md lines 78-79): replace `text-gray-900 dark:text-white` → `text-foreground`, `text-gray-600 dark:text-gray-400` → `text-muted-foreground`, `bg-white dark:bg-gray-950`/`bg-gray-50 dark:bg-gray-900` → `bg-background`/`bg-muted` as appropriate per section.

**Card grid pattern** (Problem section, 4-card grid) — use `packages/ui/src/components/shadcn-ui/card.tsx` composition exactly as documented in that file (lines 5-92): `Card > CardHeader (icon + CardTitle) + CardContent > CardDescription`. No modification needed to the `@repo/ui` Card component itself.

**Image pattern** (D-08, new — no exact analog in repo): use `next/image` directly (drop `ImageWithFallback` per CONTEXT.md discretion, simplest option):
```tsx
import Image from 'next/image';
// ...
<Image
  src="https://images.unsplash.com/photo-..."
  alt="DentaBot Dashboard"
  width={1080}
  height={720}
  className="h-auto w-full"
/>
```
Requires `apps/web/next.config.js` edit — see Shared Patterns below.

---

### `apps/web/app/demo/page.tsx` (route, event-driven, client)

**Analog:** `apps/web/components/header.tsx` (client component with `useState`/`useEffect`, full file read — 132 lines) for the `'use client'` + local-state conventions; `packages/ui/src/components/shadcn-ui/tabs.tsx` (full file, 90 lines) for `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` API.

**Client directive + state pattern** (`apps/web/components/header.tsx` lines 1, 21-24):
```tsx
'use client';

import { routes } from '@/lib/routes';
import { Button } from '@repo/ui';
// ...
import * as React from 'react';

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
```
Apply same shape to `demo/page.tsx`: `'use client'` at top (required — chat state, tab-driven admin section, `setInterval` playback), `React.useState` for `chatMessages`, `selectedSection`, keep `React.JSX.Element` return type on the default export.

**Effect cleanup pattern** (`apps/web/components/header.tsx` lines 26-30):
```tsx
React.useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 20);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```
Reuse this cleanup-return idiom for the `runScenario` interval fix (CONTEXT.md discretion item): store the interval id in a `React.useRef<NodeJS.Timeout | null>`, `clearInterval` any existing one before starting a new one, and clear on unmount via `useEffect` cleanup, mirroring this exact `addEventListener`/`removeEventListener` cleanup shape but for `setInterval`/`clearInterval`.

**Tabs composition** (`packages/ui/src/components/shadcn-ui/tabs.tsx` lines 7-89 — full API, no changes needed to the component): use exactly as documented:
```tsx
<Tabs defaultValue="bot" className="w-full">
  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 mb-8">
    <TabsTrigger value="bot" className="text-base">🤖 Бот — вид пацієнта</TabsTrigger>
    <TabsTrigger value="admin" className="text-base">⚙️ Адмін панель</TabsTrigger>
  </TabsList>
  <TabsContent value="bot">...</TabsContent>
  <TabsContent value="admin">...</TabsContent>
</Tabs>
```
Port the archive's `Tabs` usage verbatim — API is identical between the archive's local shadcn copy and `@repo/ui`'s `tabs.tsx`.

**Data extraction pattern** (`apps/web/lib/routes.ts`, full file, exact analog):
```ts
export const routes = {
  home: '/',
  prices: '/prices',
  // ...
} as const;
```
Mirror this `as const` typed-object-literal shape for `apps/web/app/demo/_data.ts` (mock `appointments`, `doctors`, bar-chart data, dashboard stats) — export named `const` arrays/objects with explicit union literal types (e.g. `status: 'confirmed' | 'pending'`) rather than loose `string`.

**Internal link inside demo (admin banner CTA to `/contacts`)** — same `asChild`+`Link`+`routes.contacts` pattern as `header.tsx` lines 67-69.

---

### `apps/web/app/contacts/page.tsx` (route, CRUD-like form, client)

**Analog:** `apps/web/components/header.tsx` for `'use client'`/state shape (partial — no existing form in repo); `packages/ui/src/components/shadcn-ui/card.tsx` for the form-in-card wrapper.

**No existing RHF+zod analog in this codebase** — `react-hook-form` and `zod` are not yet dependencies anywhere in the repo (confirmed via repo-wide grep, zero hits outside lockfile). This is a **new pattern** for the codebase; RESEARCH.md/community conventions apply, not a local analog. Build from scratch following the standard RHF + zod + shadcn pattern:

```tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Label } from '@repo/ui';
import { toast } from 'sonner';

const contactSchema = z.object({
  name: z.string().min(2, 'Ім\'я має містити щонайменше 2 символи'),
  clinic: z.string().optional(),
  contact: z
    .string()
    .min(1, 'Вкажіть телефон або email')
    .refine(
      (val) => /^\+?[0-9\s()-]{7,}$/.test(val) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Введіть коректний телефон або email',
    ),
  message: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactsPage(): React.JSX.Element {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', clinic: '', contact: '', message: '' },
  });

  const onSubmit = (values: ContactFormValues) => {
    setTimeout(() => {
      setIsSubmitted(true);
      toast.success('Заявку успішно надіслано!');
    }, 500);
  };
  // ...
}
```

**Toast pattern** (already wired, `apps/web/app/layout.tsx` line 37 — `<Toaster />` from `@repo/ui`, confirmed present): call `toast.success(...)` directly from `sonner`, no extra setup needed — matches archive's `import { toast } from "sonner"` exactly, just swap `useState`-driven submit for `form.handleSubmit(onSubmit)`.

**Field error display** — react-hook-form's `formState.errors.<field>?.message`, rendered under each `Input`/`Textarea`, styled with existing `text-destructive` token (check `packages/ui/src/components/shadcn-ui/button.tsx` line 14 for `text-destructive`/`bg-destructive` token usage precedent — reuse `text-destructive text-sm` for inline field errors, consistent with the design system's only existing error-state color).

**Accordion (FAQ)** — use `packages/ui/src/components/shadcn-ui/accordion.tsx` (not read in full this pass, but present and exported — same shadcn API as archive's `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`; archive usage at contacts.tsx is a direct verbatim port target).

---

## Shared Patterns

### Brand-blue Button/token normalization
**Source:** `packages/ui/src/components/shadcn-ui/button.tsx` lines 22-25 (`brand` / `brand-outline` variants), applied in `apps/web/components/header.tsx` lines 64-69, `apps/web/app/not-found.tsx` line 10
**Apply to:** every `#1d6be4` / `bg-[#1d6be4]` / `text-[#1d6be4]` in Home, Demo, and Contacts archive source — replace with `variant="brand"`/`variant="brand-outline"` on `Button`, `bg-brand`/`text-brand` elsewhere (icon badges, stat numbers, chart bars, chat bubbles, admin banner).
```tsx
<Button variant="brand" size="default" asChild>
  <Link href={routes.contacts}>Спробувати безкоштовно</Link>
</Button>
```

### Semantic gray-token normalization (D-03, Phase 1 rule)
**Source:** established convention, referenced in `.planning/phases/02-home-contacts-demo/02-CONTEXT.md` lines 78-79; visible in `apps/web/app/not-found.tsx` (`text-muted-foreground` line 12-13) and `apps/web/components/footer.tsx` (`text-muted-foreground`, `bg-muted`, `border-border` throughout)
**Apply to:** all three new pages — `text-gray-900 dark:text-white` → `text-foreground`, `text-gray-600 dark:text-gray-400` → `text-muted-foreground`, `bg-gray-50 dark:bg-gray-900` → `bg-muted`, `bg-white dark:bg-gray-950`/`dark:bg-gray-800` → `bg-background`/`bg-card`, `border dark:border-gray-700` → `border-border`.

### Internal navigation via `routes` object
**Source:** `apps/web/lib/routes.ts` (full file), consumed in `apps/web/components/header.tsx` lines 3, 14-18, 65, 68 and `apps/web/app/not-found.tsx` lines 1, 16
**Apply to:** all internal links across Home/Demo/Contacts — never hardcode `/demo`, `/contacts`, `#features`-adjacent internal paths as string literals; import `routes` from `@/lib/routes` and use `<Link href={routes.demo}>` etc. `#features` is a same-page anchor and is the one exception (not a `routes` entry).

### `'use client'` + React.useState/useEffect for interactive components
**Source:** `apps/web/components/header.tsx` lines 1, 21-30
**Apply to:** `demo/page.tsx` (chat + admin section state) and `contacts/page.tsx` (form state via RHF, `isSubmitted` toggle) — both need `'use client'` at file top since Home is the only page that can remain a server component.

### Explicit `React.JSX.Element` return type
**Source:** `apps/web/app/not-found.tsx` line 6 (`export default function NotFound(): React.JSX.Element`), `apps/web/app/page.tsx` line 3 (current starter, same pattern)
**Apply to:** all three new/rewritten route `page.tsx` default exports (Phase 1 `tsc` duplicate-`@types/react` workaround, still required).

### Card composition for grids/panels
**Source:** `packages/ui/src/components/shadcn-ui/card.tsx` (full file, 92 lines — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`)
**Apply to:** Home's Problem/Testimonials grids, Demo's dashboard stat cards/doctor cards, Contacts' form card and contact-method/benefit cards — no changes to the component itself, compose as documented.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/web/app/contacts/page.tsx` (RHF + zod form logic specifically) | component | CRUD-like (mocked submit) | No `react-hook-form`/`zod` usage exists anywhere in the repo yet (confirmed via grep) — this introduces the pattern fresh per PROJECT.md constraint; follow standard `zodResolver` + `useForm` community convention, not a local analog |
| `apps/web/app/demo/page.tsx` (`setInterval` chat-playback logic) | component (event-driven) | event-driven | No existing timer/interval-driven UI exists in the codebase; nearest analog (`header.tsx`'s scroll-listener `useEffect`) only covers the cleanup idiom, not the interval-driven state-append logic itself — build fresh per archive source, applying the cleanup idiom above |

## Metadata

**Analog search scope:** `apps/web/app/`, `apps/web/components/`, `apps/web/lib/`, `packages/ui/src/components/shadcn-ui/`
**Files scanned:** `apps/web/app/page.tsx`, `apps/web/app/layout.tsx`, `apps/web/app/not-found.tsx`, `apps/web/components/header.tsx`, `apps/web/components/footer.tsx`, `apps/web/components/theme-toggle.tsx`, `apps/web/lib/routes.ts`, `packages/ui/src/components/shadcn-ui/{button,card,badge,tabs}.tsx`, `apps/web/next.config.js`, `apps/web/package.json`
**Pattern extraction date:** 2026-08-08
