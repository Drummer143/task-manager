use utils::swagger::SecurityAddon;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::controllers::board_statuses::controller::create_board_status::create_board_status,
        crate::controllers::board_statuses::controller::get_board_statuses::get_board_statuses,

        crate::controllers::page::controller::get_page_list::get_page_list,
        crate::controllers::page::controller::get_page::get_page,
        crate::controllers::page::controller::create_page::create_page,
        crate::controllers::page::controller::update_page::update_page,
        crate::controllers::page::controller::delete_page::delete_page,

        crate::controllers::page::controller::get_page_details::get_page_details,

        crate::controllers::page::controller::get_page_access_list::get_page_access_list,
        crate::controllers::page::controller::create_page_access::create_page_access,
        crate::controllers::page::controller::update_page_access::update_page_access,

        crate::controllers::profile::controller::get_profile::get_profile,
        crate::controllers::profile::controller::update_profile::update_profile,
        crate::controllers::profile::controller::upload_avatar::upload_avatar,
        crate::controllers::profile::controller::delete_avatar::delete_avatar,

        crate::controllers::task::controller::get_task::get_task,
        crate::controllers::task::controller::get_tasks_in_page::get_tasks_in_page,
        crate::controllers::task::controller::create_task::create_task,
        crate::controllers::task::controller::create_draft_task::create_draft_task,
        crate::controllers::task::controller::update_task::update_task,
        crate::controllers::task::controller::delete_task::delete_task,

        crate::controllers::user::controller::get_list::get_list,
        crate::controllers::user::controller::get_by_id::get_by_id,

        crate::controllers::workspace::controller::get_list::get_list,
        crate::controllers::workspace::controller::get_by_id::get_by_id,
        crate::controllers::workspace::controller::create_workspace::create_workspace,
        crate::controllers::workspace::controller::update_workspace::update_workspace,
        crate::controllers::workspace::controller::soft_delete::soft_delete,
        crate::controllers::workspace::controller::cancel_soft_delete::cancel_soft_delete,

        crate::controllers::workspace::controller::get_detailed_workspace::get_detailed_workspace,

        crate::controllers::workspace::controller::get_workspace_access_list::get_workspace_access_list,
        crate::controllers::workspace::controller::create_workspace_access::create_workspace_access,
        crate::controllers::workspace::controller::update_workspace_access::update_workspace_access,

        crate::controllers::assets::controller::create_upload_token::create_upload_token,
    ),
    components(schemas(
        sql::user::model::User,
        sql::workspace::model::Role,

        error_handlers::handlers::ErrorResponse,
        
        crate::types::pagination::Meta,
        crate::types::pagination::SortOrder,

        crate::controllers::page::dto::PageListFormat,

        crate::repos::workspaces::WorkspaceSortBy,
        crate::repos::users::UserSortBy,
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
        crate::controllers::assets::controller::create_asset::create_asset,
        crate::controllers::assets::controller::validate_access::validate_access,
    )
)]
pub struct InternalApiDoc;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::webhooks::authentik::user_sync::controller::user_sync,
    ),
    components(schemas(
        
    ))
)]
pub struct WebhooksDoc;
