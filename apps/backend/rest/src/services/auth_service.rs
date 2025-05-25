use crate::dto::workspace;
use crate::models::user::User;
use crate::shared::error_handlers::codes;
use crate::shared::error_handlers::handlers::ErrorResponse;

pub async fn login(
    db: &sqlx::postgres::PgPool,
    email: &str,
    password: &str,
) -> Result<User, ErrorResponse> {
    let user = crate::repositories::user_repo::find_by_email(db, email).await;

    if let Err(error) = user {
        if matches!(error, sqlx::Error::RowNotFound) {
            return Err(ErrorResponse::bad_request(
                codes::BadRequestErrorCode::InvalidCredentials,
                None,
            ));
        }

        return Err(ErrorResponse::internal_server_error());
    }

    let user = user.unwrap();

    let is_valid =
        crate::repositories::user_credentials_repo::verify_credentials(db, user.id, password).await;

    if !is_valid {
        return Err(ErrorResponse::bad_request(
            codes::BadRequestErrorCode::InvalidCredentials,
            None,
        ));
    }

    Ok(user)
}

pub async fn register(
    db: &sqlx::postgres::PgPool,
    dto: &crate::dto::auth::RegisterDto,
) -> Result<User, ErrorResponse> {
    if crate::repositories::user_repo::find_by_email(db, &dto.email)
        .await
        .is_err()
    {
        return Err(ErrorResponse::bad_request(
            codes::BadRequestErrorCode::EmailTaken,
            None,
        ));
    }

    let mut tx = db
        .begin()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let user = crate::repositories::user_repo::create(
        &mut *tx,
        &crate::dto::user::CreateUserDto {
            email: dto.email.clone(),
            username: dto.username.clone(),
            picture: None,
        },
    )
    .await;

    if user.is_err() {
        tx.rollback().await;
        return Err(ErrorResponse::internal_server_error());
    }

    let user = user.unwrap();

    let user_credentials = crate::repositories::user_credentials_repo::create_credentials(
        &mut *tx,
        user.id,
        &dto.password,
    )
    .await;

    if user_credentials.is_err() {
        tx.rollback().await;
        return Err(ErrorResponse::internal_server_error());
    }

    tx.commit()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    crate::repositories::workspace_repo::create(
        db,
        workspace::CreateWorkspaceDto {
            name: format!("{}'s workspace", user.username),
            owner_id: user.id,
        },
    )
    .await;

    Ok(user)
}
