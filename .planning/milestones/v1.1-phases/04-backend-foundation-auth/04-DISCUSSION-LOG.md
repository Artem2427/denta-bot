# Phase 4: Backend Foundation & Auth - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-10
**Phase:** 4-Backend Foundation & Auth
**Areas discussed:** Local DB/environment setup, Auth token transport & domain topology, Prisma schema specifics for not-yet-CRUD'd entities, Bootstrapping the first PlatformAdmin

---

## Local DB / Environment Setup

User pre-answered the general direction via free text before the formal question ("База даних PostgresSQL, local docker compose") — confirmed and refined with follow-up questions.

| Question | Option | Selected |
|---|---|---|
| Postgres version | Postgres 17 (Recommended) | ✓ |
| | Postgres 16 | |
| docker-compose.yml location | Repo root (Recommended) | ✓ |
| | `packages/db/docker-compose.yml` | |
| DB credentials | Simple dev defaults, committed (Recommended) | ✓ |
| | Placeholder creds user fills in | |
| Extra services | Just Postgres (Recommended) | ✓ |
| | Postgres + pgAdmin | |

**Notes:** Simple, local-only setup — no docker-compose.yml or .env existed in the repo before this. No prod DB decision made here (out of scope for this discussion).

---

## Auth Token Transport & Domain Topology

STATE.md flagged production domain topology as an open blocker before Phase 4 could finalize refresh-cookie config — resolved (provisionally) in this discussion.

| Question | Option | Selected |
|---|---|---|
| Domain topology | Shared parent domain, subdomains (Recommended) | ✓ |
| | Fully separate/unrelated domains | |
| | Not decided yet — safe default, revisit later | |
| Access token storage | In memory only (Recommended) | ✓ |
| | localStorage | |
| Token TTLs | 15min access / 7-day refresh (Recommended) | ✓ |
| | 30min access / 30-day refresh | |
| CORS origins | apps/web + apps/platform-admin dev origins (Recommended) | ✓ |
| | apps/platform-admin only for now | |

**Notes:** No production hosting is actually decided yet — the subdomain topology is an assumption to design against, with the cookie `Domain` kept env-configurable so the real decision (whenever made) doesn't require touching auth code.

---

## Prisma Schema Specifics (not-yet-CRUD'd entities)

Migration must create Clinic/Lead/BlogPost/PricingPlan tables in Phase 4 even though their CRUD modules land in Phase 5 — field shapes needed to be pinned down now.

| Question | Option | Selected |
|---|---|---|
| Clinic status values | trial / active / suspended / cancelled (Recommended) | ✓ |
| | active / inactive only | |
| Clinic.plan relation | Independent string/enum field (Recommended) | ✓ |
| | Foreign key to PricingPlan | |
| Bot-usage stub fields | messageCount, bookingsCount, lastActiveAt (Recommended) | ✓ |
| | Just lastActiveAt | |
| BlogPost shape | Mirror existing Post type + published flag (Recommended) | ✓ |
| | Simplify body to markdown string | |
| PricingPlan shape | Mirror existing plan shape + published/sortOrder (Recommended) | ✓ |
| | Store prices as integer cents | |
| Lead source/status enums | contacts\|demo / new\|contacted\|converted (Recommended) | ✓ |
| | Add a 4th status ("rejected"/"lost") | |

**Notes:** Clinic.plan deliberately decoupled from the CMS-editable PricingPlan table to avoid coupling billing state to marketing-content edits. BlogPost/PricingPlan shapes chosen to make the Phase 6 mock-to-real swap a field-for-field mapping.

---

## Bootstrapping the First PlatformAdmin

| Question | Option | Selected |
|---|---|---|
| First-account creation | Prisma seed script, env-var credentials (Recommended) | ✓ |
| | Hardcoded dev seed | |
| Additional admin creation in Phase 4 | No — out of scope (Recommended) | ✓ |
| | Yes — add a minimal create-admin endpoint | |

**Notes:** No requirement in REQUIREMENTS.md covers admin creation beyond login/refresh/logout — kept to the smallest thing that unblocks development (a re-runnable seed script).

---

## Claude's Discretion

- Exact Prisma field types/nullability beyond what's specified, index choices, migration naming
- `packages/db` internal file layout and generated-client `output` path (follows research recommendation unless a blocker surfaces)

## Deferred Ideas

- Rate limiting / spam protection on the future public `POST /leads` endpoint (doesn't exist until Phase 5/6)
- Create-admin / self-service PlatformAdmin invite flow (no requirement in v1.1)
- Role tiers / RBAC (already out of scope per REQUIREMENTS.md)
