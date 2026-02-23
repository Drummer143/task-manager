use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::{shared::traits::PostgresqlRepositoryUpdate, user::model::User};
use uuid::Uuid;

use crate::{
    entities::{profile::dto::UpdateProfileRequest, user::db::UserRepository},
    types::app_state::AppState,
};

#[utoipa::path(
    put,
    path = "/profile",
    operation_id = "update_profile",
    request_body = UpdateProfileRequest,
    responses(
        (status = 200, description = "Profile", body = User),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
    ),
    tags = ["Profile"],
)]
pub async fn update_profile(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Json(body): Json<UpdateProfileRequest>,
) -> Result<Json<User>, ErrorResponse> {
    let user = UserRepository::update(
        &app_state.postgres,
        user_id,
        crate::entities::user::db::dto::UpdateUserDto {
            username: body.username,
            is_active: None,
            email: body.email,
            picture: body.picture,
        },
    )
    .await
    .map_err(ErrorResponse::from)?;

    println!("User updated in DB: {:#?}", user);

    crate::authentik_api::update_user(
        &app_state,
        user.authentik_id,
        crate::authentik_api::UpdateUserRequest {
            username: user.username.clone(),
            email: user.email.clone(),
            is_active: user.is_active,
            // name: user.username.clone(),
        },
    )
    .await?;

    println!("User updated in Authentik: {}", user.authentik_id);

    Ok(Json(user))
}
