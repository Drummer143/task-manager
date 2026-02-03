use std::collections::HashMap;

use chrono::{DateTime, Utc};
use error_handlers::{codes, handlers::ErrorResponse};
use serde::{Deserialize, Serialize};
use sql::{
    page::model::{Page, PageType, PageWithContent, Role},
    shared::tiptap_content::TipTapContent,
    user::model::User,
};
use uuid::Uuid;

use crate::entities::{
    board_statuses::dto::BoardStatusResponseDto, task::dto::TaskResponse,
    workspace::dto::WorkspaceResponseWithoutInclude,
};

// PAGE

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreatePageDto {
    pub title: String,
    pub r#type: PageType,
    pub parent_page_id: Option<Uuid>,
    pub content: Option<TipTapContent>,
}

#[derive(Debug, utoipa::ToSchema, Deserialize)]
pub struct UpdatePageDto {
    pub title: Option<String>,

    pub content: Option<Option<TipTapContent>>,
}

#[derive(Debug, Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PageResponseWithoutInclude {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<Page> for PageResponseWithoutInclude {
    fn from(page: Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

impl From<&Page> for PageResponseWithoutInclude {
    fn from(page: &Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type.clone(),
            title: page.title.clone(),
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

#[derive(Debug, Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ChildPageResponse {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<User>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<Page> for ChildPageResponse {
    fn from(page: Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            owner: None,
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

impl From<PageResponse> for ChildPageResponse {
    fn from(page: PageResponse) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            owner: page.owner,
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

#[derive(Debug, Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PageResponse {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,
    pub role: Option<sql::page::model::Role>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace: Option<WorkspaceResponseWithoutInclude>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_page: Option<ChildPageResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub child_pages: Option<Vec<ChildPageResponse>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tasks: Option<Vec<TaskResponse>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub board_statuses: Option<Vec<BoardStatusResponseDto>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<TipTapContent>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl axum::response::IntoResponse for PageResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}

impl From<PageWithContent> for PageResponse {
    fn from(page: PageWithContent) -> Self {
        Self {
            id: page.page.id,
            r#type: page.page.r#type,
            title: page.page.title,
            role: None,
            owner: None,
            workspace: None,
            parent_page: None,
            child_pages: None,
            tasks: None,
            board_statuses: None,
            content: page.content.map(|c| c.0),
            created_at: page.page.created_at,
            updated_at: page.page.updated_at,
            deleted_at: page.page.deleted_at,
        }
    }
}

impl From<Page> for PageResponse {
    fn from(page: Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            role: None,
            owner: None,
            workspace: None,
            parent_page: None,
            child_pages: None,
            tasks: None,
            content: None,
            board_statuses: None,
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

#[derive(Debug, Deserialize, utoipa::ToSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum PageListFormat {
    List,
    Tree,
}

#[derive(Debug, Deserialize, utoipa::ToSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum PageInclude {
    Owner,
    Tasks,
    Workspace,
    ParentPage,
    ChildPages,
    BoardStatuses,
}

impl std::str::FromStr for PageInclude {
    type Err = ErrorResponse;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "owner" => Ok(PageInclude::Owner),
            "tasks" => Ok(PageInclude::Tasks),
            "workspace" => Ok(PageInclude::Workspace),
            "parentPage" => Ok(PageInclude::ParentPage),
            "childPages" => Ok(PageInclude::ChildPages),
            "boardStatuses" => Ok(PageInclude::BoardStatuses),
            _ => {
                return Err(ErrorResponse::bad_request(
                    codes::BadRequestErrorCode::InvalidQueryParams,
                    Some(HashMap::from([("include".to_string(), s.to_string())])),
                    None,
                ));
            }
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct PageQuery {
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<PageInclude>>,
}

#[derive(Debug, Deserialize, utoipa::ToSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum PageListInclude {
    Owner,
    Workspace,
}

impl std::str::FromStr for PageListInclude {
    type Err = ErrorResponse;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "owner" => Ok(PageListInclude::Owner),
            "workspace" => Ok(PageListInclude::Workspace),
            _ => {
                return Err(ErrorResponse::bad_request(
                    codes::BadRequestErrorCode::InvalidQueryParams,
                    Some(HashMap::from([("include".to_string(), s.to_string())])),
                    None,
                ));
            }
        }
    }
}

#[derive(Deserialize)]
pub struct PageListQuery {
    pub format: Option<PageListFormat>,
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<PageListInclude>>,
}

// PAGE ACCESS

#[derive(Debug, utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePageAccessDto {
    pub user_id: Uuid,
    pub role: Role,
}

#[derive(Debug, utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePageAccessDto {
    pub user_id: Uuid,
    pub role: Option<Role>,
}

#[derive(Debug, Serialize, utoipa::ToSchema, Clone)]
pub struct PageAccessResponse {
    pub id: Uuid,
    pub user: sql::user::model::User,
    pub role: Role,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl axum::response::IntoResponse for PageAccessResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}
