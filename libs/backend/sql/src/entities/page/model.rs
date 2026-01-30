use std::str::FromStr;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Decode, FromRow, Postgres, Type, encode, postgres};
use uuid::Uuid;

use crate::shared::tiptap_content::TipTapContent;

// PAGE

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum PageType {
    Text,
    Board,
    Group,
}

impl std::fmt::Display for PageType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PageType::Text => write!(f, "text"),
            PageType::Board => write!(f, "board"),
            PageType::Group => write!(f, "group"),
        }
    }
}

impl FromStr for PageType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "text" => Ok(PageType::Text),
            "board" => Ok(PageType::Board),
            "group" => Ok(PageType::Group),
            _ => Err("Invalid PageType".to_string()),
        }
    }
}

impl<'r> Decode<'r, Postgres> for PageType {
    fn decode(
        value: postgres::PgValueRef<'_>,
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let s = <&str as Decode<Postgres>>::decode(value)?;
        Ok(PageType::from_str(s)?)
    }
}

impl<'r> sqlx::Encode<'r, Postgres> for PageType {
    fn encode_by_ref(
        &self,
        buf: &mut postgres::PgArgumentBuffer,
    ) -> Result<encode::IsNull, Box<dyn std::error::Error + Send + Sync>> {
        <String as encode::Encode<Postgres>>::encode(self.to_string(), buf)
    }
}

impl Type<Postgres> for PageType {
    fn type_info() -> sqlx::postgres::PgTypeInfo {
        <String as Type<Postgres>>::type_info()
    }

    fn compatible(ty: &sqlx::postgres::PgTypeInfo) -> bool {
        <String as Type<Postgres>>::compatible(ty)
    }
}

#[derive(Debug, FromRow, Clone)]
pub struct Page {
    pub id: Uuid,
    pub r#type: PageType,
    pub title: String,
    pub owner_id: Uuid,
    pub workspace_id: Uuid,
    pub parent_page_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, FromRow, Clone)]
pub struct PageWithContent {
    #[sqlx(flatten)]
    pub page: Page,
    pub content: Option<sqlx::types::Json<TipTapContent>>,
}

// PAGE ACCESS

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, utoipa::ToSchema, PartialOrd)]
#[serde(rename_all = "camelCase")]
pub enum Role {
    Guest,
    Commentator,
    Member,
    Admin,
    Owner,
}

impl std::fmt::Display for Role {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Role::Owner => write!(f, "owner"),
            Role::Admin => write!(f, "admin"),
            Role::Member => write!(f, "member"),
            Role::Commentator => write!(f, "commentator"),
            Role::Guest => write!(f, "guest"),
        }
    }
}

impl FromStr for Role {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "owner" => Ok(Role::Owner),
            "admin" => Ok(Role::Admin),
            "member" => Ok(Role::Member),
            "commentator" => Ok(Role::Commentator),
            "guest" => Ok(Role::Guest),
            _ => unreachable!(),
        }
    }
}

impl Type<Postgres> for Role {
    fn type_info() -> sqlx::postgres::PgTypeInfo {
        <String as Type<Postgres>>::type_info()
    }

    fn compatible(ty: &sqlx::postgres::PgTypeInfo) -> bool {
        <String as Type<Postgres>>::compatible(ty)
    }
}

impl<'r> sqlx::Decode<'r, Postgres> for Role {
    fn decode(
        value: sqlx::postgres::PgValueRef<'r>,
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let s = <&str as sqlx::Decode<Postgres>>::decode(value)?;
        Ok(Role::from_str(s)?)
    }
}

impl sqlx::Encode<'_, Postgres> for Role {
    fn encode_by_ref(
        &self,
        buf: &mut sqlx::postgres::PgArgumentBuffer,
    ) -> Result<sqlx::encode::IsNull, Box<dyn std::error::Error + Send + Sync>> {
        <String as sqlx::Encode<Postgres>>::encode(self.to_string(), buf)
    }
}

#[derive(Debug, FromRow, Clone)]
pub struct PageAccess {
    pub id: Uuid,
    pub user_id: Uuid,
    pub page_id: Uuid,
    pub role: Role,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
