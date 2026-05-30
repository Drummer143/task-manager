use sql::user::model::User;
use sqlx::Postgres;
use uuid::Uuid;

pub struct UsersRepository;

impl UsersRepository {
    pub async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}
