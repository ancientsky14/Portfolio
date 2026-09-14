-- portfolio-contact — schema.
--
-- messages: every brief the contact form sends, stored before the email goes
--   out, so a Gmail failure loses nothing — `emailed` stays 0 until the send
--   succeeds. No IP address is stored: `ip_hash` is a SHA-256 of a secret salt
--   and the IP, used only to cap sends at three an hour. The Worker's daily
--   cron deletes emailed rows after 30 days and every row after 90.

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,           -- ISO 8601, UTC
  mode TEXT NOT NULL CHECK (mode IN ('project', 'role')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  body_json TEXT NOT NULL,            -- the validated brief (lib/brief.ts), as JSON
  ip_hash TEXT NOT NULL,
  emailed INTEGER NOT NULL DEFAULT 0
);

-- The rate limit: this visitor's messages in the last hour.
CREATE INDEX messages_by_ip_time ON messages (ip_hash, created_at);
