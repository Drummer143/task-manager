#[derive(utoipa::OpenApi)]
#[openapi(paths(
    crate::entities::actions::controller::upload::upload,
    crate::entities::files::controller::get_file::get_file,
    crate::entities::actions::controller::upload_init::upload_init,
    crate::entities::actions::controller::upload_chunk::upload_chunk,
    crate::entities::actions::controller::upload_complete::upload_complete,
    crate::entities::actions::controller::upload_whole_file::upload_whole_file,
))]
pub struct ApiDoc;
