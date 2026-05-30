use std::{fmt::Display, str::FromStr};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{
    Decode, Encode, FromRow, Postgres, Type,
    encode::IsNull,
    postgres::{PgArgumentBuffer, PgValueRef},
};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, ToSchema, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RoomVisibility {
    Public,
    Private,
}

impl FromStr for RoomVisibility {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "public" => Ok(RoomVisibility::Public),
            "private" => Ok(RoomVisibility::Private),
            _ => Err("Invalid RoomVisibility".to_string()),
        }
    }
}

impl<'r> Decode<'r, Postgres> for RoomVisibility {
    fn decode(value: PgValueRef<'r>) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let s = <&str as Decode<Postgres>>::decode(value)?;
        Ok(RoomVisibility::from_str(s)?)
    }
}

impl Display for RoomVisibility {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RoomVisibility::Public => write!(f, "public"),
            RoomVisibility::Private => write!(f, "private"),
        }
    }
}

impl<'r> sqlx::Encode<'r, Postgres> for RoomVisibility {
    fn encode_by_ref(
        &self,
        buf: &mut PgArgumentBuffer,
    ) -> Result<IsNull, Box<dyn std::error::Error + Send + Sync>> {
        <String as Encode<Postgres>>::encode(self.to_string(), buf)
    }
}

impl Type<Postgres> for RoomVisibility {
    fn type_info() -> sqlx::postgres::PgTypeInfo {
        sqlx::postgres::PgTypeInfo::with_name("text")
    }

    fn compatible(ty: &sqlx::postgres::PgTypeInfo) -> bool {
        <String as Type<Postgres>>::compatible(ty)
    }
}

#[derive(Debug, Clone, FromRow, ToSchema, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Room {
    pub id: Uuid,
    pub name: String,
    pub visibility: RoomVisibility,
    pub created_by: Uuid,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
