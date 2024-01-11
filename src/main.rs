use std::net::SocketAddr;

use axum::Router;
use dotenv::dotenv;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

mod api;
mod db;
mod endpoints;
mod entity;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    println!("Starting findtheti.me...");

    dotenv().ok();

    let api_routes = api::routes().await.expect("Unable to create api routes");

    let mut routes = Router::new()
        .nest("/api", api_routes);


    // If in release mod, serve static files
    if !cfg!(debug_assertions) {
        println!("Initializing frontend routes...");
        
        routes = routes.nest_service("/", ServeDir::new("./frontend/dist"))
            .fallback_service(ServeDir::new("./frontend/dist"));
    }

    println!("Routes initialized...");

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));

    let listener = TcpListener::bind(addr).await.unwrap();

    println!("Starting server...");

    axum::serve(listener, routes.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}