use std::collections::HashMap;

use axum::{
    extract::{Path, State},
    Extension, Json,
};
use error_handlers::handlers::ErrorResponse;
use rust_api::entities::workspace::dto::UpdateWorkspaceDto;
use uuid::Uuid;

use crate::{entities::workspace::dto::WorkspaceResponse, shared::traits::ServiceUpdateMethod};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}",
    responses(
        (status = 200, description = "Workspace updated successfully", body = WorkspaceResponse),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = UpdateWorkspaceDto,
    tags = ["Workspace"],
)]
#[axum_macros::debug_handler]
pub async fn update_workspace(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(workspace_id): Path<Uuid>,
    Json(dto): Json<UpdateWorkspaceDto>,
) -> Result<WorkspaceResponse, ErrorResponse> {
    let workspace = crate::entities::workspace::WorkspaceService::update(&state, workspace_id, dto)
        .await
        .map(WorkspaceResponse::from)?;

    let payload = HashMap::from([
        ("message", format!("workspace:{}", workspace.id)),
        ("sender", user_id.to_string()),
    ]);
    let payload = serde_json::to_vec(&payload);

    if let Ok(payload) = payload {
        state
            .rabbitmq
            .basic_publish(
                "",
                "refresh_signals",
                lapin::options::BasicPublishOptions::default(),
                &payload,
                lapin::BasicProperties::default(),
            )
            .await;
    }

    Ok(workspace)
}
