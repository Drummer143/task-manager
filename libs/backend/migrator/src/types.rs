use sqlx::types::chrono;

#[derive(Debug)]
pub enum MigratorError {
    ConnectionError(String),
    MigratorError(String),
    SqlxError(String),
    VersionMismatchError(String),
}

impl std::fmt::Display for MigratorError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MigratorError::ConnectionError(e) => write!(f, "Connection error: {}", e),
            MigratorError::MigratorError(e) => write!(f, "Migrator error: {}", e),
            MigratorError::SqlxError(e) => write!(f, "Sqlx error: {}", e),
            MigratorError::VersionMismatchError(e) => write!(f, "Version mismatch error: {}", e),
        }
    }
}

#[derive(Debug, sqlx::FromRow)]
pub struct Migration {
    pub version: i64,
    pub checksum: Vec<u8>,
    pub name: String,
    pub installed_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Clone)]
pub struct MigrationFile {
    pub version: i64,
    pub name: String,
    pub path: String,
}

pub enum MigrationDirection {
    Up,
    Down,
}

impl ToString for MigrationDirection {
    fn to_string(&self) -> String {
        match self {
            MigrationDirection::Up => "up".to_string(),
            MigrationDirection::Down => "down".to_string(),
        }
    }
}

pub struct EnvConfig {
    pub migrations_dir: String,
    pub migrations_db_name: String,
    pub data_base_url: String,
    pub lock_id: String,
}
