use error_handlers::handlers::ErrorResponse;
use livekit_api::access_token::VideoGrants;
use uuid::Uuid;

pub struct CallService;

impl CallService {
    pub async fn create_token(
        user_id: Uuid,
        livekit_api_key: &str,
        livekit_api_secret: &str,
    ) -> Result<String, ErrorResponse> {
        livekit_api::access_token::AccessToken::with_api_key(livekit_api_key, livekit_api_secret)
            .with_identity(&user_id.to_string())
            .with_grants(VideoGrants {
                room_join: true,
                room: Uuid::new_v4().to_string(),
                can_publish: true,
                can_subscribe: true,
                ..Default::default()
            })
            .to_jwt()
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))
    }
}
