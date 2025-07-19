use error_handlers::handlers::ErrorResponse;
use rust_api::entities::workspace_access::model::WorkspaceAccess;
use uuid::Uuid;

use crate::{
    entities::workspace_access::dto::WorkspaceAccessResponse, shared::traits::{ServiceBase, ServiceCreateMethod, ServiceUpdateMethod},
};

pub struct WorkspaceAccessService;

impl ServiceBase for WorkspaceAccessService {
    type Response = WorkspaceAccess;
}

impl ServiceCreateMethod for WorkspaceAccessService {
    type CreateDto = rust_api::entities::workspace_access::dto::CreateWorkspaceAccessDto;

    async fn create(
        app_state: &crate::types::app_state::AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        rust_api::entities::workspace_access::repository::create_workspace_access(
            &app_state.postgres,
            dto,
        )
        .await
        .map_err(ErrorResponse::from)
    }
}

impl ServiceUpdateMethod for WorkspaceAccessService {
    type UpdateDto = rust_api::entities::workspace_access::dto::UpdateWorkspaceAccessDto;

    async fn update(
        app_state: &crate::types::app_state::AppState,
        _: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        rust_api::entities::workspace_access::repository::update_workspace_access(
            &app_state.postgres,
            dto,
        )
        .await
        .map_err(ErrorResponse::from)
    }
}

impl WorkspaceAccessService {
    pub async fn get_workspace_access<'a>(
        app_state: &crate::types::app_state::AppState,
        user_id: Uuid,
        workspace_id: Uuid,
    ) -> Result<WorkspaceAccessResponse, ErrorResponse> {
        let workspace_access =
            rust_api::entities::workspace_access::repository::get_workspace_access(
                &app_state.postgres,
                user_id,
                workspace_id,
            )
            .await
            .map_err(ErrorResponse::from)?;

        let user = rust_api::entities::user::repository::find_by_id(
            &app_state.postgres,
            workspace_access.user_id,
        )
        .await?;

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
        app_state: &crate::types::app_state::AppState,
        workspace_id: Uuid,
    ) -> Result<Vec<WorkspaceAccessResponse>, ErrorResponse> {
        let workspace_access_list =
            rust_api::entities::workspace_access::repository::get_workspace_access_list(
                &app_state.postgres,
                workspace_id,
            )
            .await
            .map_err(ErrorResponse::from)?;

        let mut workspace_access_list_response = Vec::new();

        for workspace_access in workspace_access_list {
            let user = rust_api::entities::user::repository::find_by_id(
                &app_state.postgres,
                workspace_access.user_id,
            )
            .await?;
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
}
