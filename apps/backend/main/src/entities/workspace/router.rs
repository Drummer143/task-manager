use axum::{
    Router,
    routing::{delete, get, patch, post, put},
};

use crate::{
    entities::workspace::controller::{
        cancel_soft_delete::cancel_soft_delete, create_workspace::create_workspace,
        create_workspace_access::create_workspace_access, get_by_id::get_by_id,
        get_detailed_workspace::get_detailed_workspace, get_list::get_list,
        get_workspace_access_list::get_workspace_access_list, soft_delete::soft_delete,
        update_workspace::update_workspace, update_workspace_access::update_workspace_access,
    },
    types::app_state::AppState,
};

pub fn init(state: AppState) -> Router<AppState> {
    let general = axum::Router::new()
        .route("/workspaces", get(get_list))
        .route("/workspaces", post(create_workspace));

    let scoped = axum::Router::new()
        .route("/workspaces/{workspace_id}", get(get_by_id))
        .route("/workspaces/{workspace_id}", put(update_workspace))
        .route("/workspaces/{workspace_id}", delete(soft_delete))
        .route(
            "/workspaces/{workspace_id}/cancel-soft-delete",
            patch(cancel_soft_delete),
        )
        .route(
            "/workspaces/{workspace_id}/detailed",
            get(get_detailed_workspace),
        )
        // workspace access
        .route(
            "/workspaces/{workspace_id}/access",
            get(get_workspace_access_list),
        )
        .route(
            "/workspaces/{workspace_id}/access",
            post(create_workspace_access),
        )
        .route(
            "/workspaces/{workspace_id}/access",
            put(update_workspace_access),
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
            utils::auth_middleware::auth_guard,
        ))
}
