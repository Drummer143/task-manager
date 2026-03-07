use crate::services::assets::AssetsService;
use axum::{
    Json,
    extract::{Path, State},
};
use axum_extra::{
    TypedHeader,
    headers::{Header, HeaderName, HeaderValue},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

pub struct XUserId(pub Uuid);

static X_USER_ID: HeaderName = HeaderName::from_static("x-user-id");

impl Header for XUserId {
    fn name() -> &'static HeaderName {
        &X_USER_ID
    }

    fn decode<'i, I>(values: &mut I) -> Result<Self, axum_extra::headers::Error>
    where
        I: Iterator<Item = &'i HeaderValue>,
    {
        let value = values
            .next()
            .ok_or_else(axum_extra::headers::Error::invalid)?;
        let s = value
            .to_str()
            .map_err(|_| axum_extra::headers::Error::invalid())?;
        let uuid = Uuid::parse_str(s).map_err(|_| axum_extra::headers::Error::invalid())?;
        Ok(XUserId(uuid))
    }

    fn encode<E: Extend<HeaderValue>>(&self, values: &mut E) {
        let value = HeaderValue::from_str(&self.0.to_string()).unwrap();
        values.extend(std::iter::once(value));
    }
}

use crate::{entities::assets::dto::ValidateAccessResponse, types::app_state::AppState};

#[utoipa::path(
    get,
    path = "/assets/{id}/blob-id",
    operation_id = "validate_access",
    params(
        ("id" = Uuid, Path, description = "Asset id"),
        ("x-user-id", Header, description = "User ID from auth middleware"),
    ),
    responses(
        (status = 200, description = "Blob id retrieved successfully", body = ValidateAccessResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Assets"],
)]
pub async fn validate_access(
    State(state): State<AppState>,
    Path(asset_id): Path<Uuid>,
    TypedHeader(XUserId(user_id)): TypedHeader<XUserId>,
) -> Result<Json<ValidateAccessResponse>, ErrorResponse> {
    AssetsService::validate_access(&state.postgres, asset_id, user_id)
        .await
        .map(|asset| {
            Json(ValidateAccessResponse {
                blob_id: asset.blob_id,
                name: asset.name,
            })
        })
}
