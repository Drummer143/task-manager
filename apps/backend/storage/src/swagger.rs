#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::entities::actions::controller::upload::upload,
        crate::entities::files::controller::get_file::get_file,
    ),
)]
pub struct ApiDoc;
