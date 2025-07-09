use uuid::Uuid;

use error_handlers::handlers::ErrorResponse;

pub async fn find_by_id(
    db: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    id: Uuid,
) -> Result<rust_api::entities::user::model::User, ErrorResponse> {
    rust_api::entities::user::repository::find_by_id(db, id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_list(
    db: impl sqlx::Executor<'_, Database = sqlx::Postgres> + Copy,
    limit: Option<i64>,
    offset: Option<i64>,
    filter: Option<rust_api::entities::user::dto::UserFilterBy>,
    sort_by: Option<rust_api::entities::user::dto::UserSortBy>,
    sort_order: Option<rust_api::shared::types::SortOrder>,
) -> Result<(Vec<rust_api::entities::user::model::User>, i64), ErrorResponse> {
    let limit = limit.unwrap_or(rust_api::shared::constants::DEFAULT_LIMIT);
    let offset = offset.unwrap_or(rust_api::shared::constants::DEFAULT_OFFSET);

    rust_api::entities::user::repository::get_list(
        db,
        limit,
        offset,
        filter.as_ref(),
        sort_by.as_ref(),
        sort_order.as_ref(),
    )
    .await
    .map_err(ErrorResponse::from)
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
