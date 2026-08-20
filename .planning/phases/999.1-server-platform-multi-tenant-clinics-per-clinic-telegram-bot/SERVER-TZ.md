# ТЗ: Server (NestJS + Prisma + Postgres) для DentaBot

> **Джерело:** надано клієнтом (Artem) 2026-08-20, збережено дослівно в розділах 1–8.
> **Статус:** backlog-документ. Розбивка на мілстоуни та технічні правки — у розділі 9 нижче,
> він має пріоритет над текстом ТЗ там, де вони розходяться.

Документ для Claude Code. Описує серверну частину під три фронти:

| Клієнт | Аудиторія | Автентифікація |
|---|---|---|
| `web` (лендинг) | публіка | немає (публічні GET + POST лідів) |
| `admin` (DentaBot Admin) | власник платформи | `PlatformAdmin` JWT |
| `clinic-admin` (DentaBot Clinic Admin) | персонал клініки | `ClinicUser` JWT, scoped до `clinicId` |

Плюс **Telegram-бот на клініку**: кожна клініка вставляє свій `botToken` у налаштуваннях,
сервер сам ставить webhook і маршрутизує апдейти до правильної клініки.

Стек, що вже є: NestJS (`server/src` з модулями `auth`, `blog-posts`, `clinics`, `config`,
`leads`, `pricing-plans`, `prisma`), Prisma (`prisma-client` generator, output `../generated/prisma`,
cjs), PostgreSQL. Далі — що додати.

---

## 1. Що змінюється в наявній схемі

Поточна схема покриває тільки маркетинг-частину (Clinic як запис у CRM, Lead, BlogPost,
PricingPlan, PlatformAdmin). Для роботи клінік і ботів її треба розширити:

1. `Clinic` стає **тенантом**, а не рядком CRM: додати `slug`, `timezone`, `address`,
   `currency`, `bookingSlotMinutes`, `trialEndsAt`, `suspendedAt`.
2. `Clinic.plan: String` лишити як є (D-10, без FK на `PricingPlan`) — але додати
   `Subscription` для біллінгу, бо MRR/продовження/платежі в адмінці рахуються з нього,
   а не з рядка тарифу.
3. Додати `ClinicUser` (персонал клініки) + власні `RefreshToken` — зараз `RefreshToken`
   жорстко привʼязаний до `PlatformAdmin`. Зробити токен поліморфним: поля
   `platformAdminId?` і `clinicUserId?` + `@@index` на кожен, або окрема модель
   `ClinicRefreshToken`. Рекомендація: **одна модель з двома опційними FK** і
   CHECK-констрейнтом (рівно один заповнений) через `@@map` + міграцію з raw SQL.
4. `messageCount` / `bookingsCount` на `Clinic` лишити як денормалізовані лічильники,
   але справжнім джерелом зробити `Appointment` / `BotMessage` і оновлювати лічильники
   в тій самій транзакції.
5. `BlogPost.date`, `readTime` — `String`; для сортування додати `publishedAt: DateTime?`.
   `PricingPlan.monthlyPrice/yearlyPrice` — `String` (щоб «890 ₴/міс» лишалось як копія);
   додати `monthlyPriceMinor Int` / `yearlyPriceMinor Int` для розрахунків.

---

## 2. Нові моделі (Prisma)

Ключові принципи: усі гроші — `Int` у копійках (`amountMinor`), усі дати — `DateTime` в UTC,
кожна tenant-сутність має `clinicId` + `@@index([clinicId, ...])`.

