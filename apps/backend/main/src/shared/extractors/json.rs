use std::collections::HashMap;

use axum::{
    body::Bytes,
    extract::{FromRequest, Request},
    http::HeaderMap,
};
use error_handlers::{codes, handlers::ErrorResponse};
use reqwest::header;
use serde::de::DeserializeOwned;

pub struct ValidatedJson<T>(pub T);

fn json_content_type(headers: &HeaderMap) -> bool {
    let Some(content_type) = headers.get(header::CONTENT_TYPE) else {
        return false;
    };

    let Ok(content_type) = content_type.to_str() else {
        return false;
    };

    let Ok(mime) = content_type.parse::<mime::Mime>() else {
        return false;
    };

    let is_json_content_type = mime.type_() == "application"
        && (mime.subtype() == "json" || mime.suffix().is_some_and(|name| name == "json"));

    is_json_content_type
}

impl<T, S> FromRequest<S> for ValidatedJson<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = ErrorResponse;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        if !json_content_type(&req.headers()) {
            return Err(ErrorResponse {
                status_code: 415,
                error: "Unsupported media type".into(),
                error_code: "UnsupportedMediaType".into(),
                details: None,
                dev_details: None,
            });
        }

        let bytes = Bytes::from_request(req, state).await.map_err(|e| {
            ErrorResponse::bad_request(
                codes::BadRequestErrorCode::InvalidBody,
                None,
                Some(e.to_string()),
            )
        })?;

        let deserializer = &mut serde_json::Deserializer::from_slice(&bytes);

        let value: T = serde_path_to_error::deserialize(deserializer).map_err(|err| {
            let path = err.path().to_string();
            let key = if path.len() == 1 || path == "." {
                "_root".to_string()
            } else {
                path
            };

            let msg = err.inner().to_string();

            if err.inner().classify() == serde_json::error::Category::Data {
                return ErrorResponse::bad_request(
                    codes::BadRequestErrorCode::InvalidBody,
                    Some(HashMap::from([(key, msg)])),
                    None,
                );
            }

            let clean_msg = if let Some(idx) = msg.find(" at line") {
                msg[..idx].to_string()
            } else {
                msg
            };

            ErrorResponse::unprocessable_entity(
                codes::UnprocessableEntityErrorCode::ValidationErrors,
                Some(HashMap::from([(key, clean_msg)])),
                None,
            )
        })?;

        Ok(ValidatedJson(value))
    }
}
