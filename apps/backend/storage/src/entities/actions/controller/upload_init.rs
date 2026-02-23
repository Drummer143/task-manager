use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::actions::{
        dto::{UploadInitDto, UploadInitResponse},
        service::ActionsService,
    },
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/actions/upload/init",
    request_body = UploadInitDto,
    responses(
        (status = 200, description = "Upload chunked init", body = UploadInitResponse),
    ),
    tags = ["Upload file"],
)]
#[axum_macros::debug_handler]
pub async fn upload_init(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Json(body): Json<UploadInitDto>,
) -> Result<Json<UploadInitResponse>, ErrorResponse> {
    ActionsService::upload_init(&state, user_id, body)
        .await
        .map(Json)
}
