use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, Clone, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct FileAttributes {
    pub id: Option<Uuid>,

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

impl TipTapContent {
    /// Finds a file node by its id and applies the hydration function to it.
    /// Returns true if the node was found and updated.
    pub fn hydrate_file_node<F>(&mut self, asset_id: Uuid, hydrate_fn: F) -> bool
    where
        F: FnOnce(&mut FileAttributes),
    {
        let Some(content) = &mut self.content else {
            return false;
        };

        for node_wrapper in content.iter_mut() {
            if let NodeWrapper::Typed(Node::File { attrs }) = node_wrapper
                && attrs.id == Some(asset_id)
            {
                hydrate_fn(attrs);
                return true;
            }
        }

        false
    }
}
