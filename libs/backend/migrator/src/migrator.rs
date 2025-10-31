use std::fs;

use sqlx::postgres::PgAdvisoryLock;

use crate::{MigrationDirection, helpers::prepare, types::MigratorError};

pub fn create_migration(migration_name: impl AsRef<str>) -> Result<(), MigratorError> {
    let start = std::time::SystemTime::now();

    let duration = start
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");

    let version = duration.as_millis();

    let env = crate::helpers::get_envs(false);

    let mut path_buf = std::path::PathBuf::from(env.migrations_dir);
    path_buf.push(format!("{}_{}", version, migration_name.as_ref()));

    let result =
        fs::create_dir_all(&path_buf).map_err(|e| MigratorError::MigratorError(e.to_string()));

    if let Err(e) = result {
        panic!("Failed to create migration directory: {}", e);
    }

    path_buf.push("up.sql");

    let result = fs::write(&path_buf, "").map_err(|e| MigratorError::MigratorError(e.to_string()));

    if let Err(e) = result {
        panic!("Failed to create migration file: {}", e);
    }

    path_buf.pop();
    path_buf.push("down.sql");

    let result = fs::write(&path_buf, "").map_err(|e| MigratorError::MigratorError(e.to_string()));

    if let Err(e) = result {
        panic!("Failed to create migration file: {}", e);
    }

    Ok(())
}

pub async fn migrate(direction: MigrationDirection) -> Result<(), MigratorError> {
    let (pool, env) = prepare().await?;

    let lock = PgAdvisoryLock::new(&env.lock_id);

    let mut conn = pool
        .acquire()
        .await
        .map_err(|e| MigratorError::SqlxError(e.to_string()))?;

    let lock_result = lock
        .try_acquire(&mut conn)
        .await
        .map_err(|e| MigratorError::SqlxError(e.to_string()))?;

    if lock_result.is_right() {
        crate::helpers::wait_until_lock(&pool, &env.lock_id).await?;

        return Ok(());
    }

    match direction {
        MigrationDirection::Up => crate::up::up(&pool, &env).await?,
        MigrationDirection::Down => crate::down::down(&pool, &env).await?,
    }

    lock_result
        .left()
        .unwrap()
        .release_now()
        .await
        .map_err(|e| MigratorError::SqlxError(e.to_string()))?;

    Ok(())
}
