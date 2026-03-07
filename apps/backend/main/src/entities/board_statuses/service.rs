use error_handlers::handlers::ErrorResponse;

use crate::repos::board_statuses::{
    BoardStatusRepository, CreateBoardStatusDto, UpdateBoardStatusDto,
};
use sql::board_statuses::model::BoardStatus;
use uuid::Uuid;

pub struct BoardStatusService;

impl BoardStatusService {
    pub async fn create(
        pool: &sqlx::PgPool,
        dto: CreateBoardStatusDto,
    ) -> Result<BoardStatus, ErrorResponse> {
        let mut tx = pool.begin().await.map_err(ErrorResponse::from)?;

        let initial = dto.initial.unwrap_or(false);

        if initial {
            let initial_status =
                BoardStatusRepository::get_initial_board_status_by_page_id(&mut *tx, dto.page_id)
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
                    let initial_status = BoardStatusRepository::update(
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

        let created_status = BoardStatusRepository::create(&mut *tx, dto)
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

    pub async fn get_board_statuses_by_page_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        page_id: Uuid,
    ) -> Result<Vec<BoardStatus>, ErrorResponse> {
        BoardStatusRepository::get_board_statuses_by_page_id(executor, page_id)
            .await
            .map_err(ErrorResponse::from)
    }
}
