use std::collections::{HashMap, HashSet};

use error_handlers::handlers::ErrorResponse;
use sql::page::model::{Page, PageAccess, PageType};
use sqlx::PgConnection;
use uuid::Uuid;

use crate::{
    controllers::{
        board_statuses::dto::BoardStatusResponse,
        page::dto::{
            DetailedPageResponse, DetailedPageResponseBase, DetailedPageResponseBoard,
            DetailedPageResponseGroup, DetailedPageResponseText, PageAccessResponse, PageSummary,
            TaskSummary, UpdatePageRequest,
        },
    },
    repos::{
        board_statuses::{BoardStatusRepository, CreateBoardStatusDto},
        pages::{
            CreatePageAccessDto, CreatePageDto, PageRepository, UpdatePageAccessDto, UpdatePageDto,
        },
        tasks::TaskRepository,
        users::UserRepository,
    },
    shared::extractors::x_user_language::DEFAULT_LANGUAGE,
};

pub struct PageService;

impl PageService {
    // QUERIES

    pub async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
    ) -> Result<Page, ErrorResponse> {
        PageRepository::get_one_by_id(executor, id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_all_in_workspace<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        workspace_id: Uuid,
    ) -> Result<Vec<Page>, ErrorResponse> {
        PageRepository::get_all_in_workspace(executor, workspace_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_detailed_page<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Copy,
        page_id: Uuid,
        page_access: PageAccess,
        lang: Option<String>,
    ) -> Result<DetailedPageResponse, ErrorResponse> {
        let lang = lang.unwrap_or(DEFAULT_LANGUAGE.to_string());
        let page = PageRepository::get_one_by_id(executor, page_id).await?;

        let base = DetailedPageResponseBase {
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
            id: page.id,
            title: page.title,
            user_role: page_access.role,
        };

        match page.r#type {
            PageType::Text => {
                let content = PageRepository::get_text_page_content(executor, page_id).await?;

                Ok(DetailedPageResponse::Text(DetailedPageResponseText {
                    base,
                    content: content.content.0,
                }))
            }
            PageType::Board => {
                let (statuses, tasks) = tokio::join!(
                    BoardStatusRepository::get_board_statuses_by_page_id(executor, page_id),
                    TaskRepository::get_all_tasks_by_page_id(executor, page_id),
                );

                let statuses = statuses?;
                let mut assignee_ids = HashSet::new();
                let tasks = tasks?
                    .iter()
                    .map(|t| {
                        if let Some(assignee_id) = t.assignee_id {
                            assignee_ids.insert(assignee_id);
                        }

                        TaskSummary {
                            id: t.id,
                            title: t.title.clone(),
                            due_date: t.due_date,
                            position: t.position,
                            is_draft: t.is_draft,
                            status_id: t.status_id,
                            assignee_id: t.assignee_id,
                        }
                    })
                    .collect();

                let assignee_ids: Vec<Uuid> = assignee_ids.into_iter().collect();
                let assignees = UserRepository::get_users_by_ids(executor, &assignee_ids).await?;

                Ok(DetailedPageResponse::Board(DetailedPageResponseBoard {
                    base,
                    assignees,
                    statuses: statuses
                        .into_iter()
                        .map(|s| BoardStatusResponse {
                            id: s.id,
                            title: s.localizations.get(&lang).cloned().unwrap_or_else(|| {
                                s.localizations.get("en").cloned().unwrap_or_default()
                            }),
                            initial: s.initial,
                        })
                        .collect(),
                    tasks,
                }))
            }
            PageType::Group => {
                let child_pages = PageRepository::get_child_pages(executor, page_id).await?;

                Ok(DetailedPageResponse::Group(DetailedPageResponseGroup {
                    base,
                    child_pages: child_pages.iter().map(PageSummary::from).collect(),
                }))
            }
        }
    }
    pub async fn get_page_access_list<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Copy,
        page_id: Uuid,
    ) -> Result<Vec<PageAccessResponse>, ErrorResponse> {
        let page_access_list = PageRepository::get_page_access_list(executor, page_id)
            .await
            .map_err(|e| match e {
                sqlx::Error::RowNotFound => ErrorResponse::not_found(
                    error_handlers::codes::NotFoundErrorCode::NotFound,
                    None,
                    Some(e.to_string()),
                ),
                error => ErrorResponse::internal_server_error(Some(error.to_string())),
            })?;

        let user_ids: Vec<Uuid> = page_access_list.iter().map(|a| a.user_id).collect();
        let users = UserRepository::get_users_by_ids(executor, &user_ids).await?;
        let users_map: HashMap<Uuid, sql::user::model::User> =
            users.into_iter().map(|u| (u.id, u)).collect();

        let page_access_list_response = page_access_list
            .into_iter()
            .filter_map(|page_access| {
                let user = users_map.get(&page_access.user_id).cloned()?;
                Some(PageAccessResponse {
                    created_at: page_access.created_at,
                    updated_at: page_access.updated_at,
                    deleted_at: page_access.deleted_at,
                    id: page_access.id,
                    user,
                    role: page_access.role,
                })
            })
            .collect();

        Ok(page_access_list_response)
    }

    // COMMANDS

    pub async fn create(
        executor: &mut PgConnection,
        dto: CreatePageDto,
    ) -> Result<Page, ErrorResponse> {
        let page = PageRepository::create(&mut *executor, dto)
            .await
            .map_err(ErrorResponse::from)?;

        if page.r#type == PageType::Board {
            for status in crate::shared::constants::INIT_BOARD_STATUSES {
                let localizations = status
                    .localizations
                    .iter()
                    .map(|(k, v)| (k.to_string(), v.to_string()))
                    .collect::<HashMap<String, String>>();

                BoardStatusRepository::create(
                    &mut *executor,
                    CreateBoardStatusDto {
                        page_id: page.id,
                        position: status.position,
                        initial: Some(status.initial),
                        localizations: sqlx::types::Json(localizations),
                    },
                )
                .await
                .map_err(ErrorResponse::from)?;
            }
        }

        Ok(page)
    }

    pub async fn update(
        executor: &mut PgConnection,
        id: Uuid,
        dto: UpdatePageRequest,
    ) -> Result<Page, ErrorResponse> {
        let page = if dto.title.is_some() {
            PageRepository::update(&mut *executor, id, UpdatePageDto { title: dto.title })
                .await
                .map_err(ErrorResponse::from)?
        } else {
            PageRepository::get_one_by_id(&mut *executor, id)
                .await
                .map_err(ErrorResponse::from)?
        };

        if let Some(content) = dto.content {
            PageRepository::update_content(&mut *executor, id, content)
                .await
                .map_err(ErrorResponse::from)?;
        }

        Ok(page)
    }

    pub async fn delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
    ) -> Result<Page, ErrorResponse> {
        PageRepository::delete(executor, id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn create_page_access<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: CreatePageAccessDto,
    ) -> Result<PageAccess, ErrorResponse> {
        PageRepository::create_page_access(executor, dto)
            .await
            .map_err(|e| match e {
                sqlx::Error::Database(e) => {
                    if e.code() == Some("23505".into()) {
                        return ErrorResponse::conflict(
                            error_handlers::codes::ConflictErrorCode::AccessAlreadyGiven,
                            None,
                            Some(e.to_string()),
                        );
                    }

                    ErrorResponse::internal_server_error(None)
                }
                _ => ErrorResponse::internal_server_error(None),
            })
    }

    pub async fn update_page_access<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: UpdatePageAccessDto,
    ) -> Result<PageAccess, ErrorResponse> {
        PageRepository::update_page_access(executor, dto)
            .await
            .map_err(|e| match e {
                sqlx::Error::RowNotFound => ErrorResponse::not_found(
                    error_handlers::codes::NotFoundErrorCode::NotFound,
                    None,
                    Some(e.to_string()),
                ),
                error => ErrorResponse::internal_server_error(Some(error.to_string())),
            })
    }
}
