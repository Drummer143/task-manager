use axum::extract::FromRequestParts;
use error_handlers::{codes, handlers::ErrorResponse};

pub struct ValidatedPath<T>(pub T);

impl<S, T> FromRequestParts<S> for ValidatedPath<T>
where
    S: Send + Sync,
    T: serde::de::DeserializeOwned + Send,
{
    type Rejection = ErrorResponse;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let path = axum::extract::Path::<T>::from_request_parts(parts, state).await;

        match path {
            Ok(path) => Ok(ValidatedPath(path.0)),
            Err(e) => {
                tracing::error_span!("Path extraction error").in_scope(|| {
                    tracing::error!("Path extraction error: {e}");
                });

                Err(ErrorResponse::bad_request(
                    codes::BadRequestErrorCode::InvalidParams,
                    None,
                    Some(e.to_string()),
                ))
            }
        }
    }
}
