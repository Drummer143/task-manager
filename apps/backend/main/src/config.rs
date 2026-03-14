pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub authentik_api_url: String,
    pub authentik_api_token: String,
    pub authentik_jwks_url: String,
    pub authentik_audience: String,
    pub jwt_secret: String,
    pub storage_service_url: String,
    pub cors_origins: Vec<axum::http::HeaderValue>,
    pub db_max_connections: u32,
    pub log_filter: String,
    pub draft_cleanup_cron: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let mut errors = Vec::new();

        let database_url = std::env::var("DATABASE_URL").ok();
        let authentik_api_url = std::env::var("AUTHENTIK_API_URL").ok();
        let authentik_api_token = std::env::var("AUTHENTIK_API_TOKEN").ok();
        let authentik_jwks_url = std::env::var("AUTHENTIK_JWKS_URL").ok();
        let authentik_audience = std::env::var("AUTHENTIK_AUDIENCE").ok();
        let jwt_secret = std::env::var("JWT_SECRET").ok();
        let storage_service_url = std::env::var("STORAGE_SERVICE_URL").ok();

        if database_url.is_none() {
            errors.push("DATABASE_URL");
        }
        if authentik_api_url.is_none() {
            errors.push("AUTHENTIK_API_URL");
        }
        if authentik_api_token.is_none() {
            errors.push("AUTHENTIK_API_TOKEN");
        }
        if authentik_jwks_url.is_none() {
            errors.push("AUTHENTIK_JWKS_URL");
        }
        if authentik_audience.is_none() {
            errors.push("AUTHENTIK_AUDIENCE");
        }
        if jwt_secret.is_none() {
            errors.push("JWT_SECRET");
        }
        if storage_service_url.is_none() {
            errors.push("STORAGE_SERVICE_URL");
        }

        if !errors.is_empty() {
            return Err(format!(
                "Missing required environment variables: {}",
                errors.join(", ")
            ));
        }

        let port = std::env::var("PORT")
            .unwrap_or_else(|_| "3000".to_string())
            .parse::<u16>()
            .map_err(|_| "PORT must be a valid u16".to_string())?;

        let cors_origins: Vec<axum::http::HeaderValue> = std::env::var("CORS_ORIGINS")
            .unwrap_or_else(|_| "http://localhost:1346,http://localhost:80".to_string())
            .split(',')
            .filter_map(|s| s.trim().parse().ok())
            .collect();

        let db_max_connections = std::env::var("DB_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "5".to_string())
            .parse::<u32>()
            .map_err(|_| "DB_MAX_CONNECTIONS must be a valid u32".to_string())?;

        let log_filter = std::env::var("LOG_FILTER")
            .unwrap_or_else(|_| "debug,lapin=warn,sqlx=warn".to_string());

        let draft_cleanup_cron = std::env::var("DRAFT_CLEANUP_CRON")
            .unwrap_or_else(|_| "0 0 2,14 * * * *".to_string());

        Ok(Config {
            database_url: database_url.unwrap(),
            port,
            authentik_api_url: authentik_api_url.unwrap(),
            authentik_api_token: authentik_api_token.unwrap(),
            authentik_jwks_url: authentik_jwks_url.unwrap(),
            authentik_audience: authentik_audience.unwrap(),
            jwt_secret: jwt_secret.unwrap(),
            storage_service_url: storage_service_url.unwrap(),
            cors_origins,
            db_max_connections,
            log_filter,
            draft_cleanup_cron,
        })
    }
}
