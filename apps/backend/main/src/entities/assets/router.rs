use axum::{Router, routing::{get, post}};

use crate::{
    entities::assets::controller::{
        create_asset::create_asset, create_upload_token::create_upload_token, validate_access::validate_access,
    },
    types::app_state::AppState,
};
use utils::auth_middleware::auth_guard;

pub fn init(state: AppState) -> Router<AppState> {
    let external_router = Router::new()
        .route("/assets/token", post(create_upload_token))
        .layer(axum::middleware::from_fn_with_state(state, auth_guard));

    let internal_router = Router::new()
        .route("/assets", post(create_asset))
        .route("/assets/{id}/blob-id", get(validate_access));

    Router::new().merge(external_router).merge(internal_router)
}
