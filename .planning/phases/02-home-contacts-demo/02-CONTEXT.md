# Phase 2: Home, Contacts & Demo - Context

**Gathered:** 2026-08-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the Home landing page (`/`), the Demo page (`/demo`, scripted Telegram-bot + admin-panel simulation), and the Contacts page (`/contacts`, lead form + FAQ). All content, copy, and layout come from the design archive — this phase ports it faithfully into `@repo/ui` + Next.js App Router, replacing the current default `apps/web/app/page.tsx` starter content. Prices and Blog are out of scope (Phase 3).

Requirements covered: HOME-01, DEMO-01, DEMO-02, CONT-01, CONT-02, CONT-03 (see `.planning/REQUIREMENTS.md`).

</domain>

<decisions>
## Implementation Decisions

### Images

- **D-08:** Keep the Home page's two Unsplash-hotlinked images (hero dashboard mockup, one testimonial photo) as external hotlinks, ported via `next/image`. Requires adding `images.unsplash.com` to `apps/web/next.config.js`'s `images.remotePatterns`. Matches the design exactly — no local asset bundling needed this phase.
- The other two testimonials in the design use emoji-in-circle placeholders (👨‍⚕️/👩‍⚕️), not photos — port those exactly as-is, don't source real photos for them.

### Contacts Form Validation

- **D-09:** The archive's Contacts form has zero real validation (raw `useState` + HTML `required` only). Per CONT-01, rebuild with `react-hook-form` + `zod`, format-validated:
  - `name`: required, min 2 characters
  - `contact` (single combined "Телефон або email" field — do NOT split into two fields, the design uses one field with a placeholder showing both formats): required, zod validator that accepts EITHER a phone-number pattern OR an email pattern (reject anything matching neither), with a specific inline error message when the input matches neither
  - `message`: optional, no format constraint
  - `clinic`: optional, no format constraint (matches archive — no `required` on this field)
