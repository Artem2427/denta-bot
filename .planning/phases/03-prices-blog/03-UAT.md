---
status: testing
phase: 03-prices-blog
source: [03-VERIFICATION.md]
started: 2026-08-10T07:53:00.000Z
updated: 2026-08-10T07:53:00.000Z
---

## Current Test

number: 1
name: /prices end-to-end visual/interactive check
expected: |
  Billing toggle updates prices live with no console errors; Бізнес card is visually distinct
  (teal border + "Популярний" badge, Старт/Клініка do not show it); all 7 FAQ items expand/collapse
  via Radix; every "Обрати план" CTA and the closing "Напишіть нам" CTA navigate to /contacts.
awaiting: user response

## Tests

### 1. /prices end-to-end visual/interactive check
expected: Visit /prices in a dev server. Toggle the billing switch (Щомісяця/Щороку) and confirm all 3 tier prices switch smoothly without a reload; confirm the Бізнес card visually shows the teal border + "Популярний" badge and Старт/Клініка do not; expand/collapse each of the 7 FAQ accordion items; click each "Обрати план" CTA and the closing "Напишіть нам" CTA and confirm they navigate to /contacts.
result: [pending]

### 2. /blog end-to-end filter + content check
expected: Visit /blog. Type a search string that matches nothing (e.g. "zzz") and confirm the empty-state message renders; type a string that matches a real post title/excerpt and confirm the grid narrows; click each category filter button and confirm exact-category narrowing; clear all filters and confirm the original 5-post order returns; confirm the featured post card never duplicates into the grid or moves; confirm "Завантажити ще" does nothing when clicked (by design, D-03). Then open 3 different post detail pages (including the featured post) and confirm real, distinct body content renders, the CTA card buttons route to /demo and /contacts respectively, and the "Схожі статті" related-posts links work.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
