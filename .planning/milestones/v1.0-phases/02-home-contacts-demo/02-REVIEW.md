---
phase: 02-home-contacts-demo
reviewed: 2026-08-09T10:43:20Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - apps/web/app/contacts/page.tsx
  - apps/web/app/demo/page.tsx
  - apps/web/app/page.tsx
  - apps/web/modules/contacts/contact-form.tsx
  - apps/web/modules/contacts/contact-info.tsx
  - apps/web/modules/contacts/faq-accordion.tsx
  - apps/web/modules/demo/_data.ts
  - apps/web/modules/demo/admin-tab.tsx
  - apps/web/modules/demo/bot-tab.tsx
  - apps/web/modules/demo/demo-tabs.tsx
  - apps/web/modules/home/cta-banner.tsx
  - apps/web/modules/home/features.tsx
  - apps/web/modules/home/hero.tsx
  - apps/web/modules/home/problem.tsx
  - apps/web/modules/home/solution.tsx
  - apps/web/modules/home/stagger-grid.tsx
  - apps/web/modules/home/testimonials.tsx
  - apps/web/next.config.js
  - apps/web/package.json
  - apps/web/shared/components/premium-accordion.tsx
  - apps/web/shared/components/premium-input.tsx
  - apps/web/shared/components/premium-textarea.tsx
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-08-09T10:43:20Z
**Depth:** standard
**Files Reviewed:** 21 (`pnpm-lock.yaml` reviewed for dependency consistency only, not counted as a source file)
**Status:** issues_found

## Summary

