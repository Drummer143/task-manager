use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Deserialize, Serialize, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct FileAttributes {
    pub id: Option<String>,

    pub src: Option<String>,
    pub href: Option<String>,

    pub alt: Option<String>,
    pub title: Option<String>,

    pub height: Option<String>,
    pub width: Option<String>,

    pub size: Option<u64>,

    pub r#type: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, ToSchema)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum Node {
    File { attrs: FileAttributes },
}

#[derive(Debug, Deserialize, Serialize, Clone, ToSchema)]
#[serde(untagged, rename_all = "camelCase")]
pub enum NodeWrapper {
    Typed(Node),

    Generic(serde_json::Value),
}

#[derive(Debug, Deserialize, Serialize, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum DocType {
    #[serde(rename = "doc")]
    Doc,
}

#[derive(Debug, Deserialize, Serialize, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TipTapContent {
    pub r#type: DocType,
    pub content: Option<Vec<NodeWrapper>>,
}
