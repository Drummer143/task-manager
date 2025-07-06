use error_handlers::handlers::ErrorResponse;
use repo::{entities::workspace::{dto::WorkspaceSortBy, model::Workspace}, shared::types::SortOrder};
use uuid::Uuid;

use crate::entities::page::dto::PageResponseWithoutInclude;

use super::dto::WorkspaceInfo;

pub async fn get_by_id(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
) -> Result<Workspace, ErrorResponse> {
    repo::entities::workspace::repository::get_by_id(db, workspace_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_list(
    db: &sqlx::postgres::PgPool,
    user_id: Uuid,
    limit: Option<i64>,
    offset: Option<i64>,
    search: Option<String>,
    sort_by: Option<WorkspaceSortBy>,
    sort_order: Option<SortOrder>,
    include_owner: bool,
    include_pages: bool,
) -> Result<(Vec<super::dto::WorkspaceInfo>, i64), ErrorResponse> {
    let (rows, count) = repo::entities::workspace::repository::get_list(
        db, user_id, limit, offset, search, sort_by, sort_order,
    )
    .await
    .map_err(ErrorResponse::from)?;

    let mut workspace_info_arr: Vec<WorkspaceInfo> = Vec::with_capacity(rows.len());

    for row in rows {
        workspace_info_arr.push(WorkspaceInfo {
            workspace: Workspace {
                id: row.id,
                name: row.name,
                owner_id: row.owner_id,
                created_at: row.created_at,
                updated_at: row.updated_at,
                deleted_at: row.deleted_at,
            },
            role: Some(row.role),
            owner: if include_owner {
                Some(
                    repo::entities::user::repository::find_by_id(db, row.owner_id)
                        .await
                        .map_err(ErrorResponse::from)?,
                )
            } else {
                None
            },
            pages: if include_pages {
                Some(
                    sqlx::query_as::<_, repo::entities::page::model::Page>(
                        "SELECT * FROM pages WHERE workspace_id = $1",
                    )
                    .bind(row.id)
                    .fetch_all(db)
                    .await
                    .map(|pages| {
                        pages
                            .into_iter()
                            .map(|page| PageResponseWithoutInclude::from(page))
                            .collect()
                    })
                    .map_err(ErrorResponse::from)?,
                )
            } else {
                None
            },
        });
    }

    Ok((workspace_info_arr, count))
}

pub async fn create_workspace(
    db: &sqlx::postgres::PgPool,
    dto: repo::entities::workspace::dto::CreateWorkspaceDto,
) -> Result<WorkspaceInfo, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let workspace = repo::entities::workspace::repository::create(&mut *tx, dto).await;

    if let Err(err) = workspace {
        let _ = tx.rollback().await;
        return Err(ErrorResponse::from(err));
    }

    let workspace = workspace.unwrap();

    let workspace_access = repo::entities::workspace_access::repository::create_workspace_access(
        &mut *tx,
        workspace.owner_id,
        workspace.id,
        repo::entities::workspace_access::model::Role::Owner,
    )
    .await;

    if let Err(err) = workspace_access {
        let _ = tx.rollback().await;
        return Err(ErrorResponse::from(err));
    }

    tx.commit().await.map_err(ErrorResponse::from)?;

    Ok(WorkspaceInfo {
        workspace,
        role: None,
        owner: None,
        pages: None,
    })
}

pub async fn update_workspace(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
    dto: repo::entities::workspace::dto::UpdateWorkspaceDto,
) -> Result<WorkspaceInfo, ErrorResponse> {
    let workspace = repo::entities::workspace::repository::update(db, workspace_id, dto)
        .await
        .map_err(ErrorResponse::from)?;

    Ok(WorkspaceInfo {
        workspace,
        role: None,
        owner: None,
        pages: None,
    })
}

pub async fn soft_delete(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
) -> Result<(), ErrorResponse> {
    repo::entities::workspace::repository::soft_delete(db, workspace_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn cancel_soft_delete(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
) -> Result<(), ErrorResponse> {
    repo::entities::workspace::repository::cancel_soft_delete(db, workspace_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_any_workspace_user_has_access_to(
    db: &sqlx::postgres::PgPool,
    user_id: Uuid,
) -> Result<Workspace, ErrorResponse> {
    repo::entities::workspace::repository::get_any_workspace_user_has_access_to(db, user_id)
        .await
        .map_err(ErrorResponse::from)
}
