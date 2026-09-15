-- portfolio-visits — start offset.
--
-- Jan, 2026-09-15: the displayed total starts 3,000 above real visits.
-- Real visits = count - 3000.
--
-- Added, not SET: every real visit counted before this runs is kept. As a
-- migration, D1 records it and never applies it twice.

UPDATE totals SET count = count + 3000 WHERE id = 1;
