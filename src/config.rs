use std::{env, str::FromStr};

use axum::http::StatusCode;

use crate::api::ApplicationError;

pub const DEFAULT_HTTP_PORT: u16 = 8080;
pub const DEFAULT_SSL_PORT: u16 = 8443;

pub const DEFAULT_SSL_ENABLED: bool = false;
pub const DEFAULT_SSL_REDIRECT: bool = true;

pub fn get<T>(name: &str, fail_status_code: StatusCode) -> Result<T, ApplicationError> where T: FromStr {
    match env::var(name).map(|r| r.parse()) {
        Ok(Ok(a)) => Ok(a),
        _ => Err(ApplicationError::new(format!("Unabled to get or parse environment variable '{}'.", name), fail_status_code)),
    }
}

pub fn get_or_default<T>(name: &str, default: T) -> T where T: FromStr {
    match env::var(name).map(|r| r.parse()) {
        Ok(Ok(a)) => a,
        _ => default,
    }
}

pub fn get_or_panic<T>(name: &str) -> T where T: FromStr {
    match get(name, StatusCode::INTERNAL_SERVER_ERROR) {
        Ok(r) => r,
        Err(e) => panic!("{}", e),
    }
}