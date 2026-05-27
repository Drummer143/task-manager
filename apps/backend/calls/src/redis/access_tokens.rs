use std::sync::Arc;

use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use deadpool_redis::redis::AsyncCommands;
use rand::RngCore;
use uuid::Uuid;

use super::error::RedisError;

/// Random bytes used for token generation. 16 bytes = 128 bits entropy = 22 base64url chars.
const TOKEN_BYTES: usize = 16;

pub struct AccessTokenRepository;

impl AccessTokenRepository {
    /// Key holding the token's existence with TTL.
    fn token_key(room_id: Uuid, token: &str) -> String {
        format!("room_access:{}:{}", room_id, token)
    }

    /// Set holding all currently valid tokens for a room — used for list/revoke-all.
    fn room_index_key(room_id: Uuid) -> String {
        format!("room_access_index:{}", room_id)
    }

    /// Generates a cryptographically random URL-safe token.
    pub fn generate_token() -> String {
        let mut bytes = [0u8; TOKEN_BYTES];
        rand::rng().fill_bytes(&mut bytes);
        URL_SAFE_NO_PAD.encode(bytes)
    }

    /// Issues a new access token for the given room, valid for `ttl_seconds`.
    pub async fn issue(
        pool: &Arc<deadpool_redis::Pool>,
        room_id: Uuid,
        ttl_seconds: u64,
    ) -> Result<String, RedisError> {
        let token = Self::generate_token();
        let mut conn = pool.get().await?;

        let token_key = Self::token_key(room_id, &token);
        let index_key = Self::room_index_key(room_id);

        conn.set_ex::<_, _, ()>(&token_key, "1", ttl_seconds).await?;
        conn.sadd::<_, _, ()>(&index_key, &token).await?;

        Ok(token)
    }

    /// Checks whether the provided token is currently valid for the given room.
    pub async fn verify(
        pool: &Arc<deadpool_redis::Pool>,
        room_id: Uuid,
        token: &str,
    ) -> Result<bool, RedisError> {
        let mut conn = pool.get().await?;
        let exists: bool = conn.exists(Self::token_key(room_id, token)).await?;
        Ok(exists)
    }

    /// Lists all valid tokens currently issued for the room. Stale entries (whose primary
    /// key already expired) are pruned from the index lazily.
    pub async fn list(
        pool: &Arc<deadpool_redis::Pool>,
        room_id: Uuid,
    ) -> Result<Vec<String>, RedisError> {
        let mut conn = pool.get().await?;
        let tokens: Vec<String> = conn.smembers(Self::room_index_key(room_id)).await?;

        let mut alive = Vec::with_capacity(tokens.len());
        for token in tokens {
            let exists: bool = conn.exists(Self::token_key(room_id, &token)).await?;
            if exists {
                alive.push(token);
            } else {
                // Lazy cleanup of expired entries in the index set
                conn.srem::<_, _, ()>(Self::room_index_key(room_id), &token)
                    .await?;
            }
        }

        Ok(alive)
    }

    /// Revokes a specific token.
    pub async fn revoke(
        pool: &Arc<deadpool_redis::Pool>,
        room_id: Uuid,
        token: &str,
    ) -> Result<(), RedisError> {
        let mut conn = pool.get().await?;

        conn.del::<_, ()>(Self::token_key(room_id, token)).await?;
        conn.srem::<_, _, ()>(Self::room_index_key(room_id), token)
            .await?;
        Ok(())
    }

    /// Revokes ALL tokens for the given room.
    pub async fn revoke_all(
        pool: &Arc<deadpool_redis::Pool>,
        room_id: Uuid,
    ) -> Result<(), RedisError> {
        let mut conn = pool.get().await?;
        let index_key = Self::room_index_key(room_id);

        let tokens: Vec<String> = conn.smembers(&index_key).await?;
        for token in &tokens {
            conn.del::<_, ()>(Self::token_key(room_id, token)).await?;
        }

        conn.del::<_, ()>(&index_key).await?;
        Ok(())
    }
}
