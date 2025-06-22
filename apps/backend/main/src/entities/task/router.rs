use axum::{
    routing::{delete, get, patch, post, put},
    Router,
};

use crate::{
    entities::task::controller::{
        change_status::change_status, create_task::create_task, delete_task::delete_task,
        get_task::get_task, get_tasks_in_page::get_tasks_in_page, update_task::update_task,
    },
    types::app_state::AppState,
};

pub fn init(state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/tasks",
            post(create_task),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}",
            delete(delete_task),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}",
            put(update_task),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/status",
            patch(change_status),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}",
            get(get_task),
        )
        .route(
            "/workspaces/{workspace_id}/pages/{page_id}/tasks",
            get(get_tasks_in_page),
        )
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middleware::auth_guard::auth_guard,
        ))
}
