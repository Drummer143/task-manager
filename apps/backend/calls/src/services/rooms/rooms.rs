use error_handlers::{codes, handlers::ErrorResponse};
use livekit_api::access_token::{AccessToken, VideoGrants};
use sql::rooms::model::{Room, RoomVisibility};
use uuid::Uuid;

use crate::{
    redis::AccessTokenRepository,
    repos::{
        rooms::{RoomsRepository, dto::CreateRoomDto},
        users::UsersRepository,
    },
    types::app_state::AppState,
};

pub struct RoomsService;

impl RoomsService {
    pub async fn create_room(
        app_state: &AppState,
        dto: CreateRoomDto,
    ) -> Result<Room, ErrorResponse> {
        RoomsRepository::create_room(&app_state.postgres, &dto)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_room(app_state: &AppState, room_id: Uuid) -> Result<Room, ErrorResponse> {
        RoomsRepository::get_one_by_id(&app_state.postgres, room_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn list_rooms(
        app_state: &AppState,
        user_id: Uuid,
    ) -> Result<Vec<Room>, ErrorResponse> {
        RoomsRepository::get_rooms_by_user(&app_state.postgres, user_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn delete_room(
        app_state: &AppState,
        room_id: Uuid,
        user_id: Uuid,
    ) -> Result<(), ErrorResponse> {
        let room = RoomsRepository::get_one_by_id(&app_state.postgres, room_id)
            .await
            .map_err(ErrorResponse::from)?;

        if room.created_by != user_id {
            return Err(ErrorResponse::forbidden(
                codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
                Some("Only the room owner can delete the room".into()),
            ));
        }

        RoomsRepository::soft_delete(&app_state.postgres, room_id)
            .await
            .map_err(ErrorResponse::from)?;

        // Best-effort cleanup of any access tokens in Redis.
        let _ = AccessTokenRepository::revoke_all(&app_state.redis, room_id).await;

        Ok(())
    }

    /// Host-only: issues a new temporary access token for a private room.
    pub async fn generate_access_token(
        app_state: &AppState,
        room_id: Uuid,
        user_id: Uuid,
        ttl_seconds: Option<u64>,
    ) -> Result<(String, u64), ErrorResponse> {
        let room = RoomsRepository::get_one_by_id(&app_state.postgres, room_id)
            .await
            .map_err(ErrorResponse::from)?;

        if room.created_by != user_id {
            return Err(ErrorResponse::forbidden(
                codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
                Some("Only the room owner can issue access tokens".into()),
            ));
        }

        if matches!(room.visibility, RoomVisibility::Public) {
            return Err(ErrorResponse::bad_request(
                codes::BadRequestErrorCode::InvalidBody,
                None,
                Some("Public rooms do not require an access token".into()),
            ));
        }

        let ttl = ttl_seconds.unwrap_or(app_state.access_token_default_ttl_seconds);

        let token = AccessTokenRepository::issue(&app_state.redis, room_id, ttl)
            .await
            .map_err(ErrorResponse::from)?;

        Ok((token, ttl))
    }

    /// Verifies access and returns a LiveKit JWT + server URL for joining the room.
    pub async fn join(
        app_state: &AppState,
        room_id: Uuid,
        user_id: Uuid,
        access_token: Option<String>,
    ) -> Result<(String, String), ErrorResponse> {
        let room = RoomsRepository::get_one_by_id(&app_state.postgres, room_id)
            .await
            .map_err(ErrorResponse::from)?;

        if matches!(room.visibility, RoomVisibility::Private) {
            let provided = access_token.ok_or_else(|| {
                ErrorResponse::forbidden(
                    codes::ForbiddenErrorCode::AccessDenied,
                    None,
                    Some("Access token required for a private room".into()),
                )
            })?;

            let valid = AccessTokenRepository::verify(&app_state.redis, room_id, &provided)
                .await
                .map_err(ErrorResponse::from)?;

            if !valid {
                return Err(ErrorResponse::forbidden(
                    codes::ForbiddenErrorCode::AccessDenied,
                    None,
                    Some("Invalid or expired access token".into()),
                ));
            }
        }

        // Fetch user to include username in the LiveKit JWT — other participants
        // see the human name instead of a UUID.
        let user = UsersRepository::get_one_by_id(&app_state.postgres, user_id)
            .await
            .map_err(ErrorResponse::from)?;

        let jwt =
            AccessToken::with_api_key(&app_state.livekit_api_key, &app_state.livekit_api_secret)
                .with_identity(&user_id.to_string())
                .with_name(&user.username)
                .with_grants(VideoGrants {
                    room_join: true,
                    room: room_id.to_string(),
                    can_publish: true,
                    can_subscribe: true,
                    can_publish_data: true,
                    ..Default::default()
                })
                .to_jwt()
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

        Ok((jwt, app_state.livekit_url.to_string()))
    }
}
