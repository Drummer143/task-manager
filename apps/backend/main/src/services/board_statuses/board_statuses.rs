use error_handlers::handlers::ErrorResponse;
use sqlx::PgConnection;

use crate::repos::board_statuses::{
    BoardStatusRepository, CreateBoardStatusDto, UpdateBoardStatusDto,
};
use sql::board_statuses::model::BoardStatus;
use uuid::Uuid;

pub struct BoardStatusService;

impl BoardStatusService {
    // QUERIES

    pub async fn get_board_statuses_by_page_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        page_id: Uuid,
    ) -> Result<Vec<BoardStatus>, ErrorResponse> {
        BoardStatusRepository::get_board_statuses_by_page_id(executor, page_id)
            .await
            .map_err(ErrorResponse::from)
    }

    // COMMANDS

    pub async fn create<'a>(
        executor: &mut PgConnection,
        dto: CreateBoardStatusDto,
    ) -> Result<BoardStatus, ErrorResponse> {
        let initial = dto.initial.unwrap_or(false);

        if initial {
            let initial_status =
                BoardStatusRepository::get_initial_board_status_by_page_id(&mut *executor, dto.page_id)
                    .await
                    .map_err(ErrorResponse::from)?;

            BoardStatusRepository::update(
                &mut *executor,
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

        BoardStatusRepository::create(&mut *executor, dto)
            .await
            .map_err(ErrorResponse::from)
    }
}
