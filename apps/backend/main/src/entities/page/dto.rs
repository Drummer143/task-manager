use std::collections::HashMap;

use chrono::{DateTime, Utc};
use error_handlers::{codes, handlers::ErrorResponse};
use repo::entities::{page::model::{Doc, Page, PageType}, user::model::User};
use serde::Serialize;
use uuid::Uuid;

use crate::entities::{task::dto::TaskResponse, workspace::dto::WorkspaceResponseWithoutInclude};

#[derive(Debug, Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DocResponse {
    pub text: Option<String>,
    pub r#type: String,
    pub version: i32,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub attrs: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub marks: Option<serde_json::Value>,
}

impl From<Doc> for DocResponse {
    fn from(doc: Doc) -> Self {
        Self {
            text: doc.text,
            r#type: doc.r#type,
            version: doc.version,
            attrs: doc.attrs,
            content: doc.content,
            marks: doc.marks,
        }
    }
}

#[derive(Debug, Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PageResponseWithoutInclude {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,
    pub text: Option<DocResponse>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<Page> for PageResponseWithoutInclude {
    fn from(page: Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            text: page.text.map(DocResponse::from),
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
            text: page.text.clone().map(DocResponse::from),
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

#[derive(Debug, serde::Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ChildPageResponse {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,
    pub text: Option<DocResponse>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<User>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<Page> for ChildPageResponse {
    fn from(page: Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            text: page.text.map(DocResponse::from),
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
            text: page.text.map(DocResponse::from),
            owner: page.owner,
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

#[derive(Debug, serde::Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PageResponse {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,
    pub role: Option<repo::entities::page_access::model::Role>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<DocResponse>,
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

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
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
            text: page.text.map(DocResponse::from),
            role: None,
            owner: None,
            workspace: None,
            parent_page: None,
            child_pages: None,
            tasks: None,
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }
    }
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum PageListFormat {
    List,
    Tree,
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum PageInclude {
    Owner,
    Tasks,
    Workspace,
    ParentPage,
    ChildPages,
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
            _ => {
                return Err(ErrorResponse::bad_request(
                    codes::BadRequestErrorCode::InvalidQueryParams,
                    Some(HashMap::from([("include".to_string(), s.to_string())])),
                ));
            }
        }
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct PageQuery {
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<PageInclude>>,
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema, PartialEq)]
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
                ));
            }
        }
    }
}

#[derive(serde::Deserialize)]
pub struct PageListQuery {
    pub format: Option<PageListFormat>,
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<PageListInclude>>,
}
