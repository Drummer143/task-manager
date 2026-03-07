use crate::{
    controllers::board_statuses::controller::{
        create_board_status::create_board_status, get_board_statuses::get_board_statuses,
    },
    types::app_state::AppState,
};
use axum::Router;

pub fn init(app_state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/pages/{page_id}/board-statuses",
            axum::routing::post(create_board_status),
        )
        .route(
            "/pages/{page_id}/board-statuses",
            axum::routing::get(get_board_statuses),
        )
        .layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            crate::middleware::page_access_guard::page_access_guard_by_page_route,
        ))
        .layer(axum::middleware::from_fn_with_state(
            app_state,
            utils::auth_middleware::auth_guard,
        ))
}
