use std::collections::{HashMap, HashSet};

use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::{
        board_statuses::{
            db::{BoardStatusRepository, CreateBoardStatusDto},
            dto::BoardStatusResponseDto,
        },
        page::{
            db::{
                CreatePageAccessDto, CreatePageDto, PageRepository, UpdatePageAccessDto,
                UpdatePageDto,
            },
            dto::{
                DetailedPageResponse, DetailedPageResponseBase, DetailedPageResponseBoard,
                DetailedPageResponseGroup, DetailedPageResponseText, PageAccessResponse,
                PageResponseWithoutInclude, TaskResponse, UpdatePageDto as ApiUpdatePageDto,
            },
        },
        task::db::TaskRepository,
        user::db::UserRepository,
    },
    shared::{
        extractors::x_user_language::DEFAULT_LANGUAGE,
        traits::{
            ServiceBase, ServiceCreateMethod, ServiceDeleteMethod, ServiceGetOneByIdMethod,
            ServiceUpdateMethod,
        },
    },
    types::app_state::AppState,
};
use sql::{
    page::model::{Page, PageAccess, PageType},
    shared::traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
        PostgresqlRepositoryUpdate,
    },
};

pub struct PageService;

impl ServiceBase for PageService {
    type Response = Page;
}

impl ServiceCreateMethod for PageService {
    type CreateDto = CreatePageDto;

    async fn create(
        app_state: &AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

        let page = PageRepository::create(&mut *tx, dto)
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
                    &mut *tx,
                    CreateBoardStatusDto {
                        page_id: page.id,
                        position: status.position,
                        // parent_status_id: None,
                        initial: Some(status.initial),
                        localizations: sqlx::types::Json(localizations),
                    },
                )
                .await
                .map_err(ErrorResponse::from)?;
            }
        }

        tx.commit().await.map_err(ErrorResponse::from)?;

        Ok(page)
    }
}

impl ServiceUpdateMethod for PageService {
    type UpdateDto = ApiUpdatePageDto;

    async fn update(
        app_state: &AppState,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

        let page = if dto.title.is_some() {
            PageRepository::update(&mut *tx, id, UpdatePageDto { title: dto.title })
                .await
                .map_err(ErrorResponse::from)?
        } else {
            PageRepository::get_one_by_id(&app_state.postgres, id)
                .await
                .map_err(ErrorResponse::from)?
        };

        if let Some(content) = dto.content {
            println!("content: {:?}", content);
            PageRepository::update_content(&mut *tx, id, content)
                .await
                .map_err(ErrorResponse::from)?;
        }

        tx.commit().await.map_err(ErrorResponse::from)?;

        Ok(page)
    }
}

