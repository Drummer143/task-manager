use uuid::Uuid;

use crate::{models::user::User, shared::error_handlers::handlers::ErrorResponse};

pub async fn find_by_id(db: &sqlx::postgres::PgPool, id: Uuid) -> Result<User, ErrorResponse> {
    let result = crate::repositories::user_repo::find_by_id(db, id).await;

    if let Ok(user) = result {
        tracing::info!("/users/{id} 200");
        return Ok(user);
    }

    let error = result.unwrap_err();

    if matches!(error, sqlx::Error::RowNotFound) {
        tracing::info!("/users/{id} 404");
        let details = std::collections::HashMap::from([("user_id".to_string(), id.to_string())]);
        return Err(
            crate::shared::error_handlers::handlers::ErrorResponse::not_found(
                crate::shared::error_handlers::codes::NotFoundErrorCode::NotFound,
                Some(details),
            ),
        );
    }

    tracing::error!("/users/{id} error 500: {error}");

    Err(crate::shared::error_handlers::handlers::ErrorResponse::internal_server_error())
}

pub async fn get_list(
    db: &sqlx::postgres::PgPool,
    limit: Option<i64>,
    offset: Option<i64>,
    filter: Option<crate::models::user::UserFilterBy>,
    sort_by: Option<crate::models::user::UserSortBy>,
    sort_order: Option<crate::types::pagination::SortOrder>,
) -> Result<(Vec<User>, i64), ErrorResponse> {
    let limit = limit.unwrap_or(crate::types::pagination::DEFAULT_LIMIT);
    let offset = offset.unwrap_or(crate::types::pagination::DEFAULT_OFFSET);

    let (users, total) = crate::repositories::user_repo::get_list(
        db,
        limit,
        offset,
        filter.as_ref(),
        sort_by.as_ref(),
        sort_order.as_ref(),
    )
    .await
    .map_err(|_| ErrorResponse::internal_server_error())?;

    Ok((users, total))
}

// pub async fn create(
//     &self,
//     body: &crate::dto::user::CreateUserDto,
// ) -> Result<User, sqlx::Error> {
//     self.user_repo.create(body).await
// }

// pub async fn update(
//     &self,
//     id: Uuid,
//     body: &crate::dto::user::UpdateUserDto,
// ) -> Result<User, sqlx::Error> {
//     self.user_repo.update(id, body).await
// }

// pub async fn delete(&self, id: Uuid) -> Result<User, sqlx::Error> {
//     self.user_repo.delete(id).await
// }
