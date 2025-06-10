pub fn init(
    state: crate::types::app_state::AppState,
) -> axum::Router<crate::types::app_state::AppState> {
    axum::Router::new()
        .route(
            "/workspaces",
            axum::routing::get(super::controller::get_list::get_list),
        )
        .route(
            "/workspaces",
            axum::routing::post(super::controller::create_workspace::create_workspace),
        )
        .route(
            "/workspaces/{id}",
            axum::routing::get(super::controller::get_by_id::get_by_id),
        )
        .route(
            "/workspaces/{id}",
            axum::routing::put(super::controller::update_workspace::update_workspace),
        )
        .route(
            "/workspaces/{id}",
            axum::routing::delete(super::controller::soft_delete::soft_delete),
        )
        .route(
            "/workspaces/{id}/cancel-soft-delete",
            axum::routing::patch(super::controller::cancel_soft_delete::cancel_soft_delete),
        )
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::workspace_access_guard::workspace_access_guard,
        ))
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middleware::auth_guard::auth_guard,
        ))
}
