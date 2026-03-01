use sql::assets::model::EntityType;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct CreateAssetDto {
    pub id: Option<Uuid>,
    pub name: String,
    pub blob_id: Uuid,
    pub entity_id: Uuid,
    pub entity_type: EntityType,
}

#[derive(Debug, Clone)]
pub struct UpdateAssetDto {
    pub id: Option<Uuid>,
    pub name: Option<String>,
    pub blob_id: Option<Uuid>,
}