```prisma
model ClinicUser {
  id           String         @id @default(cuid())
  clinicId     String
  clinic       Clinic         @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  email        String
  passwordHash String
  name         String
  role         ClinicUserRole @default(reception)
  isActive     Boolean        @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  doctor        Doctor?
  refreshTokens RefreshToken[]

  @@unique([clinicId, email])
  @@index([clinicId])
}

enum ClinicUserRole { owner admin doctor reception }

model Doctor {
  id           String   @id @default(cuid())
  clinicId     String
  clinic       Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  clinicUserId String?  @unique          // лікар може мати вхід у панель
  clinicUser   ClinicUser? @relation(fields: [clinicUserId], references: [id])
  name         String
  speciality   String
  colorKey     String   @default("chart-1")  // для розкладу у фронті
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  services     ServiceOnDoctor[]
  shifts       Shift[]
  timeOff      TimeOff[]
  appointments Appointment[]
  reviews      Review[]

  @@index([clinicId, isActive])
}

model Service {
  id              String   @id @default(cuid())
  clinicId        String
  clinic          Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  name            String
  category        String
  durationMinutes Int
  priceMinor      Int
  isBotVisible    Boolean  @default(true)   // тумблер «У боті»
  sortOrder       Int      @default(0)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  doctors      ServiceOnDoctor[]
  appointments Appointment[]

  @@index([clinicId, isBotVisible, isActive])
}

model ServiceOnDoctor {
  serviceId String
  doctorId  String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  doctor    Doctor  @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  @@id([serviceId, doctorId])
}

model Patient {
  id             String   @id @default(cuid())
  clinicId       String
  clinic         Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  name           String
  phone          String?
  email          String?
  telegramUserId String?                 // не унікальний глобально — унікальний у межах клініки
  notes          String?
  tags           String[]                 // «Постійна», «Брекети», …
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  appointments Appointment[]
  reviews      Review[]

  @@unique([clinicId, telegramUserId])
  @@index([clinicId, phone])
  @@index([clinicId, name])
}

enum AppointmentStatus { pending confirmed cancelled completed no_show }
enum AppointmentSource { bot phone walk_in instagram admin }

model Appointment {
  id            String            @id @default(cuid())
  clinicId      String
  clinic        Clinic            @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patientId     String
  patient       Patient           @relation(fields: [patientId], references: [id])
  doctorId      String
  doctor        Doctor            @relation(fields: [doctorId], references: [id])
  serviceId     String
  service       Service           @relation(fields: [serviceId], references: [id])
  startsAt      DateTime
  endsAt        DateTime
  status        AppointmentStatus @default(pending)
  source        AppointmentSource @default(bot)
  priceMinor    Int
  comment       String?
  cancelReason  String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  reminders Reminder[]
  review    Review?

  @@index([clinicId, startsAt])
  @@index([clinicId, doctorId, startsAt])
  @@index([clinicId, status])
}
```

Розклад (сторінка «Розклад» у clinic-admin):

```prisma
enum ShiftTemplate { morning evening full custom }

model Shift {                   // одна зміна лікаря на конкретну дату
  id         String        @id @default(cuid())
  clinicId   String
  clinic     Clinic        @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  doctorId   String
  doctor     Doctor        @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  date       DateTime      @db.Date
  startsAt   DateTime                     // повний timestamp у tz клініки → UTC
  endsAt     DateTime
  template   ShiftTemplate @default(custom)
  roomId     String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@unique([doctorId, date, startsAt])
  @@index([clinicId, date])
}

model ScheduleTemplate {        // «Заповнити за шаблоном»
  id        String   @id @default(cuid())
  clinicId  String
  clinic    Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  doctorId  String
  weekday   Int                            // 1..7
  template  ShiftTemplate
  createdAt DateTime @default(now())
  @@unique([doctorId, weekday])
}

model TimeOff {                 // відпустка / лікарняний, перекриває Shift
  id        String   @id @default(cuid())
  clinicId  String
  doctorId  String
  doctor    Doctor   @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  startsAt  DateTime
  endsAt    DateTime
  reason    String?
  createdAt DateTime @default(now())
  @@index([clinicId, startsAt])
}
```

Бот, нагадування, відгуки, біллінг, аудит:

