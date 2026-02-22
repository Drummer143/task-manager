use error_handlers::handlers::ErrorResponse;
use sql::{
    shared::{
        traits::{
            PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
            PostgresqlRepositoryUpdate, UpdateDto,
        },
        types::ShiftAction,
    },
    task::model::Task,
};
use uuid::Uuid;

use crate::{
    entities::{
        board_statuses::db::BoardStatusRepository,
        task::{
            controller::create_draft::CreateDraftRequest,
            db::{CreateTaskDto, TaskRepository, UpdateTaskDto},
        },
    },
    shared::traits::{
        ServiceBase, ServiceCreateMethod, ServiceDeleteMethod, ServiceGetOneByIdMethod,
        ServiceUpdateMethod,
    },
    types::app_state::AppState,
};

pub struct TaskService;

impl ServiceBase for TaskService {
    type Response = Task;
}

impl ServiceCreateMethod for TaskService {
    type CreateDto = CreateTaskDto;

    async fn create(
        app_state: &AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        TaskRepository::create(&app_state.postgres, dto)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceUpdateMethod for TaskService {
    type UpdateDto = UpdateTaskDto;

    async fn update(
        app_state: &AppState,
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

        if let Some(status_id) = dto.status_id
            && status_id != current_task.status_id
            && let Some(position) = dto.position
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
        } else if let Some(position) = dto.position
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
        app_state: &AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        TaskRepository::get_one_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceDeleteMethod for TaskService {
    async fn delete(app_state: &AppState, id: Uuid) -> Result<Self::Response, ErrorResponse> {
        TaskRepository::delete(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl TaskService {
    pub async fn get_all_tasks_by_page_id(
        app_state: &AppState,
        page_id: Uuid,
    ) -> Result<Vec<Task>, ErrorResponse> {
        TaskRepository::get_all_tasks_by_page_id(&app_state.postgres, page_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn create_for_page(
        state: &AppState,
        page_id: Uuid,
        reporter_id: Uuid,
        dto: crate::entities::task::dto::CreateTaskRequest,
    ) -> Result<Task, ErrorResponse> {
        let last_position = TaskRepository::get_last_position(&state.postgres, dto.status_id)
            .await
            .map_err(ErrorResponse::from)?
            .unwrap_or_default();

        TaskRepository::create(
            &state.postgres,
            CreateTaskDto {
                title: dto.title,
                status_id: dto.status_id,
                description: dto.description,
                due_date: dto.due_date,
                assignee_id: dto.assignee_id,
                reporter_id,
                page_id,
                position: last_position + 1,
                is_draft: false,
            },
        )
        .await
        .map_err(ErrorResponse::from)
    }

    pub async fn create_draft(
        state: &AppState,
        page_id: Uuid,
        user_id: Uuid,
        body: CreateDraftRequest,
    ) -> Result<Task, ErrorResponse> {
        let board_status_id = if let Some(status) = body.board_status_id {
            status
        } else {
            BoardStatusRepository::get_initial_board_status_by_page_id(
                &state.postgres,
                page_id,
            )
            .await?
            .id
        };

        let position =
            TaskRepository::get_last_position(&state.postgres, board_status_id)
                .await?
                .unwrap_or_default();

        println!("position: {} for status: {}", position, board_status_id);

        TaskRepository::create(
            &state.postgres,
            CreateTaskDto {
                assignee_id: None,
                description: None,
                due_date: None,
                page_id,
                position: position + 1,
                is_draft: true,
                status_id: board_status_id,
                reporter_id: user_id,
                title: "".to_string(),
            },
        )
        .await
        .map_err(ErrorResponse::from)
    }
}
