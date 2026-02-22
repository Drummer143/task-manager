use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::workspace::dto::{CreateWorkspaceRequest, WorkspaceResponse},
    shared::{extractors::json::ValidatedJson, traits::ServiceCreateMethod},
};

#[utoipa::path(
    post,
    path = "/workspaces",
    operation_id = "create_workspace",
    responses(
        (status = 200, description = "Workspace created", body = WorkspaceResponse),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"],
    request_body = CreateWorkspaceRequest,
)]
pub async fn create_workspace(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    ValidatedJson(dto): ValidatedJson<CreateWorkspaceRequest>,
) -> Result<Json<WorkspaceResponse>, ErrorResponse> {
    crate::entities::workspace::WorkspaceService::create(
        &state,
        crate::entities::workspace::db::CreateWorkspaceDto {
            name: dto.name,
            owner_id: user_id,
        },
    )
    .await
    .map_err(|_| ErrorResponse::internal_server_error(None))
    .map(|w| Json(w.into()))
}
