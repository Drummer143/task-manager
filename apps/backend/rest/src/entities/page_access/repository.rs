use uuid::Uuid;

pub async fn get_page_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    page_id: Uuid,
) -> Result<super::model::PageAccess, sqlx::Error> {
    sqlx::query_as::<_, super::model::PageAccess>(
        r#"
        SELECT * FROM page_accesses
        WHERE user_id = $1 AND page_id = $2
        "#,
    )
    .bind(user_id)
    .bind(page_id)
    .fetch_one(executor)
    .await
}

pub async fn get_page_access_list<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<Vec<super::model::PageAccess>, sqlx::Error> {
    sqlx::query_as::<_, super::model::PageAccess>(
        r#"
        SELECT * FROM page_accesses
        WHERE page_id = $1
        "#,
    )
    .bind(page_id)
    .fetch_all(executor)
    .await
}

pub async fn create_page_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    page_id: Uuid,
    role: super::model::Role,
) -> Result<super::model::PageAccess, sqlx::Error> {
    sqlx::query_as::<_, super::model::PageAccess>(
        r#"
        INSERT INTO page_accesses (user_id, page_id, role)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(page_id)
    .bind(role)
    .fetch_one(executor)
    .await
}

pub async fn update_page_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    page_id: Uuid,
    role: Option<super::model::Role>,
) -> Result<super::model::PageAccess, sqlx::Error> {
    if role.is_none() {
        return sqlx::query_as::<_, super::model::PageAccess>(
            r#"
            DELETE FROM page_accesses
            WHERE user_id = $1 AND page_id = $2
            RETURNING *
            "#,
        )
        .bind(user_id)
        .bind(page_id)
        .fetch_one(executor)
        .await;
    }

    sqlx::query_as::<_, super::model::PageAccess>(
        r#"
            UPDATE page_accesses
            SET role = $3
            WHERE user_id = $1 AND page_id = $2
            RETURNING *
            "#,
    )
    .bind(user_id)
    .bind(page_id)
    .bind(role)
    .fetch_one(executor)
    .await
}
