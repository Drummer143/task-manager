use error_handlers::handlers::ErrorResponse;
use rust_api::{
    entities::task::{TaskRepository, model::Task},
    shared::{
        traits::{
            PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
            PostgresqlRepositoryUpdate, UpdateDto,
        },
        types::ShiftAction,
    },
};
use uuid::Uuid;

use crate::shared::traits::{
    ServiceBase, ServiceCreateMethod, ServiceDeleteMethod, ServiceGetOneByIdMethod,
    ServiceUpdateMethod,
};

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
        TaskRepository::create(&app_state.postgres, dto)
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
        if dto.is_empty() {
            return TaskRepository::get_one_by_id(&app_state.postgres, id)
                .await
                .map_err(ErrorResponse::from);
        }

        let mut tx = app_state.postgres.begin().await?;

        let current_task = TaskRepository::get_one_by_id(&mut *tx, id)
            .await
            .map_err(ErrorResponse::from)?;

        if let Some(status_id) = dto.status_id.clone()
            && status_id != current_task.status_id
            && let Some(position) = dto.position.clone()
            && position > current_task.position
        {
            let shift_tasks_position = TaskRepository::shift_tasks_position(
                &mut *tx,
                status_id,
                Some(position),
                None,
                ShiftAction::Plus,
            )
            .await
            .map_err(ErrorResponse::from);

            if let Err(e) = shift_tasks_position {
                tx.rollback().await?;
                return Err(e);
            }

            let shift_tasks_position = TaskRepository::shift_tasks_position(
                &mut *tx,
                status_id,
                Some(2),
                Some(current_task.position - 1),
                ShiftAction::Minus,
            )
            .await
            .map_err(ErrorResponse::from);

            if let Err(e) = shift_tasks_position {
                tx.rollback().await?;
                return Err(e);
            }
        } else if let Some(position) = dto.position.clone()
            && position != current_task.position
        {
            let (start, end, action) = if position > current_task.position {
                (current_task.position + 1, position, ShiftAction::Minus)
            } else {
                (position, current_task.position - 1, ShiftAction::Plus)
            };

            let shift_tasks_position = TaskRepository::shift_tasks_position(
                &mut *tx,
                current_task.status_id,
                Some(start),
                Some(end),
                action,
            )
            .await
            .map_err(ErrorResponse::from);

            if let Err(e) = shift_tasks_position {
                tx.rollback().await?;
                return Err(e);
            }
        }

        let updated_task = TaskRepository::update(&mut *tx, id, dto)
            .await
            .map_err(ErrorResponse::from);

        match updated_task {
            Ok(task) => {
                tx.commit().await?;
                Ok(task)
            }
            Err(e) => {
                tx.rollback().await?;
                Err(e)
            }
        }
    }
}

impl ServiceGetOneByIdMethod for TaskService {
    async fn get_one_by_id(
        app_state: &crate::types::app_state::AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        TaskRepository::get_one_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceDeleteMethod for TaskService {
    async fn delete(
        app_state: &crate::types::app_state::AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        TaskRepository::delete(&app_state.postgres, id)
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
        let mut tx = app_state.postgres.begin().await?;

        let current_task = TaskRepository::get_one_by_id(&mut *tx, task_id)
            .await
            .map_err(ErrorResponse::from);

        if let Err(e) = current_task {
            tx.rollback().await?;
            return Err(e);
        }

        let current_task = current_task.unwrap();

        // if let Some(position) = dto.position.clone() {
        //     TaskRepository::shift_tasks_position(
        //         &mut *tx,
        //         status_id,
        //         Some(position),
        //         None,
        //         ShiftAction::Plus,
        //     )
        //     .await
        //     .map_err(ErrorResponse::from)?;
        // }

        let shift_tasks_position = TaskRepository::shift_tasks_position(
            &mut *tx,
            current_task.status_id,
            Some(current_task.position + 1),
            None,
            ShiftAction::Minus,
        )
        .await
        .map_err(ErrorResponse::from);

        if let Err(e) = shift_tasks_position {
            tx.rollback().await?;
            return Err(e);
        }

        let last_position =
            rust_api::entities::task::TaskRepository::get_last_position(&mut *tx, dto.status_id)
                .await
                .map_err(ErrorResponse::from);

        if let Err(e) = last_position {
            tx.rollback().await?;
            return Err(e);
        }

        let last_position = last_position.unwrap();

        let updated_task = TaskRepository::update(
            &mut *tx,
            task_id,
            rust_api::entities::task::dto::UpdateTaskDto {
                status_id: Some(dto.status_id),
                assignee_id: None,
                due_date: None,
                title: None,
                position: Some(last_position.unwrap_or_default() + 1),
            },
        )
        .await
        .map_err(ErrorResponse::from);

        match updated_task {
            Ok(task) => {
                tx.commit().await?;
                Ok(task)
            }
            Err(e) => {
                tx.rollback().await?;
                Err(e)
            }
        }
    }

    pub async fn get_all_tasks_by_page_id<'a>(
        app_state: &crate::types::app_state::AppState,
        page_id: Uuid,
    ) -> Result<Vec<Task>, ErrorResponse> {
        TaskRepository::get_all_tasks_by_page_id(&app_state.postgres, page_id)
            .await
            .map_err(ErrorResponse::from)
    }
}
