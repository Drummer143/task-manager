use uuid::Uuid;

use crate::{
    dto::workspace::WorkspaceInfo, models::page::Page,
    shared::error_handlers::handlers::ErrorResponse,
};

pub async fn get_by_id(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
    user_id: Uuid,
    include_owner: bool,
    include_pages: bool,
) -> Result<WorkspaceInfo, ErrorResponse> {
    let (workspace, role) =
        crate::repositories::workspace_repo::get_by_id(db, workspace_id, user_id)
            .await
            .map_err(|_| ErrorResponse::internal_server_error())?;

    let owner = if include_owner {
        Some(
            crate::repositories::user_repo::find_by_id(db, workspace.owner_id)
                .await
                .map_err(|_| ErrorResponse::internal_server_error())?,
        )
    } else {
        None
    };

    let pages = if include_pages {
        Some(
            sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE workspace_id = $1")
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
