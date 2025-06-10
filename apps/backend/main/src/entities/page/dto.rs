use std::convert::Infallible;

use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;

use crate::entities::{
    page::model::{Page, PageType},
    user::model::User,
    workspace::dto::WorkspaceResponseWithoutInclude,
};

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreatePageDto {
    pub title: String,
    pub parent_page_id: Option<Uuid>,
    pub r#type: String,
    pub text: Option<String>,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePageDto {
    pub title: Option<String>,
    pub text: Option<String>,
}

#[derive(Debug, serde::Serialize, Clone, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PageResponseWithoutInclude {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,
    pub text: Option<String>,
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
            text: page.text,
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
            text: page.text.clone(),
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
    pub text: Option<String>,

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
            text: page.text,
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
            text: page.text,
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
    pub text: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace: Option<WorkspaceResponseWithoutInclude>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_page: Option<ChildPageResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub child_pages: Option<Vec<ChildPageResponse>>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl axum::response::IntoResponse for PageResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}

impl From<super::model::Page> for PageResponse {
    fn from(page: super::model::Page) -> Self {
        Self {
            id: page.id,
            r#type: page.r#type,
            title: page.title,
            text: page.text,
            owner: None,
            workspace: None,
            parent_page: None,
            child_pages: None,
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
    Workspace,
    ParentPage,
    ChildPages,
}

impl std::str::FromStr for PageInclude {
    type Err = Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "owner" => Ok(PageInclude::Owner),
            "workspace" => Ok(PageInclude::Workspace),
            "parentPage" => Ok(PageInclude::ParentPage),
            "childPages" => Ok(PageInclude::ChildPages),
            _ => unreachable!(),
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
    type Err = Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "owner" => Ok(PageListInclude::Owner),
            "workspace" => Ok(PageListInclude::Workspace),
            _ => unreachable!(),
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
