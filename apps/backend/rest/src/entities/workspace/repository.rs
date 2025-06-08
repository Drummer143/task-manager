use chrono::Duration;
use uuid::Uuid;

use crate::{entities::workspace::model::Workspace, types::pagination::SortOrder};

use super::{dto::WorkspaceSortBy, model::WorkspaceWithRole};

pub async fn create<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    dto: super::dto::WorkspaceDto,
) -> Result<Workspace, sqlx::Error> {
    sqlx::query_as::<_, Workspace>(
        "INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *",
    )
    .bind(dto.name)
    .bind(dto.owner_id)
    .fetch_one(executor)
    .await
}

pub async fn update<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    workspace_id: Uuid,
    dto: super::dto::WorkspaceDto,
) -> Result<Workspace, sqlx::Error> {
    sqlx::query_as::<_, Workspace>(
        "UPDATE workspaces SET name = $1 WHERE id = $2 RETURNING *",
    )
    .bind(dto.name)
    .bind(workspace_id)
    .fetch_one(executor)
    .await
}

pub async fn get_by_id<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    workspace_id: Uuid,
    user_id: Uuid,
) -> Result<WorkspaceWithRole, sqlx::Error> {
    let row = sqlx::query_as::<_, WorkspaceWithRole>(
        r#"
        SELECT w.*, wa.role
        FROM workspaces w
        INNER JOIN workspace_accesses wa ON w.id = wa.workspace_id
        WHERE w.id = $1 AND wa.user_id = $2
        "#,
    )
    .bind(workspace_id)
    .bind(user_id)
    .fetch_one(executor)
    .await?;

    Ok(row)
}

pub async fn get_list<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Clone,
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
            " LIMIT {} OFFSET {}",
            limit.unwrap_or(10),
            offset.unwrap_or(0)
        ));

    let rows = builder
        .build_query_as::<WorkspaceWithRole>()
        .fetch_all(executor.clone())
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
    sqlx::query(
        "UPDATE workspaces SET deleted_at = $1 WHERE id = $2",
    )
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
    sqlx::query(
        "UPDATE workspaces SET deleted_at = NULL WHERE id = $1",
    )
    .bind(workspace_id)
    .execute(executor)
    .await?;

    Ok(())
}
