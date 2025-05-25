use uuid::Uuid;

use crate::{dto::workspace::WorkspaceRole, models::workspace::Workspace};

pub async fn create(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    dto: crate::dto::workspace::CreateWorkspaceDto,
) -> Result<Workspace, sqlx::Error> {
    sqlx::query_as::<_, Workspace>(
        "INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *",
    )
    .bind(dto.name)
    .bind(dto.owner_id)
    .fetch_one(executor)
    .await
}

pub async fn get_by_id(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres> + Clone,
    workspace_id: Uuid,
    user_id: Uuid,
) -> Result<(Workspace, WorkspaceRole), sqlx::Error> {
    let row = sqlx::query!(
        r#"
        SELECT w.*, wa.role
        FROM workspaces w
        INNER JOIN workspace_accesses wa ON w.id = wa.workspace_id
        WHERE w.id = $1 AND wa.user_id = $2
        "#,
        workspace_id,
        user_id
    )
    .fetch_one(executor.clone())
    .await?;

    Ok((
        Workspace {
            id: row.id,
            name: row.name,
            owner_id: row.owner_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at,
        },
        WorkspaceRole::from(row.role),
    ))
}
