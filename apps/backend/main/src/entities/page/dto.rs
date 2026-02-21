use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sql::{
    page::model::{Page, PageType, Role},
    shared::tiptap_content::TipTapContent,
    user::model::User,
};
use uuid::Uuid;

use crate::entities::board_statuses::dto::BoardStatusResponseDto;

// PAGE

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreatePageDto {
    pub title: String,
    pub r#type: PageType,
    pub content: Option<TipTapContent>,
    pub parent_page_id: Option<Uuid>,
}

#[derive(Debug, utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
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

    #[serde(skip_serializing_if = "Option::is_none")]
    pub child_pages: Option<Vec<ChildPageResponse>>,

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

impl From<Page> for PageResponse {
    fn from(page: Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            child_pages: None,
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

#[derive(Deserialize)]
pub struct PageListQuery {
    pub format: Option<PageListFormat>,
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

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DetailedPageResponseBase {
    pub id: Uuid,
    pub title: String,
    pub user_role: Role,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DetailedPageResponseText {
    #[serde(flatten)]
    pub base: DetailedPageResponseBase,
    pub content: Option<TipTapContent>,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TaskResponse {
    pub id: Uuid,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub due_date: Option<DateTime<Utc>>,
    pub position: i32,
    pub is_draft: bool,
    pub status_id: Uuid,

    pub assignee_id: Option<Uuid>,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DetailedPageResponseBoard {
    #[serde(flatten)]
    pub base: DetailedPageResponseBase,
    pub statuses: Vec<BoardStatusResponseDto>,
    pub tasks: Vec<TaskResponse>,
    pub assignees: Vec<User>,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DetailedPageResponseGroup {
    #[serde(flatten)]
    pub base: DetailedPageResponseBase,

    pub child_pages: Vec<PageResponseWithoutInclude>,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum DetailedPageResponse {
    Text(DetailedPageResponseText),
    Board(DetailedPageResponseBoard),
    Group(DetailedPageResponseGroup),
}
