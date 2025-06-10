use crate::{entities::page::controller, types::app_state::AppState};
use axum::{routing, Router};

pub fn init() -> Router<AppState> {
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
}
