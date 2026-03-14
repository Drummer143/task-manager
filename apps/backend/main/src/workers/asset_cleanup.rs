use std::sync::Arc;
use tokio_cron_scheduler::{Job, JobScheduler};
use tracing::{error, info};

use crate::types::app_state::AppState;

pub async fn init_asset_cleanup_worker(state: Arc<AppState>, cron_expression: &str) -> Result<(), Box<dyn std::error::Error>> {
    let sched = JobScheduler::new().await?;

    let job = Job::new_async(cron_expression, move |_uuid, mut _l| {
        let state_clone = state.clone();
        Box::pin(async move {
            info!("Running UserDraft assets cleanup worker...");
            if let Err(e) = run_cleanup(&state_clone).await {
                error!("Error in UserDraft cleanup worker: {}", e);
            }
            info!("UserDraft cleanup worker finished.");
        })
    })?;

    sched.add(job).await?;
    sched.start().await?;

    Ok(())
}

async fn run_cleanup(state: &AppState) -> Result<(), Box<dyn std::error::Error>> {
    let mut conn = state.postgres.acquire().await?;

    // Delete UserDraft assets older than 24 hours
    let result = sqlx::query(
        "DELETE FROM assets WHERE entity_type = 'user_draft' AND created_at < NOW() - INTERVAL '24 hours'"
    )
    .execute(&mut *conn)
    .await?;

    if result.rows_affected() > 0 {
        info!("Deleted {} stale UserDraft assets.", result.rows_affected());
    }

    Ok(())
}
