use uuid::Uuid;

use error_handlers::handlers::ErrorResponse;

pub async fn find_by_id(
    db: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    id: Uuid,
) -> Result<repo::entities::user::model::User, ErrorResponse> {
    repo::entities::user::repository::find_by_id(db, id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_list(
    db: impl sqlx::Executor<'_, Database = sqlx::Postgres> + Copy,
    limit: Option<i64>,
    offset: Option<i64>,
    filter: Option<repo::entities::user::dto::UserFilterBy>,
    sort_by: Option<repo::entities::user::dto::UserSortBy>,
    sort_order: Option<repo::shared::types::SortOrder>,
) -> Result<(Vec<repo::entities::user::model::User>, i64), ErrorResponse> {
    let limit = limit.unwrap_or(repo::shared::constants::DEFAULT_LIMIT);
    let offset = offset.unwrap_or(repo::shared::constants::DEFAULT_OFFSET);

    repo::entities::user::repository::get_list(
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
