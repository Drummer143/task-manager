use error_handlers::handlers::ErrorResponse;
use livekit_api::access_token::VideoGrants;
use uuid::Uuid;

use crate::{repos::users::UserRepository, types::app_state::AppState};

pub struct CallService;

impl CallService {
    pub async fn create_token(app_state: &AppState, user_id: Uuid, room_id: Option<Uuid>) -> Result<String, ErrorResponse> {
        let user = UserRepository::get_one_by_id(&app_state.postgres, user_id).await?;

        livekit_api::access_token::AccessToken::with_api_key(&app_state.livekit_api_key, &app_state.livekit_api_secret)
            .with_identity(&user_id.to_string())
            .with_name(&user.username)
            .with_grants(VideoGrants {
                room_join: true,
                room: room_id.unwrap_or_else(|| Uuid::new_v4()).to_string(),
                can_publish: true,
                can_subscribe: true,
                ..Default::default()
            })
            .to_jwt()
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))
    }
}
