use std::str::FromStr;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Postgres, Type};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, utoipa::ToSchema, PartialOrd)]
#[serde(rename_all = "camelCase")]
pub enum Role {
    Owner,
    Admin,
    Member,
    Commentator,
    Guest,
}

impl std::fmt::Display for Role {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.to_string())
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

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct WorkspaceAccess {
    pub id: Uuid,
    #[serde(skip_serializing)]
    pub user_id: Uuid,
    #[serde(skip_serializing)]
    pub workspace_id: Uuid,
    pub role: Role,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
