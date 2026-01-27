use chrono::{Duration, Utc};
use error_handlers::handlers::ErrorResponse;
use serde::{Deserialize, Serialize};
use sql::{
    assets::{AssetsRepository, model::Asset},
    page::PageRepository,
    shared::traits::PostgresqlRepositoryCreate,
    task::TaskRepository,
};
use uuid::Uuid;

use crate::{
    entities::assets::dto::{AssetTarget, CreateAssetRequest, CreateUploadTokenRequest},
    types::app_state::AppState,
};

pub struct AssetsService;

#[derive(Serialize, Deserialize)]
pub struct UploadToken {
    pub sub: Uuid,
    pub exp: usize,
    pub name: String,
    pub entity_id: Uuid,
    pub entity_type: String,
}

impl AssetsService {
    pub async fn create_upload_token(
        state: &AppState,
        body: CreateUploadTokenRequest,
        user_id: Uuid,
    ) -> Result<String, ErrorResponse> {
        let (entity_type, entity_id) = match body.target {
            AssetTarget::PageText(page_id) => {
                let result =
                    PageRepository::get_one_page_access(&state.postgres, user_id, page_id).await;

                match result {
                    Ok(_) => Ok(("page_text", page_id)),
                    Err(error) => match error {
                        sqlx::Error::RowNotFound => Err(ErrorResponse::forbidden(
                            error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                            None,
                            None,
                        )),
                        _ => Err(ErrorResponse::internal_server_error(Some(
                            error.to_string(),
                        ))),
                    },
                }
            }

            AssetTarget::TaskDescription(task_id) => {
                let result = TaskRepository::has_access(&state.postgres, user_id, task_id).await?;

                if !result {
                    return Err(ErrorResponse::forbidden(
                        error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                        None,
                        None,
                    ));
                }

                Ok(("task_description", task_id))
            }
        }?;

        jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &UploadToken {
                sub: body.asset_id,
                name: body.name,
                entity_id,
                entity_type: entity_type.to_string(),
                exp: Utc::now()
                    .checked_add_signed(Duration::minutes(10))
                    .expect("invalid timestamp")
                    .timestamp() as usize,
            },
            &jsonwebtoken::EncodingKey::from_secret(state.jwt_secret.as_bytes()),
        )
        .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))
    }

    pub async fn create_asset(
        state: &AppState,
        body: CreateAssetRequest,
    ) -> Result<Asset, ErrorResponse> {
        let token = jsonwebtoken::decode::<UploadToken>(
            &body.token,
            &jsonwebtoken::DecodingKey::from_secret(state.jwt_secret.as_bytes()),
            &jsonwebtoken::Validation::default(),
        )
        .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))?;

        AssetsRepository::create(
            &state.postgres,
            sql::assets::dto::CreateAssetDto {
                blob_id: body.blob_id,
                entity_id: token.claims.entity_id,
                entity_type: token.claims.entity_type,
                id: Some(token.claims.sub),
                name: token.claims.name,
            },
        )
        .await
        .map_err(ErrorResponse::from)
    }
}
