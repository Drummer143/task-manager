use uuid::Uuid;

use crate::shared::error_handlers::{codes, handlers::ErrorResponse};

use super::dto::WorkspaceInfo;

pub async fn get_by_id(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
    user_id: Uuid,
    include_owner: bool,
    include_pages: bool,
) -> Result<WorkspaceInfo, ErrorResponse> {
    let workspace_access =
        crate::entities::workspace_access::service::get_workspace_access(db, user_id, workspace_id)
            .await
            .map_err(|_| ErrorResponse::internal_server_error());

    if workspace_access.is_err() {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            None,
        ));
    }

    let workspace_with_role = super::repository::get_by_id(db, workspace_id, user_id)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let owner = if include_owner {
        Some(
            crate::entities::user::repository::find_by_id(db, workspace_with_role.owner_id)
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
            .bind(workspace_with_role.id)
            .fetch_all(db)
            .await
            .map_err(|_| ErrorResponse::internal_server_error())?,
        )
    } else {
        None
    };

    Ok(WorkspaceInfo {
        workspace: super::model::Workspace {
            id: workspace_with_role.id,
            name: workspace_with_role.name,
            owner_id: workspace_with_role.owner_id,
            created_at: workspace_with_role.created_at,
            updated_at: workspace_with_role.updated_at,
            deleted_at: workspace_with_role.deleted_at,
        },
        role: Some(workspace_with_role.role),
        owner,
        pages,
    })
}

pub async fn get_list(
    db: &sqlx::postgres::PgPool,
    user_id: Uuid,
    limit: Option<i64>,
    offset: Option<i64>,
    search: Option<String>,
    sort_by: Option<super::dto::WorkspaceSortBy>,
    sort_order: Option<crate::types::pagination::SortOrder>,
    include_owner: bool,
    include_pages: bool,
) -> Result<(Vec<super::dto::WorkspaceInfo>, i64), ErrorResponse> {
    let (rows, count) =
        super::repository::get_list(db, user_id, limit, offset, search, sort_by, sort_order)
            .await
            .map_err(|_| ErrorResponse::internal_server_error())?;

    let mut workspace_info_arr: Vec<WorkspaceInfo> = Vec::with_capacity(rows.len());

    for row in rows {
        workspace_info_arr.push(WorkspaceInfo {
            workspace: super::model::Workspace {
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
                    crate::entities::user::repository::find_by_id(db, row.owner_id)
                        .await
                        .map_err(|_| ErrorResponse::internal_server_error())?,
                )
            } else {
                None
            },
            pages: if include_pages {
                Some(
                    sqlx::query_as::<_, crate::entities::page::model::Page>(
                        "SELECT * FROM pages WHERE workspace_id = $1",
                    )
                    .bind(row.id)
                    .fetch_all(db)
                    .await
                    .map_err(|_| ErrorResponse::internal_server_error())?,
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
    dto: super::dto::WorkspaceDto,
) -> Result<WorkspaceInfo, ErrorResponse> {
    let mut tx = db
        .begin()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let workspace = super::repository::create(&mut *tx, dto).await;

    if workspace.is_err() {
        tx.rollback()
            .await
            .map_err(|_| ErrorResponse::internal_server_error())?;
        return Err(ErrorResponse::internal_server_error());
    }

    let workspace = workspace.unwrap();

    let workspace_access = crate::entities::workspace_access::service::create_workspace_access(
        &mut *tx,
        workspace.owner_id,
        workspace.id,
        crate::entities::workspace_access::model::Role::Owner,
    )
    .await;

    if workspace_access.is_err() {
        tx.rollback()
            .await
            .map_err(|_| ErrorResponse::internal_server_error())?;
        return Err(ErrorResponse::internal_server_error());
    }

    tx.commit()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

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
    dto: super::dto::WorkspaceDto,
) -> Result<WorkspaceInfo, ErrorResponse> {
    let mut tx = db
        .begin()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let workspace = super::repository::update(&mut *tx, workspace_id, dto)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    tx.commit()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

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
    let mut tx = db
        .begin()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let workspace = super::repository::soft_delete(&mut *tx, workspace_id)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    tx.commit()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    Ok(workspace)
}

pub async fn cancel_soft_delete(
    db: &sqlx::postgres::PgPool,
    workspace_id: Uuid,
) -> Result<(), ErrorResponse> {
    let workspace = super::repository::cancel_soft_delete(db, workspace_id)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    Ok(workspace)
}
