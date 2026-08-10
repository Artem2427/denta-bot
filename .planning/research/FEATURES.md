# Feature Research

**Domain:** Internal/ops-facing SaaS admin dashboard (platform-admin) — tenant monitoring, lead inbox, lightweight CMS
**Researched:** 2026-08-10
**Confidence:** MEDIUM

This research covers `apps/platform-admin`'s v1.1 scope: denta-bot staff monitoring clinic accounts, triaging site leads (Contacts/Demo form submissions), and managing marketing-site content (blog + pricing) as a lightweight CMS — backed by a new NestJS + Prisma API. It is explicitly **not** researching the clinic's own self-service panel (`apps/client-admin`, deferred) or the real Telegram bot (deferred).

## Feature Landscape

### Table Stakes (Users Expect These)

Features staff assume exist the moment there's an admin dashboard. Missing these = the tool feels broken or untrustworthy for day-to-day ops.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Staff login (email/password, JWT access+refresh) | Any internal tool with sensitive customer/lead data needs authenticated access — this is non-negotiable even for a 2-person staff team | LOW | Dedicated `PlatformAdmin` table already decided in PROJECT.md; single role is enough for v1 (no need for granular RBAC yet) |
| Clinic list view (table, searchable/filterable) | Staff need to find a specific clinic quickly as tenant count grows past a handful | LOW | Simple table: name, status, plan, created date — no need for saved views/segments in v1 |
| Clinic detail view + edit | Staff need to see and correct one clinic's info (contact, plan, status) without a DB console | LOW–MED | CRUD form, not a multi-tab "customer 360" — that's over-built for a first version |
| Subscription/account status field (active/trial/suspended/cancelled, plan tier) | This is the single most important thing staff check per clinic — "is this account paying and active?" | LOW | A status enum + plan reference field is sufficient; no need for a full billing/invoicing subsystem since there's no real payment processor integrated this milestone |
| Lead list (Contacts + Demo submissions, unified) | Staff need one place to see "who filled out a form," not two separate raw tables/emails | LOW–MED | Both form types persist to one `Lead`-shaped table (with a `source` field) so staff don't context-switch between two screens |
| Lead status tracking (New / Contacted / Converted or similar) | Prevents leads going stale/duplicated follow-up — the #1 complaint about raw-inbox lead handling | LOW | Small enum is enough; don't build a sales pipeline (see Anti-Features) |
| Lead detail view (full form payload: name, contact info, message, submitted-at) | Staff need the actual inquiry content to act on it, not just a row in a table | LOW | Straightforward detail panel/page |
| Blog post list + CRUD (title, slug, body, excerpt, category, published flag) | Replaces the current hardcoded `_data.ts` — staff need to publish/edit/unpublish posts without a code deploy | MED | Maps almost 1:1 onto the existing mock data shape in `apps/web/modules/blog/_data.ts`; keep fields the same to minimize both migration and frontend rework |
| Pricing plan list + CRUD (name, price, billing period, features list, tier order) | Same rationale as blog — replaces hardcoded pricing data so marketing can adjust prices without a deploy | MED | Existing `pricing-cards.tsx` / `comparison-table.tsx` duplication (flagged in the v1.0 code review as an open pitfall) should collapse into this one DB-backed source of truth |
| Basic navigation/shell (sidebar nav across Clinics / Leads / Content, logged-in user indicator, logout) | Minimum viable admin shell — staff need to move between the three feature areas without confusion | LOW | `@repo/ui` primitives (already the mandated base for `apps/platform-admin`) cover this well |
| Server-side validation matching frontend zod schemas | Contacts/Demo forms already validate client-side with zod (per PROJECT.md); the new persistence endpoints must re-validate server-side — a lead API that trusts client input is a real risk once it's a public-facing endpoint | LOW–MED | Reuse/mirror zod schemas via the shared `packages/` types package already planned for Prisma-generated types |

### Differentiators (Competitive Advantage)

Not required for v1, but worth flagging as "do this well, it's cheap and staff will notice."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tenant-aware bot-usage stub fields (message count, last-active, bookings-made — all mocked/stubbed) | PROJECT.md explicitly wants these fields *modeled* even though no real bot exists yet — having the schema/UI shape ready avoids a rework when the bot ships | LOW (since stubbed, no real aggregation logic needed) | Model as nullable/mock fields on the Clinic record now; wiring real data is future-milestone work, not this one |
| Lead → Clinic conversion link (mark a lead as "became a clinic", link the two records) | Closes the loop between marketing funnel and paying customer — useful business signal for staff without needing a full CRM | LOW–MED | Simple foreign key + a "Convert to Clinic" action; valuable because it's cheap once both tables exist, not because staff asked for it explicitly |
| Search/filter across leads and clinics by status/date | Speeds up daily triage once volume grows beyond a glance-able list | LOW | Straightforward query params; don't over-invest in faceted search infra for a table that will hold dozens–hundreds of rows |
| Audit trail (who changed what, timestamp) on clinic status changes and content publish actions | Builds trust for a shared-staff tool where "who approved this price change" matters | MED | Worth flagging for roadmap consideration, but genuinely optional for v1 — a `updatedBy`/`updatedAt` field is a cheap partial version if full audit logging is deferred |

