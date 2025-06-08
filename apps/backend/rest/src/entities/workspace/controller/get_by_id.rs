use axum::{
    extract::{Extension, Path, State},
    response::IntoResponse,
};

use crate::{
    entities::{user::model::User, workspace::dto::{Include, WorkspaceResponse}},
    shared::{error_handlers::handlers::ErrorResponse, extractors::query::ValidatedQuery},
};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}",
    operation_id = "get_workspace_by_id",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
        ("include" = Option<Vec<Include>>, Query, description = "Include related entities"),
    ),
    responses(
        (status = 200, description = "Workspace found", body = WorkspaceResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"]
)]
pub async fn get_by_id(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user): Extension<User>,
    Path(workspace_id): Path<uuid::Uuid>,
    ValidatedQuery(query): ValidatedQuery<crate::entities::workspace::dto::GetWorkspaceQuery>,
) -> impl IntoResponse {
    let include = query.include.unwrap_or_default();

    crate::entities::workspace::service::get_by_id(
        &state.db,
        workspace_id,
        user.id,
        include.contains(&Include::Owner),
        include.contains(&Include::Pages),
    )
    .await
    .map(|workspace| crate::entities::workspace::dto::WorkspaceResponse::from(workspace))
}
