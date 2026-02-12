use axum::{extract::State, Extension, Json};
use axum_extra::extract::cookie;
use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::profile::dto::{GetProfileDto, GetProfileInclude, GetProfileQuery},
    shared::{extractors::query::ValidatedQuery, traits::ServiceGetOneByIdMethod},
    types::app_state::AppState,
};

#[utoipa::path(
    get,
    path = "/profile",
    responses(
        (status = 200, description = "Profile", body = GetProfileDto),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
    ),
    params(
        ("includes" = Option<Vec<GetProfileInclude>>, Query, description = "User ID"),
    ),
    tags = ["Profile"],
)]
pub async fn get_profile(
    State(state): State<AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    ValidatedQuery(query): ValidatedQuery<GetProfileQuery>,
    mut cookie_jar: axum_extra::extract::CookieJar,
) -> Result<impl axum::response::IntoResponse, ErrorResponse> {
    let user = crate::entities::user::UserService::get_one_by_id(&state, user_id).await?;

    let mut profile_response = GetProfileDto {
        user,
        workspace: None,
    };

    let include = query.include.unwrap_or_default();

    if include.is_empty() {
        return Ok((
            axum::http::StatusCode::OK,
            cookie_jar,
            Json(profile_response),
        ));
    }

    let workspace_id = cookie_jar.get("workspace_id");

    if workspace_id.is_none() {
        let workspace =
            crate::entities::workspace::WorkspaceService::get_any_workspace_user_has_access_to(
                &state, user_id,
            )
            .await?;

        let workspace_id = workspace.id;

        cookie_jar = cookie_jar.add(cookie::Cookie::new(
            "workspace_id",
            workspace_id.to_string(),
        ));

        profile_response.workspace = Some(workspace);
    } else {
        let workspace_id = workspace_id.unwrap().value();
        let workspace_id = uuid::Uuid::parse_str(workspace_id).unwrap();

        let workspace =
            crate::entities::workspace::WorkspaceService::get_one_by_id(&state, workspace_id)
                .await?;

        profile_response.workspace = Some(workspace.workspace);
    }

    Ok((
        axum::http::StatusCode::OK,
        cookie_jar,
        Json(profile_response),
    ))
}
