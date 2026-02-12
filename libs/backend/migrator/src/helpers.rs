use std::{fs, path::PathBuf};

use sha2::Digest;

use crate::{
    MigratorError,
    types::{EnvConfig, Migration, MigrationDirection, MigrationFile},
};

pub fn get_migrations_from_folder(
    direction: &MigrationDirection,
    migrations_dir: &str,
) -> Result<Vec<MigrationFile>, MigratorError> {
    let migrations_dir = PathBuf::from(migrations_dir);
    let migrations_dir = migrations_dir.canonicalize().unwrap();
    let migrations = fs::read_dir(migrations_dir)
        .map_err(|e| MigratorError::MigratorError(e.to_string()))?
        .filter_map(|entry| {
            if entry.is_err() {
                return None;
            }

            let entry = entry.unwrap();

            let mut migration_file_path = entry.path();
            migration_file_path.push(format!("{}.sql", direction.to_string()));

            let exists = fs::exists(&migration_file_path);

            if matches!(exists, Err(_) | Ok(false)) {
                return None;
            }

            let dir_filename = entry.file_name();
            let dir_filename = dir_filename.to_str()?;

            let version = dir_filename.split('_').next().unwrap().parse::<i64>();

            if version.is_err() {
                return None;
            }

            let name = dir_filename
                .split('_')
                .skip(1)
                .collect::<Vec<_>>()
                .join("_");
            let path = migration_file_path.to_str().unwrap().to_string();

            Some(MigrationFile {
                version: version.unwrap(),
                name,
                path,
            })
        })
        .collect::<Vec<_>>();

    Ok(migrations)
}

pub fn compare_migrations(
    applied_migrations: &[Migration],
    all_migrations: &[MigrationFile],
    compare_checksum: bool,
) -> Result<(), MigratorError> {
    for applied_migration in applied_migrations.iter() {
        let migration_file = all_migrations
            .iter()
            .find(|m| m.version == applied_migration.version);

        if migration_file.is_none() {
            return Err(MigratorError::VersionMismatchError(format!(
                "Migration {} not found in folder",
                applied_migration.version
            )));
        }

        if compare_checksum {
            let sql = fs::read_to_string(&migration_file.unwrap().path)
                .map_err(|e| MigratorError::MigratorError(e.to_string()))?;

            let checksum = sha2::Sha256::digest(sql.as_bytes()).to_vec();

            if checksum != applied_migration.checksum {
                return Err(MigratorError::VersionMismatchError(format!(
                    "Migration {} checksum mismatch",
                    applied_migration.version
                )));
            }
        }
    }

    Ok(())
}

pub fn get_unapplied_migrations(
    all_migrations: &[MigrationFile],
    applied_migrations: &[Migration],
) -> Vec<MigrationFile> {
    all_migrations
        .iter()
        .filter(|m| applied_migrations.iter().any(|am| am.version == m.version))
        .cloned()
        .collect::<Vec<MigrationFile>>()
}

pub fn get_envs() -> EnvConfig {
    let data_base_url = std::env::var("DATABASE_URL").expect("DATABASE_URL not found");
    let migrations_dir = std::env::var("MIGRATIONS_DIR").unwrap_or("migrations".to_string());
    let migrations_db_name =
        std::env::var("MIGRATIONS_DB_NAME").unwrap_or("_migrations".to_string());
    let lock_id = std::env::var("MIGRATOR_LOCK_ID")
        .ok()
        .filter(|val| val.parse::<u32>().is_ok())
        .unwrap_or_else(|| "29876".to_string());

    EnvConfig {
        migrations_dir,
        migrations_db_name,
        data_base_url,
        lock_id,
    }
}

pub async fn get_migrations_from_db(
    pool: &sqlx::postgres::PgPool,
    migrations_db_name: &str,
) -> Result<Vec<Migration>, MigratorError> {
    let migrations = sqlx::query_as::<_, Migration>(
        format!(
            "SELECT version, name, installed_at, checksum FROM {} ORDER BY version ASC",
            migrations_db_name
        )
        .as_str(),
    )
    .fetch_all(pool)
    .await
    .map_err(|e| MigratorError::SqlxError(e.to_string()))?;

    Ok(migrations)
}

pub async fn prepare() -> Result<(sqlx::postgres::PgPool, EnvConfig), MigratorError> {
    let env = get_envs();

    let pool = sqlx::postgres::PgPool::connect(&env.data_base_url)
        .await
        .map_err(|e| MigratorError::ConnectionError(e.to_string()))?;

    let sql = format!(
        "
        CREATE TABLE IF NOT EXISTS {} (
            version bigint NOT NULL,
            checksum bytea NOT NULL,
            name text DEFAULT NULL,
            installed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_version_{} ON {} (version);
        ",
        &env.migrations_db_name, &env.migrations_db_name, &env.migrations_db_name,
    );

    use sqlx::Executor;

    pool.execute(sql.as_str())
        .await
        .map_err(|e| MigratorError::SqlxError(e.to_string()))?;

    let exists =
        fs::exists(&env.migrations_dir).map_err(|e| MigratorError::MigratorError(e.to_string()))?;

    if !exists {
        fs::create_dir(&env.migrations_dir)
            .map_err(|e| MigratorError::MigratorError(e.to_string()))?;
    }

    Ok((pool, env))
}

pub async fn wait_until_lock(
    pool: &sqlx::postgres::PgPool,
    lock_id: &str,
) -> Result<(), MigratorError> {
    let conn = pool.acquire().await;

    if conn.is_err() {
        return Err(MigratorError::SqlxError(conn.unwrap_err().to_string()));
    }

    let mut conn = conn.unwrap();

    let lock = sqlx::postgres::PgAdvisoryLock::new(lock_id);

    let lock_result = lock.acquire(&mut conn).await;

    match lock_result.unwrap().release_now().await {
        Ok(_) => Ok(()),
        Err(e) => Err(MigratorError::SqlxError(e.to_string())),
    }
}
