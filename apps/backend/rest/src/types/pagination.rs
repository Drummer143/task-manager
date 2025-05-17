use std::fmt;

use serde::{Deserialize, Serialize};

pub const DEFAULT_LIMIT: i64 = 10;
pub const DEFAULT_OFFSET: i64 = 0;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Meta {
    pub total: i64,
    pub limit: i64,
    pub offset: i64,
    pub has_more: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Pagination<T> {
    pub data: Vec<T>,
    pub meta: Meta,
}

impl<T> Pagination<T> {
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

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SortOrder {
    Asc,
    Desc,
}

impl fmt::Display for SortOrder {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SortOrder::Asc => write!(f, "asc"),
            SortOrder::Desc => write!(f, "desc"),
        }
    }
}
