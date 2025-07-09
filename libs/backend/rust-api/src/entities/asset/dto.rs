#[derive(Debug, Clone)]
pub struct CreateAssetDto {
    pub id: Option<uuid::Uuid>,
    pub name: String,
    pub path: String,
    pub size: i64,
}
