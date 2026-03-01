use std::collections::HashMap;

use error_handlers::{codes, handlers::ErrorResponse};
use reqwest::{Client, StatusCode};

use crate::{authentik_api::types::Authentik400ErrorResponse, types::app_state::AppState};

use super::types::{AuthentikUser, UpdateUserRequest};

pub async fn update_user(
    app_state: &AppState,
    user_id: i32,
    update_data: UpdateUserRequest,
) -> Result<AuthentikUser, ErrorResponse> {
    let client = Client::new();
    let url = format!(
        "{}/api/v3/core/users/{}/",
        app_state.authentik_api_url, user_id
    );

    tracing::info!("Updating user in Authentik: {}", user_id);

    let response = client
        .patch(&url)
        .header(
            "Authorization",
            format!("Bearer {}", app_state.authentik_api_token),
        )
        .json(&update_data)
        .send()
        .await
        .map_err(|e| {
            ErrorResponse::internal_server_error(Some(format!(
                "Failed to connect to Authentik: {}",
                e
            )))
        })?;

    match response.status() {
        StatusCode::OK => {
            let user = response
                .json::<AuthentikUser>()
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            Ok(user)
        }
        StatusCode::BAD_REQUEST => {
            let error = response
                .json::<Authentik400ErrorResponse>()
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            let mut errors: HashMap<String, String> = HashMap::new();

            if let Some(non_field_errors) = error.non_field_errors
                && !non_field_errors.is_empty()
            {
                errors.insert(
                    "non_field_errors".to_string(),
                    non_field_errors[0].to_string(),
                );
            }

            for (key, value) in error.field_errors {
                errors.insert(key, value[0].to_string());
            }

            Err(ErrorResponse::bad_request(
                codes::BadRequestErrorCode::InvalidBody,
                Some(errors),
                None,
            ))
        }
        _ => Err(ErrorResponse::internal_server_error(Some(format!(
            "Unknown error: {}",
            response.text().await.unwrap()
        )))),
    }
}
