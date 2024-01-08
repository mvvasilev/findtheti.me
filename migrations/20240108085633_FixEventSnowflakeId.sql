ALTER TABLE events.event
DROP COLUMN IF EXISTS snowflake_if;

ALTER TABLE events.event
ADD COLUMN IF NOT EXISTS snowflake_id VARCHAR(255) NOT NULL;

ALTER TABLE events.event
ADD CONSTRAINT UQ_event_snowflake_id UNIQUE (snowflake_id);