- Inline field errors shown on invalid input (react-hook-form's error state), per CONT-01's exact wording.
- Submission stays mocked: keep the archive's `setTimeout` simulated delay + `sonner`'s `toast.success("Заявку успішно надіслано!")` (Toaster already wired into `apps/web/app/layout.tsx` from Phase 1) — no real backend call.
- On success, swap the form for the archive's inline "Дякуємо!" confirmation card (not just a toast) — both behaviors happen together, exactly as archived. A "Надіслати ще одну заявку" (outline) button resets the form back to the empty state.

### Claude's Discretion

- Exact `zod` regex patterns for the phone/email format validator — pick something reasonable (e.g. loose international phone pattern + standard email regex), no specific format was mandated beyond "reject garbage, accept phone or email."
- How to port `ImageWithFallback` (a Figma-export-specific `<img>` wrapper with an SVG error fallback, `src/app/components/figma/ImageWithFallback.tsx` in the archive) — since images now go through `next/image`, either replicate the onError fallback pattern with `next/image`'s `onError` handler or drop the fallback wrapper entirely (next/image's own broken-image behavior is acceptable). Not user-facing enough to require a decision.
- The "Дізнатись більше" hero button scrolls to `#features` on the same page (`<Link to="#features">` in the archive, react-router same-page anchor). Implement as a same-page anchor scroll in Next.js (`<a href="#features">` or `next/link` with a hash) — technical detail, not a content decision.
- Whether the demo chat's `setInterval`-based typing playback (800ms per message) needs a cleanup/cancel guard when a new scenario is triggered mid-playback (the archive's own code doesn't clear the previous interval before starting a new one — arguably a latent bug in the source). Fine to fix defensively during port; not a scope change.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level specs
- `.planning/PROJECT.md` — Core value, constraints (tech stack, forms, images), Key Decisions table (includes Phase 1's brand-blue Button variants: `brand`/`brand-outline`)
- `.planning/REQUIREMENTS.md` — HOME-01, DEMO-01/02, CONT-01/02/03 full requirement text and traceability
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, dependencies (depends on Phase 1)
- `.planning/phases/01-theme-site-shell/01-CONTEXT.md` — Phase 1 decisions this phase builds on (theming, layout shell, brand token)

### Codebase maps
- `.planning/codebase/CONVENTIONS.md` — naming, formatting, import order
- `.planning/codebase/STRUCTURE.md` — directory layout
- `.planning/codebase/STACK.md` — exact dependency versions

### Design archive (⚠ ephemeral scratch path — re-extract if missing)
- Design archive root (this session): `/private/tmp/claude-501/-Users-artemdanko-Developer-denta-bot/e3fefd73-3b26-4919-9147-6b7d2c7c868e/scratchpad/design-archive/` — re-extracted fresh this session from `/Users/artemdanko/Downloads/Дизайн з темами.zip` (the persistent source zip — re-unzip from there if this scratch path is gone by execution time, per the repeated warning from Phase 1).
- **The full relevant source for all three pages has been transcribed into `<code_context>` below** — treat that as the canonical source for Phase 2 planning/execution, not the scratch path.
- [No ADRs or other external specs exist for this milestone.]

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (already in `@repo/ui`, confirmed present — no THEME-02 gaps this phase)
- `Button` (incl. Phase 1's new `brand`/`brand-outline` variants for any brand-accented CTA)
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Badge`, `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`
- `Input`, `Textarea`, `Label`
- `Toaster` (sonner) — already wired into `apps/web/app/layout.tsx` in Phase 1, `'use client'` bug already fixed
- `routes` const object (`apps/web/lib/routes.ts`) — use `routes.home`/`routes.demo`/`routes.contacts` etc. for all internal links, do NOT hardcode path strings (established Phase 1 pattern)

### Established Patterns (from Phase 1)
- `apps/web/app/` holds only route files (`page.tsx`, `layout.tsx`, `not-found.tsx`); shared components go in `apps/web/components/`, non-route utilities in `apps/web/lib/`
- Semantic Tailwind tokens over literal grays: normalize the archive's `text-gray-900 dark:text-white`, `bg-gray-50 dark:bg-gray-900`, `text-gray-600 dark:text-gray-400` etc. to `text-foreground`, `bg-muted`/`bg-card`, `text-muted-foreground` (same D-03 rule from Phase 1, applies repo-wide)
- Brand blue: the archive hardcodes `#1d6be4` / `bg-[#1d6be4]` / `text-[#1d6be4]` everywhere in these three pages — normalize ALL of these to `bg-brand`/`text-brand` (Phase 1's token), never raw hex
- `React.JSX.Element` explicit return types on components (Phase 1 workaround for a pre-existing duplicate-`@types/react` `tsc` error) — keep applying this pattern to new page components

### Integration Points
- `apps/web/app/page.tsx` — currently the default create-turbo starter; this phase replaces its content entirely with the Home page
- New routes: `apps/web/app/demo/page.tsx`, `apps/web/app/contacts/page.tsx`
- Header's "Демо" and "Спробувати безкоштовно" CTAs (Phase 1) already link to `/demo` and `/contacts` via `routes.demo`/`routes.contacts` — no header changes needed this phase

### Design source — Home page (`src/app/pages/home.tsx`, react-router → Next.js App Router)
Full page, 6 sections in order: Hero (badge + h1 + subhead + 2 CTAs + 3 stats + hero image w/ 2 floating cards) → Problem (4-card grid, "Знайомо?") → Solution (2-column "Для пацієнта"/"Для клініки" numbered steps + CTA) → Features (8-card grid, `#features` anchor target) → CTA Banner (blue bg, 2 buttons both → `/demo`) → Testimonials (3-card grid, 1 real photo + 2 emoji avatars, 5-star ratings).

```tsx
import { Link } from "react-router";
import { ArrowRight, Check, BarChart, Bell, Calendar, MessageSquare, Users, Settings, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1d6be4] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1d6be4]"></span>
                </span>
                Нова платформа для стоматологій
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Автоматичний запис пацієнтів через Telegram. Без дзвінків.
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400">
                Підключіть бота за 1 день — пацієнти записуються самі, отримують нагадування і не забувають про прийом.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/demo">Спробувати демо <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="#features">Дізнатись більше</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-1">
                  <div className="text-2xl lg:text-3xl font-bold text-[#1d6be4]">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">клінік</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl lg:text-3xl font-bold text-[#1d6be4]">15 000+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">записів/місяць</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl lg:text-3xl font-bold text-[#1d6be4]">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">задоволених</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1766171359875-73155eff7f66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkYXNoYm9hcmQlMjBtb2NrdXAlMjBzY3JlZW58ZW58MXx8fHwxNzcyOTA1MjU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="DentaBot Dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-bounce">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Новий запис від Олени Коваль</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#1d6be4]" />
                  <span className="text-sm font-medium">Нагадування відправлено 24 пацієнтам</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">Знайомо?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Як зараз виглядає запис у більшості клінік</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 4 cards: 📞 "Адміністратор на телефоні" / 😔 "Пацієнти забувають" / 💬 "Хаос в месенджерах" / 📊 "Немає статистики" */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4"><span className="text-2xl">📞</span></div>
                <CardTitle>Адміністратор на телефоні</CardTitle>
              </CardHeader>
              <CardContent><CardDescription>Весь день відповідає на дзвінки, записує в блокнот або Excel</CardDescription></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4"><span className="text-2xl">😔</span></div>
                <CardTitle>Пацієнти забувають</CardTitle>
              </CardHeader>
              <CardContent><CardDescription>Немає автоматичних нагадувань — люди просто не приходять</CardDescription></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4"><span className="text-2xl">💬</span></div>
                <CardTitle>Хаос в месенджерах</CardTitle>
              </CardHeader>
              <CardContent><CardDescription>Записи через WhatsApp, Viber, Instagram — все розкидано</CardDescription></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4"><span className="text-2xl">📊</span></div>
                <CardTitle>Немає статистики</CardTitle>
              </CardHeader>
              <CardContent><CardDescription>Неможливо проаналізувати завантаженість та оптимізувати роботу</CardDescription></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section — "Для пацієнта" (3 numbered steps: Відкриває Telegram бота / Обирає час і лікаря / Отримує підтвердження)
          and "Для клініки" (3 numbered steps: Запис з'являється в системі / Бот надсилає нагадування / Аналітика та звіти),
          each step number is a filled bg-[#1d6be4] circle. CTA below: outline button "Спробувати як це працює" → /demo */}
      {/* See full text in prose above — numbered-circle-step pattern, port verbatim */}

      {/* Features Section id="features" — 8-card grid: MessageSquare "Telegram бот" / Calendar "Розклад лікарів" /
          Bell "Автонагадування" / BarChart "Аналітика" / Star "Відгуки" / Settings "Адмін панель" /
          Users "Управління персоналом" / Check "Скасування запису" — each icon text-[#1d6be4] h-10 w-10 */}

      {/* CTA Banner — bg-[#1d6be4] text-white, h2 "Спробуйте як це працює прямо зараз",
          p "Живий демо бот. Без реєстрації. Займає 2 хвилини.",
          2 buttons: variant="secondary" "Відкрити демо бот" → /demo,
          variant="outline" className="border-white text-white hover:bg-white hover:text-[#1d6be4]" "Переглянути адмін панель" → /demo */}

      {/* Testimonials Section — 3-card grid, 5-star ratings (fill-yellow-400):
          1) Олена Ковальчук / Клініка Посмішка — real Unsplash photo, quote about 70% fewer missed appointments
          2) Андрій Мельник / Denta Plus — emoji avatar 👨‍⚕️, quote about admin freed up
          3) Марія Петренко / Стоматологія Люкс — emoji avatar 👩‍⚕️, quote about easy setup */}
    </div>
  );
}
```

### Design source — Demo page (`src/app/pages/demo.tsx`)
Two tabs (`Tabs` from `@repo/ui`): "🤖 Бот — вид пацієнта" and "⚙️ Адмін панель". Client component (`useState` for chat messages + selected admin section).

```tsx
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar, Clock, User, CheckCircle, X, Phone } from "lucide-react";
import { Link } from "react-router";

export default function Demo() {
  const [chatMessages, setChatMessages] = useState<Array<{ type: "bot" | "user"; text: string }>>([
    { type: "bot", text: "Вітаю! Я DentaBot 🦷" },
    { type: "bot", text: "Допоможу записатись на прийом до стоматолога" },
  ]);
  const [selectedSection, setSelectedSection] = useState("dashboard");

  const scenarios = [
    { label: "Записатись на прийом", messages: [
      { type: "user" as const, text: "Хочу записатись" },
      { type: "bot" as const, text: "Чудово! Оберіть зручну дату:" },
      { type: "bot" as const, text: "📅 8 березня (Сб)\n📅 10 березня (Пн)\n📅 11 березня (Вт)" },
      { type: "user" as const, text: "10 березня" },
      { type: "bot" as const, text: "Оберіть час:\n⏰ 10:00\n⏰ 14:00\n⏰ 16:30" },
      { type: "user" as const, text: "14:00" },
      { type: "bot" as const, text: "Оберіть лікаря:\n👨‍⚕️ Доктор Іваненко Петро\n👩‍⚕️ Доктор Коваль Олена" },
      { type: "user" as const, text: "Доктор Коваль Олена" },
      { type: "bot" as const, text: "✅ Готово! Ви записані на 10 березня о 14:00 до лікаря Коваль Олена.\n\nНадішлю нагадування за день до прийому." },
    ]},
    { label: "Перенести запис", messages: [
      { type: "user" as const, text: "Хочу перенести запис" },
      { type: "bot" as const, text: "Зараз у вас запис на 10 березня о 14:00" },
      { type: "bot" as const, text: "Оберіть нову дату:\n📅 11 березня (Вт)\n📅 12 березня (Ср)\n📅 13 березня (Чт)" },
      { type: "user" as const, text: "11 березня" },
      { type: "bot" as const, text: "Оберіть час:\n⏰ 11:00\n⏰ 15:00\n⏰ 17:00" },
      { type: "user" as const, text: "15:00" },
      { type: "bot" as const, text: "✅ Запис перенесено! Нова дата: 11 березня о 15:00" },
    ]},
    { label: "Скасувати запис", messages: [
      { type: "user" as const, text: "Потрібно скасувати запис" },
      { type: "bot" as const, text: "Ваш запис: 10 березня о 14:00 до лікаря Коваль Олена" },
      { type: "bot" as const, text: "Ви впевнені що хочете скасувати?" },
      { type: "user" as const, text: "Так, скасувати" },
      { type: "bot" as const, text: "✅ Запис скасовано. Сподіваємось побачити вас іншого разу!" },
    ]},
  ];

  const runScenario = (scenarioIndex: number) => {
    const messages = scenarios[scenarioIndex].messages;
    setChatMessages([
      { type: "bot", text: "Вітаю! Я DentaBot 🦷" },
      { type: "bot", text: "Допоможу записатись на прийом до стоматолога" },
    ]);
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < messages.length) {
        setChatMessages((prev) => [...prev, messages[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);
  };

  const appointments = [
    { id: 1, patient: "Іваненко Марія", doctor: "Доктор Коваль О.", date: "10 березня", time: "14:00", status: "confirmed" },
    { id: 2, patient: "Петренко Олександр", doctor: "Доктор Іваненко П.", date: "10 березня", time: "15:30", status: "confirmed" },
    { id: 3, patient: "Сидоренко Анна", doctor: "Доктор Коваль О.", date: "11 березня", time: "10:00", status: "pending" },
    { id: 4, patient: "Мельник Ігор", doctor: "Доктор Іваненко П.", date: "11 березня", time: "11:30", status: "confirmed" },
    { id: 5, patient: "Коваленко Ольга", doctor: "Доктор Коваль О.", date: "12 березня", time: "09:00", status: "confirmed" },
  ];

  const doctors = [
    { name: "Іваненко Петро Сергійович", specialty: "Терапевт-стоматолог", experience: "12 років досвіду", schedule: "Пн, Ср, Пт: 9:00 - 18:00", avatar: "👨‍⚕️" },
    { name: "Коваль Олена Михайлівна", specialty: "Хірург-стоматолог", experience: "8 років досвіду", schedule: "Вт, Чт, Сб: 10:00 - 19:00", avatar: "👩‍⚕️" },
    { name: "Сидоренко Андрій Васильович", specialty: "Ортодонт", experience: "15 років досвіду", schedule: "Пн-Пт: 10:00 - 17:00", avatar: "👨‍⚕️" },
  ];

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-16">
      <section className="pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">DEMO MODE</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">Живе демо — спробуйте DentaBot прямо зараз</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">Це тестове середовище клініки "Посмішка". Всі дані фейкові. Реєстрація не потрібна.</p>
          </div>
        </div>
      </section>
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs defaultValue="bot" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 mb-8">
              <TabsTrigger value="bot" className="text-base">🤖 Бот — вид пацієнта</TabsTrigger>
              <TabsTrigger value="admin" className="text-base">⚙️ Адмін панель</TabsTrigger>
            </TabsList>

            {/* Bot Tab: phone mockup (rounded-[3rem] bg-gray-900 frame, Telegram-style header bg-[#1d6be4],
                chat bubbles: user bg-[#1d6be4] text-white justify-end, bot bg-white justify-start) +
                scenario buttons (outline, click runs runScenario) + "Відкрити в Telegram" button (variant="default") */}
            <TabsContent value="bot">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="max-w-md mx-auto">
                    <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden h-[600px] flex flex-col">
                        <div className="bg-[#1d6be4] text-white px-4 py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><span className="text-2xl">🦷</span></div>
                          <div><div className="font-semibold">DentaBot</div><div className="text-xs opacity-90">завжди онлайн</div></div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                          {chatMessages.map((message, index) => (
                            <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${message.type === "user" ? "bg-[#1d6be4] text-white" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"}`}>
                                {message.text}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Оберіть сценарій справа →</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Оберіть сценарій:</h3>
                  {scenarios.map((scenario, index) => (
                    <Button key={index} onClick={() => runScenario(index)} variant="outline" className="w-full justify-start h-auto py-4">{scenario.label}</Button>
                  ))}
                  <div className="pt-4 border-t dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Або спробуйте в реальному Telegram:</p>
                    <Button variant="default" className="w-full">Відкрити в Telegram</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Admin Tab: demo banner (bg-[#1d6be4], "Демо режим" badge + clinic name + "Підключити свою клініку →" secondary button → /contacts),
                sidebar (5 nav buttons: Dashboard/Записи/Лікарі/Пацієнти/Налаштування, variant=default when selected else ghost),
                content panel switches on selectedSection:
                - dashboard: 4 stat cards (12/47/156/85%) + bar chart (7-day, bg-[#1d6be4] bars, height = value/50*100%)
                - appointments: table of 5 mock appointments (Badge default="Підтверджено"/secondary="Очікує")
                - doctors: 2-col grid of 3 doctor cards (avatar emoji, specialty, experience, schedule)
                - patients: placeholder card ("База даних пацієнтів з контактами та історією відвідувань")
                - settings: placeholder card ("Налаштування клініки, робочих годин, повідомлень та інтеграцій") */}
            <TabsContent value="admin">
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
                <div className="bg-[#1d6be4] text-white px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white text-[#1d6be4]">Демо режим</Badge>
                    <span>Клініка "Посмішка"</span>
                  </div>
                  <Button variant="secondary" size="sm" asChild><Link to="/contacts">Підключити свою клініку →</Link></Button>
                </div>
                <div className="flex">
                  <div className="w-64 border-r dark:border-gray-700 p-4 space-y-2">
                    <Button variant={selectedSection === "dashboard" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedSection("dashboard")}>📊 Dashboard</Button>
                    <Button variant={selectedSection === "appointments" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedSection("appointments")}>📅 Записи</Button>
                    <Button variant={selectedSection === "doctors" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedSection("doctors")}>👨‍⚕️ Лікарі</Button>
                    <Button variant={selectedSection === "patients" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedSection("patients")}>🧑‍🤝‍🧑 Пацієнти</Button>
                    <Button variant={selectedSection === "settings" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedSection("settings")}>⚙️ Налаштування</Button>
                  </div>
                  <div className="flex-1 p-6">
                    {/* dashboard/appointments/doctors/patients/settings content — see full source above for exact mock data */}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
```

Mock data (transcribe verbatim into a local constants file, e.g. `apps/web/app/demo/_data.ts` or similar — Claude's discretion on exact location, following the `lib/`/local-to-route convention):
- `appointments`: 5 rows exactly as listed above (patient, doctor, date, time, status: confirmed|pending)
- `doctors`: 3 entries exactly as listed above (name, specialty, experience, schedule, avatar emoji)
- Dashboard stat cards: 12 / 47 / 156 / 85% (labels: "Записів сьогодні", "Записів цього тижня", "Активних пацієнтів", "Завантаженість")
- Bar chart data: `[42, 38, 45, 50, 47, 40, 35]` for Пн–Нд

### Design source — Contacts page (`src/app/pages/contacts.tsx`)

```tsx
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Contacts() {
  const [formData, setFormData] = useState({ name: "", clinic: "", contact: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSubmitted(true);
      toast.success("Заявку успішно надіслано!");
    }, 500);
  };

  const faqs = [
    { question: "Скільки коштує підключення?", answer: "Підключення безкоштовне. Ви платите тільки за обраний тарифний план. Перші 14 днів — безкоштовний пробний період." },
    { question: "Чи складно налаштувати систему?", answer: "Налаштування дуже просте і займає близько години. Ми надаємо відео інструкції та особисту підтримку на кожному етапі." },
    { question: "Чи потрібен технічний спеціаліст?", answer: "Ні, система розроблена для зручності звичайних користувачів. Якщо виникнуть питання — наша підтримка завжди на зв'язку." },
    { question: "Як швидко можна почати користуватись?", answer: "Після реєстрації ви можете налаштувати бота за 1 день та одразу почати приймати записи від пацієнтів." },
    { question: "Чи безпечна система?", answer: "Так, ми використовуємо сучасні методи шифрування даних та відповідаємо всім стандартам безпеки медичних даних." },
    { question: "Які гарантії якості?", answer: "Ми надаємо 14 днів безкоштовного тестування. Якщо система вам не підійде — ви можете скасувати в будь-який момент." },
    { question: "Чи можна інтегрувати з існуючою системою?", answer: "Так, ми маємо API та інтеграції з популярними CRM системами. Зв'яжіться з нами для деталей." },
    { question: "Які методи оплати доступні?", answer: "Ми приймаємо оплату картками Visa/Mastercard онлайн, а також банківський переказ для юридичних осіб." },
  ];

  return (
    <div className="min-h-screen pt-24 lg:pt-32 pb-16">
      <section className="pb-12 lg:pb-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">Зв'яжіться з нами</h1>
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Відповімо протягом 2 годин у робочий час. Або напишіть нам у Telegram — там швидше.</p>
        </div>
      </section>
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Залишити заявку</CardTitle>
                <CardDescription>Заповніть форму і ми зв'яжемося з вами найближчим часом</CardDescription>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2"><Label htmlFor="name">Ім'я *</Label><Input id="name" name="name" placeholder="Ваше ім'я" required /></div>
                    <div className="space-y-2"><Label htmlFor="clinic">Назва клініки</Label><Input id="clinic" name="clinic" placeholder="Назва вашої клініки" /></div>
                    <div className="space-y-2"><Label htmlFor="contact">Телефон або email *</Label><Input id="contact" name="contact" placeholder="+380 XX XXX XX XX або email@example.com" required /></div>
                    <div className="space-y-2"><Label htmlFor="message">Повідомлення</Label><Textarea id="message" name="message" placeholder="Розкажіть про ваші потреби..." rows={4} /></div>
                    <Button type="submit" size="lg" className="w-full">Надіслати заявку</Button>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-8 w-8 text-green-500" /></div>
                    <h3 className="text-2xl font-bold mb-2">Дякуємо!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Ваша заявка успішно надіслана. Ми зв'яжемося з вами найближчим часом.</p>
                    <Button variant="outline" onClick={() => { setIsSubmitted(false); }}>Надіслати ще одну заявку</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="space-y-6">
              {/* 3 contact-method cards: Telegram (@dentabot_support), Email (hello@dentabot.ua), Робочі години (Пн-Пт 9:00-18:00 Київ) —
                  each with a bg-[#1d6be4] icon badge */}
              {/* 3 benefit callout cards (colored bg tints): "Відповідаємо за 2 години" (green),
                  "Безкоштовна демонстрація" (blue), "Налаштування за 1 день" (purple) */}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">Часті питання</h2></div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-white dark:bg-gray-950 dark:border-gray-700">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
```

All 8 FAQ question/answer pairs are transcribed verbatim above — port exactly, no rewriting.

</code_context>

<specifics>
## Specific Ideas

- Both Home CTA buttons at top of hero ("Спробувати демо") and the CTA banner's "Відкрити демо бот" button are strong candidates for the Phase 1 `brand`/`brand-outline` Button variants — the design literally colors them brand blue in the CTA banner section (`bg-[#1d6be4]` section background with `variant="secondary"`) and via `#1d6be4` text/border on the other. Apply the same brand-blue Button-variant fix pattern from Phase 1 rather than raw hex classes.
- The Contacts page's 3 contact-method icon badges and 3 colored benefit-callout cards all use `#1d6be4` for the blue one — normalize to `bg-brand`/`text-brand` per the established Phase 1 token rule; the green/purple benefit cards can stay as literal Tailwind color utilities (no brand token equivalent exists for those, and the design doesn't call for one).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. No scope-creep suggestions came up.

</deferred>

---

*Phase: 2-Home, Contacts & Demo*
*Context gathered: 2026-08-08*
