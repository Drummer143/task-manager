use axum::{
    Router,
    routing::{get, post},
};

use crate::{
    controllers::rooms::controller::{
        create_room::create_room, delete_room::delete_room,
        generate_room_token::generate_room_token, get_room::get_room, join_room::join_room,
        list_rooms::list_rooms,
    },
    types::app_state::AppState,
};

pub fn init(app_state: AppState) -> Router<AppState> {
    axum::Router::new()
        .route("/calls/rooms", post(create_room).get(list_rooms))
        .route("/calls/rooms/{room_id}", get(get_room).delete(delete_room))
        .route("/calls/rooms/{room_id}/join", post(join_room))
        .route(
            "/calls/rooms/{room_id}/access-tokens",
            post(generate_room_token),
        )
        .layer(axum::middleware::from_fn_with_state(
            app_state,
            utils::auth_middleware::auth_guard,
        ))
}
