-- ═════════════════════════════════════════════════════════════════
-- 0012 - Google-only sign-in + roles
--
-- DESTRUCTIVE: deletes every user account and session. Orders are kept
-- (they carry their own name/email/address) but are detached from
-- accounts. Back up first:
--   npx wrangler d1 export elorikids-db --remote --output backup.sql
--
-- Changes:
--   - users: no password / security question; identified by Google's
--     stable account id (google_sub); role column ('owner' | 'customer')
--     replaces the OWNER_EMAIL env var.
--   - sessions: store only the SHA-256 of the token (token_hash), add
--     last_used_at for idle expiry.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0012-google-auth.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0012-google-auth.sql
--
-- Then sign in once with the owner's Google account and promote it:
--   npx wrangler d1 execute elorikids-db --remote --command "UPDATE users SET role = 'owner' WHERE email = 'OWNER_GMAIL_HERE'; DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE role = 'owner');"
-- ═════════════════════════════════════════════════════════════════

UPDATE orders SET user_id = NULL;

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- AUTOINCREMENT: ids are never reused, so a new account can never
-- inherit anything keyed on an old id.
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub    TEXT NOT NULL UNIQUE,              -- Google's stable account id
  email         TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('owner', 'customer')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE sessions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash     TEXT NOT NULL UNIQUE,             -- SHA-256(token), base64url
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at   TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at     TEXT NOT NULL,
  elevated_until TEXT                              -- admin window (owner only)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Old login/register/elevate counters are meaningless now
DELETE FROM rate_limits;