```prisma
model TelegramBot {
  id             String    @id @default(cuid())
  clinicId       String    @unique
  clinic         Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  botTokenCipher String                     // AES-256-GCM, НІКОЛИ не в plaintext
  botTokenIv     String
  botTokenTag    String
  botId          BigInt                     // з getMe, використовується для маршрутизації
  username       String                     // @clinic_bot
  webhookSecret  String                     // secret_token для X-Telegram-Bot-Api-Secret-Token
  webhookPath    String    @unique          // /telegram/webhook/:webhookPath (random 32 hex)
  status         BotStatus @default(pending)
  lastError      String?
  lastUpdateAt   DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  sessions BotSession[]
  messages BotMessage[]
}

enum BotStatus { pending active invalid_token webhook_failed disabled }

model BotSession {              // стан діалогу запису
  id        String   @id @default(cuid())
  botId     String
  bot       TelegramBot @relation(fields: [botId], references: [id], onDelete: Cascade)
  chatId    BigInt
  state     Json                            // { step, serviceId, doctorId, slot… }
  expiresAt DateTime
  updatedAt DateTime @updatedAt
  @@unique([botId, chatId])
}

model BotMessage {              // лог вхідних/вихідних (для «Записів у боті» і дебагу)
  id        String   @id @default(cuid())
  botId     String
  bot       TelegramBot @relation(fields: [botId], references: [id], onDelete: Cascade)
  chatId    BigInt
  direction MsgDirection
  updateId  BigInt?                          // ідемпотентність
  payload   Json
  createdAt DateTime @default(now())
  @@unique([botId, updateId])
  @@index([botId, createdAt])
}

enum MsgDirection { in out }

enum ReminderKind { visit_24h visit_2h followup review_request }
enum ReminderStatus { scheduled sent failed cancelled }

model Reminder {
  id            String         @id @default(cuid())
  clinicId      String
  appointmentId String
  appointment   Appointment    @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  kind          ReminderKind
  sendAt        DateTime
  status        ReminderStatus @default(scheduled)
  sentAt        DateTime?
  error         String?
  @@index([status, sendAt])
  @@index([clinicId])
}

model Review {
  id            String   @id @default(cuid())
  clinicId      String
  patientId     String
  patient       Patient  @relation(fields: [patientId], references: [id])
  doctorId      String
  doctor        Doctor   @relation(fields: [doctorId], references: [id])
  appointmentId String   @unique
  appointment   Appointment @relation(fields: [appointmentId], references: [id])
  rating        Int                          // 1..5
  text          String?
  isPublished   Boolean  @default(false)
  createdAt     DateTime @default(now())
  @@index([clinicId, createdAt])
}

enum SubscriptionStatus { trialing active past_due frozen cancelled }

model Subscription {
  id                 String             @id @default(cuid())
  clinicId           String             @unique
  clinic             Clinic             @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  planCode           String                        // "start" | "clinic" | "network"
  status             SubscriptionStatus @default(trialing)
  amountMinor        Int
  currency           String             @default("UAH")
  interval           String             @default("month")   // month | year
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAt           DateTime?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  payments Payment[]
  @@index([status, currentPeriodEnd])
}

enum PaymentStatus { pending paid failed refunded }

model Payment {
  id             String        @id @default(cuid())
  clinicId       String
  subscriptionId String
  subscription   Subscription  @relation(fields: [subscriptionId], references: [id])
  provider       String                        // liqpay | manual | card
  providerRef    String?       @unique
  amountMinor    Int
  currency       String        @default("UAH")
  status         PaymentStatus @default(pending)
  method         String?                       // "Картка ••4291"
  paidAt         DateTime?
  createdAt      DateTime      @default(now())
  @@index([clinicId, createdAt])
  @@index([status])
}

model AuditLog {
  id        String   @id @default(cuid())
  clinicId  String?
  actorType String                            // platform_admin | clinic_user | bot | system
  actorId   String?
  action    String                            // "appointment.cancel"
  entity    String
  entityId  String?
  diff      Json?
  ip        String?
  createdAt DateTime @default(now())
  @@index([clinicId, createdAt])
  @@index([entity, entityId])
}

model ClinicSettings {
  clinicId            String  @id
  clinic              Clinic  @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  workdayStart        String  @default("09:00")
  workdayEnd          String  @default("21:00")
  slotMinutes         Int     @default(30)
  remind24h           Boolean @default(true)
  followupAfterVisit  Boolean @default(true)
  waitlistEnabled     Boolean @default(false)
  askReview           Boolean @default(true)
  botGreeting         String?
  botLocale           String  @default("uk")
}
```

---

