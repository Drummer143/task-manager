use axum::Router;

pub fn init(
    state: crate::types::app_state::AppState,
) -> Router<crate::types::app_state::AppState> {
    Router::new()
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/access",
            axum::routing::get(
                super::controller::get_page_access_list::get_page_access_list,
            ),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/access",
            axum::routing::post(
                super::controller::create_page_access::create_page_access,
            ),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/access",
            axum::routing::put(super::controller::update_page_access::update_page_access),
        )
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middleware::auth_guard::auth_guard,
        ))
}
