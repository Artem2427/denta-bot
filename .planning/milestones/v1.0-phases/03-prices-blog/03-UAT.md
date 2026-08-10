---
status: complete
phase: 03-prices-blog
source: [03-VERIFICATION.md]
started: 2026-08-10T07:53:00.000Z
updated: 2026-08-10T08:07:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. /prices end-to-end visual/interactive check
expected: Visit /prices in a dev server. Toggle the billing switch (Щомісяця/Щороку) and confirm all 3 tier prices switch smoothly without a reload; confirm the Бізнес card visually shows the teal border + "Популярний" badge and Старт/Клініка do not; expand/collapse each of the 7 FAQ accordion items; click each "Обрати план" CTA and the closing "Напишіть нам" CTA and confirm they navigate to /contacts.
result: pass

### 2. /blog end-to-end filter + content check
expected: Visit /blog. Type a search string that matches nothing (e.g. "zzz") and confirm the empty-state message renders; type a string that matches a real post title/excerpt and confirm the grid narrows; click each category filter button and confirm exact-category narrowing; clear all filters and confirm the original 5-post order returns; confirm the featured post card never duplicates into the grid or moves; confirm "Завантажити ще" does nothing when clicked (by design, D-03). Then open 3 different post detail pages (including the featured post) and confirm real, distinct body content renders, the CTA card buttons route to /demo and /contacts respectively, and the "Схожі статті" related-posts links work.
result: pass

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
