use axum::{
    extract::{Multipart, State},
    response::IntoResponse,
    Json,
};
use error_handlers::{codes, handlers::ErrorResponse};
use std::{collections::HashMap, env};
use tokio::{fs::File, io::AsyncWriteExt};

use crate::{
    entities::actions::dto::{UploadRequest, UploadResponse},
    types,
};

#[utoipa::path(
    post,
    path = "/actions/upload",
    request_body(
        content = UploadRequest,
        content_type = "multipart/form-data"
    ),
    responses(
        (status = 201, description = "File uploaded successfully", body = UploadResponse),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
    ),
    tags = ["File"],
)]
#[axum_macros::debug_handler]
pub async fn upload(
    State(state): State<types::app_state::AppState>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let mut filename: Option<String> = None;
    let mut name: Option<String> = None;
    let mut file_bytes: Vec<u8> = Vec::new();

    while let Ok(Some(mut field)) = multipart.next_field().await {
        let field_name = field.name().unwrap_or_default();

        match field_name {
            "file" => {
                if let Some(f) = field.file_name() {
                    filename = Some(f.to_string());

                    while let Ok(Some(chunk)) = field.chunk().await {
                        file_bytes.extend_from_slice(&chunk);
                    }
                }
            }
            "name" => {
                if let Ok(value) = field.text().await {
                    name = Some(value);
                }
            }
            _ => {}
        }
    }

    let throw_bad_request = |field_name: &str| {
        let details: HashMap<String, String> = HashMap::from([(
            codes::FieldErrorCode::MissingField.to_string(),
            field_name.to_string(),
        )]);
        ErrorResponse::bad_request(codes::BadRequestErrorCode::InvalidBody, Some(details), None)
    };

    let filename = filename.ok_or_else(|| throw_bad_request("file"))?;
    let file_id = uuid::Uuid::new_v4();

    if name.as_ref().map(|s| s.is_empty()).unwrap_or(true) {
        name = Some(filename.clone());
    }

    let name = name.ok_or_else(|| throw_bad_request("name"))?;

    let mut file_path = std::path::PathBuf::from(format!(
        "{}/{}/{}",
        env::var("STATIC_FOLDER_PATH").unwrap(),
        file_id,
        name
    ));

    if let Err(e) = tokio::fs::create_dir_all(file_path.parent().unwrap()).await {
        return Err(ErrorResponse::internal_server_error(Some(e.to_string())));
    }

    if file_path.extension().is_none() && filename != name {
        let filename_buf = std::path::PathBuf::from(&filename);

        if let Some(extension) = filename_buf.extension() {
            file_path.set_extension(extension);
        }
    }

    let mut file = File::create(&file_path).await.map_err(|e| {
        ErrorResponse::internal_server_error(Some(format!(
            "{}\n\n\n{}",
            e.to_string(),
            file_path.display().to_string()
        )))
    })?;

    if let Err(e) = file.write_all(&file_bytes).await {
        let _ = tokio::fs::remove_file(&file_path).await;
        return Err(ErrorResponse::internal_server_error(Some(e.to_string())));
    }

    if let Err(e) = file.flush().await {
        let _ = tokio::fs::remove_file(&file_path).await;
        return Err(ErrorResponse::internal_server_error(Some(e.to_string())));
    }

    let link = format!(
        "http://{}:{}/files/{}/{}",
        env::var("SELF_HOST").unwrap_or("localhost".to_string()),
        env::var("SELF_PORT").unwrap_or("8082".to_string()),
        file_id,
        name
    );

    let create_asset_result = crate::entities::asset::service::create_asset(
        &state.postgres,
        rust_api::entities::asset::dto::CreateAssetDto {
            id: Some(file_id),
            name,
            path: file_path.to_str().unwrap().to_string(),
            size: file_bytes.len() as i64,
        },
    )
    .await;

    match create_asset_result {
        Ok(asset) => Ok(Json(UploadResponse {
            link,
            name: asset.name,
            size: asset.size,
            created_at: asset.created_at,
        })
        .into_response()),
        Err(e) => Err(e),
    }
}
