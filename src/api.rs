use std::{
    env::{self, VarError},
    error::Error,
    fmt::Display,
};

use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};

use serde::Serialize;
use sqlx::{migrate::MigrateError, PgPool};

use crate::endpoints;

pub(crate) async fn routes() -> Result<Router, ApplicationError> {
    Ok(Router::new()
        .route("/events", post(endpoints::create_event))
        .route("/events/:event_id", get(endpoints::fetch_event))
        .route(
            "/events/:event_id/availabilities",
            post(endpoints::create_availabilities),
        )
        .route(
            "/events/:event_id/availabilities",
            get(endpoints::fetch_availabilities),
        )
        .with_state(AppState::new().await?))
}

pub(crate) fn ok<T: Serialize>(r: Result<T, ApplicationError>) -> UniversalResponseDto<T> {
    match r {
        Ok(res) => UniversalResponseDto {
            status: StatusCode::OK,
            result: Some(res),
            error: None,
        },
        Err(err) => error(err),
    }
}

pub(crate) fn error<T: Serialize>(e: ApplicationError) -> UniversalResponseDto<T> {
    UniversalResponseDto {
        status: e.status,
        result: None,
        error: Some(ErrorDto { message: format!("{}", e)})
    }
}

pub(crate) fn internal_server_error<T: Serialize>(e: ApplicationError) -> UniversalResponseDto<T> {
    UniversalResponseDto {
        status: StatusCode::INTERNAL_SERVER_ERROR,
        result: None,
        error: Some(ErrorDto {
            message: format!("{}", e),
        }),
    }
}

#[derive(Serialize)]
pub struct UniversalResponseDto<T: Serialize> {
    #[serde(skip_serializing)]
    status: StatusCode,

    result: Option<T>,
    error: Option<ErrorDto>,
}

impl<T: Serialize> IntoResponse for UniversalResponseDto<T> {
    fn into_response(self) -> axum::response::Response {
        if self.error.is_some() {
            return (self.status, Json(self)).into_response();
        }

        if self.result.is_some() {
            return (self.status, Json(self)).into_response();
        }

        (self.status, Json(self)).into_response()
    }
}

#[derive(Serialize)]
pub struct ErrorDto {
    message: String,
}

#[derive(Debug, Clone)]
pub struct AppState {
    pub db_pool: PgPool,
    pub event_uid_size: usize,
}

impl AppState {
    pub async fn new() -> Result<Self, ApplicationError> {
        Ok(Self {
            db_pool: {
                let pool = PgPool::connect(&env::var("DATABASE_URL")?).await?;

                // Run migrations
                sqlx::migrate!("./migrations").run(&pool).await?;

                pool
            },
            event_uid_size: env::var("EVENT_UID_SIZE")?
                .parse()
                .expect("EVENT_UID_SIZE is undefined. Must be a number."),
        })
    }
}

#[derive(Debug)]
pub struct ApplicationError {
    status: StatusCode,
    msg: String,
}

impl ApplicationError {
    pub fn new(msg: String, status: StatusCode) -> Self {
        Self { msg, status }
    }
}

impl From<sqlx::Error> for ApplicationError {
    fn from(value: sqlx::Error) -> Self {
        Self {
            msg: value.to_string(),
            status: StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

impl From<MigrateError> for ApplicationError {
    fn from(value: MigrateError) -> Self {
        Self {
            msg: value.to_string(),
            status: StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

impl From<VarError> for ApplicationError {
    fn from(value: VarError) -> Self {
        Self {
            msg: value.to_string(),
            status: StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

impl Display for ApplicationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.msg)
    }
}

impl Error for ApplicationError {}