## 3. Структура модулів (`server/src`)

Наявні: `auth`, `blog-posts`, `clinics`, `config`, `leads`, `pricing-plans`, `prisma`.
Додати:

```
src/
  auth/                 + clinic-auth (окремі стратегії й guard'и)
  clinic-users/
  doctors/
  services/
  patients/
  appointments/         (пошук вільних слотів, конфлікти)
  schedule/             (shifts, templates, time-off)
  reviews/
  subscriptions/
  payments/             (+ webhook провайдера)
  telegram/
    telegram.module.ts
    webhook.controller.ts      POST /telegram/webhook/:path
    bot-registry.service.ts    кеш botToken → Bot instance
    bot-provisioning.service.ts setWebhook / deleteWebhook / getMe
    update-router.service.ts   маршрутизація апдейту → clinicId
    conversation/              сценарій запису (FSM)
    telegram-api.client.ts
  reminders/            (черга + cron)
  analytics/            (KPI для обох адмінок)
  audit/
  common/               guards, interceptors, filters, pagination dto
  jobs/                 BullMQ processors
```

Ключове рішення: **tenant-скоуп на рівні guard + Prisma middleware**. `ClinicScopeGuard`
кладе `req.clinicId`; Prisma extension автоматично додає `where.clinicId` для всіх
tenant-моделей. PlatformAdmin-роути обходять скоуп явно (`prisma.$bypassTenant()`),
але кожен такий виклик логується в `AuditLog`.

---

## 4. Telegram: багато ботів, один сервер

### 4.1 Підключення бота клінікою

`PUT /clinic/settings/telegram` body `{ botToken }` (роль `owner`/`admin`):

1. Валідація формату (`^\d{6,}:[A-Za-z0-9_-]{30,}$`).
2. `getMe` з цим токеном → `botId`, `username`. Помилка → 422 `INVALID_BOT_TOKEN`.
3. `botId` вже привʼязаний до іншої клініки → 409 `BOT_ALREADY_LINKED`.
4. Генерація `webhookPath = randomBytes(16).hex` і `webhookSecret = randomBytes(32).hex`.
5. Шифрування токена: AES-256-GCM ключем із `TELEGRAM_TOKEN_ENC_KEY` (32 байти, з env/KMS).
   У БД — `botTokenCipher`/`botTokenIv`/`botTokenTag`. У логах і API-відповідях токен
   ніколи не повертається — тільки `username`, `status`, останні 4 символи.
6. `setWebhook`:
   ```
   url          = `${PUBLIC_API_URL}/telegram/webhook/${webhookPath}`
   secret_token = webhookSecret
   allowed_updates = ["message","callback_query","my_chat_member"]
   drop_pending_updates = true
   ```
7. `status = active` при успіху, `webhook_failed` + `lastError` при помилці.
8. `DELETE /clinic/settings/telegram` → `deleteWebhook` + видалення рядка.
9. Кнопка «Перевірити зʼєднання» → `getWebhookInfo`, показує `pending_update_count`
   і `last_error_message` у налаштуваннях.

### 4.2 Маршрутизація вхідних апдейтів

Один контролер: `POST /telegram/webhook/:webhookPath`.

1. Порівняти заголовок `X-Telegram-Bot-Api-Secret-Token` з `webhookSecret` цього рядка
   (constant-time). Не збігся → 401, без деталей у тілі.
2. Знайти `TelegramBot` по `webhookPath` (кеш у Redis, TTL 5 хв; інвалідація при зміні
   налаштувань) → маємо `clinicId`. **Це і є відповідь на «якому боту відповідати»:**
   шлях унікальний на клініку, тому токен для відповіді береться з того ж рядка.
3. Ідемпотентність: `BotMessage.@@unique([botId, updateId])` — дубль апдейту
   (Telegram ретраїть) просто ігнорується.
4. Відповідь Telegram — **завжди 200 і одразу**; обробка йде в BullMQ-джобі
   (`telegram-update` queue, ключ партиціювання `botId`, щоб порядок у межах чату зберігався).
