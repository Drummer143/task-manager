use repo::entities::user::model::User;
use error_handlers::codes;
use error_handlers::handlers::ErrorResponse;

pub async fn login(
    db: &sqlx::postgres::PgPool,
    email: &str,
    password: &str,
) -> Result<User, ErrorResponse> {
    let user = repo::entities::user::repository::find_by_email(db, email)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => {
                ErrorResponse::bad_request(codes::BadRequestErrorCode::InvalidCredentials, None)
            }
            _ => ErrorResponse::internal_server_error(None),
        })?;

    let is_valid =
        repo::entities::user_credentials::repository::verify_credentials(db, user.id, password)
            .await;

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
    dto: &super::dto::RegisterDto,
) -> Result<User, ErrorResponse> {
    let user = repo::entities::user::repository::find_by_email(db, &dto.email).await;

    if let Err(err) = user {
        if !matches!(err, sqlx::Error::RowNotFound) {
            return Err(ErrorResponse::internal_server_error(None));
        }
    } else if user.is_ok() {
        return Err(ErrorResponse::bad_request(
            codes::BadRequestErrorCode::EmailTaken,
            None,
        ));
    }

    let mut tx = db
        .begin()
        .await
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

    let user = repo::entities::user::repository::create(
        &mut *tx,
        repo::entities::user::dto::CreateUserDto {
            email: dto.email.clone(),
            username: dto.username.clone(),
            picture: None,
        },
    )
    .await;

    if user.is_err() {
        tx.rollback()
            .await
            .map_err(|_| ErrorResponse::internal_server_error(None))?;
        return Err(ErrorResponse::internal_server_error(None));
    }

    let user = user.unwrap();

    let user_credentials = repo::entities::user_credentials::repository::create_credentials(
        &mut *tx,
        user.id,
        &dto.password,
    )
    .await;

    if user_credentials.is_err() {
        tx.rollback()
            .await
            .map_err(|_| ErrorResponse::internal_server_error(None))?;
        return Err(ErrorResponse::internal_server_error(None));
    }

    tx.commit()
        .await
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

    crate::entities::workspace::service::create_workspace(
        db,
        repo::entities::workspace::dto::CreateWorkspaceDto {
            name: format!("{}'s workspace", user.username),
            owner_id: user.id,
        },
    )
    .await
    .map_err(ErrorResponse::from)?;

    Ok(user)
}
