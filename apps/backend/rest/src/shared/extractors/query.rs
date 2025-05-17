use crate::shared::error_handlers::handlers::ErrorResponse;

pub struct ValidatedQuery<T>(pub T);

impl<B, T> axum::extract::FromRequest<B> for ValidatedQuery<T>
where
    B: Send + Sync,
    T: serde::de::DeserializeOwned + Send,
{
    type Rejection = ErrorResponse;

    async fn from_request(req: axum::extract::Request, state: &B) -> Result<Self, Self::Rejection> {
        let query = axum::extract::Query::<T>::from_request(req, state).await;

        match query {
            Ok(query) => Ok(ValidatedQuery(query.0)),
            Err(e) => Err(ErrorResponse::from_query_rejection(e)),
        }
    }
}
