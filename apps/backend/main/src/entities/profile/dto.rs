use std::convert::Infallible;

use serde::{Deserialize, Serialize};

use rust_api::entities::{user::model::User, workspace::model::Workspace};

#[derive(Serialize, utoipa::ToSchema)]
pub struct GetProfileDto {
    #[serde(flatten)]
    pub user: User,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace: Option<Workspace>,
}

#[derive(Deserialize, utoipa::ToSchema, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum GetProfileInclude {
    Workspace,
}

impl std::str::FromStr for GetProfileInclude {
    type Err = Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "workspace" => Ok(GetProfileInclude::Workspace),
            _ => unreachable!(),
        }
    }
}

impl ToString for GetProfileInclude {
    fn to_string(&self) -> String {
        match self {
            GetProfileInclude::Workspace => "workspace".to_string(),
        }
    }
}

#[derive(Deserialize)]
pub struct GetProfileQuery {
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<GetProfileInclude>>,
}
