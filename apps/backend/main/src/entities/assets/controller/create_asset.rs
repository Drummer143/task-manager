use axum::{Json, extract::State};
use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::assets::{
        AssetsService,
        dto::{AssetResponse, CreateAssetRequest},
    },
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/assets",
    operation_id = "create_asset",
    request_body = CreateAssetRequest,
    responses(
        (status = 200, description = "Asset created successfully", body = AssetResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Assets"],
)]
pub async fn create_asset(
    State(state): State<AppState>,
    Json(body): Json<CreateAssetRequest>,
) -> Result<Json<AssetResponse>, ErrorResponse> {
    AssetsService::create_asset(&state, body)
        .await
        .map(|asset| {
            Json(AssetResponse {
                id: asset.id,
                name: asset.name,
                created_at: asset.created_at,
            })
        })
}
