use std::net::SocketAddr;

use axum::Router;
use dotenv::dotenv;
use tokio::net::TcpListener;
use tower_http::services::ServeFile;
use tower_http::trace::TraceLayer;
use tower_http::{services::ServeDir, trace};
use tracing::Level;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

mod api;
mod db;
mod endpoints;
mod entity;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    println!("Starting findtheti.me...");

    dotenv().ok();

    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(EnvFilter::from_env("LOG_LEVEL"))
        .init();

    let api_routes = api::routes().await.expect("Unable to create api routes");

    let mut routes = Router::new().nest("/api", api_routes);

    // If in release mod, serve static files
    if !cfg!(debug_assertions) {
        println!("Initializing frontend routes...");

        routes = routes
            .nest_service("/assets", ServeDir::new("./frontend/dist/assets"))
            .fallback_service(ServeFile::new("./frontend/dist/index.html"));
    }

    println!("Routes initialized...");

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));

    let listener = TcpListener::bind(addr).await.unwrap();

    println!("Starting server...");

    axum::serve(
        listener,
        routes
            .layer(
                TraceLayer::new_for_http()
                    .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
                    .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
            )
            .into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}
