use std::fmt;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum SortOrder {
    Asc,
    Desc,
}

impl Default for SortOrder {
    fn default() -> Self {
        SortOrder::Asc
    }
}

impl fmt::Display for SortOrder {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SortOrder::Asc => write!(f, "ASC"),
            SortOrder::Desc => write!(f, "DESC"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub enum ShiftAction {
    Plus,
    Minus,
}

impl ToString for ShiftAction {
    fn to_string(&self) -> String {
        match self {
            ShiftAction::Plus => "+".to_string(),
            ShiftAction::Minus => "-".to_string(),
        }
    }
}

