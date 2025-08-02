use std::collections::HashMap;

use error_handlers::{codes, handlers::ErrorResponse};

use rust_api::{
    entities::board_statuses::{
        dto::{CreateBoardStatusDto, UpdateBoardStatusDto},
        model::BoardStatus,
        BoardStatusRepository,
    },
    shared::traits::{PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById, PostgresqlRepositoryUpdate},
};
use uuid::Uuid;

use crate::{
    shared::traits::{
        ServiceBase, ServiceCreateMethod, ServiceDeleteMethod, ServiceGetOneByIdMethod,
        ServiceUpdateMethod,
    },
    types::app_state::AppState,
};

pub struct BoardStatusService;

impl ServiceBase for BoardStatusService {
    type Response = BoardStatus;
}

impl ServiceCreateMethod for BoardStatusService {
    type CreateDto = CreateBoardStatusDto;

    async fn create(
        app_state: &AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

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
}

impl ServiceUpdateMethod for BoardStatusService {
    type UpdateDto = UpdateBoardStatusDto;

    async fn update(
        app_state: &AppState,
        status_id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

        let initial = dto.initial.unwrap_or(false);

        let updated_status = BoardStatusRepository::update(&mut *tx, status_id, dto)
            .await
            .map_err(ErrorResponse::from);

        if let Err(e) = updated_status {
            tx.rollback().await.map_err(ErrorResponse::from)?;
            return Err(e);
        }

        let updated_status = updated_status.unwrap();

        if initial {
            let initial_status = BoardStatusRepository::get_initial_board_status_by_page_id(
                &mut *tx,
                updated_status.page_id,
            )
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
        }

        tx.commit().await.map_err(ErrorResponse::from)?;
        Ok(updated_status)
    }
}

impl ServiceGetOneByIdMethod for BoardStatusService {
    async fn get_one_by_id(
        app_state: &AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        BoardStatusRepository::get_one_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceDeleteMethod for BoardStatusService {
    async fn delete(app_state: &AppState, id: Uuid) -> Result<Self::Response, ErrorResponse> {
        let target_status = BoardStatusRepository::get_one_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)?;

        if target_status.initial {
            return Err(ErrorResponse::conflict(
                codes::ConflictErrorCode::InstanceInUse,
                Some(HashMap::from([(
                    "message".to_string(),
                    "Before deleting status, you must set another status as initial".to_string(),
                )])),
                None,
            ));
        }

        BoardStatusRepository::delete(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl BoardStatusService {
    pub async fn get_board_statuses_by_page_id(
        app_state: &AppState,
        page_id: Uuid,
    ) -> Result<Vec<BoardStatus>, ErrorResponse> {
        BoardStatusRepository::get_board_statuses_by_page_id(&app_state.postgres, page_id)
            .await
            .map_err(ErrorResponse::from)
    }
}
