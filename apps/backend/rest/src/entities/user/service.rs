use uuid::Uuid;

use crate::shared::error_handlers::handlers::ErrorResponse;

pub async fn find_by_id(
    db: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    id: Uuid,
) -> Result<super::model::User, ErrorResponse> {
    super::repository::find_by_id(db, id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_list(
    db: impl sqlx::Executor<'_, Database = sqlx::Postgres> + Copy,
    limit: Option<i64>,
    offset: Option<i64>,
    filter: Option<super::dto::UserFilterBy>,
    sort_by: Option<super::dto::UserSortBy>,
    sort_order: Option<crate::types::pagination::SortOrder>,
) -> Result<(Vec<super::model::User>, i64), ErrorResponse> {
    let limit = limit.unwrap_or(crate::types::pagination::DEFAULT_LIMIT);
    let offset = offset.unwrap_or(crate::types::pagination::DEFAULT_OFFSET);

    super::repository::get_list(
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
