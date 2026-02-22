use crate::{
    entities::page::controller::{
        create_page::create_page, create_page_access::create_page_access, delete_page::delete_page,
        get_page_list::get_page_list, get_page::get_page,
        get_page_access_list::get_page_access_list, get_page_details::get_page_details,
        update_page::update_page, update_page_access::update_page_access,
    },
    types::app_state::AppState,
};
use axum::{Router, routing};

pub fn init(state: AppState) -> Router<AppState> {
    let general = Router::new()
        .route(
            "/workspaces/{workspace_id}/pages",
            routing::post(create_page),
        )
        .route(
            "/workspaces/{workspace_id}/pages",
            routing::get(get_page_list),
        )
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::workspace_access_guard::workspace_access_guard,
        ));

    let scoped = Router::new()
        .route("/pages/{page_id}", routing::get(get_page))
        .route("/pages/{page_id}", routing::put(update_page))
        .route("/pages/{page_id}", routing::delete(delete_page))
        .route("/pages/{page_id}/detailed", routing::get(get_page_details))
        .route(
            "/pages/{page_id}/access",
            axum::routing::get(get_page_access_list),
        )
        .route(
            "/pages/{page_id}/access",
            axum::routing::post(create_page_access),
        )
        .route(
            "/pages/{page_id}/access",
            axum::routing::put(update_page_access),
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
