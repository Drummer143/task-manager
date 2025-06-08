use axum::Extension;

use crate::{entities::user::model::User, shared::error_handlers::handlers::ErrorResponse};

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
    Extension(user): Extension<User>,
) -> Result<User, ErrorResponse> {
    Ok(user)
}
