---
status: testing
phase: 06-apps-web-integration
source: [06-VERIFICATION.md]
started: 2026-08-15T12:35:00Z
updated: 2026-08-15T12:35:00Z
---

## Current Test

number: 1
name: Submit the Contacts form with a valid name+email and observe the button label/disabled state while the request is in flight, then confirm the success panel appears
expected: |
  Button reads 'Надсилаємо…' and is disabled during the request; on success the form is replaced by the 'Дякуємо!' panel
awaiting: user response

## Tests

### 1. Submit the Contacts form (/contacts) with a valid name+email and observe the button label/disabled state while the request is in flight, then confirm the success panel appears
expected: Button reads 'Надсилаємо…' and is disabled during the request; on success the form is replaced by the 'Дякуємо!' panel
result: [pending]

### 2. Trigger a 429 by submitting the Contacts or Demo form 6 times within a minute and observe the toast copy
expected: Distinct 'Забагато спроб. Зачекайте хвилину і спробуйте ще раз.' toast, field values preserved, button re-enabled
result: [pending]

### 3. Open '/demo', click 'Замовити демо', confirm PremiumDialog opens/closes correctly (ESC, overlay click, close button) and DemoLeadForm resets on reopen
expected: Modal opens centered, max-w-md, close button has visible focus/labeled 'Закрити'; reopening after a successful submit shows the pre-submit form again (unmount-remount reset)
result: [pending]

### 4. View /blog with 0, 1, and 2+ published posts (seed/unseed via platform-admin) and confirm the empty-state, hero-only, and hero+grid layouts render as specified
expected: 0 posts -> 'Матеріалів поки немає' block, no hero/grid; 1 post -> hero only, no grid, no 'nothing found' filter message; 2+ posts -> hero + filterable grid with line-clamped cards
result: [pending]

### 5. View /prices with 0, 1, 2, and 3+ published plans and confirm the empty-state CTA, card grid (centered/2-col/3-col), and comparison table (hidden below 2 plans) render as specified
expected: 0 plans -> 'Тарифи тимчасово недоступні' + 'Зв'язатися з нами' CTA, no cards/table; 1 -> single centered card, no table; 2 -> 2-col grid + table; 3+ -> 3-col grid + table with a row per distinct feature string
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
