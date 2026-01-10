use uuid::Uuid;

#[derive(sqlx::FromRow)]
pub struct Blob {
    pub id: Uuid,
    pub hash: String,
    pub size: i64,
    pub path: String,
    pub mime_type: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}
