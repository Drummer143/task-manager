use std::collections::HashMap;

use error_handlers::handlers::ErrorResponse;
use sql::{
    shared::{
        traits::{
            PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, PostgresqlRepositoryUpdate,
        },
        types::SortOrder,
    },
    user::model::User,
    workspace::model::{Workspace, WorkspaceAccess},
};
use uuid::Uuid;

use crate::entities::{
    page::db::PageRepository,
    user::db::UserRepository,
    workspace::{
        db::{
            CreateWorkspaceAccessDto, UpdateWorkspaceAccessDto, WorkspaceRepository,
            WorkspaceSortBy,
        },
        dto::{DetailedWorkspaceResponse, WorkspaceAccessResponse, WorkspaceResponse},
    },
};

pub struct WorkspaceService;

impl WorkspaceService {
    pub async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: crate::entities::workspace::db::CreateWorkspaceDto,
    ) -> Result<Workspace, ErrorResponse> {
        WorkspaceRepository::create(executor, dto)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
        dto: crate::entities::workspace::db::UpdateWorkspaceDto,
    ) -> Result<Workspace, ErrorResponse> {
        WorkspaceRepository::update(executor, id, dto)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
    ) -> Result<Workspace, ErrorResponse> {
        WorkspaceRepository::get_one_by_id(executor, id)
            .await
            .map_err(ErrorResponse::from)
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn get_list(
        pool: &sqlx::PgPool,
        user_id: Uuid,
        limit: Option<i64>,
        offset: Option<i64>,
        search: Option<String>,
        sort_by: Option<WorkspaceSortBy>,
        sort_order: Option<SortOrder>,
    ) -> Result<(Vec<WorkspaceResponse>, i64), ErrorResponse> {
        let (rows, count) = WorkspaceRepository::get_list(
            pool, user_id, limit, offset, search, sort_by, sort_order,
        )
        .await
        .map_err(ErrorResponse::from)?;

        let workspaces = rows.into_iter().map(WorkspaceResponse::from).collect();

        Ok((workspaces, count))
    }

    pub async fn soft_delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        workspace_id: Uuid,
    ) -> Result<(), ErrorResponse> {
        WorkspaceRepository::soft_delete(executor, workspace_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn cancel_soft_delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        workspace_id: Uuid,
    ) -> Result<(), ErrorResponse> {
        WorkspaceRepository::cancel_soft_delete(executor, workspace_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_any_workspace_user_has_access_to<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        user_id: Uuid,
    ) -> Result<Workspace, ErrorResponse> {
        WorkspaceRepository::get_any_workspace_user_has_access_to(executor, user_id)
            .await
            .map_err(ErrorResponse::from)
    }

    // Workspace Access

    pub async fn create_workspace_access<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: CreateWorkspaceAccessDto,
    ) -> Result<WorkspaceAccess, ErrorResponse> {
        WorkspaceRepository::create_workspace_access(executor, dto)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn update_workspace_access<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: UpdateWorkspaceAccessDto,
    ) -> Result<WorkspaceAccess, ErrorResponse> {
        WorkspaceRepository::update_workspace_access(executor, dto)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_workspace_access(
        pool: &sqlx::PgPool,
        user_id: Uuid,
        workspace_id: Uuid,
    ) -> Result<WorkspaceAccessResponse, ErrorResponse> {
        let workspace_access =
            WorkspaceRepository::get_one_workspace_access(pool, user_id, workspace_id)
                .await
                .map_err(ErrorResponse::from)?;

        let user = UserRepository::get_one_by_id(pool, workspace_access.user_id).await?;

        Ok(WorkspaceAccessResponse {
            created_at: workspace_access.created_at,
            updated_at: workspace_access.updated_at,
            deleted_at: workspace_access.deleted_at,
            id: workspace_access.id,
            user,
            role: workspace_access.role,
        })
    }

    pub async fn get_workspace_access_list(
        pool: &sqlx::PgPool,
        workspace_id: Uuid,
    ) -> Result<Vec<WorkspaceAccessResponse>, ErrorResponse> {
        let workspace_access_list =
            WorkspaceRepository::get_workspace_access_list(pool, workspace_id)
                .await
                .map_err(ErrorResponse::from)?;

        let user_ids: Vec<Uuid> = workspace_access_list.iter().map(|a| a.user_id).collect();
        let users = UserRepository::get_users_by_ids(pool, &user_ids).await?;
        let users_map: HashMap<Uuid, User> = users.into_iter().map(|u| (u.id, u)).collect();

        let workspace_access_list_response = workspace_access_list
            .into_iter()
            .filter_map(|workspace_access| {
                let user = users_map.get(&workspace_access.user_id).cloned()?;
                Some(WorkspaceAccessResponse {
                    created_at: workspace_access.created_at,
                    updated_at: workspace_access.updated_at,
                    deleted_at: workspace_access.deleted_at,
                    id: workspace_access.id,
                    user,
                    role: workspace_access.role,
                })
            })
            .collect();

        Ok(workspace_access_list_response)
    }

    pub async fn get_detailed_workspace(
        pool: &sqlx::PgPool,
        access: WorkspaceAccess,
    ) -> Result<DetailedWorkspaceResponse, ErrorResponse> {
        let (pages, workspace, owner) = tokio::join!(
            PageRepository::get_all_in_workspace(pool, access.workspace_id),
            WorkspaceRepository::get_one_by_id(pool, access.workspace_id),
            UserRepository::get_one_by_id(pool, access.user_id),
        );

        let pages = pages?;
        let workspace = workspace?;
        let owner = owner?;

        Ok(DetailedWorkspaceResponse {
            owner,
            role: access.role,
            pages: pages.into_iter().map(Into::into).collect(),
            id: workspace.id,
            name: workspace.name,
            updated_at: workspace.updated_at,
            created_at: workspace.created_at,
            deleted_at: workspace.deleted_at,
        })
    }
}
