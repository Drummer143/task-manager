use std::fmt;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Meta {
    pub total: i64,
    pub limit: i64,
    pub offset: i64,
    pub has_more: bool,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Pagination<T: Serialize> {
    pub data: Vec<T>,
    pub meta: Meta,
}

impl<T: Serialize> Pagination<T> {
    pub fn new(data: Vec<T>, total: i64, limit: i64, offset: i64) -> Self {
        let has_more = offset + limit < total;
        Self {
            data,
            meta: Meta {
                total,
                limit,
                offset,
                has_more,
            },
        }
    }
}

impl<T: Serialize> axum::response::IntoResponse for Pagination<T> {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema, Default)]
#[serde(rename_all = "camelCase")]
pub enum SortOrder {
    #[default]
    Asc,
    Desc,
}

impl fmt::Display for SortOrder {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SortOrder::Asc => write!(f, "ASC"),
            SortOrder::Desc => write!(f, "DESC"),
        }
    }
}
