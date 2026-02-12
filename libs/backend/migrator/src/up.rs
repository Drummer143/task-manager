use sha2::Digest;
use sqlx::Executor;

use crate::{types::{EnvConfig, Migration, MigrationFile}, MigrationDirection, MigratorError};

async fn apply_up_migration(
    pool: &sqlx::postgres::PgPool,
    migrations_db_name: &str,
    migration: &MigrationFile,
    sql: &str,
) -> Result<Migration, MigratorError> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| MigratorError::SqlxError(e.to_string()))?;

    if let Err(e) = tx.execute(sql).await {
        tx.rollback()
            .await
            .map_err(|e| MigratorError::SqlxError(e.to_string()))?;
        return Err(MigratorError::SqlxError(e.to_string()));
    }

    let checksum = sha2::Sha256::digest(sql.as_bytes()).to_vec();

    let migration: Result<Migration, sqlx::Error> = sqlx::query_as::<_, Migration>(
        format!(
            "INSERT INTO {} (version, name, checksum) VALUES ($1, $2, $3) RETURNING *",
            migrations_db_name
        )
        .as_str(),
    )
    .bind(migration.version)
    .bind(&migration.name)
    .bind(checksum)
    .fetch_one(&mut *tx)
    .await;

    if let Err(e) = migration {
        tx.rollback()
            .await
            .map_err(|e| MigratorError::SqlxError(e.to_string()))?;
        return Err(MigratorError::SqlxError(e.to_string()));
    }

    if let Err(e) = tx.commit().await {
        return Err(MigratorError::SqlxError(e.to_string()));
    }

    Ok(migration.unwrap())
}

pub async fn up(pool: &sqlx::postgres::PgPool, env: &EnvConfig) -> Result<(), MigratorError> {
    use crate::helpers::{compare_migrations, get_migrations_from_db, get_migrations_from_folder, get_unapplied_migrations};

    let all_migrations = get_migrations_from_folder(&MigrationDirection::Up, &env.migrations_dir)?;

    let applied_migrations = get_migrations_from_db(pool, &env.migrations_db_name).await?;

    compare_migrations(&applied_migrations, &all_migrations, true)?;

    let mut unapplied_migrations = get_unapplied_migrations(&all_migrations, &applied_migrations);

    unapplied_migrations.sort_by_key(|m| m.version);

    for unapplied_migration in unapplied_migrations.iter() {
        let sql = std::fs::read_to_string(&unapplied_migration.path)
            .map_err(|e| MigratorError::MigratorError(e.to_string()))?;

        if sql.is_empty() {
            return Err(MigratorError::MigratorError(format!(
                "Migration {}_{}\\{}.sql is empty",
                unapplied_migration.version,
                unapplied_migration.name,
                MigrationDirection::Up
            )));
        }

        apply_up_migration(
            pool,
            &env.migrations_db_name,
            unapplied_migration,
            sql.as_str(),
        )
        .await?;
    }

    Ok(())
}
