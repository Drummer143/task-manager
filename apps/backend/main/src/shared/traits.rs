use error_handlers::handlers::ErrorResponse;
use rust_api::shared::types::SortOrder;
use uuid::Uuid;

use crate::types::app_state::AppState;

pub trait ServiceBase {
    type Response;
}

pub trait ServiceCreateMethod
where
    Self: ServiceBase,
{
    type CreateDto;

    async fn create(
        app_state: &AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse>;
}

pub trait ServiceUpdateMethod
where
    Self: ServiceBase,
{
    type UpdateDto;

    async fn update(
        app_state: &AppState,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse>;
}

pub trait ServiceGetOneByIdMethod
where
    Self: ServiceBase,
{
    async fn get_one_by_id(app_state: &AppState, id: Uuid)
        -> Result<Self::Response, ErrorResponse>;
}

pub trait ServiceDeleteMethod
where
    Self: ServiceBase,
{
    async fn delete(app_state: &AppState, id: Uuid) -> Result<Self::Response, ErrorResponse>;
}

pub trait ServiceGetAllWithPaginationMethod
where
    Self: ServiceBase,
{
    type FilterBy;

    type SortBy;

    async fn get_all_with_pagination(
        app_state: &AppState,
        limit: Option<i64>,
        offset: Option<i64>,
        filter: Option<Self::FilterBy>,
        sort_by: Option<Self::SortBy>,
        sort_order: Option<SortOrder>,
    ) -> Result<(Vec<Self::Response>, i64), ErrorResponse>;
}
