use axum::{extract::State, Extension};

use crate::{entities::user::model::User, shared::error_handlers::handlers::ErrorResponse, types::app_state::AppState};

#[utoipa::path(
    get,
    path = "/profile",
    responses(
        (status = 200, description = "Profile", body = User),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
    ),
    tags = ["Profile"],
)]
pub async fn get_profile(
    State(state): State<AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
) -> Result<User, ErrorResponse> {
    crate::entities::user::service::find_by_id(&state.db, user_id).await
}
