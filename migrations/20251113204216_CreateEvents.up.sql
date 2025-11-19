CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2048),
    snowflake_id VARCHAR(255) NOT NULL,
    from_date TIMESTAMP,
    to_date TIMESTAMP,
    event_type INT NOT NULL,
    duration INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    CONSTRAINT PK_event PRIMARY KEY (id)
)