Reviewed the Home / Contacts / Demo implementation (premium bespoke design system, per Phase 01.1 pivot). No Critical/security findings. `pnpm --filter web check-types` and `eslint` were run against the file set — the only type errors present are pre-existing `csstype` mismatches inside `packages/ui` (already known/filtered per the phase's own commit history) and are unrelated to this phase's files. A clean `next build` was also run to confirm CSS import resolution.

Five Warnings were found, all real logic/robustness defects: an untracked nested `setTimeout` race in the demo bot chat that can interleave stale messages from a previous scenario, a non-deterministic timestamp computed during initial render that risks an SSR hydration mismatch, a contact form with no submit-guard or unmount cleanup, two CTA buttons that silently point at the identical route despite different labels/promises, and a CSS import (`tw-animate-css`) that isn't declared as a dependency of `apps/web` and only currently resolves because a sibling workspace package happens to depend on it. Four Info-level items (a11y, magic numbers, unnecessary directives, inconsistent typing) round out the report.

## Warnings

### WR-01: Untracked nested `setTimeout` lets a previous scenario's bot message leak into a freshly-reset chat

**File:** `apps/web/modules/demo/bot-tab.tsx:47-98` (specifically the `setTimeout` at line 75-81)

**Issue:** `runScenario` explicitly documents (lines 48-50) that it must "cancel any in-flight playback before starting a new one, so retriggering a scenario mid-playback never interleaves or duplicates messages." The cleanup only clears `intervalRef.current` (the `setInterval`). However, when the interval tick encounters a bot message, it schedules an **inner, untracked** `setTimeout(() => { setChatMessages(...); setIsTyping(false); }, 400)` (line 75). That inner timeout is a bare closure — its id is never stored, so it cannot be cancelled.

If the user clicks a different scenario button (or the component re-renders/unmounts) within that 400ms window, `runScenario` clears the interval and resets `chatMessages` to `seedGreetings()`, but the stale `setTimeout` from the *previous* scenario still fires afterwards and appends the old scenario's message onto the new, freshly-reset chat — directly contradicting the stated intent and producing a visibly wrong/interleaved conversation. The same untracked timeout also fires after unmount (component navigates away mid-scenario), calling `setChatMessages`/`setIsTyping` on an unmounted component.

**Fix:** Track the inner timeout id (e.g. `const messageTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)`), clear it alongside the interval both at the start of `runScenario` and in the unmount cleanup effect:
```tsx
const messageTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

const runScenario = React.useCallback((scenarioIndex: number) => {
  if (intervalRef.current) clearInterval(intervalRef.current);
  if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
  intervalRef.current = null;
  messageTimeoutRef.current = null;
  // ...
  if (nextMessage.type === 'bot') {
    setIsTyping(true);
    messageTimeoutRef.current = setTimeout(() => {
      setChatMessages((prev) => [...prev, { ...nextMessage, time: nowTime() }]);
      setIsTyping(false);
      messageTimeoutRef.current = null;
    }, 400);
  }
  // ...
}, []);

React.useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
  };
}, []);
```

### WR-02: Non-deterministic timestamp computed during initial render risks SSR hydration mismatch

**File:** `apps/web/modules/demo/bot-tab.tsx:26-40`

**Issue:** `BotTab` is a client component (`'use client'`), which is still rendered on the server for the initial HTML and then hydrated on the client. `useState<ChatMessage[]>(() => seedGreetings())` (line 38-40) runs its lazy initializer during **both** the server render and the client hydration render, and `seedGreetings()` calls `nowTime()` → `new Date().toLocaleTimeString(...)` (line 19-24). Because wall-clock time isn't frozen/seeded, the server-rendered timestamp and the client-hydrated timestamp can differ (most likely across a minute boundary), producing a React hydration text mismatch for the two seed message timestamps.

**Fix:** Don't compute wall-clock time during the initial (potentially server-rendered) render. Seed the greetings without a `time` value and populate it client-side only, e.g. via `useEffect` after mount, or render the timestamp with `suppressHydrationWarning` if the discrepancy is considered cosmetic:
```tsx
function seedGreetings(): ChatMessage[] {
  return [
    { type: 'bot', text: 'Вітаю! Я DentaBot 🦷', time: '' },
    { type: 'bot', text: 'Допоможу записатись на прийом до стоматолога', time: '' },
  ];
}
// then in a useEffect on mount: setChatMessages((prev) => prev.map((m) => ({ ...m, time: nowTime() })));
```

### WR-03: Contact form submit has no in-flight guard and no unmount cleanup

**File:** `apps/web/modules/contacts/contact-form.tsx:39-44`

**Issue:** `onSubmit` schedules a bare `setTimeout(..., 500)` with no `isSubmitting` state and no stored timeout id. Rapidly clicking "Надіслати заявку" multiple times before the 500ms mock delay resolves queues multiple timeouts, each independently calling `setIsSubmitted(true)` and `toast.success(...)` (stacking duplicate success toasts). If the user navigates away within that 500ms window, the timeout still fires and calls `setIsSubmitted`/`toast.success` after the component has unmounted.

**Fix:** Disable the submit button while submitting and clean up the pending timeout on unmount:
```tsx
const [isSubmitting, setIsSubmitting] = React.useState(false);
const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

React.useEffect(() => () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
}, []);

const onSubmit = form.handleSubmit(() => {
  setIsSubmitting(true);
  timeoutRef.current = setTimeout(() => {
    setIsSubmitted(true);
    setIsSubmitting(false);
    toast.success('Заявку успішно надіслано!');
  }, 500);
});
// <PremiumButton type="submit" disabled={isSubmitting} ...>
```

### WR-04: Both hero CTA buttons link to the identical route despite different labels

**File:** `apps/web/modules/home/cta-banner.tsx:20-32`

**Issue:** The two buttons — "Відкрити демо бот" (Open demo bot) and "Переглянути адмін панель" (View admin panel) — both `<Link href={routes.demo}>` to the exact same `/demo` route (lines 22 and 30). `DemoTabs` (`apps/web/modules/demo/demo-tabs.tsx:14`) defaults `activeTab` to `'bot'` with no way to deep-link into the admin tab (no query param / hash handling). So clicking "Переглянути адмін панель" does not fulfill its label — the user lands on the bot tab, identical to clicking the first button.

**Fix:** Either give `DemoTabs` a way to open on a specific tab (e.g. `?tab=admin` read via `useSearchParams`) and link accordingly, or make both CTAs consistent (single CTA, or clearly differentiate copy from destination):
```tsx
<Link href={`${routes.demo}?tab=admin`}>Переглянути адмін панель</Link>
```

### WR-05: `tw-animate-css` is used but not declared as a dependency of `apps/web`

**File:** `apps/web/package.json:13-31`

**Issue:** `apps/web/app/globals.css` imports `tw-animate-css` directly (`@import 'tw-animate-css';`), which supplies the `animate-accordion-up`/`animate-accordion-down` keyframes consumed by `premium-accordion.tsx`. `apps/web/package.json` does not list `tw-animate-css` in `dependencies` or `devDependencies` — it is only declared in `packages/ui/package.json`. The import currently resolves only because Next.js/Turbopack's pnpm-aware module resolver reaches into the sibling workspace package's node_modules (confirmed via a clean `next build`), not because `apps/web` has its own reference to the package. This is a phantom/undeclared dependency: if `packages/ui` ever drops, renames, or independently version-bumps `tw-animate-css`, `apps/web`'s CSS build can silently break with no direct signal pointing at `package.json`.

**Fix:** Declare `tw-animate-css` explicitly in `apps/web/package.json` (matching the version pinned in `packages/ui/package.json`, currently `^1.4.0`):
```json
"devDependencies": {
  "tw-animate-css": "^1.4.0"
}
```

## Info

### IN-01: `StaggerGrid`/`StaggerItem` missing explicit return type annotations

**File:** `apps/web/modules/home/stagger-grid.tsx:9-33`

**Issue:** Every other reviewed component annotates its return type as `React.JSX.Element` (e.g. `Hero`, `Features`, `ContactForm`), but `StaggerGrid` and `StaggerItem` omit it, relying on inference.

**Fix:** Add `: React.JSX.Element` to both function signatures for consistency with the rest of the codebase.

### IN-02: Contact form errors aren't wired to inputs via ARIA attributes

**File:** `apps/web/modules/contacts/contact-form.tsx:64-104`

**Issue:** Validation error text is rendered as a sibling `<p>` under each `PremiumInput`, but the input itself never receives `aria-invalid` or `aria-describedby` pointing at the error message id, so screen readers won't reliably announce the association between an invalid field and its error text.

**Fix:**
```tsx
<PremiumInput
  id="name"
  aria-invalid={!!form.formState.errors.name}
  aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
  {...form.register('name')}
/>
{form.formState.errors.name?.message ? (
  <p id="name-error" className="text-sm text-dt-coral">{form.formState.errors.name.message}</p>
) : null}
```

### IN-03: Magic number `50` used for bar chart height scaling

**File:** `apps/web/modules/demo/admin-tab.tsx:97-103`

**Issue:** `height: mounted ? \`${(entry.value / 50) * 100}%\` : '0%'` hardcodes `50` as the assumed maximum of `barChartData` values (defined separately in `_data.ts`). If the mock data changes and a value exceeds 50, bars will silently overflow the 100% cap with no warning.

**Fix:** Derive the max from the data itself, e.g. `const maxValue = Math.max(...barChartData.map((d) => d.value));` and use `(entry.value / maxValue) * 100`.

### IN-04: Unnecessary `'use client'` directive on components with no client-only behavior

**File:** `apps/web/modules/home/problem.tsx:1`, `apps/web/modules/home/testimonials.tsx:1`

**Issue:** `Problem` and `Testimonials` are marked `'use client'` but contain no hooks, event handlers, or browser-only APIs themselves — they only render already-client `Reveal`/`StaggerGrid`/`StaggerItem` children. The directive forces an unnecessary client boundary at this level (compare with `Features`/`Solution`, which render the same client children without the directive).

**Fix:** Remove the `'use client'` directive from `problem.tsx` and `testimonials.tsx`; the nested client components already establish their own boundaries.

---

_Reviewed: 2026-08-09T10:43:20Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
