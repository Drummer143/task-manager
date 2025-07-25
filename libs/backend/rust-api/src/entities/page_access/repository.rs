use uuid::Uuid;

pub struct PageAccessRepository;

impl PageAccessRepository {
    pub async fn get_one<'a>(
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

    pub async fn get_list<'a>(
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

    pub async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: super::dto::CreatePageAccessDto,
    ) -> Result<super::model::PageAccess, sqlx::Error> {
        sqlx::query_as::<_, super::model::PageAccess>(
            r#"
        INSERT INTO page_accesses (user_id, page_id, role)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
        )
        .bind(dto.user_id)
        .bind(dto.page_id)
        .bind(dto.role)
        .fetch_one(executor)
        .await
    }

    pub async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: super::dto::UpdatePageAccessDto,
    ) -> Result<super::model::PageAccess, sqlx::Error> {
        if dto.role.is_none() {
            return sqlx::query_as::<_, super::model::PageAccess>(
                r#"
            DELETE FROM page_accesses
            WHERE user_id = $1 AND page_id = $2
            RETURNING *
            "#,
            )
            .bind(dto.user_id)
            .bind(dto.page_id)
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
        .bind(dto.user_id)
        .bind(dto.page_id)
        .bind(dto.role)
        .fetch_one(executor)
        .await
    }
}
