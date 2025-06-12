use crate::{entities::page::controller, types::app_state::AppState};
use axum::{routing, Router};

pub fn init(state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/workspaces/{workspace_id}/pages",
            routing::post(controller::create_page::create_page),
        )
        .route(
            "/workspaces/{workspace_id}/pages",
            routing::get(controller::get_list_in_workspace::get_list_in_workspace),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}",
            routing::get(controller::get_page::get_page),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}",
            routing::put(controller::update_page::update_page),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}",
            routing::delete(controller::delete_page::delete_page),
        )
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::page_access_guard::page_access_guard,
        ))
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middleware::auth_guard::auth_guard,
        ))
}
