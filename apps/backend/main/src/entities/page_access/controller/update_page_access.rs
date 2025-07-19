use std::collections::HashMap;

use axum::{
    extract::{Path, State},
    Extension, Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::page_access::dto::{PageAccessResponse, UpdatePageAccessDto},
    shared::traits::ServiceUpdateMethod,
};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access updated successfully", body = crate::entities::page_access::dto::PageAccessResponse),
        (status = 400, description = "Invalid request", body = error_handlers::handlers::ErrorResponse),
        (status = 401, description = "Unauthorized", body = error_handlers::handlers::ErrorResponse),
        (status = 403, description = "Forbidden", body = error_handlers::handlers::ErrorResponse),
        (status = 404, description = "Not found", body = error_handlers::handlers::ErrorResponse),
        (status = 500, description = "Internal server error", body = error_handlers::handlers::ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = UpdatePageAccessDto,
    tags = ["Page Access"],
)]
pub async fn update_page_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(dto): Json<UpdatePageAccessDto>,
) -> Result<PageAccessResponse, ErrorResponse> {
    let user_page_access =
        crate::entities::page_access::PageAccessService::get_page_access(&state, user_id, page_id)
            .await
            .map_err(|e| {
                if e.status_code == 404 {
                    return error_handlers::handlers::ErrorResponse::forbidden(
                        error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                        Some(HashMap::from([(
                            "message".to_string(),
                            "Insufficient permissions".to_string(),
                        )])),
                        None,
                    );
                }

                e
            })?;

    if user_page_access.role < rust_api::entities::page_access::model::Role::Admin {
        return Err(error_handlers::handlers::ErrorResponse::forbidden(
            error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    // TODO: complete access checks

    let page_access = crate::entities::page_access::PageAccessService::update(
        &state,
        Uuid::nil(),
        rust_api::entities::page_access::dto::UpdatePageAccessDto {
            user_id: dto.user_id,
            page_id,
            role: dto.role,
        },
    )
    .await?;

    Ok(PageAccessResponse {
        id: page_access.id,
        user: user_page_access.user,
        role: page_access.role,
        created_at: page_access.created_at,
        updated_at: page_access.updated_at,
        deleted_at: page_access.deleted_at,
    })
}
