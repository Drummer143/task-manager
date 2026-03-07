use axum::{Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::user::model::User;

use crate::{services::users::UserService, shared::extractors::path::ValidatedPath};

#[utoipa::path(
    get,
    path = "/users/{id}",
    operation_id = "get_user_by_id",
    params(
        ("id" = Uuid, Path, description = "ID of user to get"),
    ),
    responses(
        (status = 200, description = "User", body = User),
        (status = 404, description = "User not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["User"]
)]
pub async fn get_by_id(
    State(state): State<crate::types::app_state::AppState>,
    ValidatedPath(id): ValidatedPath<uuid::Uuid>,
) -> Result<Json<User>, ErrorResponse> {
    UserService::get_one_by_id(&state.postgres, id)
        .await
        .map(Json)
}
