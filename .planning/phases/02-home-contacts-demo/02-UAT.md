---
status: testing
phase: 02-home-contacts-demo
source: [02-VERIFICATION.md]
started: 2026-08-09T20:20:00Z
updated: 2026-08-09T20:20:00Z
---

## Current Test

number: 1
name: FAQ accordion expand/collapse
expected: |
  Visit /contacts, click each of the 8 FAQ items to expand, then click again to collapse.
  Each item's answer appears/disappears smoothly; only the 8 verbatim Q/A pairs from the design archive are shown.
awaiting: user response

## Tests

### 1. FAQ accordion expand/collapse
expected: Visit /contacts, click each of the 8 FAQ items to expand, then click again to collapse. Each item's answer appears/disappears smoothly; only the 8 verbatim Q/A pairs from the design archive are shown.
result: [pending]

### 2. Demo chat scenario playback, including mid-playback retrigger
expected: Visit /demo, click each of the 3 scenario buttons in turn (no retriggering) to confirm pacing/typing-indicator/auto-scroll. Then click a scenario button, and within roughly 400ms of a bot-message tick, click a different scenario button — confirm the chat resets cleanly with no stale message from the abandoned scenario appended afterward. Messages appear at an 800ms pace with a ~400ms typing indicator before each bot message; the chat auto-scrolls smoothly to the newest message; rapid retriggering never leaks a stale message into the freshly-reset conversation.
result: [pending]

### 3. Admin tab dashboard animations
expected: Visit /demo, switch to the Admin tab, observe the Dashboard section on first display, then click through all 5 sidebar sections. Stat numbers count up from 0; bar-chart bars grow bottom-up with a visible 80ms-per-bar stagger; each sidebar switch fades in over 150ms.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
