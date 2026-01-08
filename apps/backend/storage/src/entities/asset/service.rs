use error_handlers::handlers::ErrorResponse;
use sql::{entities::asset::model::Asset, shared::traits::PostgresqlRepositoryCreate};

pub async fn create_asset<'a>(
    db: &sqlx::postgres::PgPool,
    create_asset_dto: sql::entities::asset::dto::CreateAssetDto,
) -> Result<Asset, ErrorResponse> {
    sql::entities::asset::AssetRepository::create(
        db,
        sql::entities::asset::dto::CreateAssetDto {
            id: create_asset_dto.id,
            name: create_asset_dto.name,
            path: create_asset_dto.path,
            size: create_asset_dto.size,
        },
    )
    .await
    .map_err(ErrorResponse::from)
}
