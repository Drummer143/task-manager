use axum::extract::FromRequestParts;

pub const DEFAULT_LANGUAGE: &str = "en";
const HEADER_NAME: &str = "x-user-language";

// TODO: validate language against a list of supported languages
pub struct XUserLanguage(pub Option<String>);

impl<S> FromRequestParts<S> for XUserLanguage
where
    S: Send + Sync,
{
    type Rejection = std::convert::Infallible;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _: &S,
    ) -> Result<Self, Self::Rejection> {
        let lang = parts
            .headers
            .get(HEADER_NAME)
            .and_then(|v| v.to_str().ok())
            .map(|v| v.to_string());

        Ok(Self(lang))
    }
}
