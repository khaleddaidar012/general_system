Status: COMPLETED

- [x] Task created
- [x] Implementation started
- [x] Implementation completed
- [x] Testing completed
- [x] Acceptance criteria verified
- [x] Task completed

# Task 03 — Contractor Display Updates

## Overview
When viewing a project or adding quick money, selecting a contractor should display the contractor's name in parentheses alongside their role, e.g., "مقاول محارة (خالد دعيدر)".

## Requirements
- REQ-007: Show contractor name in parentheses when selecting a contractor.

## Current Implementation

### Existing
Contractor dropdowns in `frontend/pages/project.html` and `frontend/components/quick-add.html` likely just show the role or just the name.

### Reusable
Existing dropdown components and API endpoints that fetch contractors.

### Required Changes
Modify the string formatting in the frontend when rendering the select options or displaying the contractor.

### Missing
String interpolation combining role and name.

## Files / Modules Affected
- `frontend/components/quick-add.html`
- `frontend/pages/project.html`
- Any JS populating these dropdowns.

## Data / Architecture Changes
- None expected. Just frontend display logic.

## UI / UX Changes
- Dropdown options will be wider and more descriptive.

## Implementation Plan
1. Locate where contractors are fetched and populated into dropdowns.
2. Change the text content to `${contractor.role} (${contractor.name})` or similar based on existing properties.

## Small Tasks
- [ ] Find contractor dropdown population logic.
- [ ] Update string format.
- [ ] Verify in quick add modal.
- [ ] Verify in project page.

## Edge Cases
- Missing role or missing name (handle gracefully).

## Testing Checklist
- [ ] Quick add dropdown.
- [ ] Project page dropdown.

## Acceptance Criteria
- Contractor appears as Role (Name) in dropdowns.

## Dependencies
Depends on:
- None
