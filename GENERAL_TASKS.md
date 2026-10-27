# General System implementation

1. [x] Clone and audit the original system.
2. [x] Add D1 accounts, secure sessions and tenant-owned records.
3. [x] Add administrator account management and user login.
4. [x] Isolate browser storage and remove demo authentication.
5. [x] Add Developed by Daidar branding and deployment instructions.
6. [x] Verify account lifecycle, authorization and tenant isolation.
7. [x] Prepare general_system Git remote for publication.
8. [ ] Later phase: administrator-driven migration of a user into a dedicated D1 database. Requires Cloudflare provisioning and an atomic migration flow.

Trial decision: all accounts and workspaces share one physical D1 database, with logical isolation by account.

Each user is an independent workspace. Administrators manage accounts; they do not automatically access another user's business data. Existing legacy tables are retained without assigning their data to new users.
