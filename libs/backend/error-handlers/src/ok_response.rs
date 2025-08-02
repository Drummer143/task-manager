use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;

pub struct OkResponse<T> {
    pub response: T,
    pub status_code: StatusCode,
}

impl<T: Serialize> IntoResponse for OkResponse<T> {
    fn into_response(self) -> axum::response::Response {
        (self.status_code, Json(self.response)).into_response()
    }
}

impl<T> OkResponse<T> {
    pub fn ok(response: T) -> Self {
        Self {
            response,
            status_code: StatusCode::OK,
        }
    }

    pub fn created(response: T) -> Self {
        Self {
            response,
            status_code: StatusCode::CREATED,
        }
    }
}

impl OkResponse<()> {
    pub fn no_content() -> Self {
        Self {
            response: (),
            status_code: StatusCode::NO_CONTENT,
        }
    }

    pub fn not_modified() -> Self {
        Self {
            response: (),
            status_code: StatusCode::NOT_MODIFIED,
        }
    }
}
