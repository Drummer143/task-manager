use axum::response::IntoResponse;
use error_handlers::handlers::ErrorResponse;

#[derive(Debug)]
pub enum RedisError {
    Pool(deadpool_redis::PoolError),
    Redis(deadpool_redis::redis::RedisError),
    Serialization(serde_json::Error),
    NotFound,
}

impl From<deadpool_redis::PoolError> for RedisError {
    fn from(err: deadpool_redis::PoolError) -> Self {
        RedisError::Pool(err)
    }
}

impl From<deadpool_redis::redis::RedisError> for RedisError {
    fn from(err: deadpool_redis::redis::RedisError) -> Self {
        RedisError::Redis(err)
    }
}

impl From<serde_json::Error> for RedisError {
    fn from(err: serde_json::Error) -> Self {
        RedisError::Serialization(err)
    }
}

impl From<RedisError> for ErrorResponse {
    fn from(err: RedisError) -> Self {
        match err {
            RedisError::Pool(e) => {
                ErrorResponse::internal_server_error(Some(format!("Redis pool error: {}", e)))
            }
            RedisError::Redis(e) => {
                ErrorResponse::internal_server_error(Some(format!("Redis error: {}", e)))
            }
            RedisError::Serialization(e) => ErrorResponse::internal_server_error(Some(format!(
                "Serialization error: {}",
                e
            ))),
            RedisError::NotFound => ErrorResponse::not_found(
                error_handlers::codes::NotFoundErrorCode::NotFound,
                None,
                None,
            ),
        }
    }
}

impl IntoResponse for RedisError {
    fn into_response(self) -> axum::response::Response {
        ErrorResponse::from(self).into_response()
    }
}
