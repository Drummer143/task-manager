use crate::{entities::actions::service::ActionsService, types::app_state::AppState};
use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

#[utoipa::path(
    delete,
    path = "/actions/upload/{transaction_id}/cancel",
    params(
        ("transaction_id", Path, description = "Transaction ID"),
    ),
    responses(
        (status = 200, description = "Upload cancelled"),
    ),
    tags = ["Upload file"],
)]
pub async fn upload_cancel(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
) -> Result<(), ErrorResponse> {
    ActionsService::upload_cancel(&state, transaction_id).await
}
