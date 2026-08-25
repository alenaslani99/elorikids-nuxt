-- ═════════════════════════════════════════════════════════════════
-- 0002 - Admin elevation: security question + session elevation
--
-- Adds a security-question gate for the owner's admin panel access.
-- No role column - the owner is identified by OWNER_EMAIL env var.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0002-admin-elevation.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0002-admin-elevation.sql
-- ═════════════════════════════════════════════════════════════════

-- ─── 1. Security question on users (owner-only gate) ───────────
-- The answer is hashed with the same PBKDF2 used for passwords.
ALTER TABLE users ADD COLUMN security_question   TEXT;
ALTER TABLE users ADD COLUMN security_answer_hash TEXT;

-- ─── 2. Elevation timestamp on sessions ─────────────────────────
-- Set to datetime('now', '+1 hour') when the owner answers the
-- security question. Admin routes check elevated_until > datetime('now').
-- Automatically revoked on logout / session expiry.
ALTER TABLE sessions ADD COLUMN elevated_until TEXT;