### Anti-Features (Commonly Requested, Often Problematic)

Things that look like "obviously the right call" but are over-built for this milestone's actual scope (small internal team, 2 lead sources, 2 content types, no real bot yet).

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Full sales pipeline / deal stages / forecasting for leads | "It's basically a CRM, so let's build CRM features" | Multi-stage pipelines, deal values, and forecasting are built for sales teams working dozens of leads with revenue attribution — this is 2 form types feeding a staff team that just needs to know "did we follow up?" | A 3–4 value status enum (New/Contacted/Converted/Archived) is the whole feature |
| Granular RBAC / permission matrix across multiple staff roles | Multi-tenant admin best-practice articles universally recommend RBAC | With likely 1–3 staff users total this milestone, a permission matrix is unused complexity that adds auth surface area without adding value; PROJECT.md only asked for one `PlatformAdmin` table, not roles | Single flat role for all `PlatformAdmin` accounts now; add role tiers only when a second distinct staff persona (e.g. "read-only support") actually shows up |
| Real-time SaaS observability dashboard (uptime, MRR/ARR, churn analytics, response-time monitoring) | "Admin dashboards should have analytics" is the loudest pattern in SaaS-admin-panel best-practice content | These are metrics for a live paying customer base with a real payment processor and real bot telemetry — none of which exist this milestone (bot is stubbed, no billing integration) | Skip entirely for v1; the account-status field + stubbed usage fields are the whole "monitoring" story until there's real data to show |
| General-purpose page builder / drag-and-drop CMS / multi-content-type abstraction | "We're building a CMS, so make it extensible for any future content type" | There are exactly 2 content types (blog posts, pricing plans) with one internal editor persona; a generic content-model abstraction (like Strapi/Contentful patterns) adds real complexity for zero near-term payoff | Two purpose-built CRUD screens, one per content type, with fields matching the existing frontend data shapes |
| Content approval/publish workflow (draft → review → approve → publish state machine) | Feels like "proper CMS" behavior | With ~1-3 internal staff editing their own company's marketing copy, there's no separate reviewer role to gate against — an approval chain is process overhead nobody asked for | A simple `published: boolean` flag; staff edit and publish directly |
| Git-based/file CMS (Decap-style markdown-in-repo) | It's the most commonly recommended "minimal CMS" pattern for small marketing sites in the broader ecosystem | PROJECT.md has already decided content is Prisma/DB-backed and edited through `platform-admin`'s own UI — a git-workflow CMS would conflict with that decision and reintroduce a deploy-to-publish step the milestone is explicitly removing | Stick with DB-backed CRUD via the new API, as already decided |
| Webhook/email notification system for new leads | "Staff should be notified the moment a lead comes in" | No notification infrastructure (email service, webhook config) exists yet in the stack, and it's a separate integration concern from persisting + displaying leads | Staff check the Leads list in `platform-admin` directly for v1; notifications are a clean, additive feature for a later milestone |
| Full audit-log system with diff history on every entity | "We might need to know who changed what" | Full audit logging (append-only event store, diffing, UI to browse history) is a meaningfully larger build than the CRUD screens it would sit behind, for a staff team small enough that verbal accountability is currently sufficient | Simple `updatedBy`/`updatedAt` columns if any trace is wanted; skip a dedicated audit subsystem |

## Feature Dependencies

```
PlatformAdmin auth (JWT access+refresh)
    └──requires──> nothing (foundational, build first)

Clinic CRUD + subscription status
    └──requires──> PlatformAdmin auth (endpoints must be protected)

Lead persistence (Contacts/Demo submissions)
    └──requires──> nothing structurally — INDEPENDENT of Clinic records
    └──enhanced by──> Clinic CRUD (optional "convert lead to clinic" link, not required for basic lead capture/triage)

CMS (blog posts + pricing plans)
    └──requires──> PlatformAdmin auth (editing is staff-only)
    └──independent of──> Clinic CRUD and Lead persistence (no data relationship)

Prisma schema + migrations + shared generated types package
    └──requires──> nothing (foundational, must exist before any of the above can persist data)

apps/web Contacts/Demo forms → real submission
    └──requires──> Lead persistence API (currently mocked per PROJECT.md)

apps/web Blog/Pricing pages → real content
    └──requires──> CMS API (currently mocked _data.ts / hardcoded pricing)
```

