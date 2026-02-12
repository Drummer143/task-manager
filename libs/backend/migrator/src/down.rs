use std::fs;

use sqlx::Executor;

use crate::{
    MigrationDirection, MigratorError,
    types::{EnvConfig, Migration},
};

async fn apply_down_migration(
    pool: &sqlx::postgres::PgPool,
    migrations_db_name: &str,
    migration: &Migration,
    sql: &str,
) -> Result<(), MigratorError> {
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

    let result = sqlx::query(
        format!(
            "DELETE FROM {} WHERE version = $1 AND name = $2",
            migrations_db_name
        )
        .as_str(),
    )
    .bind(migration.version)
    .bind(&migration.name)
    .execute(&mut *tx)
    .await;

    if let Err(e) = result {
        tx.rollback()
            .await
            .map_err(|e| MigratorError::SqlxError(e.to_string()))?;
        return Err(MigratorError::SqlxError(e.to_string()));
    }

    if let Err(e) = tx.commit().await {
        return Err(MigratorError::SqlxError(e.to_string()));
    }

    Ok(())
}

pub async fn down(pool: &sqlx::postgres::PgPool, env: &EnvConfig) -> Result<(), MigratorError> {
    use crate::helpers::{
        compare_migrations, get_migrations_from_folder, get_migrations_from_db,
    };

    let all_migrations =
        get_migrations_from_folder(&MigrationDirection::Down, &env.migrations_dir)?;

    let applied_migrations = get_migrations_from_db(pool, &env.migrations_db_name).await?;

    compare_migrations(&applied_migrations, &all_migrations, false)?;

    for applied_migration in applied_migrations.iter().rev() {
        let migration = all_migrations
            .iter()
            .find(|m| m.version == applied_migration.version)
            .unwrap();

        let sql = fs::read_to_string(&migration.path)
            .map_err(|e| MigratorError::MigratorError(e.to_string()))?;

        if sql.is_empty() {
            return Err(MigratorError::MigratorError(format!(
                "Migration {}_{}\\{}.sql is empty",
                applied_migration.version,
                applied_migration.name,
                MigrationDirection::Down.to_string()
            )));
        }

        apply_down_migration(
            pool,
            &env.migrations_db_name,
            applied_migration,
            sql.as_str(),
        )
        .await?;
    }

    Ok(())
}
