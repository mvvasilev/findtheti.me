ALTER TABLE events.availability
DROP COLUMN IF EXISTS user_ip;

ALTER TABLE events.availability
ADD COLUMN IF NOT EXISTS user_ip VARCHAR(12) NOT NULL;