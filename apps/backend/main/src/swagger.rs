use utoipa::openapi::security::{SecurityScheme, Http, HttpAuthScheme};
use utoipa::Modify;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = &mut openapi.components {
            components.add_security_scheme(
                "bearer_auth",
                SecurityScheme::Http(Http::new(HttpAuthScheme::Bearer)),
            )
        }
    }
}

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::entities::board_statuses::controller::create_board_status::create_board_status,
        crate::entities::board_statuses::controller::get_board_statuses::get_board_statuses,

        crate::entities::page::controller::get_list_in_workspace::get_list_in_workspace,
        crate::entities::page::controller::get_page::get_page,
        crate::entities::page::controller::create_page::create_page,
        crate::entities::page::controller::update_page::update_page,
        crate::entities::page::controller::delete_page::delete_page,

        crate::entities::page_access::controller::get_page_access_list::get_page_access_list,
        crate::entities::page_access::controller::create_page_access::create_page_access,
        crate::entities::page_access::controller::update_page_access::update_page_access,

        crate::entities::profile::controller::get_profile::get_profile,

        crate::entities::task::controller::get_task::get_task,
        crate::entities::task::controller::get_tasks_in_page::get_tasks_in_page,
        crate::entities::task::controller::create_task::create_task,
        crate::entities::task::controller::update_task::update_task,
        crate::entities::task::controller::delete_task::delete_task,
        crate::entities::task::controller::change_status::change_status,

        crate::entities::user::controller::get_list::get_list,
        crate::entities::user::controller::get_by_id::get_by_id,

        crate::entities::workspace::controller::get_list::get_list,
        crate::entities::workspace::controller::get_by_id::get_by_id,
        crate::entities::workspace::controller::create_workspace::create_workspace,
        crate::entities::workspace::controller::update_workspace::update_workspace,
        crate::entities::workspace::controller::soft_delete::soft_delete,
        crate::entities::workspace::controller::cancel_soft_delete::cancel_soft_delete,

        crate::entities::workspace::controller::get_workspace_access_list::get_workspace_access_list,
        crate::entities::workspace::controller::create_workspace_access::create_workspace_access,
        crate::entities::workspace::controller::update_workspace_access::update_workspace_access,
    ),
    components(schemas(
        rust_api::entities::user::model::User,
        rust_api::entities::workspace::model::Role,

        error_handlers::handlers::ErrorResponse,
        
        crate::types::pagination::Meta,
        crate::types::pagination::SortOrder,

        crate::entities::page::dto::PageInclude,
        crate::entities::page::dto::PageListFormat,
        crate::entities::page::dto::PageListInclude,

        crate::entities::user::dto::UserSortBy,

        crate::entities::workspace::dto::Include,
        crate::entities::workspace::dto::WorkspaceInfo,
        crate::entities::workspace::dto::WorkspaceSortBy,
    )),
    security(
        ("bearer_auth" = [])
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::webhooks::authentik::user_sync::controller::user_sync,  
    ),
    components(schemas(
        
    ))
)]
pub struct WebhooksDoc;
