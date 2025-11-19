-- this time with ipv6 in mind
ALTER TABLE events.availability
ALTER COLUMN user_ip TYPE VARCHAR(255);
