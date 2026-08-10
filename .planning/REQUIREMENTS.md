# Requirements: denta-bot Platform

**Defined:** 2026-08-10
**Core Value:** A real NestJS + Prisma backend feeds `apps/platform-admin` (clinic/lead/content monitoring) and the site's CMS-backed content, so denta-bot staff can operate on real data instead of hardcoded fixtures.

## v1 Requirements

Requirements for the v1.1 "Platform Admin API" milestone. Each maps to roadmap phases.

### Foundation (INFRA)

- [ ] **INFRA-01**: Prisma schema + migrations are the single source of DB schema truth, version-controlled (no manual DB edits)
- [ ] **INFRA-02**: Generated Prisma types/client are consumable from `apps/server`, `apps/web`, and `apps/platform-admin` via a shared `packages/` package
- [ ] **INFRA-03**: `apps/server` exposes a REST API documented via Swagger/OpenAPI
- [ ] **INFRA-04**: Frontend data-fetching uses `TanStack Query` with a typed client generated from the OpenAPI spec
- [ ] **INFRA-05**: `updatedBy`/`updatedAt` trace fields exist on Clinic, Lead, and Content records

### Auth (AUTH)

- [ ] **AUTH-01**: PlatformAdmin can log in with email + password and receive an access token + refresh token
- [ ] **AUTH-02**: PlatformAdmin's session persists via refresh-token rotation (with reuse detection) without re-entering credentials
- [ ] **AUTH-03**: PlatformAdmin can log out, invalidating the refresh token server-side
- [ ] **AUTH-04**: Unauthenticated requests to protected endpoints are rejected

### Clinic Monitoring (CLINIC)

- [ ] **CLINIC-01**: PlatformAdmin can view a list of all clinic accounts
- [ ] **CLINIC-02**: PlatformAdmin can view a single clinic's detail (contact info, status, plan, stubbed bot-usage fields)
- [ ] **CLINIC-03**: PlatformAdmin can create a new clinic account
- [ ] **CLINIC-04**: PlatformAdmin can edit a clinic's info, status, and plan
- [ ] **CLINIC-05**: PlatformAdmin can search/filter the clinic list by status

### Lead Inbox (LEAD)

- [ ] **LEAD-01**: A Contacts-form submission on `apps/web` is persisted as a Lead via the API
- [ ] **LEAD-02**: A Demo-form submission on `apps/web` is persisted as a Lead via the API
- [ ] **LEAD-03**: PlatformAdmin can view a unified list of all Leads (tagged by source: contacts/demo)
- [ ] **LEAD-04**: PlatformAdmin can view a Lead's full submitted detail
- [ ] **LEAD-05**: PlatformAdmin can update a Lead's status (New/Contacted/Converted)
- [ ] **LEAD-06**: PlatformAdmin can search/filter Leads by status and date
- [ ] **LEAD-07**: PlatformAdmin can convert a Lead into a linked Clinic record

### Content / CMS (CMS)

- [ ] **CMS-01**: PlatformAdmin can create, edit, and delete Blog posts
- [ ] **CMS-02**: `apps/web`'s Blog list/detail pages render real Blog posts from the API, replacing `modules/blog/_data.ts`
- [ ] **CMS-03**: PlatformAdmin can create, edit, and delete Pricing plans
- [ ] **CMS-04**: `apps/web`'s Prices page renders real Pricing plans from the API, replacing hardcoded data and collapsing the `pricing-cards.tsx`/`comparison-table.tsx` duplication

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Client Self-Service

- **CADMIN-01**: Clinic staff can log into `apps/client-admin`, their own per-clinic panel

### Bot Integration

- **BOT-01**: Real Telegram bot webhook receives and processes patient messages
- **BOT-02**: Clinic bot-usage fields (message count, last-active, bookings-made) populate from real bot telemetry instead of stubs

### Admin Depth

- **ADMIN-01**: Multiple PlatformAdmin role tiers with distinct permissions
- **ADMIN-02**: Email/webhook notification on new Lead submission
- **ADMIN-03**: Full audit log with diff history on entity changes
- **ADMIN-04**: Real SaaS usage/billing analytics (MRR, churn) once a payment processor is integrated

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| `apps/client-admin` build-out | Separate app, deferred to next milestone entirely |
| Real Telegram bot integration | Future milestone; this milestone is the CRM/CMS backend only, bot-usage stays stubbed |
| Role tiers / RBAC | Single flat `PlatformAdmin` role suffices at current (1–3 person) staff size |
| Lead/webhook notifications | Separate integration concern, additive later |
| Full audit-log system | `updatedBy`/`updatedAt` trace fields are sufficient for now; full audit log is disproportionate build cost |
| Real SaaS billing/usage analytics | No real payment processor or bot telemetry exists yet to analyze |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |
| INFRA-05 | TBD | Pending |
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| AUTH-03 | TBD | Pending |
| AUTH-04 | TBD | Pending |
| CLINIC-01 | TBD | Pending |
| CLINIC-02 | TBD | Pending |
| CLINIC-03 | TBD | Pending |
| CLINIC-04 | TBD | Pending |
| CLINIC-05 | TBD | Pending |
| LEAD-01 | TBD | Pending |
| LEAD-02 | TBD | Pending |
| LEAD-03 | TBD | Pending |
| LEAD-04 | TBD | Pending |
| LEAD-05 | TBD | Pending |
| LEAD-06 | TBD | Pending |
| LEAD-07 | TBD | Pending |
| CMS-01 | TBD | Pending |
| CMS-02 | TBD | Pending |
| CMS-03 | TBD | Pending |
| CMS-04 | TBD | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 0
- Unmapped: 23 ⚠️ (roadmap not yet created)

---
*Requirements defined: 2026-08-10*
*Last updated: 2026-08-10 after initial definition*
