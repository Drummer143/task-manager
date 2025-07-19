use uuid::Uuid;

use error_handlers::handlers::ErrorResponse;

use crate::{
    shared::traits::{ServiceBase, ServiceGetAllWithPaginationMethod, ServiceGetOneByIdMethod},
    types::app_state::AppState,
};

pub struct UserService;

impl ServiceBase for UserService {
    type Response = rust_api::entities::user::model::User;
}

impl ServiceGetOneByIdMethod for UserService {
    async fn get_one_by_id(
        app_state: &AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        rust_api::entities::user::repository::find_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceGetAllWithPaginationMethod for UserService {
    type FilterBy = rust_api::entities::user::dto::UserFilterBy;
    type SortBy = rust_api::entities::user::dto::UserSortBy;

    async fn get_all_with_pagination(
        app_state: &AppState,
        limit: Option<i64>,
        offset: Option<i64>,
        filter: Option<Self::FilterBy>,
        sort_by: Option<Self::SortBy>,
        sort_order: Option<rust_api::shared::types::SortOrder>,
    ) -> Result<(Vec<Self::Response>, i64), ErrorResponse> {
        let limit = limit.unwrap_or(rust_api::shared::constants::DEFAULT_LIMIT);
        let offset = offset.unwrap_or(rust_api::shared::constants::DEFAULT_OFFSET);

        rust_api::entities::user::repository::get_list(
            &app_state.postgres,
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
