use utils::swagger::SecurityAddon;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::controllers::calls::controller::create_token::create_token,
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
