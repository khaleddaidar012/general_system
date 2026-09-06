Status: COMPLETED

- [x] Task created
- [x] Implementation started
- [x] Implementation completed
- [x] Testing completed
- [x] Acceptance criteria verified
- [x] Task completed

# Task 05 — Statement Account Filters

## Overview
When generating a statement of account for suppliers or contractors, add the ability to filter by one or more specific projects to see only the relevant transactions.

## Requirements
- REQ-009: Add a multi-project filter to supplier/contractor statements of account.

## Current Implementation

### Existing
`frontend/pages/statement.html` (or similar) likely has filters for date ranges, but lacks a project filter. Backend routes return all transactions for the supplier/contractor.

### Reusable
Existing filtering logic (dates). Existing UI for dropdowns.

### Required Changes
- Add a multi-select project dropdown in the frontend.
- Pass selected project IDs to the backend.
- Update backend queries to filter by the `project_id` array if provided.

### Missing
- Multi-select UI for projects.
- Backend query condition for `project_id IN (...)`.

## Files / Modules Affected
- `frontend/pages/statement.html` (or `suppliers.html`/`contractors.html`)
- Backend controller fetching statements.
- Backend database query logic.

## Data / Architecture Changes
- API endpoint needs to accept an array of project IDs.

## UI / UX Changes
- A new multi-select dropdown for projects in the filter section.

## Implementation Plan
1. Add multi-select dropdown to the statement filter UI.
2. Populate dropdown with available projects.
3. Update frontend API call to include selected project IDs.
4. Update backend query to filter transactions based on the provided IDs.

## Small Tasks
- [ ] Add UI multi-select.
- [ ] Fetch projects for dropdown.
- [ ] Update API request logic.
- [ ] Update backend query.
- [ ] Test filtering.

## Edge Cases
- No projects selected (should show all).
- Project deleted but transactions exist.

## Testing Checklist
- [ ] Filter by 1 project.
- [ ] Filter by multiple projects.
- [ ] No filter (shows all).

## Acceptance Criteria
- Statement only shows transactions associated with the selected projects when the filter is used.

## Dependencies
Depends on:
- None
