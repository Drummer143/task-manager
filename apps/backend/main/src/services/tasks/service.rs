use std::collections::{HashMap, HashSet};

use error_handlers::handlers::ErrorResponse;
use sql::{
    shared::{traits::UpdateDto, types::ShiftAction},
    task::model::Task,
    user::model::User,
};
use uuid::Uuid;

use crate::{
    controllers::{
        board_statuses::dto::BoardStatusResponse,
        task::{controller::create_draft_task::CreateDraftRequest, dto::TaskResponse},
    },
    repos::{
        board_statuses::BoardStatusRepository,
        tasks::{CreateTaskDto, TaskRepository, UpdateTaskDto},
        users::UserRepository,
    },
};

pub struct TaskService;

impl TaskService {
    pub async fn update(
        pool: &sqlx::PgPool,
        id: Uuid,
        dto: UpdateTaskDto,
    ) -> Result<Task, ErrorResponse> {
        if dto.is_empty() {
            return TaskRepository::get_one_by_id(pool, id)
                .await
                .map_err(ErrorResponse::from);
        }

        let mut tx = pool.begin().await?;

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

    pub async fn delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
    ) -> Result<Task, ErrorResponse> {
        TaskRepository::delete(executor, id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn create_for_page(
        pool: &sqlx::PgPool,
        page_id: Uuid,
        reporter_id: Uuid,
        dto: crate::controllers::task::dto::CreateTaskRequest,
    ) -> Result<Task, ErrorResponse> {
        let last_position = TaskRepository::get_last_position(pool, dto.status_id)
            .await
            .map_err(ErrorResponse::from)?
            .unwrap_or_default();

        TaskRepository::create(
            pool,
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
        pool: &sqlx::PgPool,
        page_id: Uuid,
        user_id: Uuid,
        body: CreateDraftRequest,
    ) -> Result<Task, ErrorResponse> {
        let board_status_id = if let Some(status) = body.board_status_id {
            status
        } else {
            BoardStatusRepository::get_initial_board_status_by_page_id(pool, page_id)
                .await?
                .id
        };

        let position = TaskRepository::get_last_position(pool, board_status_id)
            .await?
            .unwrap_or_default();

        TaskRepository::create(
            pool,
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

    pub async fn get_task_with_details(
        pool: &sqlx::PgPool,
        task_id: Uuid,
        lang: &str,
    ) -> Result<TaskResponse, ErrorResponse> {
        let task = TaskRepository::get_one_by_id(pool, task_id)
            .await
            .map_err(ErrorResponse::from)?;

        let board_status = BoardStatusRepository::get_one_by_id(pool, task.status_id)
            .await
            .map_err(ErrorResponse::from)?;

        let mut user_ids = HashSet::new();
        user_ids.insert(task.reporter_id);
        if let Some(assignee_id) = task.assignee_id {
            user_ids.insert(assignee_id);
        }

        let user_ids_vec: Vec<Uuid> = user_ids.into_iter().collect();
        let users = UserRepository::get_users_by_ids(pool, &user_ids_vec).await?;
        let users_map: HashMap<Uuid, User> = users.into_iter().map(|u| (u.id, u)).collect();

        let reporter = users_map.get(&task.reporter_id).cloned();
        let assignee = task.assignee_id.and_then(|id| users_map.get(&id).cloned());

        let mut task_response = TaskResponse::from(task);
        task_response.reporter = reporter;
        task_response.assignee = assignee;
        task_response.status = Some(BoardStatusResponse {
            id: board_status.id,
            title: board_status
                .localizations
                .get(lang)
                .or_else(|| board_status.localizations.get("en"))
                .cloned()
                .unwrap_or_default(),
            initial: board_status.initial,
        });

        Ok(task_response)
    }

    pub async fn get_tasks_in_page_with_details(
        pool: &sqlx::PgPool,
        page_id: Uuid,
        lang: &str,
    ) -> Result<Vec<TaskResponse>, ErrorResponse> {
        let (tasks, board_statuses) = tokio::join!(
            TaskRepository::get_all_tasks_by_page_id(pool, page_id),
            BoardStatusRepository::get_board_statuses_by_page_id(pool, page_id),
        );

        let tasks = tasks.map_err(ErrorResponse::from)?;
        let board_statuses = board_statuses.map_err(ErrorResponse::from)?;

        let status_map: HashMap<Uuid, BoardStatusResponse> = board_statuses
            .into_iter()
            .map(|s| {
                let title = s
                    .localizations
                    .get(lang)
                    .or_else(|| s.localizations.get("en"))
                    .cloned()
                    .unwrap_or_default();
                (
                    s.id,
                    BoardStatusResponse {
                        id: s.id,
                        title,
                        initial: s.initial,
                    },
                )
            })
            .collect();

        // Batch load all users (reporters + assignees)
        let mut user_ids = HashSet::new();
        for task in &tasks {
            user_ids.insert(task.reporter_id);
            if let Some(assignee_id) = task.assignee_id {
                user_ids.insert(assignee_id);
            }
        }

        let user_ids_vec: Vec<Uuid> = user_ids.into_iter().collect();
        let users = UserRepository::get_users_by_ids(pool, &user_ids_vec).await?;
        let users_map: HashMap<Uuid, User> = users.into_iter().map(|u| (u.id, u)).collect();

        let task_responses = tasks
            .into_iter()
            .map(|task| {
                let reporter = users_map.get(&task.reporter_id).cloned();
                let assignee = task.assignee_id.and_then(|id| users_map.get(&id).cloned());
                let status = status_map.get(&task.status_id).cloned();

                let mut resp = TaskResponse::from(task);
                resp.description = None;
                resp.reporter = reporter;
                resp.assignee = assignee;
                resp.status = status;
                resp
            })
            .collect();

        Ok(task_responses)
    }
}
