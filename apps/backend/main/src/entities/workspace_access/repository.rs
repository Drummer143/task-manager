use uuid::Uuid;

pub async fn get_workspace_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    workspace_id: Uuid,
) -> Result<super::model::WorkspaceAccess, sqlx::Error> {
    sqlx::query_as::<_, super::model::WorkspaceAccess>(
        r#"
        SELECT * FROM workspace_accesses
        WHERE user_id = $1 AND workspace_id = $2
        "#,
    )
    .bind(user_id)
    .bind(workspace_id)
    .fetch_one(executor)
    .await
}

pub async fn get_workspace_access_list<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    workspace_id: Uuid,
) -> Result<Vec<super::model::WorkspaceAccess>, sqlx::Error> {
    sqlx::query_as::<_, super::model::WorkspaceAccess>(
        r#"
        SELECT * FROM workspace_accesses
        WHERE workspace_id = $1
        "#,
    )
    .bind(workspace_id)
    .fetch_all(executor)
    .await
}

pub async fn create_workspace_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    workspace_id: Uuid,
    role: super::model::Role,
) -> Result<super::model::WorkspaceAccess, sqlx::Error> {
    println!("user_id: {}", user_id);
    println!("workspace_id: {}", workspace_id);
    println!("role: {}", role);

    sqlx::query_as::<_, super::model::WorkspaceAccess>(
        r#"
        INSERT INTO workspace_accesses (user_id, workspace_id, role)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(workspace_id)
    .bind(role)
    .fetch_one(executor)
    .await
}

pub async fn update_workspace_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    workspace_id: Uuid,
    role: Option<super::model::Role>,
) -> Result<super::model::WorkspaceAccess, sqlx::Error> {
    if role.is_none() {
        return sqlx::query_as::<_, super::model::WorkspaceAccess>(
            r#"
            DELETE FROM workspace_accesses
            WHERE user_id = $1 AND workspace_id = $2
            RETURNING *
            "#,
        )
        .bind(user_id)
        .bind(workspace_id)
        .fetch_one(executor)
        .await;
    }

    let workspace_access = sqlx::query_as::<_, super::model::WorkspaceAccess>(
        r#"
            UPDATE workspace_accesses
            SET role = $3
            WHERE user_id = $1 AND workspace_id = $2
            RETURNING *
            "#,
    )
    .bind(user_id)
    .bind(workspace_id)
    .bind(role.unwrap())
    .fetch_one(executor)
    .await?;

    dbg!(&workspace_access);

    Ok(workspace_access)
}
