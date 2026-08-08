# Phase 2: Home, Contacts & Demo - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-08
**Phase:** 2-Home, Contacts & Demo
**Areas discussed:** Images, Contacts form validation

---

## Images (Home page hero + testimonial)

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as Unsplash hotlinks | Use next/image with the same URLs; requires adding images.unsplash.com to next.config.js remotePatterns. Matches the design exactly. | ✓ |
| Replace with local placeholder assets | Download/bundle static images in the repo instead of hotlinking. | |
| Drop images, text/icon-only | Skip images entirely this phase. | |

**User's choice:** Keep as Unsplash hotlinks
**Notes:** Matches PROJECT.md's "render faithfully" core value; no asset bundling work needed this phase.

---

## Contacts Form Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Format-validated | zod regex accepts either a phone pattern or an email pattern, rejects garbage with a specific inline error. Name: required, min 2 chars. Message: optional. | ✓ |
| Presence-only | Just require non-empty (matches archive 1:1) — no format checking. | |

**User's choice:** Format-validated
**Notes:** Matches CONT-01's requirement for inline field errors on invalid input; the archive's own form has zero real validation, so this is genuinely new behavior, not a straight port.

---

## Claude's Discretion

- Exact `zod` regex patterns for phone/email validation
- How to port `ImageWithFallback` (Figma-export-specific `<img>` error-fallback wrapper) — replicate with `next/image`'s `onError` or drop it
- Same-page anchor scroll implementation for "Дізнатись більше" → `#features`
- Whether to add a cleanup guard for the demo chat's `setInterval` typing playback when a new scenario is triggered mid-animation

## Deferred Ideas

None — discussion stayed within phase scope.
