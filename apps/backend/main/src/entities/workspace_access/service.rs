use error_handlers::handlers::ErrorResponse;
use rust_api::entities::workspace_access::model::WorkspaceAccess;
use uuid::Uuid;

use crate::entities::workspace_access::dto::WorkspaceAccessResponse;

pub async fn get_workspace_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Copy,
    user_id: Uuid,
    workspace_id: Uuid,
) -> Result<WorkspaceAccessResponse, ErrorResponse> {
    let workspace_access = rust_api::entities::workspace_access::repository::get_workspace_access(
        executor,
        user_id,
        workspace_id,
    )
    .await
    .map_err(ErrorResponse::from)?;

    let user =
        crate::entities::user::service::find_by_id(executor, workspace_access.user_id).await?;

    Ok(WorkspaceAccessResponse {
        created_at: workspace_access.created_at,
        updated_at: workspace_access.updated_at,
        deleted_at: workspace_access.deleted_at,
        id: workspace_access.id,
        user,
        role: workspace_access.role,
    })
}

pub async fn get_workspace_access_list<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Copy,
    workspace_id: Uuid,
) -> Result<Vec<WorkspaceAccessResponse>, ErrorResponse> {
    let workspace_access_list =
        rust_api::entities::workspace_access::repository::get_workspace_access_list(
            executor,
            workspace_id,
        )
        .await
        .map_err(ErrorResponse::from)?;

    let mut workspace_access_list_response = Vec::new();

    for workspace_access in workspace_access_list {
        let user =
            crate::entities::user::service::find_by_id(executor, workspace_access.user_id).await?;
        workspace_access_list_response.push(WorkspaceAccessResponse {
            created_at: workspace_access.created_at,
            updated_at: workspace_access.updated_at,
            deleted_at: workspace_access.deleted_at,
            id: workspace_access.id,
            user,
            role: workspace_access.role,
        });
    }

    Ok(workspace_access_list_response)
}

pub async fn create_workspace_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    workspace_id: Uuid,
    role: rust_api::entities::workspace_access::model::Role,
) -> Result<WorkspaceAccess, ErrorResponse> {
    rust_api::entities::workspace_access::repository::create_workspace_access(
        executor,
        user_id,
        workspace_id,
        role,
    )
    .await
    .map_err(ErrorResponse::from)
}

pub async fn update_workspace_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    workspace_id: Uuid,
    role: Option<rust_api::entities::workspace_access::model::Role>,
) -> Result<WorkspaceAccess, ErrorResponse> {
    rust_api::entities::workspace_access::repository::update_workspace_access(
        executor,
        user_id,
        workspace_id,
        role,
    )
    .await
    .map_err(ErrorResponse::from)
}
