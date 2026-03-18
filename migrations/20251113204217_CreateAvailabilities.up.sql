CREATE TABLE IF NOT EXISTS availabilities (
    id BIGSERIAL,
    event_id BIGINT NOT NULL,
    from_date TIMESTAMP NOT NULL,
    to_date TIMESTAMP NOT NULL,
    user_email VARCHAR(255),
    user_ip VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    CONSTRAINT PK_availability PRIMARY KEY (id),
    CONSTRAINT FK_availability_event FOREIGN KEY (event_id) REFERENCES events(id)
);
