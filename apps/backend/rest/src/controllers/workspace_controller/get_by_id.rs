use axum::{
    extract::{Path, State},
    response::IntoResponse,
};

use crate::{dto::workspace::WorkspaceResponse, shared::extractors::query::ValidatedQuery};

#[derive(PartialEq, serde::Deserialize)]
enum Include {
    Owner,
    Pages,
}

#[derive(serde::Deserialize)]
pub struct GetWorkspaceQuery {
    include: Option<Vec<Include>>,
}

#[axum_macros::debug_handler]
pub async fn get_by_id(
    State(state): State<crate::types::app_state::AppState>,
    Path(workspace_id): Path<uuid::Uuid>,
    ValidatedQuery(query): ValidatedQuery<GetWorkspaceQuery>,
    headers: axum::http::header::HeaderMap,
) -> impl IntoResponse {
    let token = headers.get("token").unwrap().to_str().unwrap();

    let user_id = crate::shared::utils::jwt::decode_jwt(&token, &state.jwt_secret).unwrap();

    let include = query.include.unwrap_or_default();

    crate::services::workspace_service::get_by_id(
        &state.db,
        workspace_id,
        user_id,
        include.contains(&Include::Owner),
        include.contains(&Include::Pages),
    )
    .await
    .map(|workspace| WorkspaceResponse::from(workspace))
}
