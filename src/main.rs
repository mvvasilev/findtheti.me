use std::net::SocketAddr;
use axum::extract::Host;
use axum::handler::HandlerWithoutStateExt;
use axum::http::uri::Scheme;
use axum::response::Redirect;
use axum::{Router, BoxError};
use axum::http::{Uri, StatusCode};
use axum_server::tls_rustls::RustlsConfig;
use dotenv::dotenv;
use tower_http::services::ServeFile;
use tower_http::trace::TraceLayer;
use tower_http::{services::ServeDir, trace};
use tracing::{Level, instrument, info, warn};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

mod api;
mod db;
mod endpoints;
mod entity;
mod config;

#[instrument(name = "findtheti-me")]
#[tokio::main(flavor = "current_thread")]
async fn main() {
    info!("Starting findtheti.me...");

    dotenv().ok();

    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(EnvFilter::from_env("LOG_LEVEL"))
        .init();

    let router = init_router()
        .await
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
                .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
        )
        .into_make_service_with_connect_info::<SocketAddr>();

    let http_port = config::get_or_default("HTTP_PORT", config::DEFAULT_HTTP_PORT);

    let ssl_enabled = config::get_or_default("SSL_ENABLED", config::DEFAULT_SSL_ENABLED);

    if ssl_enabled {
        info!("SSL marked as enabled, will create http to https redirect.");

        let (ssl_port, ssl_redirect, ssl_cert_path, ssl_key_path): (u16, bool, String, String) = (
            config::get_or_default("SSL_PORT", config::DEFAULT_SSL_PORT),
            config::get_or_default("SSL_REDIRECT", config::DEFAULT_SSL_REDIRECT),
            config::get_or_panic("SSL_CERT_PATH"),
            config::get_or_panic("SSL_KEY_PATH")
        );

        let ssl_config = match RustlsConfig::from_pem_file(ssl_cert_path, ssl_key_path).await {
            Ok(c) => c,
            Err(e) => {
                panic!("Unable to use files configured in 'SSL_CERT_PATH' or 'SSL_KEY_PATH': {:?}", e);
            },
        };

        if ssl_redirect {
            tokio::spawn(redirect_http_to_https(http_port, ssl_port));
        }

        let addr = SocketAddr::from(([0, 0, 0, 0], ssl_port));

        info!("Listening on {}", addr);

        axum_server::bind_rustls(addr, ssl_config)
            .serve(router)
            .await
            .unwrap()
    } else {
        let addr = SocketAddr::from(([0, 0, 0, 0], http_port));

        info!("Listening on {}", addr);

        axum_server::bind(addr).serve(router).await.unwrap()
    }
}


async fn init_router() -> Router {
    let api_routes = api::routes().await.expect("Unable to create api routes");

    let mut routes = Router::new().nest("/api", api_routes);

    // If in release mode, serve static files
    if !cfg!(debug_assertions) {
        info!("Initializing frontend routes...");

        routes = routes
            .nest_service("/assets", ServeDir::new("./frontend/dist/assets"))
            .fallback_service(ServeFile::new("./frontend/dist/index.html"));
    }

    info!("Routes initialized...");

    routes
}

async fn redirect_http_to_https(http_port: u16, https_port: u16) {
    fn make_https(host: String, uri: Uri, http_port: u16, https_port: u16) -> Result<Uri, BoxError> {
        let mut parts = uri.into_parts();

        parts.scheme = Some(Scheme::HTTPS);

        if parts.path_and_query.is_none() {
            parts.path_and_query = Some("/".parse().unwrap());
        }

        let https_host = host.replace(&http_port.to_string(), &https_port.to_string());
        parts.authority = Some(https_host.parse()?);

        Ok(Uri::from_parts(parts)?)
    }

    let redirect = move |Host(host): Host, uri: Uri| async move {
        match make_https(host, uri, http_port, https_port) {
            Ok(uri) => Ok(Redirect::permanent(&uri.to_string())),
            Err(error) => {
                
                warn!(%error, "failed to convert URI to HTTPS");
                
                Err(StatusCode::BAD_REQUEST)
            }
        }
    };

    let addr = SocketAddr::from(([0, 0, 0, 0], http_port));

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    
    info!("HTTPS redirect listening on {}", listener.local_addr().unwrap());
    
    axum::serve(listener, redirect.into_make_service())
        .await
        .unwrap();
}