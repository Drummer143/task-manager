#[derive(utoipa::OpenApi)]
#[openapi(paths(
    crate::entities::actions::controller::upload::upload,
    crate::entities::files::controller::get_file::get_file,
    crate::entities::actions::controller::upload_init::upload_init,
    crate::entities::actions::controller::upload_chunked::upload_chunked,
    crate::entities::actions::controller::upload_complete::upload_complete
))]
pub struct ApiDoc;
