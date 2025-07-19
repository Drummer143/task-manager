use error_handlers::codes;
use error_handlers::handlers::ErrorResponse;
use rust_api::entities::user::model::User;

pub async fn login(
    db: &sqlx::postgres::PgPool,
    email: &str,
    password: &str,
) -> Result<User, ErrorResponse> {
    let user = rust_api::entities::user::repository::find_by_email(db, email)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => ErrorResponse::unauthorized(
                codes::UnauthorizedErrorCode::InvalidCredentials,
                Some(e.to_string()),
            ),
            _ => ErrorResponse::internal_server_error(None),
        })?;

    let is_valid =
        rust_api::entities::user_credentials::repository::verify_credentials(db, user.id, password)
            .await;

    if !is_valid {
        return Err(ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::InvalidCredentials,
            None,
        ));
    }

    Ok(user)
}

pub async fn register(
    db: &sqlx::postgres::PgPool,
    dto: &super::dto::RegisterDto,
) -> Result<User, ErrorResponse> {
    let user = rust_api::entities::user::repository::find_by_email(db, &dto.email).await;

    if let Err(err) = user {
        if !matches!(err, sqlx::Error::RowNotFound) {
            return Err(ErrorResponse::internal_server_error(Some(err.to_string())));
        }
    } else if user.is_ok() {
        return Err(ErrorResponse::conflict(
            codes::ConflictErrorCode::EmailTaken,
            None,
            None,
        ));
    }

    let mut tx = db
        .begin()
        .await
        .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))?;

    let user = rust_api::entities::user::repository::create(
        &mut *tx,
        rust_api::entities::user::dto::CreateUserDto {
            email: dto.email.clone(),
            username: dto.username.clone(),
            picture: None,
        },
    )
    .await;

    if let Err(err) = user {
        tx.rollback()
            .await
            .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))?;
        return Err(ErrorResponse::internal_server_error(Some(err.to_string())));
    }

    let user = user.unwrap();

    let user_credentials = rust_api::entities::user_credentials::repository::create_credentials(
        &mut *tx,
        user.id,
        &dto.password,
    )
    .await;

    if let Err(err) = user_credentials {
        tx.rollback()
            .await
            .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))?;
        return Err(ErrorResponse::internal_server_error(Some(err.to_string())));
    }

    tx.commit()
        .await
        .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))?;

    crate::entities::workspace::service::create_workspace(
        db,
        rust_api::entities::workspace::dto::CreateWorkspaceDto {
            name: format!("{}'s workspace", user.username),
            owner_id: user.id,
        },
    )
    .await?;

    Ok(user)
}
