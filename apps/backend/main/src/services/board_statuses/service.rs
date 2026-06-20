use error_handlers::handlers::ErrorResponse;

use crate::repos::board_statuses::{
    BoardStatusRepository, CreateBoardStatusDto, UpdateBoardStatusDto,
};
use sql::board_statuses::model::BoardStatus;
use uuid::Uuid;

pub struct BoardStatusService;

impl BoardStatusService {
    // QUERIES

    pub async fn get_board_statuses_by_page_id(
        pool: &sqlx::PgPool,
        page_id: Uuid,
    ) -> Result<Vec<BoardStatus>, ErrorResponse> {
        BoardStatusRepository::get_board_statuses_by_page_id(pool, page_id)
            .await
            .map_err(ErrorResponse::from)
    }

    // COMMANDS

    pub async fn create(
        pool: &sqlx::PgPool,
        dto: CreateBoardStatusDto,
    ) -> Result<BoardStatus, ErrorResponse> {
        let initial = dto.initial.unwrap_or(false);

        if initial {
            let initial_status =
                BoardStatusRepository::get_initial_board_status_by_page_id(pool, dto.page_id)
                    .await
                    .map_err(ErrorResponse::from)?;

            BoardStatusRepository::update(
                pool,
                initial_status.id,
                UpdateBoardStatusDto {
                    initial: Some(false),
                    localizations: None,
                    position: None,
                },
            )
            .await
            .map_err(ErrorResponse::from)?;
        }

        BoardStatusRepository::create(pool, dto)
            .await
            .map_err(ErrorResponse::from)
    }
}
