use chrono::{Duration, Utc};
use error_handlers::handlers::ErrorResponse;
use serde::{Deserialize, Serialize};
use sql::assets::model::{Asset, EntityType};
use uuid::Uuid;

use crate::repos::{
    assets::{AssetsRepository, CreateAssetDto as RepoCreateAssetDto},
    pages::PageRepository,
    tasks::{TaskRepository, UpdateTaskDto},
};

use super::dto::{AssetTarget, CreateAssetDto as ServiceCreateAssetDto, CreateUploadTokenDto};

fn hydrate_asset(
    content: &mut sql::shared::tiptap_content::TipTapContent,
    asset_id: Uuid,
    mime_type: &str,
    size: i64,
    name: &str,
    storage_url: &str,
) -> bool {
    content.hydrate_file_node(asset_id, |attrs| {
        attrs.r#type = Some(mime_type.to_string());
        attrs.size = Some(size as u64);
        attrs.alt = Some(name.to_string());
        attrs.width = Some("100%".to_string());
        attrs.height = Some("auto".to_string());
        attrs.title = Some(name.to_string());
        attrs.href = Some(format!("{}/files/{}", storage_url, asset_id));
        attrs.src = Some(format!("{}/files/{}", storage_url, asset_id));
        attrs.id = Some(asset_id);
    })
}

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
    // COMMANDS

    /// Needs AppState for jwt_secret + postgres
    pub async fn create_upload_token(
        executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
        jwt_secret: &str,
        body: CreateUploadTokenDto,
        user_id: Uuid,
    ) -> Result<String, ErrorResponse> {
        let (entity_type, entity_id) = match body.target {
            AssetTarget::PageText(page_id) => {
                let result = PageRepository::get_one_page_access(executor, user_id, page_id).await;

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
                let result = TaskRepository::has_access(executor, user_id, task_id).await?;

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
            AssetTarget::UserDraft => Ok((EntityType::UserDraft, user_id)),
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
            &jsonwebtoken::EncodingKey::from_secret(jwt_secret.as_bytes()),
        )
        .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))
    }

    /// Needs AppState for jwt_secret + storage_service_url + postgres
    pub async fn create_asset(
        executor: &mut sqlx::PgConnection,
        jwt_secret: &str,
        storage_service_url: &str,
        body: ServiceCreateAssetDto,
    ) -> Result<Asset, ErrorResponse> {
        let token = jsonwebtoken::decode::<UploadToken>(
            &body.token,
            &jsonwebtoken::DecodingKey::from_secret(jwt_secret.as_bytes()),
            &jsonwebtoken::Validation::default(),
        )
        .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))?;

        let asset_id = token.claims.sub;

        match token.claims.entity_type {
            EntityType::PageText => {
                let page_content =
                    PageRepository::get_text_page_content(&mut *executor, token.claims.entity_id)
                        .await?;

                let Some(content_json) = page_content.content.0 else {
                    return Err(ErrorResponse::not_found(
                        error_handlers::codes::NotFoundErrorCode::NotFound,
                        None,
                        None,
                    ));
                };

                let mut content = content_json;

                let found = hydrate_asset(
                    &mut content,
                    asset_id,
                    &body.blob.mime_type,
                    body.blob.size,
                    &token.claims.name,
                    storage_service_url,
                );

                if found {
                    PageRepository::update_content(
                        &mut *executor,
                        token.claims.entity_id,
                        Some(content),
                    )
                    .await
                    .map_err(ErrorResponse::from)?;
                }
            }
            EntityType::TaskDescription => {
                let task =
                    TaskRepository::get_one_by_id(&mut *executor, token.claims.entity_id).await?;

                let Some(mut content) = task.description.0 else {
                    return Err(ErrorResponse::not_found(
                        error_handlers::codes::NotFoundErrorCode::NotFound,
                        None,
                        None,
                    ));
                };

                let found = hydrate_asset(
                    &mut content,
                    asset_id,
                    &body.blob.mime_type,
                    body.blob.size,
                    &token.claims.name,
                    storage_service_url,
                );

                if found {
                    TaskRepository::update(
                        &mut *executor,
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
            EntityType::UserDraft => {
                // Draft assets are created without hydration. They will be linked later.
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
            &mut *executor,
            RepoCreateAssetDto {
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

    pub async fn validate_access(
        executor: impl sqlx::Executor<'_, Database = sqlx::Postgres> + Copy,
        asset_id: Uuid,
        user_id: Uuid,
    ) -> Result<Asset, ErrorResponse> {
        let asset = AssetsRepository::get_one_by_id(executor, asset_id)
            .await
            .map_err(ErrorResponse::from)?;

        let is_valid = match asset.entity_type {
            EntityType::PageText => {
                let page =
                    PageRepository::get_one_page_access(executor, user_id, asset.entity_id).await;

                match page {
                    Ok(_) => Ok(true),
                    Err(sqlx::Error::RowNotFound) => Ok(false),
                    Err(err) => return Err(ErrorResponse::from(err)),
                }
            }

            EntityType::TaskDescription => {
                TaskRepository::has_access(executor, asset.entity_id, user_id)
                    .await
                    .map_err(ErrorResponse::from)
            }

            EntityType::UserAvatar => Ok(true),
            EntityType::UserDraft => Ok(asset.entity_id == user_id),
        }?;

        if !is_valid {
            return Err(ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                None,
                None,
            ));
        }

        Ok(asset)
    }
}
