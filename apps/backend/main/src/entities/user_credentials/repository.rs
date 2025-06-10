use sqlx::Postgres;

use super::model::UserCredentials;

pub async fn verify_credentials<'a>(
    executor: impl sqlx::Executor<'a, Database = Postgres>,
    user_id: uuid::Uuid,
    password: &str,
) -> bool {
    let credentials = sqlx::query_as::<_, UserCredentials>(
        "SELECT * FROM user_credentials WHERE user_id = $1 AND deleted_at IS NULL",
    )
    .bind(user_id)
    .fetch_one(executor)
    .await;

    if credentials.is_err() {
        return false;
    }

    let credentials = credentials.unwrap();

    let is_valid = bcrypt::verify(password, &credentials.password_hash);

    if is_valid.is_err() {
        return false;
    }

    is_valid.unwrap()
}

pub async fn create_credentials<'a>(
    executor: impl sqlx::Executor<'a, Database = Postgres>,
    user_id: uuid::Uuid,
    password: &str,
) -> Result<(), sqlx::Error> {
    let password_hash = bcrypt::hash(password, bcrypt::DEFAULT_COST);

    if password_hash.is_err() {
        return Err(sqlx::Error::WorkerCrashed);
    }

    let password_hash = password_hash.unwrap();

    sqlx::query(
        "INSERT INTO user_credentials (password_hash, user_id) VALUES ($1, $2) RETURNING *",
    )
    .bind(password_hash)
    .bind(user_id)
    .execute(executor)
    .await?;

    Ok(())
}