### Dependency Notes

- **Lead management does NOT require Clinic records first.** This directly answers the downstream question: leads are captured from anonymous public-site visitors before they're ever a clinic — the `Lead` entity stands alone. A `Lead → Clinic` link is a nice-to-have differentiator, not a blocking dependency, and can be added after both entities independently exist.
- **All three feature areas (Clinic monitoring, Lead inbox, CMS) are mutually independent** at the data-model level — they share no foreign keys required for v1 function. They only share the `PlatformAdmin` auth layer as a common prerequisite. This means they can be built/planned as parallel phases once auth + Prisma schema foundations exist, rather than a strict linear chain.
- **Auth must land before or alongside the first protected CRUD surface** — every other feature area needs at least a guard/decorator to protect its endpoints, so `PlatformAdmin` auth is the one true blocking dependency for the milestone.
- **CMS is the only area with an existing frontend contract to preserve:** blog and pricing data shapes already exist as mock data/components in `apps/web` (`modules/blog/_data.ts`, `pricing-cards.tsx`, `comparison-table.tsx`). The Prisma schema for these two entities should mirror those existing shapes closely to minimize both migration risk and frontend rework — and this is also the moment to resolve the pricing-data-duplication issue flagged in the v1.0 code review by making the DB table the single source of truth both `pricing-cards.tsx` and `comparison-table.tsx` read from.

## MVP Definition

### Launch With (v1.1, per PROJECT.md's stated milestone scope)

- [ ] `PlatformAdmin` JWT auth (access + refresh, single flat role) — required to protect everything else
- [ ] Clinic CRUD + status field (active/trial/suspended/cancelled) + plan reference — core "is this account okay?" ops view
- [ ] Clinic bot-usage fields modeled but stubbed/mocked (no real bot data source yet) — avoids later schema rework
- [ ] Lead capture: Contacts + Demo form submissions persist via API (replacing the current simulated-delay mock)
- [ ] Lead list + status (New/Contacted/Converted) + detail view — the whole "inbox" experience
- [ ] Blog post CRUD (DB-backed, replacing `_data.ts`) with fields matching current mock shape
- [ ] Pricing plan CRUD (DB-backed, replacing hardcoded pricing + collapsing the pricing-cards/comparison-table duplication)
- [ ] Prisma schema + migrations, shared generated types package consumable by `server`, `web`, `platform-admin`
- [ ] REST + Swagger API surface; `TanStack Query` on `platform-admin` (and `web` where it now calls real endpoints)

### Add After Validation (v1.x)

- [ ] Lead → Clinic conversion link — once both tables are in real use and staff start asking "did this lead become a customer?"
- [ ] Search/filter on Clinics and Leads lists — once row counts grow past a quick scan
- [ ] `updatedBy`/`updatedAt` lightweight trace fields — if staff ask "who changed this?"
- [ ] Real bot-usage data wiring — once the actual Telegram bot exists (separate future milestone per PROJECT.md)

### Future Consideration (v2+)

