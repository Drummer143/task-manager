use error_handlers::{codes, handlers::ErrorResponse};

pub struct ValidatedPath<T>(pub T);

impl<B, T> axum::extract::FromRequest<B> for ValidatedPath<T>
where
    B: Send + Sync,
    T: serde::de::DeserializeOwned + Send,
{
    type Rejection = ErrorResponse;

    async fn from_request(req: axum::extract::Request, state: &B) -> Result<Self, Self::Rejection> {
        let path = axum::extract::Path::<T>::from_request(req, state).await;

        match path {
            Ok(path) => Ok(ValidatedPath(path.0)),
            Err(e) => {
                tracing::error_span!("Path extraction error").in_scope(|| {
                    tracing::error!("Path extraction error: {e}");
                });

                Err(ErrorResponse::bad_request(
                    codes::BadRequestErrorCode::InvalidParams,
                    None,
                ))
            }
        }
    }
}
