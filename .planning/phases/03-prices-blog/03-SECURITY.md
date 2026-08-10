---
phase: 3
slug: 03-prices-blog
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-10
---

# Phase 3 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| None crossing untrusted input (03-01 /prices) | Every artifact renders static, hardcoded mock data (plans/comparisonFeatures/faqs arrays) or purely local UI state (`isYearly` boolean); no form submission, no external API call, no persisted user input | None — mock data only |
| Client search input → in-memory array filter (03-02 /blog) | User-typed text in `blog-filters.tsx`'s search field is used only as a `.includes()` substring predicate over an in-memory `posts` array; no server round-trip, no persistence, no query construction | Client-side string, never leaves the browser |
| Unknown slug URL param → `getPostBySlug` lookup → `notFound()` branch (03-02 /blog/[slug]) | `/blog/[slug]`'s `slug` route param is untrusted input; used only as a lookup key, never rendered back into the page | URL segment → lookup key only |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-01-SC | Tampering | npm/pnpm installs | low | accept | No new packages installed by 03-01 — `PremiumSwitch`/`PremiumBadge` built on already-vetted `radix-ui`/`class-variance-authority`/`@phosphor-icons/react`, confirmed present in `apps/web/package.json` from Phase 01.1's Package Legitimacy Gate | closed |
| T-03-01-01 | Information Disclosure | `pricing-cards.tsx` / `comparison-table.tsx` static data | low | accept | Pricing tiers, features, and FAQ content are intentionally public marketing copy — no sensitive or user-specific data rendered | closed |
| T-03-01-02 | Tampering | `PremiumSwitch` billing-toggle state | low | accept | `isYearly` is ephemeral client-only React state (not persisted, not submitted to any endpoint) — only changes which static price string displays | closed |
| T-03-02-SC | Tampering | npm/pnpm installs | low | accept | No new packages installed by 03-02 — reuses the same already-vetted dependencies as 03-01; no Package Legitimacy Gate checkpoint needed | closed |
| T-03-02-01 | Injection (Reflected XSS) | `blog-filters.tsx` search input | low | accept | Search string used only as a `.includes()` substring filter, echoed back solely into a controlled `<input value={search}>` — never interpolated into markup or passed to `dangerouslySetInnerHTML` | closed |
| T-03-02-02 | Tampering | `modules/blog/_data.ts` body content blocks | low | mitigate | Body blocks (paragraph/heading/list/quote) are static, hardcoded literals authored at build time; `post-body.tsx`'s renderer maps `block.text`/`block.items` through plain JSX children only, never `dangerouslySetInnerHTML` — verified present in the executed implementation (03-02-SUMMARY.md `post-body.tsx`), closing off any future injection path if body content is ever externalized to a CMS | closed |
| T-03-02-03 | Information Disclosure | `blog/[slug]/page.tsx` `notFound()` branch | low | accept | Unmatched `slug` value from the URL is never echoed into the rendered Not Found UI — `apps/web/app/not-found.tsx` has fixed copy with no interpolation of the attempted slug | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on (high) count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

**Short-circuit path taken:** `threats_open: 0` at plan-authoring time (both 03-01-PLAN.md and 03-02-PLAN.md carry a complete `<threat_model>` block, `register_authored_at_plan_time: true`) and `asvs_level == 1` → verified directly from plan-time threat register per `secure-phase.md` §3's L1 short-circuit rule; no auditor agent spawn required. All 7 threats are severity `low`, well below the `high` block threshold, and each carries a documented accept/mitigate disposition with concrete rationale.

---

## Accepted Risks Log

No accepted risks beyond the dispositions already documented in the Threat Register above (all `accept`-disposition threats are low-severity, non-actionable for a static/mock-data marketing site with no auth, no persistence, and no external API).

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-10 | 7 | 7 | 0 | Claude (orchestrator, L1 short-circuit — plan-time register) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-10
