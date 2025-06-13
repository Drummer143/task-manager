#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::entities::file::controller::upload::upload,
    ),
)]
pub struct ApiDoc;
