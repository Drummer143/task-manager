use crate::types::app_state::AppState;
use axum::Router;

pub fn init(app_state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/board-statuses",
            axum::routing::post(super::controller::create_board_status::create_board_status),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/board-statuses",
            axum::routing::get(super::controller::get_board_statuses::get_board_statuses),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/board-statuses/{status_id}",
            axum::routing::put(super::controller::update_board_status::update_board_status),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/board-statuses/{status_id}",
            axum::routing::delete(super::controller::delete_board_status::delete_board_status),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/board-statuses/{status_id}",
            axum::routing::get(super::controller::get_board_status_by_id::get_board_status_by_id),
        )
        .layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            crate::middleware::workspace_access_guard::workspace_access_guard,
        ))
        .layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            crate::middleware::page_access_guard::page_access_guard,
        ))
        .layer(axum::middleware::from_fn_with_state(
            app_state,
            crate::middleware::auth_guard::auth_guard,
        ))
}
