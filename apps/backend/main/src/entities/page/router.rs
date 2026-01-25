use crate::{entities::page::controller, types::app_state::AppState};
use axum::{Router, routing};

pub fn init(state: AppState) -> Router<AppState> {
    let general = Router::new()
        .route(
            "/workspaces/{workspace_id}/pages",
            routing::post(controller::create_page::create_page),
        )
        .route(
            "/workspaces/{workspace_id}/pages",
            routing::get(controller::get_list_in_workspace::get_list_in_workspace),
        )
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::workspace_access_guard::workspace_access_guard,
        ));

    let scoped = Router::new()
        .route(
            "/pages/{page_id}",
            routing::get(controller::get_page::get_page),
        )
        .route(
            "/pages/{page_id}",
            routing::put(controller::update_page::update_page),
        )
        .route(
            "/pages/{page_id}",
            routing::delete(controller::delete_page::delete_page),
        )
        .route(
            "/pages/{page_id}/access",
            axum::routing::get(controller::get_page_access_list::get_page_access_list),
        )
        .route(
            "/pages/{page_id}/access",
            axum::routing::post(controller::create_page_access::create_page_access),
        )
        .route(
            "/pages/{page_id}/access",
            axum::routing::put(controller::update_page_access::update_page_access),
        )
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::page_access_guard::page_access_guard_by_page_route,
        ));

    axum::Router::new()
        .merge(general)
        .merge(scoped)
        .layer(axum::middleware::from_fn_with_state(
            state,
            utils::auth_middleware::auth_guard,
        ))
}
