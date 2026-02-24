use chrono::{Duration, Utc};
use error_handlers::handlers::ErrorResponse;
use serde::{Deserialize, Serialize};
use sql::{
    assets::model::{Asset, EntityType},
    shared::traits::{PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, PostgresqlRepositoryUpdate},
};
use uuid::Uuid;

use crate::{
    entities::{
        assets::db::{AssetsRepository, CreateAssetDto},
        page::db::PageRepository,
        task::db::{TaskRepository, UpdateTaskDto},
    },
    entities::assets::dto::{AssetTarget, CreateAssetRequest, CreateUploadTokenRequest},
    types::app_state::AppState,
};

pub struct AssetsService;

#[derive(Serialize, Deserialize)]
pub struct UploadToken {
    pub sub: Uuid,
    pub exp: usize,
    pub name: String,
    pub user_id: Uuid,
    pub entity_id: Uuid,
    pub entity_type: EntityType,
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
                    Ok(_) => Ok((EntityType::PageText, page_id)),
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

                Ok((EntityType::TaskDescription, task_id))
            }

            AssetTarget::Avatar(user_id) => Ok((EntityType::UserAvatar, user_id)),
        }?;

        jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &UploadToken {
                sub: body.asset_id,
                name: body.name,
                user_id,
                entity_id,
                entity_type,
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

        let asset_id = token.claims.sub;

        match token.claims.entity_type {
            EntityType::PageText => {
                let page_content =
                    PageRepository::get_text_page_content(&state.postgres, token.claims.entity_id)
                        .await?;

                let Some(content_json) = page_content.content.0 else {
                    return Err(ErrorResponse::not_found(
                        error_handlers::codes::NotFoundErrorCode::NotFound,
                        None,
                        None,
                    ));
                };

                let mut content = content_json;

                let found = content.hydrate_file_node(asset_id, |attrs| {
                    attrs.r#type = Some(body.blob.mime_type);
                    attrs.size = Some(body.blob.size as u64);
                    attrs.alt = Some(token.claims.name.clone());
                    attrs.width = Some("100%".to_string());
                    attrs.height = Some("auto".to_string());
                    attrs.title = Some(token.claims.name.clone());
                    attrs.href = Some(format!("http://localhost:8082/files/{}", asset_id));
                    attrs.src = Some(format!("http://localhost:8082/files/{}", asset_id));
                    attrs.id = Some(asset_id);
                });

                if found {
                    PageRepository::update_content(
                        &state.postgres,
                        token.claims.entity_id,
                        Some(content),
                    )
                    .await
                    .map_err(ErrorResponse::from)?;
                }
            }
            EntityType::TaskDescription => {
                let task =
                    TaskRepository::get_one_by_id(&state.postgres, token.claims.entity_id)
                        .await?;

                let Some(mut content) = task.description.0 else {
                    return Err(ErrorResponse::not_found(
                        error_handlers::codes::NotFoundErrorCode::NotFound,
                        None,
                        None,
                    ));
                };

                let found = content.hydrate_file_node(asset_id, |attrs| {
                    attrs.r#type = Some(body.blob.mime_type);
                    attrs.size = Some(body.blob.size as u64);
                    attrs.alt = Some(token.claims.name.clone());
                    attrs.width = Some("100%".to_string());
                    attrs.height = Some("auto".to_string());
                    attrs.title = Some(token.claims.name.clone());
                    attrs.href = Some(format!("http://localhost:8082/files/{}", asset_id));
                    attrs.src = Some(format!("http://localhost:8082/files/{}", asset_id));
                    attrs.id = Some(asset_id);
                });

                if found {
                    TaskRepository::update(
                        &state.postgres,
                        token.claims.entity_id,
                        UpdateTaskDto {
                            description: Some(Some(content)),
                            assignee_id: None,
                            due_date: None,
                            position: None,
                            status_id: None,
                            title: None,
                        },
                    )
                    .await
                    .map_err(ErrorResponse::from)?;
                }
            }
            _ => {
                return Err(ErrorResponse::forbidden(
                    error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                    None,
                    None,
                ));
            }
        }

        AssetsRepository::create(
            &state.postgres,
            CreateAssetDto {
                blob_id: body.blob.id,
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
