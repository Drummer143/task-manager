use chrono::Duration;
use uuid::Uuid;

use crate::{
    entities::workspace::model::Workspace,
    shared::{
        traits::{
            PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, PostgresqlRepositoryUpdate,
            RepositoryBase,
        },
        types::SortOrder,
    },
};

use super::{dto::WorkspaceSortBy, model::WorkspaceWithRole};

pub struct WorkspaceRepository;

impl RepositoryBase for WorkspaceRepository {
    type Response = Workspace;
}

impl PostgresqlRepositoryCreate for WorkspaceRepository {
    type CreateDto = super::dto::CreateWorkspaceDto;

    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: Self::CreateDto,
    ) -> Result<Workspace, sqlx::Error> {
        sqlx::query_as::<_, Workspace>("SELECT * FROM workspaces WHERE id = $1")
            .bind(dto.name)
            .bind(dto.owner_id)
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryUpdate for WorkspaceRepository {
    type UpdateDto = super::dto::UpdateWorkspaceDto;

    async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        workspace_id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Workspace, sqlx::Error> {
        let mut builder = sqlx::QueryBuilder::new("UPDATE workspaces SET");

        let mut separated = builder.separated(", ");

        if let Some(name) = dto.name {
            separated.push("name = ").push_bind(name);
        }

        builder
            .push(" WHERE id = ")
            .push_bind(workspace_id)
            .push(" RETURNING *")
            .build_query_as::<Workspace>()
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryGetOneById for WorkspaceRepository {
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        workspace_id: Uuid,
    ) -> Result<Workspace, sqlx::Error> {
        sqlx::query_as::<_, Workspace>("SELECT * FROM workspaces WHERE id = $1")
            .bind(workspace_id)
            .fetch_one(executor)
            .await
    }
}

impl WorkspaceRepository {
    pub async fn get_list<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Copy,
        user_id: Uuid,
        limit: Option<i64>,
        offset: Option<i64>,
        search: Option<String>,
        sort_by: Option<WorkspaceSortBy>,
        sort_order: Option<SortOrder>,
    ) -> Result<(Vec<WorkspaceWithRole>, i64), sqlx::Error> {
        let search_query = if search.is_some() {
            " AND w.name ILIKE "
        } else {
            ""
        };

        let mut builder = sqlx::QueryBuilder::new(
            r#"
        SELECT w.*, wa.role
        FROM workspaces w
        INNER JOIN workspace_accesses wa ON w.id = wa.workspace_id
        WHERE wa.user_id = "#,
        );

        let mut count_builder = sqlx::QueryBuilder::new(
            r#"
        SELECT COUNT(*)
        FROM workspaces w
        INNER JOIN workspace_accesses wa ON w.id = wa.workspace_id
        WHERE wa.user_id = "#,
        );

        builder.push_bind(user_id);
        count_builder.push_bind(user_id);

        if let Some(search) = search {
            builder
                .push(search_query)
                .push_bind(format!("%{}%", search));

            count_builder
                .push(search_query)
                .push_bind(format!("%{}%", search));
        }

        builder
            .push(format!(
                " ORDER BY {} {}",
                sort_by.unwrap_or(WorkspaceSortBy::CreatedAt),
                sort_order.unwrap_or_default().to_string()
            ))
            .push(format!(
                " OFFSET {}",
                offset.unwrap_or(crate::shared::constants::DEFAULT_OFFSET)
            ));

        let limit = crate::shared::utils::calculate_limit(limit);

        if limit > 0 {
            builder.push(format!("LIMIT {}", limit));
        }

        let rows = builder
            .build_query_as::<WorkspaceWithRole>()
            .fetch_all(executor)
            .await?;
        let count = count_builder
            .build_query_scalar::<i64>()
            .fetch_one(executor)
            .await?;

        Ok((rows, count))
    }

    pub async fn soft_delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        workspace_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE workspaces SET deleted_at = $1 WHERE id = $2")
            .bind((chrono::Utc::now() + Duration::days(14)).to_string())
            .bind(workspace_id)
            .execute(executor)
            .await?;

        Ok(())
    }

    pub async fn cancel_soft_delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        workspace_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE workspaces SET deleted_at = NULL WHERE id = $1")
            .bind(workspace_id)
            .execute(executor)
            .await?;

        Ok(())
    }

    pub async fn get_any_workspace_user_has_access_to<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        user_id: Uuid,
    ) -> Result<Workspace, sqlx::Error> {
        let row: Workspace = sqlx::query_as::<_, Workspace>(
        "SELECT w.* FROM workspaces w INNER JOIN workspace_accesses wa ON w.id = wa.workspace_id WHERE wa.user_id = $1 LIMIT 1",
    )
    .bind(user_id)
    .fetch_one(executor)
    .await?;

        Ok(row)
    }
}
