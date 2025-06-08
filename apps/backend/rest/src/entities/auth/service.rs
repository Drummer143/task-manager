use crate::entities::user::model::User;
use crate::shared::error_handlers::codes;
use crate::shared::error_handlers::handlers::ErrorResponse;

pub async fn login(
    db: &sqlx::postgres::PgPool,
    email: &str,
    password: &str,
) -> Result<User, ErrorResponse> {
    let user = crate::entities::user::repository::find_by_email(db, email)
        .await
        .map_err(ErrorResponse::from)?;

    let is_valid =
        crate::entities::user_credentials::repository::verify_credentials(db, user.id, password)
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
    if crate::entities::user::repository::find_by_email(db, &dto.email)
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

    let user = crate::entities::user::repository::create(
        &mut *tx,
        crate::entities::user::dto::CreateUserDto {
            email: dto.email.clone(),
            username: dto.username.clone(),
            picture: None,
        },
    )
    .await;

    if user.is_err() {
        tx.rollback().await.map_err(|_| ErrorResponse::internal_server_error())?;
        return Err(ErrorResponse::internal_server_error());
    }

    let user = user.unwrap();

    let user_credentials = crate::entities::user_credentials::repository::create_credentials(
        &mut *tx,
        user.id,
        &dto.password,
    )
    .await;

    if user_credentials.is_err() {
        tx.rollback().await.map_err(|_| ErrorResponse::internal_server_error())?;
        return Err(ErrorResponse::internal_server_error());
    }

    tx.commit()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    crate::entities::workspace::repository::create(
        db,
        crate::entities::workspace::dto::WorkspaceDto {
            name: format!("{}'s workspace", user.username),
            owner_id: user.id,
        },
    )
    .await;

    Ok(user)
}
