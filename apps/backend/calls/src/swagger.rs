use utils::swagger::SecurityAddon;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        crate::controllers::rooms::controller::create_room::create_room,
        crate::controllers::rooms::controller::list_rooms::list_rooms,
        crate::controllers::rooms::controller::get_room::get_room,
        crate::controllers::rooms::controller::delete_room::delete_room,
        crate::controllers::rooms::controller::join_room::join_room,
        crate::controllers::rooms::controller::generate_room_token::generate_room_token,
    ),
    components(schemas(
        error_handlers::handlers::ErrorResponse,
        sql::rooms::model::Room,
        sql::rooms::model::RoomVisibility,
        crate::controllers::rooms::dto::CreateRoomDto,
        crate::controllers::rooms::dto::GenerateRoomTokenDto,
        crate::controllers::rooms::dto::GenerateRoomTokenResponse,
        crate::controllers::rooms::dto::JoinRoomDto,
        crate::controllers::rooms::dto::JoinRoomResponse,
    )),
    security(
        ("bearer_auth" = [])
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;
