CREATE TABLE accounts (
 id TEXT PRIMARY KEY,
 username TEXT NOT NULL UNIQUE COLLATE NOCASE,
 display_name TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin','user')),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
 session_version INTEGER NOT NULL DEFAULT 1,
 created_at INTEGER NOT NULL
);
CREATE TABLE sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES accounts(id),
 version INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE tenant_records (
 user_id TEXT NOT NULL REFERENCES accounts(id),
 collection TEXT NOT NULL,
 id TEXT NOT NULL,
 data TEXT NOT NULL,
 PRIMARY KEY(user_id, collection, id)
);
CREATE TABLE tenant_backups (
 user_id TEXT PRIMARY KEY REFERENCES accounts(id),
 data TEXT NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE TABLE login_attempts (
 key TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
