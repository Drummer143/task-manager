use axum::{Extension, Json, extract::State};
use axum_extra::extract::cookie;
use error_handlers::{codes, handlers::ErrorResponse};

use crate::{
    entities::profile::dto::ProfileResponse, repos::workspaces::WorkspaceRepository,
    services::{users::UserService, workspaces::WorkspaceService}, types::app_state::AppState,
};

#[utoipa::path(
    get,
    path = "/profile",
    operation_id = "get_profile",
    responses(
        (status = 200, description = "Profile", body = ProfileResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
    ),
    tags = ["Profile"],
)]
pub async fn get_profile(
    State(state): State<AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    mut cookie_jar: axum_extra::extract::CookieJar,
) -> Result<impl axum::response::IntoResponse, ErrorResponse> {
    let user = UserService::get_one_by_id(&state.postgres, user_id).await?;

    let workspace_id = cookie_jar.get("workspace_id");

    let workspace = if let Some(workspace_id) = workspace_id {
        let workspace_id = workspace_id.value();
        let workspace_id = uuid::Uuid::parse_str(workspace_id).map_err(|_| {
            ErrorResponse::bad_request(codes::BadRequestErrorCode::InvalidParams, None, None)
        })?;

        WorkspaceRepository::get_one_by_id(&state.postgres, workspace_id).await?
    } else {
        let workspace =
            WorkspaceService::get_any_workspace_user_has_access_to(&state.postgres, user_id)
                .await?;

        let workspace_id = workspace.id;

        cookie_jar = cookie_jar.add(cookie::Cookie::new(
            "workspace_id",
            workspace_id.to_string(),
        ));

        workspace
    };

    Ok((
        axum::http::StatusCode::OK,
        cookie_jar,
        Json(ProfileResponse { user, workspace }),
    ))
}