5. У джобі: розшифрувати токен, узяти `Bot` з `BotRegistry` (LRU-кеш інстансів на
   `botId`, ліміт ~500, ідемпотентне створення), виконати сценарій.
6. Rate limit: власний ліміт на клініку (30 msg/s глобально в Telegram, 1 msg/s на чат) —
   черга з `limiter` на `botId`.

### 4.3 Сценарій запису (FSM у `BotSession.state`)

```
/start → привітання (ClinicSettings.botGreeting) + меню:
  [Записатися] [Мої записи] [Скасувати запис] [Контакти]

Записатися:
  1. Послуга      → Service.where(isBotVisible, isActive) інлайн-кнопками
  2. Лікар        → ServiceOnDoctor ∩ Doctor.isActive (+ «Будь-який»)
  3. Дата         → наступні 14 днів, де є Shift і немає TimeOff
  4. Час          → вільні слоти = Shift − існуючі Appointment − TimeOff,
                     крок ClinicSettings.slotMinutes, тривалість Service.durationMinutes
  5. Імʼя і телефон (якщо Patient не знайдений по telegramUserId)
  6. Підтвердження → Appointment(status=pending|confirmed, source=bot)
                     + Reminder(visit_24h, visit_2h) + BotMessage(out)
```

Обчислення слотів робити в одній транзакції з `SELECT … FOR UPDATE` по перекритних
`Appointment` — інакше два паралельні діалоги забронюють один слот. Гонку віддавати як
«цей час щойно зайняли, ось найближчі альтернативи».

Тайм-зони: усе в БД у UTC, конвертація по `Clinic.timezone` (`Europe/Kyiv`) через
`date-fns-tz`. Слот-сітку рахувати в локальній зоні клініки, а не сервера.

### 4.4 Вихідні повідомлення

`TelegramApiClient.send(clinicId, method, payload)` — єдина точка виходу:
дістає токен, ретраїть 429 з `retry_after`, при `403 blocked by user` ставить
`Patient.telegramUserId = null` і логує в `AuditLog`; при `401 Unauthorized`
переводить бота в `status = invalid_token` і показує алерт у clinic-admin.

---

## 5. API (контракти)

Три префікси, три guard'и: `/api/public/*`, `/api/admin/*` (PlatformAdmin),
`/api/clinic/*` (ClinicUser, scoped).

**Спільна конвенція списків** (усі таблиці обох адмінок):
```
GET …?page=1&perPage=20&sort=startsAt&order=asc&q=текст&status=…&doctorId=…
→ { items: T[], total: number, page, perPage }
```
Пагінація, сортування, пошук і фільтри — **на сервері**, фронт лише передає параметри
(TanStack Table у `manualPagination`/`manualSorting` режимі).

**Public**: `GET /pricing-plans`, `GET /blog-posts`, `GET /blog-posts/:slug`,
`POST /leads` (rate-limit по IP, honeypot, `source: contacts|demo`).

**Admin** (superadmin): `clinics` CRUD + `PATCH /clinics/:id/status`,
`subscriptions`, `payments`, `appointments` (крос-клінічний read-only),
`analytics/overview` (MRR, ARR, churn, тріали, прострочки), `logs` (AuditLog + BotMessage
з фільтрами), `support/tickets`, `settings/platform`, `leads`, `blog-posts`, `pricing-plans`.

**Clinic**: `dashboard` (KPI + графік + сьогоднішні візити + джерела),
`appointments` (список/створення/статус/скасування), `schedule` (див. нижче),
`patients`, `doctors`, `services` (+ `PATCH /services/:id/bot-visibility`),
`reviews`, `settings` (клініка / бот / автоматизації / команда), `users` (запрошення).