- [ ] Role tiers / permission matrix — only once a second distinct staff persona actually needs restricted access
- [ ] Lead notifications (email/webhook on new submission) — separate integration concern, valuable but additive
- [ ] Full audit log with diff history — only if compliance/accountability needs exceed simple trace fields
- [ ] Real SaaS usage/billing analytics (MRR, churn) — only once a real payment processor and real bot telemetry exist
- [ ] `apps/client-admin` (per-clinic self-service panel) — explicitly deferred per PROJECT.md, separate app entirely

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| PlatformAdmin JWT auth | HIGH | MEDIUM | P1 |
| Clinic CRUD + status | HIGH | LOW–MEDIUM | P1 |
| Clinic bot-usage stub fields | MEDIUM | LOW | P1 |
| Lead capture (Contacts+Demo → DB) | HIGH | MEDIUM | P1 |
| Lead list + status tracking | HIGH | LOW | P1 |
| Blog CRUD | HIGH | MEDIUM | P1 |
| Pricing plan CRUD | HIGH | MEDIUM | P1 |
| Lead → Clinic link | MEDIUM | LOW | P2 |
| List search/filter | MEDIUM | LOW | P2 |
| Basic trace fields (updatedBy/At) | LOW–MEDIUM | LOW | P2 |
| Role tiers/RBAC | LOW (at current staff size) | MEDIUM | P3 |
| Lead notifications | MEDIUM | MEDIUM | P3 |
| Full audit log | LOW (at current staff size) | HIGH | P3 |
| Real usage/billing analytics | LOW (no real data source yet) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (matches PROJECT.md's stated v1.1 "Active" requirements)
- P2: Should have, add when possible / when triggered by real usage
- P3: Nice to have, explicitly future-milestone per PROJECT.md's own deferral list

## Competitor / Pattern Analysis

Rather than named competitor products (this is an internal tool, not a market-facing feature), the relevant comparison is against common *patterns* in the ecosystem:

| Pattern | How it's commonly done | Why it doesn't fully apply here | Our approach |
|---------|------------------------|----------------------------------|--------------|
| Multi-tenant SaaS admin (e.g. Retool/Django-admin-style internal tools) | Tenant-aware views, RBAC matrix, usage/billing analytics dashboards | Built for products with real usage telemetry and paying-customer volume; denta-bot has neither yet (bot stubbed, handful of clinics) | Borrow the "tenant-aware view + status field" shape, skip the analytics/RBAC layers until there's real data/team size to justify them |
| Lead capture ecosystem (nocrm.io, Pipeline CRM, "Pre-CRM inbox" tools) | Form submission → tracked lead with status → pipeline/deal stages → CRM handoff | Built for sales teams with volume and multi-stage deal cycles; here it's 2 form types feeding a small staff team doing manual outreach | Borrow the "tracked lead + status" shape, skip pipeline/deal-stage/forecasting machinery |
| Minimal CMS ecosystem (Decap/git-based CMS vs. hosted CMS like Ghost/HubSpot) | Either git-committed content files or a full hosted CMS product | PROJECT.md already committed to Prisma/DB-backed content edited via the internal `platform-admin` UI, not a separate CMS product or git workflow | Two purpose-built CRUD screens against Prisma tables, matching existing frontend data shapes exactly |

## Sources

- [How to Build an Admin Panel for a SaaS Product | Sequenzy](https://www.sequenzy.com/blog/how-to-build-saas-admin-panel)
- [OPS 1: How do you effectively monitor and manage the operational health of a multi-tenant environment? (AWS Well-Architected SaaS Lens)](https://wa.aws.amazon.com/saas.question.OPS_1.en.html)
- [SaaS Monitoring: Metrics, Tools, And Best Practices Explained | UptimeRobot](https://uptimerobot.com/knowledge-hub/monitoring/saas-monitoring-how-to-monitor-saas-applications-effectively/)
- [The Best Lead Management Tools That Capture Leads from Web Forms | nocrm.io](https://www.nocrm.io/blog/best-lead-management-tools-to-capture-leads-from-web-forms)
- [Self-Hosted Lead Capture System | Forms, Inbox & Webhooks | WCKD Forms](https://wckd.marketing/products/wckd-forms/)
- [Formgrid: AI Form Builder with Lead Pipeline and Smart Inbox](https://formgrid.dev/)
- [18 best CMS tools in 2026 | Guideflow](https://www.guideflow.com/blog/cms-tools)
- [7 best content management system (CMS) examples & how to choose yours | HubSpot](https://blog.hubspot.com/website/best-cms-systems)
- [How to Build a SaaS Admin Panel: Features, Architecture, and Scope | Yaro Labs](https://yaro-labs.com/blog/saas-admin-panel)
- [Enterprise Low Code Dashboard Failures | Medium](https://medium.com/@aleyacyrus/enterprise-low-code-dashboard-failures-what-happens-to-your-low-code-app-when-the-engineer-who-3d775fc5ac03)
- [NestJS Authentication with JWT, Refresh Tokens, and RBAC: The Complete Guide (2026) | EthioDev](https://etdevhub.com/article/nestjs-authentication-jwt-refresh-tokens-rbac-complete-guide-2026)
- [NestJS JWT Authentication with Refresh Tokens Complete Guide | Elvis Duru](https://www.elvisduru.com/blog/nestjs-jwt-authentication-refresh-token)
- Internal: `/Users/artemdanko/Developer/denta-bot/.planning/PROJECT.md` (milestone scope, existing mock-data shapes, decisions log)

Confidence note: findings are WebSearch-sourced (general ecosystem/pattern knowledge, not vendor/official docs), cross-corroborated across multiple independent sources per topic — treated as MEDIUM confidence per the project's source-hierarchy classification. No claim here is presented as vendor-authoritative; all are pattern observations checked against this specific project's already-stated PROJECT.md decisions.

---
*Feature research for: internal SaaS-ops admin dashboard (platform-admin) — clinic monitoring, lead inbox, lightweight CMS*
*Researched: 2026-08-10*
