use uuid::Uuid;

#[derive(Debug, sqlx::FromRow, serde::Serialize, Clone, utoipa::ToSchema)]
pub struct Workspace {
    pub id: Uuid,
    pub name: String,
    pub owner_id: Uuid,

    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub deleted_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct WorkspaceWithRole {
    pub id: Uuid,
    pub name: String,
    pub owner_id: Uuid,

    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub deleted_at: Option<chrono::DateTime<chrono::Utc>>,

    pub role: crate::entities::workspace_access::model::Role,
}
