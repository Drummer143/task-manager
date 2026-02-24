use std::io::Cursor;

use axum::{Extension, Json, extract::Multipart, extract::State, http::StatusCode};
use error_handlers::handlers::ErrorResponse;
use image::GenericImageView;
use sql::{
    assets::model::EntityType, shared::traits::{PostgresqlRepositoryCreate, PostgresqlRepositoryUpdate}, user::model::User
};
use uuid::Uuid;

use crate::{
    entities::{
        assets::db::{AssetsRepository, CreateAssetDto},
        user::db::UserRepository,
    },
    types::app_state::AppState,
};

#[derive(serde::Deserialize)]
struct StorageBlobResponse {
    id: Uuid,
    #[allow(dead_code)]
    hash: String,
    #[allow(dead_code)]
    size: i64,
    #[allow(dead_code)]
    path: String,
    #[allow(dead_code)]
    mime_type: String,
}

fn bad_request(msg: String) -> ErrorResponse {
    ErrorResponse::bad_request(
        error_handlers::codes::BadRequestErrorCode::InvalidBody,
        None,
        Some(msg),
    )
}

fn parse_f64_field(value: &str, name: &str) -> Result<f64, ErrorResponse> {
    value
        .parse::<f64>()
        .map_err(|_| bad_request(format!("Invalid '{}' value", name)))
}

#[derive(utoipa::ToSchema)]
struct UploadAvatarForm {
    #[allow(dead_code)]
    #[schema(format = "binary")]
    file: String,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    x: Option<f64>,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    y: Option<f64>,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    width: Option<f64>,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    height: Option<f64>,
}

#[utoipa::path(
    put,
    path = "/profile/avatar",
    operation_id = "upload_avatar",
    request_body(
        content_type = "multipart/form-data",
        content = UploadAvatarForm,
    ),
    responses(
        (status = 200, description = "Updated user with new avatar", body = User),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
    ),
    tags = ["Profile"],
)]
pub async fn upload_avatar(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    mut multipart: Multipart,
) -> Result<Json<User>, ErrorResponse> {
    let mut file_bytes: Option<Vec<u8>> = None;
    let mut file_name: Option<String> = None;
    let mut crop_x: Option<f64> = None;
    let mut crop_y: Option<f64> = None;
    let mut crop_width: Option<f64> = None;
    let mut crop_height: Option<f64> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| bad_request(e.to_string()))?
    {
        let field_name = field.name().unwrap_or_default().to_string();

        match field_name.as_str() {
            "file" => {
                file_name = field.file_name().map(|s| s.to_string());
                let bytes = field
                    .bytes()
                    .await
                    .map_err(|e| bad_request(e.to_string()))?;
                file_bytes = Some(bytes.to_vec());
            }
            "x" => {
                let val = field.text().await.map_err(|e| bad_request(e.to_string()))?;
                crop_x = Some(parse_f64_field(&val, "x")?);
            }
            "y" => {
                let val = field.text().await.map_err(|e| bad_request(e.to_string()))?;
                crop_y = Some(parse_f64_field(&val, "y")?);
            }
            "width" => {
                let val = field.text().await.map_err(|e| bad_request(e.to_string()))?;
                crop_width = Some(parse_f64_field(&val, "width")?);
            }
            "height" => {
                let val = field.text().await.map_err(|e| bad_request(e.to_string()))?;
                crop_height = Some(parse_f64_field(&val, "height")?);
            }
            _ => {}
        }
    }

    let raw_bytes = file_bytes.ok_or_else(|| bad_request("Missing 'file' field".to_string()))?;
    let file_name = file_name.unwrap_or_else(|| "avatar.png".to_string());

    // Crop image if area is provided
    let cropped_bytes = if let (Some(x), Some(y), Some(w), Some(h)) =
        (crop_x, crop_y, crop_width, crop_height)
    {
        let img = image::load_from_memory(&raw_bytes)
            .map_err(|e| bad_request(format!("Invalid image: {}", e)))?;

        let (img_w, img_h) = img.dimensions();

        // react-easy-crop sends percentages (0..100) or pixels — here we treat as pixels
        let cx = (x as u32).min(img_w);
        let cy = (y as u32).min(img_h);
        let cw = (w as u32).min(img_w.saturating_sub(cx));
        let ch = (h as u32).min(img_h.saturating_sub(cy));

        if cw == 0 || ch == 0 {
            return Err(bad_request("Crop area is empty".to_string()));
        }

        let cropped = img.crop_imm(cx, cy, cw, ch);

        let mut buf = Cursor::new(Vec::new());
        cropped
            .write_to(&mut buf, image::ImageFormat::Png)
            .map_err(|e| {
                ErrorResponse::internal_server_error(Some(format!("Failed to encode image: {}", e)))
            })?;

        buf.into_inner()
    } else {
        raw_bytes
    };

    // Forward cropped file to storage service
    let form = reqwest::multipart::Form::new().part(
        "file",
        reqwest::multipart::Part::bytes(cropped_bytes).file_name(file_name.clone()),
    );

    let resp = reqwest::Client::new()
        .post(format!("{}/internal/upload", state.storage_service_url))
        .multipart(form)
        .send()
        .await
        .map_err(|e| {
            ErrorResponse::internal_server_error(Some(format!(
                "Failed to upload to storage: {}",
                e
            )))
        })?;

    if resp.status() != StatusCode::CREATED {
        return Err(resp
            .json::<ErrorResponse>()
            .await
            .unwrap_or_else(|e| ErrorResponse::internal_server_error(Some(e.to_string()))));
    }

    let blob: StorageBlobResponse = resp.json().await.map_err(|e| {
        ErrorResponse::internal_server_error(Some(format!(
            "Failed to parse storage response: {}",
            e
        )))
    })?;

    // Create asset record
    let asset = AssetsRepository::create(
        &state.postgres,
        CreateAssetDto {
            id: Some(Uuid::new_v4()),
            name: file_name,
            blob_id: blob.id,
            entity_id: user_id,
            entity_type: EntityType::UserAvatar,
        },
    )
    .await
    .map_err(ErrorResponse::from)?;

    // Update user picture
    let user = UserRepository::update(
        &state.postgres,
        user_id,
        crate::entities::user::db::dto::UpdateUserDto {
            username: None,
            is_active: None,
            email: None,
            picture: Some(Some(format!("/files/{}", asset.id))),
        },
    )
    .await
    .map_err(ErrorResponse::from)?;

    Ok(Json(user))
}
