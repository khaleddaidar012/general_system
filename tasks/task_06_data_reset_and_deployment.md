Status: COMPLETED

- [x] Task created
- [x] Implementation started
- [x] Implementation completed
- [x] Testing completed
- [x] Acceptance criteria verified
- [x] Task completed

# Task 06 — Data Reset and Deployment

## Overview
Perform a complete reset of all accounts, projects, and database data, and prepare the final version for deployment.

## Requirements
- REQ-010: Reset all accounts and projects.
- REQ-011: Delete all data on the database.
- REQ-012: Upload the new version with a clean database.

## Current Implementation

### Existing
The database currently holds test or old data.

### Reusable
Deployment scripts (`wrangler.toml`, `package.json` scripts).
Database schema creation scripts/migrations.

### Required Changes
- Truncate all tables or drop and recreate the database schema.
- Deploy the frontend and backend.

### Missing
- A secure script to clear the database (if not using migration drops).

## Files / Modules Affected
- Database (SQLite/D1/etc.)
- Deployment configuration.

## Data / Architecture Changes
- Complete data wipe. Schema remains intact.

## UI / UX Changes
- None directly, but the app will appear empty on first load post-deployment.

## Implementation Plan
1. Ensure all other tasks (Task 01-05) are completed and tested locally.
2. Run database reset commands (e.g., dropping tables and running migrations, or using a specific reset endpoint/script).
3. Verify the local database is clean.
4. Deploy the application to the production environment.
5. Verify the production database is clean.

## Small Tasks
- [ ] Verify Tasks 01-05 are complete.
- [ ] Clear database.
- [ ] Verify empty state locally.
- [ ] Run deployment command.
- [ ] Verify production is live and clean.

## Edge Cases
- Admin accounts might need to be reseeded if authentication relies on them.

## Testing Checklist
- [ ] Database is empty (except essential seed data).
- [ ] Deployment succeeds.
- [ ] Production site loads correctly.

## Acceptance Criteria
- System contains no transactional data.
- New version is live and accessible.

## Dependencies
Depends on:
- Task 01
- Task 02
- Task 03
- Task 04
- Task 05
