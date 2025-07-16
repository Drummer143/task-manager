use std::collections::HashMap;

use error_handlers::handlers::ErrorResponse;
use sqlx::PgPool;

use rust_api::entities::board_statuses::{
    dto::{CreateBoardStatusDto, UpdateBoardStatusDto},
    model::BoardStatus,
    repository,
};
use uuid::Uuid;

pub async fn create_board_status(
    db: &PgPool,
    dto: CreateBoardStatusDto,
) -> Result<BoardStatus, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let initial = dto.initial.unwrap_or(false);

    if initial {
        let initial_status = repository::get_initial_board_status_by_page_id(&mut *tx, dto.page_id)
            .await
            .map_err(ErrorResponse::from);

        match initial_status {
            Err(e) => {
                if e.status_code != 404 {
                    tx.rollback().await.map_err(ErrorResponse::from)?;
                    return Err(e);
                }
            }
            Ok(initial_status) => {
                let initial_status = repository::update_board_status(
                    &mut *tx,
                    initial_status.id,
                    UpdateBoardStatusDto {
                        initial: Some(false),
                        localizations: None,
                        position: None,
                    },
                )
                .await
                .map_err(ErrorResponse::from);

                if let Err(e) = initial_status {
                    tx.rollback().await.map_err(ErrorResponse::from)?;
                    return Err(e);
                }
            }
        }
    }

    let created_status = repository::create_board_status(&mut *tx, dto)
        .await
        .map_err(ErrorResponse::from);

    match created_status {
        Ok(status) => {
            tx.commit().await.map_err(ErrorResponse::from)?;
            Ok(status)
        }
        Err(e) => {
            tx.rollback().await.map_err(ErrorResponse::from)?;
            Err(e)
        }
    }
}

pub async fn update_board_status(
    db: &PgPool,
    status_id: Uuid,
    dto: UpdateBoardStatusDto,
) -> Result<BoardStatus, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let initial = dto.initial.unwrap_or(false);

    let updated_status = repository::update_board_status(&mut *tx, status_id, dto)
        .await
        .map_err(ErrorResponse::from);

    if let Err(e) = updated_status {
        tx.rollback().await.map_err(ErrorResponse::from)?;
        return Err(e);
    }

    let updated_status = updated_status.unwrap();

    if initial {
        let initial_status =
            repository::get_initial_board_status_by_page_id(&mut *tx, updated_status.page_id)
                .await
                .map_err(ErrorResponse::from);

        match initial_status {
            Err(e) => {
                if e.status_code != 404 {
                    tx.rollback().await.map_err(ErrorResponse::from)?;
                    return Err(e);
                }
            }
            Ok(initial_status) => {
                if initial_status.id != updated_status.id {
                    let initial_status = repository::update_board_status(
                        &mut *tx,
                        initial_status.id,
                        UpdateBoardStatusDto {
                            initial: Some(false),
                            localizations: None,
                            position: None,
                        },
                    )
                    .await
                    .map_err(ErrorResponse::from);

                    if let Err(e) = initial_status {
                        tx.rollback().await.map_err(ErrorResponse::from)?;
                        return Err(e);
                    }
                }
            }
        }
    }

    tx.commit().await.map_err(ErrorResponse::from)?;
    Ok(updated_status)
}

pub async fn get_board_status_by_id(
    db: &PgPool,
    status_id: Uuid,
) -> Result<BoardStatus, ErrorResponse> {
    repository::get_board_status_by_id(db, status_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_board_statuses_by_page_id(
    db: &PgPool,
    page_id: Uuid,
) -> Result<Vec<BoardStatus>, ErrorResponse> {
    repository::get_board_statuses_by_page_id(db, page_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn delete_board_status(
    db: &PgPool,
    status_id: Uuid,
) -> Result<BoardStatus, ErrorResponse> {
    let target_status = repository::get_board_status_by_id(db, status_id)
        .await
        .map_err(ErrorResponse::from)?;

    if target_status.initial {
        return Err(ErrorResponse {
            status_code: 409,
            error_code: None,
            details: Some(HashMap::from([(
                "message".to_string(),
                "Before deleting status, you must set another status as initial".to_string(),
            )])),
            dev_details: None,
            error: "Conflict".to_string(),
        });
    }

    repository::delete_board_status(db, status_id)
        .await
        .map_err(ErrorResponse::from)
}
