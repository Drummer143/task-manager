pub fn init(
    state: crate::types::app_state::AppState,
) -> axum::Router<crate::types::app_state::AppState> {
    let general = axum::Router::new()
        .route(
            "/workspaces",
            axum::routing::get(super::controller::get_list::get_list),
        )
        .route(
            "/workspaces",
            axum::routing::post(super::controller::create_workspace::create_workspace),
        );

    let scoped = axum::Router::new()
        .route(
            "/workspaces/{workspace_id}",
            axum::routing::get(super::controller::get_by_id::get_by_id),
        )
        .route(
            "/workspaces/{workspace_id}",
            axum::routing::put(super::controller::update_workspace::update_workspace),
        )
        .route(
            "/workspaces/{workspace_id}",
            axum::routing::delete(super::controller::soft_delete::soft_delete),
        )
        .route(
            "/workspaces/{workspace_id}/cancel-soft-delete",
            axum::routing::patch(super::controller::cancel_soft_delete::cancel_soft_delete),
        )
        // workspace access
        .route(
            "/workspaces/{workspace_id}/access",
            axum::routing::get(
                super::controller::get_workspace_access_list::get_workspace_access_list,
            ),
        )
        .route(
            "/workspaces/{workspace_id}/access",
            axum::routing::post(
                super::controller::create_workspace_access::create_workspace_access,
            ),
        )
        .route(
            "/workspaces/{workspace_id}/access",
            axum::routing::put(super::controller::update_workspace_access::update_workspace_access),
        )
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::workspace_access_guard::workspace_access_guard,
        ));

    axum::Router::new()
        .merge(general)
        .merge(scoped)
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middleware::auth_guard::auth_guard,
        ))
}
