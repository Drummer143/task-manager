use std::str::FromStr;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{encode, postgres, Decode, FromRow, Postgres, Type};
use uuid::Uuid;

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

#[derive(Debug, Deserialize, Serialize, Clone, utoipa::ToSchema)]
pub struct Doc {
    pub text: Option<String>,
    pub r#type: String,
    pub page_id: Option<String>,
    pub attrs: Option<serde_json::Value>,
    pub content: Option<serde_json::Value>,
    pub marks: Option<serde_json::Value>,
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

// #[derive(Debug, FromRow, Clone)]
// pub struct PageContent {
//     page_id: Uuid,
//     content: sqlx::types::Json<Doc>,
//     updated_at: DateTime<Utc>,
// }

#[derive(Debug, FromRow, Clone)]
pub struct PageWithContent {
    #[sqlx(flatten)]
    pub page: Page,
    pub content: Option<sqlx::types::Json<Doc>>,
}
