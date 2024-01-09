use sqlx::{Postgres, Transaction};

use crate::entity::{availability::Availability, event::Event};

pub(crate) async fn fetch_event_by_id(
    txn: &mut Transaction<'_, Postgres>,
    id: i64,
) -> Result<Event, sqlx::Error> {
    sqlx::query_as!(
        Event,
        r#"
        SELECT * FROM events.event
        WHERE id = $1
        "#,
        id
    )
    .fetch_one(&mut **txn)
    .await
}

pub(crate) async fn fetch_event_by_snowflake_id(
    txn: &mut Transaction<'_, Postgres>,
    snowflake_id: String,
) -> Result<Event, sqlx::Error> {
    sqlx::query_as!(
        Event,
        r#"
        SELECT * FROM events.event
        WHERE snowflake_id = $1
        "#,
        snowflake_id
    )
    .fetch_one(&mut **txn)
    .await
}

pub(crate) async fn insert_event_and_fetch_id(
    txn: &mut Transaction<'_, Postgres>,
    event: Event,
) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar!(
        r#"
        INSERT INTO events.event (snowflake_id, name, description, from_date, to_date, event_type, duration)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        "#,
        event.snowflake_id,
        event.name,
        event.description,
        event.from_date,
        event.to_date,
        event.event_type.to_string(),
        event.duration
    )
    .fetch_one(&mut **txn)
    .await
}

pub(crate) async fn insert_availability_and_fetch_id(
    txn: &mut Transaction<'_, Postgres>,
    availability: Availability,
) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar!(
        r#"
        INSERT INTO events.availability (event_id, from_date, to_date, user_email, user_ip, user_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        "#,
        availability.event_id,
        availability.from_date,
        availability.to_date,
        availability.user_email,
        availability.user_ip,
        availability.user_name
    )
    .fetch_one(&mut **txn).await
}

pub(crate) async fn fetch_event_availabilities(
    txn: &mut Transaction<'_, Postgres>,
    event_id: i64,
) -> Result<Vec<Availability>, sqlx::Error> {
    sqlx::query_as!(
        Availability,
        r#"
        SELECT *
        FROM events.availability
        WHERE event_id = $1
        "#,
        event_id
    )
    .fetch_all(&mut **txn)
    .await
}

pub(crate) async fn fetch_event_availabilities_by_event_snowflake_id(
    txn: &mut Transaction<'_, Postgres>,
    snowflake: String,
) -> Result<Vec<Availability>, sqlx::Error> {
    sqlx::query_as!(
        Availability,
        r#"
        SELECT a.*
        FROM events.availability AS a
        JOIN events.event AS e ON e.id = a.event_id
        WHERE e.snowflake_id = $1
        "#,
        snowflake
    )
    .fetch_all(&mut **txn)
    .await
}
