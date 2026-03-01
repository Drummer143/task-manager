use std::collections::HashMap;

use axum::{Extension, Json, extract::State};
use error_handlers::{codes, handlers::ErrorResponse};
use sql::page::model::PageAccess;

use crate::{
    entities::page::{PageService, dto::PageAccessResponse},
    types::app_state::AppState,
};

#[utoipa::path(
    get,
    path = "/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access list retrieved successfully", body = Vec<PageAccessResponse>),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    tags = ["Page Access"],
)]
pub async fn get_page_access_list(
    State(state): State<AppState>,
    Extension(user_page_access): Extension<PageAccess>,
    // Path(page_id): Path<Uuid>,
) -> Result<Json<Vec<PageAccessResponse>>, ErrorResponse> {
    if user_page_access.role < sql::page::model::Role::Member {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    let page_access_list = PageService::get_page_access_list(&state, user_page_access.page_id)
        .await
        .map_err(|e| {
            if e.status_code == 404 {
                return ErrorResponse::forbidden(
                    codes::ForbiddenErrorCode::InsufficientPermissions,
                    Some(HashMap::from([(
                        "message".to_string(),
                        "Insufficient permissions".to_string(),
                    )])),
                    None,
                );
            }

            e
        })?;

    Ok(axum::Json(page_access_list))
}
