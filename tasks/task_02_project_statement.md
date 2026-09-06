Status: COMPLETED

- [x] Task created
- [x] Implementation started
- [x] Implementation completed
- [x] Testing completed
- [x] Acceptance criteria verified
- [x] Task completed

# Task 02 — Project Statement Enhancements

## Overview
Update the Project Statement (كشف حساب المشروع) to remove the concept of "Units", display only total material values without quantities, allow adding notes for labor costs, and implement complex supervision percentage logic (including general supervision and specific client-bought material supervision).

## Requirements
- REQ-002: Remove the "Unit" (الوحدة) concept from the project statement.
- REQ-003: Show total materials only, without quantity/count.
- REQ-004: Add a place for a note/remark next to specific labor costs (مصنعيه).
- REQ-005: Add general supervision (الاشراف) percentage at the bottom, applied to the sum of materials and labor.
- REQ-006: Add supervision percentage for specific materials bought by the client. This specific supervision adds to the total materials but is excluded from the general supervision calculation.

## Current Implementation

### Existing
`frontend/pages/statement.html` (or `project.html`) renders the project statement. It likely includes columns for unit, quantity, and calculates a simple total. 

### Reusable
Existing table layout and PDF generation logic (if present).

### Required Changes
- Remove "Unit" and "Quantity" columns for materials.
- Add "Notes" field to labor entries.
- Add calculation logic for specific material supervision.
- Add calculation logic for general supervision.

### Missing
- Supervision percentage input fields.
- Logic to separate client-bought supervision from general supervision base.

## Files / Modules Affected
- `frontend/pages/statement.html`
- `frontend/pages/project.html`
- Backend statement generation endpoint/logic.
- Database schema (possibly to store supervision percentages).

## Data / Architecture Changes
- Project model or statement generation logic might need to accept and store `general_supervision_percentage` and `client_material_supervision_percentage`.

## UI / UX Changes
- Table columns will change.
- New input fields for supervision percentages at the bottom.
- New checkbox/toggle for "Purchased by Client" with a percentage input.

## Implementation Plan
1. Update UI to remove unit/qty columns for materials.
2. Add "Notes" input for labor in the frontend form and backend schema.
3. Update calculation logic on frontend and backend to handle the two types of supervision correctly.
4. Ensure the final total reflects `(Materials + Client Bought Supervision) + Labor + (General Supervision % * (Materials + Labor))`.

## Small Tasks
- [ ] Remove "Unit" column from UI.
- [ ] Remove "Quantity" column for materials from UI.
- [ ] Add "Notes" field for labor.
- [ ] Implement UI for client-bought material supervision.
- [ ] Implement UI for general supervision.
- [ ] Update backend calculations.
- [ ] Verify PDF/Print layout if applicable.

## Edge Cases
- 0% supervision.
- No client-bought materials.

## Testing Checklist
- [ ] Verify unit/qty are gone.
- [ ] Verify labor notes save and display.
- [ ] Verify specific supervision calculation.
- [ ] Verify general supervision calculation.
- [ ] Verify they don't double count.

## Acceptance Criteria
- Unit and quantity are not visible.
- Notes can be added to labor.
- Supervision logic matches REQ-005 and REQ-006 exactly.

## Dependencies
Depends on:
- None
