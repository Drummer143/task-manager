use error_handlers::handlers::ErrorResponse;

pub struct ValidatedQuery<T>(pub T);

impl<S, T> axum::extract::FromRequestParts<S> for ValidatedQuery<T>
where
    T: serde::de::DeserializeOwned + Send,
    S: Send + Sync,
{
    type Rejection = ErrorResponse;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _: &S,
    ) -> Result<Self, Self::Rejection> {
        let query = parts.uri.query().unwrap_or_default();

        let query_vec = form_urlencoded::parse(query.as_bytes())
            .into_owned()
            .collect::<Vec<(String, String)>>();

        let deserializer =
            serde_urlencoded::Deserializer::new(form_urlencoded::parse(query.as_bytes()));
        let params = serde_path_to_error::deserialize(deserializer).map_err(|e| {
            let mut details = std::collections::HashMap::<String, String>::new();

            let field_name = e.path().to_string();
            let field_value = query_vec
                .iter()
                .find(|(k, _)| k == &field_name)
                .map(|(_, v)| v.clone());

            details.insert("param".to_string(), field_name);
            if let Some(field_value) = field_value {
                details.insert("received".to_string(), field_value);
            }

            ErrorResponse::bad_request(
                error_handlers::codes::BadRequestErrorCode::InvalidQueryParams,
                Some(details),
            )
        })?;

        Ok(Self(params))
    }
}
