use axum::extract::State;
use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::types::app_state::AppState;

/// works only with path `/workspace/{workspace_id}/...`
pub async fn workspace_access_guard(
    State(state): State<AppState>,
    mut req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let path = req.uri().path();

    let workspace_id = path.split('/').nth(2).unwrap_or_default();

    let workspace_id = Uuid::parse_str(workspace_id);

    if workspace_id.is_err() {
        return next.run(req).await;
    }

    let user_id = req.extensions().get::<Uuid>();

    if user_id.is_none() {
        let body = serde_json::to_string(&ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::Unauthorized,
            Some("User is not authorized".to_string()),
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::UNAUTHORIZED)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let user_id = user_id.unwrap().clone();
    let workspace_id = workspace_id.unwrap();

    let workspace_access =
        rust_api::entities::workspace_access::WorkspaceAccessRepository::get_one(
            &state.postgres,
            user_id,
            workspace_id,
        )
        .await;

    if workspace_access.is_err() {
        let body = serde_json::to_string(&ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            None,
            None,
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::FORBIDDEN)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    req.extensions_mut().insert(workspace_access.unwrap());

    return next.run(req).await;
}
