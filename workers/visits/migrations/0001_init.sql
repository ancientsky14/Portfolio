-- portfolio-visits — schema.
--
-- visits: one row per visitor per Manila day. `visitor` is a SHA-256 of a
--   secret salt, the day, the IP and the user agent — the salt and the day
--   change the hash, so it cannot be reversed to an IP or linked across days.
--   Rows older than two days are deleted by the Worker's daily cron.
-- totals: the running count. Starts at 0 (Jan, 2026-09-13).

CREATE TABLE visits (
  day TEXT NOT NULL,
  visitor TEXT NOT NULL,
  PRIMARY KEY (day, visitor)
);

CREATE TABLE totals (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO totals (id, count) VALUES (1, 0);

-- Counting lives in the database, not the Worker: a new (day, visitor) row
-- adds one; `INSERT OR IGNORE` on a repeat inserts nothing, so nothing fires.
-- The daily cleanup DELETE never touches the total.
CREATE TRIGGER visits_count AFTER INSERT ON visits
BEGIN
  UPDATE totals SET count = count + 1 WHERE id = 1;
END;
