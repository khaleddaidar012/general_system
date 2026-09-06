# Task Overview

## Project Goal
Implement various improvements to the financial and project management system, including logic for quick materials, project statement updates (removing units, adding supervision percentages), UI improvements for displaying contractor names, fixing cost summary bugs, adding multi-project filters in statements, and finally resetting data and deploying.

## Requirements Coverage

| Requirement | Description | Task |
|---|---|---|
| REQ-001 | Quick materials not in financial accounts unless paid. | Task 01 |
| REQ-002 | Remove "Unit" from project statement. | Task 02 |
| REQ-003 | Show total materials without count in project statement. | Task 02 |
| REQ-004 | Add notes for labor costs. | Task 02 |
| REQ-005 | Supervision percentage on grand total. | Task 02 |
| REQ-006 | Supervision percentage on client-bought materials. | Task 02 |
| REQ-007 | Show contractor name in parentheses. | Task 03 |
| REQ-008 | Total Cost summary must update correctly. | Task 04 |
| REQ-009 | Multi-project filter in supplier/contractor statements. | Task 05 |
| REQ-010 | Reset all accounts and projects. | Task 06 |
| REQ-011 | Delete all data on database. | Task 06 |
| REQ-012 | Upload version with full data. | Task 06 |

## Execution Order

- [ ] Task 01 — Quick Materials Logic
- [ ] Task 02 — Project Statement Enhancements
- [ ] Task 03 — Contractor Display Updates
- [ ] Task 04 — Cost Summary Fixes
- [ ] Task 05 — Statement Account Filters
- [ ] Task 06 — Data Reset and Deployment

## Dependencies

Task 01
Task 02
Task 03
Task 04
Task 05
  ↓
Task 06

Tasks 01 through 05 can largely be executed independently as they touch different parts of the frontend and backend logic. Task 06 must be executed last as it involves clearing the database and deploying the final changes.

## Recommended Implementation Sequence
1. Task 01: Core logic change for materials.
2. Task 02 & Task 04: UI and calculation logic on statements and summaries.
3. Task 03 & Task 05: UI enhancements and filters.
4. Task 06: Final reset and deployment.
This order ensures functional logic is solid before moving to presentation and finally deployment.

## Global Acceptance Criteria
- Financial accounts accurately reflect only paid quick materials.
- Project statements show correct totals and supervision calculations without "Units".
- Total costs update dynamically.
- Data can be reset cleanly.

## Final Testing

- [ ] Verify every requirement from `needs.md`.
- [ ] Verify requirement traceability.
- [ ] Verify data integrity.
- [ ] Verify API behavior.
- [ ] Verify UI/UX.
- [ ] Verify responsive behavior.
- [ ] Verify authentication/permissions.
- [ ] Verify existing functionality.
- [ ] Run full regression testing.
