---
phase: 01
slug: theme-site-shell
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-08
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| build-time CSS token compile → runtime browser styling | Tailwind v4 resolves `--brand`/token values at build time from a static file; no user input crosses this boundary | design tokens only, no user data |
| shared `@repo/ui` package → 3 consuming apps (web/docs/admin-panel) | A `theme.css` edit propagates to `apps/docs` and `apps/admin-panel` at their next build/dev cycle, not just `apps/web` | CSS tokens |
| Browser → external anchor targets (Telegram/Instagram, footer) | User-initiated navigation to a third-party origin via `target="_blank"` | none (outbound link only) |
| Browser `localStorage` (next-themes) → `<html>` class attribute | Client-only state, no server round-trip, no user-supplied free text | theme preference enum |
| Any URL → `app/not-found.tsx` | Unauthenticated, unvalidated path input reaching the Next.js router (framework-level, not custom code) | URL path only |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-01 | Tampering (unintended cross-app regression) | `packages/ui/styles/theme.css` consumed by `apps/docs`/`apps/admin-panel` | medium | mitigate | Manual spot-check that `apps/docs`/`apps/admin-panel` still render coherently after the token swap — confirmed via UAT test 3 (both apps visually coherent, dev server checked) | closed |
| T-01-02 | Elevation of Privilege / Information Disclosure | N/A — no runtime code or user input path introduced by `theme.css`/`sonner.tsx` changes | low | accept | `theme.css` is a static build-time asset; `sonner.tsx`'s only change is a client-boundary directive, no logic change | closed |
| T-01-03 | Tampering / Spoofing (reverse tabnabbing) | `apps/web/components/footer.tsx` (Telegram/Instagram anchors) | medium | mitigate | `rel="noopener noreferrer"` present on both external anchors — verified via `grep -c` (2/2) | closed |
| T-01-04 | Tampering (theme value) | `next-themes` `localStorage` `'theme'` key | low | accept | `next-themes` only reads/writes its own constrained enum (`light`/`dark`/`system`), never renders the stored value as HTML — no injection surface | closed |
| T-01-05 | Spoofing (silent redirect masking a bad URL) | `apps/web/app/not-found.tsx` | low | mitigate | No client-side redirect/`useRouter()`/`redirect(` in the file — verified via grep (0 matches); user always sees 404 content, navigates via explicit button click | closed |
| T-01-SC | Tampering (supply chain) | npm/pnpm installs across both plans | high | accept | No new packages installed this phase — `packages/ui/package.json` unchanged since phase start (verified via `git diff`); `apps/web/package.json`'s `next-themes`/`lucide-react` entries promote already-locked transitive deps to direct deps, no new install occurred | closed |

*Status: open · closed · open — below `high` threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` (`high`) count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-01-02 | T-01-02 | Static build-time CSS asset + a client-boundary-only directive change carry no runtime attack surface | Plan 01-01 threat model | 2026-08-08 |
| R-01-04 | T-01-04 | `next-themes` constrains its own storage key to a fixed enum, never renders it as HTML | Plan 01-02 threat model | 2026-08-08 |
| R-01-SC | T-01-SC | Zero new package installs this phase, confirmed via lockfile/manifest diff | Plan 01-01 + 01-02 threat models | 2026-08-08 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-08 | 6 | 6 | 0 | Claude (orchestrator, L1 grep-depth per ASVS level 1 short-circuit) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-08
