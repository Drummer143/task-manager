use uuid::Uuid;

use crate::{models::user::User, shared::error_handlers::handlers::ErrorResponse};

pub struct UserService<'a> {
    user_repo: crate::repositories::user_repo::UserRepository<'a>,
}

impl<'a> UserService<'a> {
    pub fn new(db: &'a sqlx::postgres::PgPool) -> Self {
        Self {
            user_repo: crate::repositories::user_repo::UserRepository::new(db),
        }
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<User, ErrorResponse> {
        let result = self.user_repo.find_by_id(id).await;

        if let Ok(user) = result {
            tracing::info!("/users/{id} 200");
            return Ok(user);
        }

        let error = result.unwrap_err();

        if matches!(error, sqlx::Error::RowNotFound) {
            tracing::info!("/users/{id} 404");
            let details = std::collections::HashMap::from([(
                "user_id".to_string(),
                id.to_string(),
            )]);
            return Err(
                crate::shared::error_handlers::handlers::ErrorResponse::not_found(
                    "user_not_found",
                    Some(details),
                ),
            );
        }

        tracing::error!("/users/{id} error 500: {error}");

        Err(crate::shared::error_handlers::handlers::ErrorResponse::internal_server_error())
    }

    pub async fn get_list(
        &self,
        limit: Option<i64>,
        offset: Option<i64>,
        filter: Option<crate::models::user::UserFilterBy>,
        sort_by: Option<crate::models::user::UserSortBy>,
        sort_order: Option<crate::types::pagination::SortOrder>,
    ) -> Result<crate::types::pagination::Pagination<User>, ErrorResponse> {
        let limit = limit.unwrap_or(crate::types::pagination::DEFAULT_LIMIT);
        let offset = offset.unwrap_or(crate::types::pagination::DEFAULT_OFFSET);

        let result = self
            .user_repo
            .get_list(
                limit,
                offset,
                filter.as_ref(),
                sort_by.as_ref(),
                sort_order.as_ref(),
            )
            .await;

        if let Ok((users, total)) = result {
            return Ok(crate::types::pagination::Pagination::new(
                users, total, limit, offset,
            ));
        }

        let error = result.unwrap_err();

        tracing::error!("/users error 500: {error}. Params: limit: {limit}, offset: {offset}, filter: {filter:?}, sort_by: {sort_by:?}, sort_order: {sort_order:?}");

        Err(crate::shared::error_handlers::handlers::ErrorResponse::internal_server_error())
    }

    pub async fn create(
        &self,
        body: &crate::dto::user::CreateUserDto,
    ) -> Result<User, sqlx::Error> {
        self.user_repo.create(body).await
    }

    pub async fn update(
        &self,
        id: Uuid,
        body: &crate::dto::user::UpdateUserDto,
    ) -> Result<User, sqlx::Error> {
        self.user_repo.update(id, body).await
    }

    pub async fn delete(&self, id: Uuid) -> Result<User, sqlx::Error> {
        self.user_repo.delete(id).await
    }
}
