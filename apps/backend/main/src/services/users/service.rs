use uuid::Uuid;

use error_handlers::handlers::ErrorResponse;

use crate::repos::users::{UserFilterBy, UserRepository, UserSortBy};

pub struct UserService;

impl UserService {
    pub async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
    ) -> Result<sql::user::model::User, ErrorResponse> {
        UserRepository::get_one_by_id(executor, id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_all_with_pagination(
        pool: &sqlx::PgPool,
        limit: Option<i64>,
        offset: Option<i64>,
        filter: Option<UserFilterBy>,
        sort_by: Option<UserSortBy>,
        sort_order: Option<sql::shared::types::SortOrder>,
    ) -> Result<(Vec<sql::user::model::User>, i64), ErrorResponse> {
        let limit = limit.unwrap_or(sql::shared::constants::DEFAULT_LIMIT);
        let offset = offset.unwrap_or(sql::shared::constants::DEFAULT_OFFSET);

        UserRepository::get_list(
            pool,
            limit,
            offset,
            filter.as_ref(),
            sort_by.as_ref(),
            sort_order.as_ref(),
        )
        .await
        .map_err(ErrorResponse::from)
    }
}
