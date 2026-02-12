use axum::{body::Body, http};
use insta::assert_json_snapshot;
use serde_json::json;
use tower::ServiceExt;
use http_body_util::BodyExt;

// TODO: Setup env for integration tests
#[tokio::test]
#[ignore = "requires running PostgreSQL and Authentik (integration test)"]
async fn create_workspace_empty_body() {
    let _ = dotenvy::dotenv();

    let app = app::build().await;

    let json_body = json!({
        "event": "test_unreal_event",
        "payload": {
            "asd": "AAAAAAAAA"
        }
    });

    let resp = app
        .oneshot(
            http::Request::builder()
                .uri("/webhooks/authentik/user_sync")
                .method(http::Method::POST)
                .header("content-type", "application/json")
                .body(Body::from(json_body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), http::StatusCode::BAD_REQUEST);

    let body_error = resp.into_body().collect().await.unwrap().to_bytes();
    let error = std::str::from_utf8(&body_error).unwrap();

    assert_json_snapshot!(error);
}
