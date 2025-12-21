use axum::{Extension, extract::State};
use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::workspace::dto::{CreateWorkspaceDto, WorkspaceResponse},
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
    request_body = CreateWorkspaceDto,
)]
pub async fn create_workspace(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    ValidatedJson(dto): ValidatedJson<CreateWorkspaceDto>,
) -> Result<WorkspaceResponse, ErrorResponse> {
    let workspace = crate::entities::workspace::WorkspaceService::create(
        &state,
        rust_api::entities::workspace::dto::CreateWorkspaceDto {
            name: dto.name,
            owner_id: user_id,
        },
    )
    .await
    .map_err(|_| ErrorResponse::internal_server_error(None))?;

    Ok(workspace.into())
}
