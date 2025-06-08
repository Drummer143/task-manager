use axum::Router;

pub fn init(
    state: crate::types::app_state::AppState,
) -> Router<crate::types::app_state::AppState> {
    Router::new()
        .route(
            "/workspace/{workspace_id}/access",
            axum::routing::get(
                super::controller::get_workspace_access_list::get_workspace_access_list,
            ),
        )
        .route(
            "/workspace/{workspace_id}/access",
            axum::routing::post(
                super::controller::create_workspace_access::create_workspace_access,
            ),
        )
        .route(
            "/workspace/{workspace_id}/access",
            axum::routing::put(super::controller::update_workspace_access::update_workspace_access),
        )
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middleware::with_auth::with_auth,
        ))
}
