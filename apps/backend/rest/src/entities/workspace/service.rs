use uuid::Uuid;

use crate::shared::error_handlers::handlers::ErrorResponse;

use super::dto::WorkspaceInfo;

pub async fn get_by_id(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
    user_id: Uuid,
    include_owner: bool,
    include_pages: bool,
) -> Result<WorkspaceInfo, ErrorResponse> {
    let (workspace, role) = super::repository::get_by_id(db, workspace_id, user_id)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let owner = if include_owner {
        Some(
            crate::entities::user::repository::find_by_id(db, workspace.owner_id)
                .await
                .map_err(|_| ErrorResponse::internal_server_error())?,
        )
    } else {
        None
    };

    let pages = if include_pages {
        Some(
            sqlx::query_as::<_, crate::entities::page::model::Page>(
                "SELECT * FROM pages WHERE workspace_id = $1",
            )
            .bind(workspace.id)
            .fetch_all(db)
            .await
            .map_err(|_| ErrorResponse::internal_server_error())?,
        )
    } else {
        None
    };

    Ok(WorkspaceInfo {
        workspace,
        role,
        owner,
        pages,
    })
}
