use std::collections::HashMap;

use axum::{Extension, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::page::model::PageAccess;

use crate::{
    entities::page::dto::{PageAccessResponse, UpdatePageAccessDto},
    shared::{extractors::json::ValidatedJson, traits::ServiceGetOneByIdMethod},
};

#[utoipa::path(
    put,
    path = "/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access updated successfully", body = crate::entities::page::dto::PageAccessResponse),
        (status = 400, description = "Invalid request", body = error_handlers::handlers::ErrorResponse),
        (status = 401, description = "Unauthorized", body = error_handlers::handlers::ErrorResponse),
        (status = 403, description = "Forbidden", body = error_handlers::handlers::ErrorResponse),
        (status = 404, description = "Not found", body = error_handlers::handlers::ErrorResponse),
        (status = 500, description = "Internal server error", body = error_handlers::handlers::ErrorResponse),
    ),
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = UpdatePageAccessDto,
    tags = ["Page Access"],
)]
pub async fn update_page_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_page_access): Extension<PageAccess>,
    // Path(page_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<UpdatePageAccessDto>,
) -> Result<PageAccessResponse, ErrorResponse> {
    if user_page_access.role < sql::page::model::Role::Admin {
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

    let page_access = crate::entities::page::PageService::update_page_access(
        &state,
        crate::entities::page::db::UpdatePageAccessDto {
            user_id: dto.user_id,
            page_id: user_page_access.page_id,
            role: dto.role,
        },
    )
    .await?;

    Ok(PageAccessResponse {
        id: page_access.id,
        user: crate::entities::user::UserService::get_one_by_id(&state, page_access.user_id)
            .await?,
        role: page_access.role,
        created_at: page_access.created_at,
        updated_at: page_access.updated_at,
        deleted_at: page_access.deleted_at,
    })
}
