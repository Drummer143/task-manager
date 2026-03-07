use axum::{Json, extract::State};
use error_handlers::handlers::ErrorResponse;

use crate::{
    controllers::assets::dto::AssetResponse,
    services::assets::{AssetsService, dto::CreateAssetDto},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/assets",
    operation_id = "create_asset",
    request_body = CreateAssetDto,
    responses(
        (status = 200, description = "Asset created successfully", body = AssetResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Assets"],
)]
pub async fn create_asset(
    State(state): State<AppState>,
    Json(body): Json<CreateAssetDto>,
) -> Result<Json<AssetResponse>, ErrorResponse> {
    let mut tx = state.postgres.begin().await?;

    let asset =
        AssetsService::create_asset(&mut tx, &state.jwt_secret, &state.storage_service_url, body)
            .await?;

    tx.commit().await?;

    Ok(Json(AssetResponse {
        id: asset.id,
        name: asset.name,
        created_at: asset.created_at,
    }))
}
