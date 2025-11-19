CREATE TABLE IF NOT EXISTS events.availability (
    id BIGSERIAL,
    event_id BIGINT NOT NULL,
    from_date TIMESTAMP NOT NULL,
    to_date TIMESTAMP NOT NULL,
    user_email VARCHAR(255) NULL,
    user_ip INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    CONSTRAINT PK_availability PRIMARY KEY (id),
    CONSTRAINT FK_availability_event FOREIGN KEY (event_id) REFERENCES events.event(id)
)