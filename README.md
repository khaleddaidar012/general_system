# General System — Developed by Daidar

Arabic/English project and finance management with independent user workspaces, administrator account management, Cloudflare Pages Functions and D1.

## Local setup

1. Run `npm install` (Node 22+).
2. Copy `.dev.vars.example` to `.dev.vars`. Set `SPARK_ADMIN_USERNAME` and a unique `SPARK_ADMIN_PASSWORD` (12+ characters).
3. Run `npm run db:migrate:local`, then `npm run dev`.
4. Sign in using the configured administrator credentials. The first successful login creates the administrator in D1. Manage users at `/pages/admin.html`.

There are no default credentials. Passwords use salted PBKDF2-SHA256 (100,000 iterations). Sessions expire after 24 hours. Account suspension and password changes revoke previous sessions. Remove the bootstrap password secret after creating the administrator; subsequent password changes use D1.

## Cloudflare deployment

1. Run `npx wrangler login` and `npx wrangler d1 create general-system`.
2. Replace the placeholder database ID in `wrangler.toml` with the returned ID. Use a fresh database.
3. Run `npm run db:migrate:remote`.
4. Create a Pages project named `general-system` or connect the `general_system` GitHub repository. Output directory: `frontend`; no build command.
5. Configure its D1 binding named `DB` and encrypted secrets `SPARK_ADMIN_USERNAME` and `SPARK_ADMIN_PASSWORD`.
6. Deploy with `npm run deploy` or Git integration, sign in as administrator, then remove the bootstrap password secret and redeploy.

Preview deployments should use a separate D1 database and credentials. Cloudflare resources and live deployment require your Cloudflare account; source preparation does not create them.

## Isolation and migration

Business records use `(user_id, collection, id)` as their primary key. The owner comes from the authenticated session. Reads, writes, deletes, sync, reset, restore and backups are scoped to that owner. Backups are in D1; KV is unnecessary. Admins manage accounts without automatically seeing users' business data.

IndexedDB and backup metadata are namespaced by account. Each page pins its identity and token to prevent cross-account writes after a different login in another tab. Offline password authentication is removed. Signed-in users can retain offline work; synchronization requires a valid server session. Browser caches are not encrypted; use separate browser profiles on shared devices or clear site data.

Legacy tables remain intact but are not exposed through the new API. No original company data is assigned to new accounts. New accounts start empty. Use deliberate export/import for appropriate existing data.

Sync uses full snapshots to propagate deletions and resets. Concurrent edits use the last accepted server write, without a conflict-resolution interface.

## Verification

`npm test` applies all migrations to in-memory SQLite and exercises the real Pages handler through a D1 adapter. Coverage includes user creation, duplicates, authorization, same record IDs across tenants, data and backup isolation, reset/restore, synchronization, suspension, password resets, session revocation and logout. Deployed Cloudflare behavior and visual browser testing still need verification.

The original Express backend is retained as legacy source. Supported npm commands run the Pages/D1 application.
## Trial configuration

All users share the same physical D1 database in this phase. User IDs isolate their business records. Moving a user to a dedicated D1 database from the administrator page is tracked as a later phase in GENERAL_TASKS.md and is not part of the current account-management screen.

## Dependency audit

Wrangler was updated to 4.153.0. The final npm installation audit reported zero vulnerabilities. The Pages handler has no npm runtime dependencies.
