use axum::{Router, routing::post};

use crate::{
    entities::assets::controller::{
        create_asset::create_asset, create_upload_token::create_upload_token,
    },
    middleware::auth_guard::auth_guard,
    types::app_state::AppState,
};

pub fn init(state: AppState) -> Router<AppState> {
    let external_router = Router::new()
        .route("/assets/token", post(create_upload_token))
        .layer(axum::middleware::from_fn_with_state(state, auth_guard));

    let internal_router = Router::new().route("/assets", post(create_asset));

    Router::new().merge(external_router).merge(internal_router)
}
