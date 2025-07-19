use error_handlers::handlers::ErrorResponse;
use rust_api::entities::task::{model::Task, repository};
use uuid::Uuid;

use crate::shared::traits::{ServiceBase, ServiceCreateMethod, ServiceDeleteMethod, ServiceGetOneByIdMethod, ServiceUpdateMethod};

pub struct TaskService;

impl ServiceBase for TaskService {
    type Response = Task;
}

impl ServiceCreateMethod for TaskService {
    type CreateDto = rust_api::entities::task::dto::CreateTaskDto;

    async fn create(
        app_state: &crate::types::app_state::AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        repository::create_task(&app_state.postgres, dto)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceUpdateMethod for TaskService {
    type UpdateDto = rust_api::entities::task::dto::UpdateTaskDto;

    async fn update(
        app_state: &crate::types::app_state::AppState,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        repository::update_task(&app_state.postgres, id, dto)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceGetOneByIdMethod for TaskService {
    async fn get_one_by_id(
        app_state: &crate::types::app_state::AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        repository::get_task_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceDeleteMethod for TaskService {
    async fn delete(
        app_state: &crate::types::app_state::AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        repository::delete_task(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl TaskService {
    pub async fn change_status<'a>(
        app_state: &crate::types::app_state::AppState,
        task_id: Uuid,
        dto: rust_api::entities::task::dto::ChangeStatusDto,
    ) -> Result<Task, ErrorResponse> {
        repository::change_status(&app_state.postgres, task_id, dto.status)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_all_tasks_by_page_id<'a>(
        app_state: &crate::types::app_state::AppState,
        page_id: Uuid,
    ) -> Result<Vec<Task>, ErrorResponse> {
        repository::get_all_tasks_by_page_id(&app_state.postgres, page_id)
            .await
            .map_err(ErrorResponse::from)
    }
}
