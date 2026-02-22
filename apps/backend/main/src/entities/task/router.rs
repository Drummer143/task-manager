use axum::{
    Router,
    routing::{delete, get, post, put},
};

use crate::{
    entities::task::controller::{
        create_draft_task::create_draft_task, create_task::create_task, delete_task::delete_task,
        get_task::get_task, get_tasks_in_page::get_tasks_in_page, update_task::update_task,
    },
    types::app_state::AppState,
};

pub fn init(state: AppState) -> Router<AppState> {
    let general = Router::new()
        .route("/pages/{page_id}/tasks", post(create_task))
        .route("/pages/{page_id}/tasks/draft", post(create_draft_task))
        .route("/pages/{page_id}/tasks", get(get_tasks_in_page))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::page_access_guard::page_access_guard_by_page_route,
        ));

    let scoped = Router::new()
        .route("/tasks/{task_id}", delete(delete_task))
        .route("/tasks/{task_id}", put(update_task))
        .route("/tasks/{task_id}", get(get_task))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            crate::middleware::page_access_guard::page_access_guard_task_route,
        ));

    axum::Router::new()
        .merge(general)
        .merge(scoped)
        .layer(axum::middleware::from_fn_with_state(
            state,
            utils::auth_middleware::auth_guard,
        ))
}
