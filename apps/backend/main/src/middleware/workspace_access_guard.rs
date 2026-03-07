use axum::extract::State;
use axum::http::StatusCode;
use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::{repos::workspaces::WorkspaceRepository, types::app_state::AppState};

use super::json_error_response;

/// works only with path `/workspace/{workspace_id}/...`
pub async fn workspace_access_guard(
    State(state): State<AppState>,
    mut req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let workspace_id = req.uri().path().split('/').nth(2).unwrap_or_default();

    let Ok(workspace_id) = Uuid::parse_str(workspace_id) else {
        return json_error_response(
            StatusCode::BAD_REQUEST,
            ErrorResponse::bad_request(
                codes::BadRequestErrorCode::InvalidParams,
                None,
                Some("Invalid workspace id".to_string()),
            ),
        );
    };

    let Some(user_id) = req.extensions().get::<Uuid>() else {
        return json_error_response(
            StatusCode::UNAUTHORIZED,
            ErrorResponse::unauthorized(
                codes::UnauthorizedErrorCode::Unauthorized,
                Some("User is not authorized".to_string()),
            ),
        );
    };

    let user_id = *user_id;

    let Ok(workspace_access) =
        WorkspaceRepository::get_one_workspace_access(&state.postgres, user_id, workspace_id).await
    else {
        return json_error_response(
            StatusCode::FORBIDDEN,
            ErrorResponse::forbidden(
                codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
                None,
            ),
        );
    };

    req.extensions_mut().insert(workspace_access);

    next.run(req).await
}