**Schedule API** під сторінку «Розклад»:
```
GET  /api/clinic/schedule?weekStart=2026-08-17
     → { doctors: [{ id, name, speciality, colorKey, weekHours,
                     days: [{ date, shift: {template, startsAt, endsAt} | null,
                              timeOff?: {...}, appointmentsCount }] }],
         totals: { weekHours, offDays, peakWeekday } }
PUT  /api/clinic/schedule            body { changes: [{ doctorId, date, template|null }] }
POST /api/clinic/schedule/apply-template   body { weekStart }
POST /api/clinic/schedule/clear            body { weekStart }
```
`PUT` — атомарний батч (одна транзакція, як фронт і надсилає при «Зберегти розклад»).
Якщо зняття зміни залишає активні `Appointment` без покриття — відповідь `409` з
`{ conflicts: [{ appointmentId, startsAt, patientName }] }`, фронт показує AlertDialog;
повторний запит із `force: true` дозволяє зберегти і ставить конфліктні записи в
`status = pending` + нотифікацію пацієнту.

---

## 6. Фонові задачі (BullMQ + Redis)

| Черга | Тригер | Що робить |
|---|---|---|
| `telegram-update` | webhook | обробка апдейту (партиція по `botId`) |
| `telegram-send` | сервіси | вихідні повідомлення з rate-limit |
| `reminders` | cron 1/хв | `Reminder.where(status=scheduled, sendAt<=now)` → `telegram-send` |
| `review-requests` | cron 15/хв | через 2 год після `completed`, якщо `askReview` |
| `subscriptions` | cron щодня 03:00 | `currentPeriodEnd` → `past_due`, авто-заморозка через 7 днів |
| `bot-health` | cron щогодини | `getWebhookInfo` по активних ботах, оновлення `status`/`lastError` |
| `counters` | після транзакцій | перерахунок `Clinic.bookingsCount`/`messageCount` |

Ідемпотентність джоб — по `jobId` (`reminder:{id}`, `update:{botId}:{updateId}`).

---

## 7. Безпека

- `botToken` — тільки AES-256-GCM у БД; ключ у env/KMS, ротація через `keyVersion` у рядку.
- Токен ніколи не в логах, помилках, Sentry-breadcrumbs — маскувати `\d+:[\w-]+` на рівні логера.
- Webhook: перевірка `secret_token` + опційно allowlist підмереж Telegram; тіло ≤ 1 МБ.
- JWT: access 15 хв, refresh 30 днів з ротацією і `familyId` (як у наявному `RefreshToken`) —
  повторне використання відкликаного refresh анулює всю родину.
- Паролі — argon2id. Ліміт спроб логіну по email+IP.
- RBAC: `owner` (усе + біллінг), `admin` (усе, крім біллінгу), `doctor` (свій розклад
  і свої записи), `reception` (записи, пацієнти, без налаштувань).
- Кожна мутація → `AuditLog`; читання чужого тенанта фізично неможливе через Prisma-скоуп.
- CORS: явний allowlist доменів (`dentabot.ua`, `app.dentabot.ua`, `admin.dentabot.ua`).

## 8. Інфраструктура і якість

- `.env`: `DATABASE_URL`, `REDIS_URL`, `JWT_*`, `TELEGRAM_TOKEN_ENC_KEY`, `PUBLIC_API_URL`,
  `LIQPAY_*`, `SENTRY_DSN`. Валідація через `@nestjs/config` + zod-схему на старті (fail fast).
- Міграції — `prisma migrate`; сідер: платформа-адмін, 3 тарифи, демо-клініка з ботом-заглушкою.
- Валідація DTO — zod або `class-validator` з `whitelist: true, forbidNonWhitelisted: true`.
- Помилки — єдиний фільтр: `{ code, message, details? }`, коди типу `INVALID_BOT_TOKEN`,
  `SLOT_TAKEN`, `SCHEDULE_CONFLICT`.
- Swagger на `/api/docs` (тільки non-prod), OpenAPI-схема → типи для фронтів.
- Тести: unit на слот-калькулятор і FSM бота; e2e на webhook-маршрутизацію (два боти,
  два webhookPath, перевірка ізоляції), на schedule-конфлікти, на tenant-ізоляцію.
- Health: `/health` (db, redis), `/health/bots` (кількість active/invalid).

Також якщо будуть якісь спільні утиліти, які використовуються і на сервері, і на FE-сайтах
чи адмінках — виносимо в `packages/`, щоб було в одному місці.

---

## 9. Адаптація під поточний репо (додано 2026-08-20)

### 9.1 Розбивка на мілстоуни (узгоджено)

