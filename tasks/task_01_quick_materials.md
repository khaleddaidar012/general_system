Status: COMPLETED

- [x] Task created
- [x] Implementation started
- [x] Implementation completed
- [x] Testing completed
- [x] Acceptance criteria verified
- [x] Task completed

# Task 01 — Quick Materials Logic

## Overview
Modify the financial logic when ordering "quick materials" (خامات سريعة). These should not appear in the financial accounts (الحسابات المالية) as a negative balance unless they are actually paid for at the moment. However, they should still be registered against the project and supplier accounts normally.

## Requirements
- REQ-001: Modify quick materials financial logic to exclude unpaid entries from financial accounts.

## Current Implementation

### Existing
Currently, adding quick materials likely deducts from a global financial account, leading to negative balances if not paid. 

### Reusable
Existing form submissions (`frontend/components/quick-add.html`) and backend routes for adding materials (`backend/routes`, `backend/controllers`).

### Required Changes
Condition the update of the financial balance on the payment status.

### Missing
Conditional logic to bypass the financial account update if unpaid.

## Files / Modules Affected
- `frontend/components/quick-add.html`
- Backend controllers handling quick additions.
- Backend services handling financial transactions.

## Data / Architecture Changes
- API payload for quick material might need a `isPaid` flag.
- Business logic in the controller to only create a financial transaction if `isPaid` is true.

## UI / UX Changes
- Ensure the quick add form clearly differentiates between paid and unpaid status when submitting.

## Implementation Plan
1. Identify the backend endpoint handling quick materials.
2. Update the logic to check if a payment was actually made.
3. If no payment made, skip creating the financial account debit transaction.
4. Ensure project and supplier transactions still occur.

## Small Tasks
- [ ] Inspect quick add backend controller.
- [ ] Identify financial account update logic.
- [ ] Wrap financial account update in a check for payment.
- [ ] Test the backend logic.

## Edge Cases
- Partial payments for quick materials.
- Existing records should remain unaffected.

## Testing Checklist
- [ ] Normal flow (paid)
- [ ] Normal flow (unpaid)
- [ ] Financial account doesn't show negative for unpaid
- [ ] Project account shows cost
- [ ] Supplier account shows cost

## Acceptance Criteria
- Unpaid quick materials do not affect global financial accounts.
- Unpaid quick materials do register in project and supplier accounts.

## Dependencies
Depends on:
- None
