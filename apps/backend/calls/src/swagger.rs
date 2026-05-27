use utils::swagger::SecurityAddon;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::controllers::rooms::controller::create_room::create_room,
    ),
    components(schemas(
        error_handlers::handlers::ErrorResponse,
    )),
    security(
        ("bearer_auth" = [])
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;
