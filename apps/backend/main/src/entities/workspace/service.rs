use error_handlers::handlers::ErrorResponse;
use rust_api::{
    entities::workspace::{dto::WorkspaceSortBy, model::Workspace},
    shared::{traits::{PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, PostgresqlRepositoryUpdate}, types::SortOrder},
};
use uuid::Uuid;

use crate::{
    entities::page::dto::PageResponseWithoutInclude,
    shared::traits::{
        ServiceBase, ServiceCreateMethod, ServiceGetOneByIdMethod, ServiceUpdateMethod,
    },
    types::app_state::AppState,
};

use super::dto::WorkspaceInfo;

pub struct WorkspaceService;

impl ServiceBase for WorkspaceService {
    type Response = WorkspaceInfo;
}

impl ServiceCreateMethod for WorkspaceService {
    type CreateDto = rust_api::entities::workspace::dto::CreateWorkspaceDto;

    async fn create(
        app_state: &AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

        let workspace = rust_api::entities::workspace::WorkspaceRepository::create(&mut *tx, dto).await;

        if let Err(err) = workspace {
            let _ = tx.rollback().await;
            return Err(ErrorResponse::from(err));
        }

        let workspace = workspace.unwrap();

        let workspace_access =
            rust_api::entities::workspace_access::WorkspaceAccessRepository::create(
                &mut *tx,
                rust_api::entities::workspace_access::dto::CreateWorkspaceAccessDto {
                    user_id: workspace.owner_id,
                    workspace_id: workspace.id,
                    role: rust_api::entities::workspace_access::model::Role::Owner,
                },
            )
            .await;

        if let Err(err) = workspace_access {
            let _ = tx.rollback().await;
            return Err(ErrorResponse::from(err));
        }

        tx.commit().await.map_err(ErrorResponse::from)?;

        Ok(WorkspaceInfo {
            workspace,
            role: Some(rust_api::entities::workspace_access::model::Role::Owner),
            owner: None,
            pages: None,
        })
    }
}

impl ServiceUpdateMethod for WorkspaceService {
    type UpdateDto = rust_api::entities::workspace::dto::UpdateWorkspaceDto;

    async fn update(
        app_state: &AppState,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let workspace =
            rust_api::entities::workspace::WorkspaceRepository::update(&app_state.postgres, id, dto)
                .await
                .map_err(ErrorResponse::from)?;

        Ok(WorkspaceInfo {
            workspace,
            role: None,
            owner: None,
            pages: None,
        })
    }
}

impl ServiceGetOneByIdMethod for WorkspaceService {
    async fn get_one_by_id(
        app_state: &AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        let workspace =
            rust_api::entities::workspace::WorkspaceRepository::get_one_by_id(&app_state.postgres, id)
                .await
                .map_err(ErrorResponse::from)?;

        Ok(WorkspaceInfo {
            workspace,
            role: None,
            owner: None,
            pages: None,
        })
    }
}

impl WorkspaceService {
    pub async fn get_list(
        app_state: &AppState,
        user_id: Uuid,
        limit: Option<i64>,
        offset: Option<i64>,
        search: Option<String>,
        sort_by: Option<WorkspaceSortBy>,
        sort_order: Option<SortOrder>,
        include_owner: bool,
        include_pages: bool,
    ) -> Result<(Vec<super::dto::WorkspaceInfo>, i64), ErrorResponse> {
        let (rows, count) = rust_api::entities::workspace::WorkspaceRepository::get_list(
            &app_state.postgres,
            user_id,
            limit,
            offset,
            search,
            sort_by,
            sort_order,
        )
        .await
        .map_err(ErrorResponse::from)?;

        let mut workspace_info_arr: Vec<WorkspaceInfo> = Vec::with_capacity(rows.len());

        for row in rows {
            workspace_info_arr.push(WorkspaceInfo {
                workspace: Workspace {
                    id: row.id,
                    name: row.name,
                    owner_id: row.owner_id,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    deleted_at: row.deleted_at,
                },
                role: Some(row.role),
                owner: if include_owner {
                    Some(
                        rust_api::entities::user::UserRepository::get_one_by_id(
                            &app_state.postgres,
                            row.owner_id,
                        )
                        .await
                        .map_err(ErrorResponse::from)?,
                    )
                } else {
                    None
                },
                pages: if include_pages {
                    Some(
                        sqlx::query_as::<_, rust_api::entities::page::model::Page>(
                            "SELECT * FROM pages WHERE workspace_id = $1",
                        )
                        .bind(row.id)
                        .fetch_all(&app_state.postgres)
                        .await
                        .map(|pages| {
                            pages
                                .into_iter()
                                .map(|page| PageResponseWithoutInclude::from(page))
                                .collect()
                        })
                        .map_err(ErrorResponse::from)?,
                    )
                } else {
                    None
                },
            });
        }

        Ok((workspace_info_arr, count))
    }

    pub async fn soft_delete(
        app_state: &AppState,
        workspace_id: Uuid,
    ) -> Result<(), ErrorResponse> {
        rust_api::entities::workspace::WorkspaceRepository::soft_delete(&app_state.postgres, workspace_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn cancel_soft_delete(
        app_state: &AppState,
        workspace_id: Uuid,
    ) -> Result<(), ErrorResponse> {
        rust_api::entities::workspace::WorkspaceRepository::cancel_soft_delete(
            &app_state.postgres,
            workspace_id,
        )
        .await
        .map_err(ErrorResponse::from)
    }

    pub async fn get_any_workspace_user_has_access_to(
        app_state: &AppState,
        user_id: Uuid,
    ) -> Result<Workspace, ErrorResponse> {
        rust_api::entities::workspace::WorkspaceRepository::get_any_workspace_user_has_access_to(
            &app_state.postgres,
            user_id,
        )
        .await
        .map_err(ErrorResponse::from)
    }
}
