use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct CreateAssetDto {
    pub id: Option<Uuid>,
    pub name: String,
    pub blob_id: Uuid,
    pub entity_id: Uuid,
    pub entity_type: String,
}
