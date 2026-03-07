use axum::extract::State;
use axum::http::StatusCode;
use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::{entities::page::db::PageRepository, types::app_state::AppState};

use super::json_error_response;

// works only with path `/task/{task_id}/...`
pub async fn page_access_guard_task_route(
    State(state): State<AppState>,
    mut req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let task_id = req.uri().path().split('/').nth(2).unwrap_or_default();

    let Ok(task_id) = Uuid::parse_str(task_id) else {
        return json_error_response(
            StatusCode::BAD_REQUEST,
            ErrorResponse::bad_request(
                codes::BadRequestErrorCode::InvalidParams,
                None,
                Some("Invalid task id".to_string()),
            ),
        );
    };

    let page = PageRepository::get_page_by_task_id(&state.postgres, task_id).await;

    let Ok(page) = page else {
        return json_error_response(
            StatusCode::NOT_FOUND,
            ErrorResponse::not_found(
                codes::NotFoundErrorCode::NotFound,
                None,
                Some("Task not found".to_string()),
            ),
        );
    };

    let page_id = page.id;
    req.extensions_mut().insert(page);

    validate_page_access(state, req, page_id, next).await
}

// works only with path `/page/{page_id}/...`
pub async fn page_access_guard_by_page_route(
    State(state): State<AppState>,
    req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let page_id = req.uri().path().split('/').nth(2).unwrap_or_default();

    let Ok(page_id) = Uuid::parse_str(page_id) else {
        return json_error_response(
            StatusCode::BAD_REQUEST,
            ErrorResponse::bad_request(
                codes::BadRequestErrorCode::InvalidParams,
                None,
                Some("Invalid page id".to_string()),
            ),
        );
    };

    validate_page_access(state, req, page_id, next).await
}

pub async fn validate_page_access(
    state: AppState,
    mut req: axum::http::Request<axum::body::Body>,
    page_id: Uuid,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
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

    let Ok(page_access) =
        PageRepository::get_one_page_access(&state.postgres, user_id, page_id).await
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

    req.extensions_mut().insert(page_access);

    next.run(req).await
}