impl ServiceGetOneByIdMethod for PageService {
    async fn get_one_by_id(
        app_state: &AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        PageRepository::get_one_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceDeleteMethod for PageService {
    async fn delete(app_state: &AppState, id: Uuid) -> Result<Self::Response, ErrorResponse> {
        PageRepository::delete(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl PageService {
    pub async fn get_all_in_workspace(
        app_state: &AppState,
        workspace_id: Uuid,
    ) -> Result<Vec<Page>, ErrorResponse> {
        PageRepository::get_all_in_workspace(&app_state.postgres, workspace_id)
            .await
            .map_err(ErrorResponse::from)
    }

    // pub async fn get_child_pages(
    //     app_state: &AppState,
    //     page_id: Uuid,
    // ) -> Result<Vec<Page>, ErrorResponse> {
    //     PageRepository::get_child_pages(&app_state.postgres, page_id)
    //         .await
    //         .map_err(ErrorResponse::from)
    // }

    // PAGE ACCESS

    pub async fn create_page_access(
        app_state: &crate::types::app_state::AppState,
        dto: CreatePageAccessDto,
    ) -> Result<PageAccess, ErrorResponse> {
        PageRepository::create_page_access(&app_state.postgres, dto)
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

    pub async fn update_page_access(
        app_state: &crate::types::app_state::AppState,
        dto: UpdatePageAccessDto,
    ) -> Result<PageAccess, ErrorResponse> {
        PageRepository::update_page_access(&app_state.postgres, dto)
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

    // pub async fn get_page_access(
    //     app_state: &crate::types::app_state::AppState,
    //     user_id: Uuid,
    //     page_id: Uuid,
    // ) -> Result<PageAccessResponse, ErrorResponse> {
    //     let page_access =
    //         PageRepository::get_one_page_access(&app_state.postgres, user_id, page_id)
    //             .await
    //             .map_err(|e| match e {
    //                 sqlx::Error::RowNotFound => ErrorResponse::not_found(
    //                     error_handlers::codes::NotFoundErrorCode::NotFound,
    //                     None,
    //                     Some(e.to_string()),
    //                 ),
    //                 error => ErrorResponse::internal_server_error(Some(error.to_string())),
    //             })?;

    //     let user =
    //         crate::entities::user::UserService::get_one_by_id(app_state, page_access.user_id)
    //             .await?;

    //     Ok(PageAccessResponse {
    //         created_at: page_access.created_at,
    //         updated_at: page_access.updated_at,
    //         deleted_at: page_access.deleted_at,
    //         id: page_access.id,
    //         user,
    //         role: page_access.role,
    //     })
    // }

    pub async fn get_page_access_list(
        app_state: &crate::types::app_state::AppState,
        page_id: Uuid,
    ) -> Result<Vec<PageAccessResponse>, ErrorResponse> {
        let page_access_list = PageRepository::get_page_access_list(&app_state.postgres, page_id)
            .await
            .map_err(|e| match e {
                sqlx::Error::RowNotFound => ErrorResponse::not_found(
                    error_handlers::codes::NotFoundErrorCode::NotFound,
                    None,
                    Some(e.to_string()),
                ),
                error => ErrorResponse::internal_server_error(Some(error.to_string())),
            })?;

        let mut page_access_list_response = Vec::new();

        for page_access in page_access_list {
            let user =
                crate::entities::user::UserService::get_one_by_id(app_state, page_access.user_id)
                    .await?;
            page_access_list_response.push(PageAccessResponse {
                created_at: page_access.created_at,
                updated_at: page_access.updated_at,
                deleted_at: page_access.deleted_at,
                id: page_access.id,
                user,
                role: page_access.role,
            });
        }

        Ok(page_access_list_response)
    }

    pub async fn get_detailed_page(
        app_state: &crate::types::app_state::AppState,
        page_id: Uuid,
        page_access: PageAccess,
        lang: Option<String>,
    ) -> Result<DetailedPageResponse, ErrorResponse> {
        let lang = lang.unwrap_or(DEFAULT_LANGUAGE.to_string());
        let page = PageRepository::get_one_by_id(&app_state.postgres, page_id).await?;

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
                let content =
                    PageRepository::get_text_page_content(&app_state.postgres, page_id).await?;

                Ok(DetailedPageResponse::Text(DetailedPageResponseText {
                    base,
                    content: content.content.0,
                }))
            }
            PageType::Board => {
                // TODO: Get board page details

                let (statuses, tasks) = tokio::join!(
                    BoardStatusRepository::get_board_statuses_by_page_id(
                        &app_state.postgres,
                        page_id,
                    ),
                    TaskRepository::get_all_tasks_by_page_id(&app_state.postgres, page_id,),
                );

                let statuses = statuses?;
                let mut assignee_ids = HashSet::new();
                let tasks = tasks?
                    .iter()
                    .map(|t| {
                        if let Some(assignee_id) = t.assignee_id {
                            assignee_ids.insert(assignee_id);
                        }

                        TaskResponse {
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
                let assignees =
                    UserRepository::get_users_by_ids(&app_state.postgres, &assignee_ids).await?;

                Ok(DetailedPageResponse::Board(DetailedPageResponseBoard {
                    base,
                    assignees,
                    statuses: statuses
                        .into_iter()
                        .map(|s| BoardStatusResponseDto {
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
                let child_pages =
                    PageRepository::get_child_pages(&app_state.postgres, page_id).await?;

                Ok(DetailedPageResponse::Group(DetailedPageResponseGroup {
                    base,
                    child_pages: child_pages
                        .iter()
                        .map(PageResponseWithoutInclude::from)
                        .collect(),
                }))
            }
        }
    }
}
