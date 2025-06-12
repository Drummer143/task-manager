use axum::extract::State;

use crate::shared::{error_handlers::handlers::ErrorResponse, extractors::path::ValidatedPath};

#[utoipa::path(
    get,
    path = "/users/{id}",
    operation_id = "get_user_by_id",
    params(
        ("id", Path, description = "ID of user to get"),
    ),
    responses(
        (status = 200, description = "User", body = crate::entities::user::model::User),
        (status = 404, description = "User not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["User"]
)]
pub async fn get_by_id(
    State(state): State<crate::types::app_state::AppState>,
    ValidatedPath(id): ValidatedPath<uuid::Uuid>,
) -> impl axum::response::IntoResponse {
    crate::entities::user::service::find_by_id(&state.postgres, id).await
}