ТЗ планується **не одним мілстоуном**, а трьома, послідовно, після того як зашипиться v1.1:

| Мілстоун | Зміст |
|---|---|
| **v1.2 Multi-tenant Core** | Clinic-as-tenant, `ClinicUser` + clinic-auth, tenant-скоуп, RBAC, `AuditLog`, Doctors/Services/Patients/Appointments + слот-калькулятор, `/api/{public,admin,clinic}` префікси + міграція наявних клієнтів, `packages/shared` |
| **v1.3 Telegram** | Redis + BullMQ інфра, шифрування токенів, provisioning, webhook-роутинг, FSM запису, reminders, `TelegramApiClient`, `bot-health` |
| **v1.4 Billing & Analytics** | `Subscription`/`Payment`/LiqPay, аналітика для обох адмінок, `/health` |

Redis **не заходить у v1.2** — до v1.3 сервер лишається на самому Postgres.
`apps/client-admin` (порожній Vite-скафолд) — окремий фронтовий мілстоун після v1.2/v1.3.

### 9.2 Обовʼязкові технічні правки до тексту ТЗ

Ці пункти мають пріоритет над розділами 1–8:

1. **Prisma middleware не існує** — у репо Prisma 7.9.1, `$use` видалено. Tenant-скоуп
   робиться через **Client Extensions** (`$extends` з `query` хуками). `prisma.$bypassTenant()`
   теж не існує — потрібен явний неcкоупнутий клієнт (базовий `PrismaClient` як окремий
   провайдер) для PlatformAdmin-роутів, кожен виклик → `AuditLog`.
2. **`BigInt` (`TelegramBot.botId`, `BotSession.chatId`, `BotMessage.chatId/updateId`)**
   ламає `JSON.stringify` у Nest-відповідях і BullMQ-payload'ах. Рішення ухвалити **до
   першої міграції**: або `String` у схемі, або глобальний BigInt-серіалізатор + кастомний
   job-serializer. Рекомендація — `String`.
3. **`RefreshToken.platformAdminId` зараз NOT NULL** — поліморфізм вимагає міграції
   `nullable + backfill + CHECK (num_nonnulls(platform_admin_id, clinic_user_id) = 1)`
   через raw SQL у `prisma migrate`.
4. **Дублювання полів:** `Clinic.bookingSlotMinutes` (розд. 1) і `ClinicSettings.slotMinutes`
   (розд. 2) — те саме поле; лишити одне (в `ClinicSettings`). `Shift.date @db.Date` +
   `Shift.startsAt` — `date` виводиться зі `startsAt` у tz клініки; або тримати `date` як
   денормалізацію з явним правилом обчислення, або прибрати (тоді `@@unique` міняється).
5. **`Subscription.planCode`** посилається на код тарифу, якого немає в `PricingPlan` —
   додати `PricingPlan.code String @unique` (`start` | `clinic` | `network`).
6. **Неконсистентні `clinicId`:** `Reminder`, `TimeOff`, `AuditLog` мають `clinicId` без
   `@relation`, на відміну від решти. Для `Reminder`/`TimeOff` додати FK; для `AuditLog`
   свідомо лишити без FK (лог має переживати видалення тенанта) — задокументувати.
7. **Ламкі зміни роутів:** зараз контролери — `auth`, `clinics`, `leads`, `blog-posts`,
   `pricing-plans`, `public/blog-posts`, `public/pricing-plans`, без глобального `/api`
   префікса. Перехід на `/api/{public,admin,clinic}/*` ламає наявних споживачів
   (`apps/web`, `apps/platform-admin`) — міграція клієнтів має бути частиною того ж
   мілстоуна (v1.2), не окремою «потім».
8. **Swagger вже піднятий** на `api/docs` (`apps/server/src/main.ts`), `ValidationPipe`
   з `whitelist`/`forbidNonWhitelisted` вже глобальний, CORS-allowlist вже читається з
   `CORS_ALLOWED_ORIGINS` — розділ 8 у цих трьох пунктах уже виконаний.
9. **Docker-compose** має тільки `postgres:17` — `redis` додається в v1.3.
