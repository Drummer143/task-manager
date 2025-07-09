use error_handlers::handlers::ErrorResponse;
use rust_api::entities::asset::model::Asset;

pub async fn create_asset<'a>(
    db: &sqlx::postgres::PgPool,
    create_asset_dto: rust_api::entities::asset::dto::CreateAssetDto,
) -> Result<Asset, ErrorResponse> {
    rust_api::entities::asset::repository::create_asset(
        db,
        rust_api::entities::asset::dto::CreateAssetDto {
            id: create_asset_dto.id,
            name: create_asset_dto.name,
            path: create_asset_dto.path,
            size: create_asset_dto.size,
        },
    )
    .await
    .map_err(ErrorResponse::from)
}
