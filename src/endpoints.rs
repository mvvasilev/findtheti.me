use axum::{
    extract::{Path, State},
    Json,
};
use chrono::{DateTime, TimeZone, Utc};
use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use sqlx::Connection;

use crate::{
    api::{self, AppState, ApplicationError, UniversalResponseDto},
    db,
    entity::{
        availability::Availability,
        event::{Event, EventType},
    },
};

#[derive(Deserialize)]
pub struct CreateEventDto {
    from_date: Option<DateTime<Utc>>,
    to_date: Option<DateTime<Utc>>,
    name: String,
    description: Option<String>,
    event_type: String,
    duration: i32
}

#[derive(Serialize)]
pub struct EventDto {
    snowflake_id: String,
    from_date: Option<DateTime<Utc>>,
    to_date: Option<DateTime<Utc>>,
    name: String,
    description: Option<String>,
    event_type: String,
    duration: i32
}

#[derive(Deserialize)]
pub struct CreateAvailabilitiesDto {
    availabilities: Vec<CreateAvailabilityDto>,
    user_email: Option<String>,
    user_ip: String,
    user_name: String,
}

#[derive(Deserialize, Clone)]
pub struct CreateAvailabilityDto {
    from_date: DateTime<Utc>,
    to_date: DateTime<Utc>,
}

#[derive(Serialize, Deserialize)]
pub struct AvailabilityDto {
    id: i64,
    from_date: DateTime<Utc>,
    to_date: DateTime<Utc>,
    user_name: String,
}

pub async fn create_event(
    State(app_state): State<AppState>,
    Json(dto): Json<CreateEventDto>,
) -> UniversalResponseDto<EventDto> {
    let event_uid_size = app_state.event_uid_size;

    let mut conn = match app_state.db_pool.acquire().await {
        Ok(c) => c,
        Err(e) => return api::internal_server_error(e),
    };

    let res = conn
        .transaction(|txn| {
            Box::pin(async move {
                let uid: String = rand::thread_rng()
                    .sample_iter(&Alphanumeric)
                    .take(event_uid_size)
                    .map(char::from)
                    .collect();

                let event_type: EventType = dto.event_type.into();

                if matches!(event_type, EventType::Unknown) {
                    return Err(ApplicationError::new(
                        "Unknown event type, invalid variant.".to_string(),
                    ));
                }

                let event_id = db::insert_event_and_fetch_id(
                    txn,
                    Event {
                        id: -1,
                        snowflake_id: uid,
                        name: dto.name,
                        description: dto.description,
                        from_date: dto.from_date.map(|d| d.naive_utc()),
                        to_date: dto.to_date.map(|d| d.naive_utc()),
                        event_type,
                        duration: dto.duration
                    },
                )
                .await?;

                let event = db::fetch_event_by_id(txn, event_id).await?;

                Ok(EventDto {
                    snowflake_id: event.snowflake_id,
                    from_date: event.from_date.map(|d| Utc.from_utc_datetime(&d)),
                    to_date: event.to_date.map(|d| Utc.from_utc_datetime(&d)),
                    name: event.name,
                    description: event.description,
                    event_type: event.event_type.to_string(),
                    duration: event.duration
                })
            })
        })
        .await;

    api::ok::<EventDto, ApplicationError>(res)
}

pub async fn fetch_event(
    State(app_state): State<AppState>,
    Path(event_snowflake_id): Path<String>,
) -> UniversalResponseDto<EventDto> {
    let mut conn = match app_state.db_pool.acquire().await {
        Ok(c) => c,
        Err(e) => return api::internal_server_error(e),
    };

    let res = conn
        .transaction(|txn| {
            Box::pin(async move {
                let event = db::fetch_event_by_snowflake_id(txn, event_snowflake_id).await?;

                Ok(EventDto {
                    snowflake_id: event.snowflake_id,
                    from_date: event.from_date.map(|d| Utc.from_utc_datetime(&d)),
                    to_date: event.to_date.map(|d| Utc.from_utc_datetime(&d)),
                    name: event.name,
                    description: event.description,
                    event_type: event.event_type.to_string(),
                    duration: event.duration
                })
            })
        })
        .await;

    api::ok::<EventDto, ApplicationError>(res)
}

pub async fn create_availabilities(
    State(app_state): State<AppState>,
    Path(event_snowflake_id): Path<String>,
    Json(dto): Json<CreateAvailabilitiesDto>,
) -> UniversalResponseDto<()> {
    let mut conn = match app_state.db_pool.acquire().await {
        Ok(c) => c,
        Err(e) => return api::internal_server_error(e),
    };

    let res = conn
        .transaction(|txn| {
            Box::pin(async move {
                let event = db::fetch_event_by_snowflake_id(txn, event_snowflake_id).await?;

                let current_availabilities = db::fetch_event_availabilities(txn, event.id).await?;

                let already_submitted = current_availabilities.iter().any(|a| {
                    (dto.user_email.is_none() && a.user_email == dto.user_email)
                        || a.user_ip == dto.user_ip
                        || a.user_name == dto.user_name
                });

                if already_submitted {
                    return Err(ApplicationError::new(
                        "Availability already submitted".to_string(),
                    ));
                }

                // TODO: Do these in parallel.
                // At the moment, it would appear sqlx's transaction does not implement Clone, so it's not possible to execute these concurrently
                for a in dto.availabilities {
                    db::insert_availability_and_fetch_id(
                        txn,
                        Availability {
                            id: -1,
                            event_id: event.id,
                            from_date: a.from_date.naive_utc(),
                            to_date: a.to_date.naive_utc(),
                            user_email: dto.user_email.clone(),
                            user_ip: dto.user_ip.clone(),
                            user_name: dto.user_name.clone(),
                        },
                    )
                    .await?;
                }

                Ok(())
            })
        })
        .await;

    api::ok::<(), ApplicationError>(res)
}

pub async fn fetch_availabilities(
    State(app_state): State<AppState>,
    Path(event_snowflake_id): Path<String>,
) -> UniversalResponseDto<Vec<AvailabilityDto>> {
    let mut conn = match app_state.db_pool.acquire().await {
        Ok(c) => c,
        Err(e) => return api::internal_server_error(e),
    };

    let res = conn
        .transaction(|txn| {
            Box::pin(async move {
                let availabilities =
                    db::fetch_event_availabilities_by_event_snowflake_id(txn, event_snowflake_id)
                        .await?;

                Ok(availabilities
                    .into_iter()
                    .map(|a| AvailabilityDto {
                        id: a.id,
                        user_name: a.user_name,
                        from_date: Utc.from_utc_datetime(&a.from_date),
                        to_date: Utc.from_utc_datetime(&a.to_date),
                    })
                    .collect())
            })
        })
        .await;

    api::ok::<Vec<AvailabilityDto>, ApplicationError>(res)
}
