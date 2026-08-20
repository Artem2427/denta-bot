# Roadmap: denta-bot Platform

## Milestones

- ✅ **v1.0 MVP** — Phases 1, 01.1, 2, 3 (shipped 2026-08-10)
- ✅ **v1.1 Platform Admin API** — Phases 4, 5, 6, 06.1, 06.2 (shipped 2026-08-20)
- 📋 **v1.2 Multi-tenant Core** — not yet planned (`/gsd-new-milestone`)

## Phases

**Phase Numbering:**

- Integer phases: planned milestone work
- Decimal phases (01.1, 06.1, 06.2): urgent insertions between surrounding integers
- 999.x: backlog parking lot, unsequenced

<details>
<summary>✅ v1.0 MVP (Phases 1, 01.1, 2, 3) — SHIPPED 2026-08-10</summary>

- [x] Phase 1: Theme & Site Shell (2/2 plans) — completed 2026-08-08
- [x] Phase 01.1: Premium Design System (apps/web) (4/4 plans) — completed 2026-08-08
- [x] Phase 2: Home, Contacts & Demo (4/4 plans) — completed 2026-08-09
- [x] Phase 3: Prices & Blog (2/2 plans) — completed 2026-08-10

Full phase details archived at `.planning/milestones/v1.0-ROADMAP.md`.

</details>

<details>
<summary>✅ v1.1 Platform Admin API (Phases 4, 5, 6, 06.1, 06.2) — SHIPPED 2026-08-20</summary>

**Milestone Goal:** Build a real NestJS + Prisma backend that powers `apps/platform-admin` (clinic/lead/content monitoring) and gives the marketing site a CMS layer for blog/pricing content, replacing the no-backend / mock-data-only state.

- [x] Phase 4: Backend Foundation & Auth (2/2 plans) — completed 2026-08-14
- [x] Phase 5: Clinic, Lead & Content Management (7/7 plans) — completed 2026-08-14
- [x] Phase 6: apps/web Integration (3/3 plans) — completed 2026-08-15
- [x] Phase 06.1: Premium Visual Restyle (apps/web) *(inserted)* (5/5 plans) — completed 2026-08-18
- [x] Phase 06.2: Single-Page Landing Consolidation + i18n (apps/web) *(inserted)* (7/7 plans) — completed 2026-08-19

Full phase details archived at `.planning/milestones/v1.1-ROADMAP.md`; phase directories at `.planning/milestones/v1.1-phases/`.

</details>

### 📋 v1.2 Multi-tenant Core (not yet planned)

Turn `Clinic` from a CRM row into a real tenant — `ClinicUser` auth + RBAC, tenant scoping via Prisma Client Extensions, `AuditLog`, doctors/services/patients/appointments + slot calculator, `/api/{public,admin,clinic}` route prefixes, `packages/shared`.

Source spec: `.planning/phases/999.1-server-platform-multi-tenant-clinics-per-clinic-telegram-bot/SERVER-TZ.md` (§9.1 defines the v1.2 → v1.3 → v1.4 split).

Run `/gsd-new-milestone` to define requirements and phases.

## Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 MVP | 4 | 12 | Complete | 2026-08-10 |
| v1.1 Platform Admin API | 5 | 24 | Complete | 2026-08-20 |
| v1.2 Multi-tenant Core | — | — | Not planned | — |

## Backlog

### Phase 999.1: Server platform — multi-tenant clinics, per-clinic Telegram bots, billing (BACKLOG)

**Goal:** [Captured for future planning] Full server-side ТЗ (2026-08-20, client-supplied) covering `apps/server` + `packages/db`: Clinic as tenant, ClinicUser auth + RBAC, doctors/services/patients/appointments/schedule, one Telegram bot per clinic (webhook routing + booking FSM + reminders), subscriptions/payments, analytics, audit. Full spec: `.planning/phases/999.1-server-platform-multi-tenant-clinics-per-clinic-telegram-bot/SERVER-TZ.md`

**Agreed slicing** (2026-08-20): this backlog item is NOT one milestone — it splits into three, planned in order after v1.1 ships:

- **v1.2 Multi-tenant Core** — Clinic-as-tenant schema, ClinicUser + clinic-auth, tenant scoping via Prisma Client Extensions, RBAC, AuditLog, Doctors/Services/Patients/Appointments + slot calculator, `/api/{public,admin,clinic}` prefixes (+ migrating existing web/platform-admin callers), `packages/shared`
- **v1.3 Telegram** — Redis + BullMQ infra, AES-256-GCM bot-token storage, provisioning/setWebhook, webhook routing by path, booking FSM, reminders, `TelegramApiClient`
- **v1.4 Billing & Analytics** — Subscription/Payment/LiqPay, analytics for both admin panels, health endpoints

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)
