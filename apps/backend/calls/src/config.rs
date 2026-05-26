pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub authentik_jwks_url: String,
    pub authentik_audience: String,
    pub livekit_url: String,
    pub livekit_api_key: String,
    pub livekit_api_secret: String,
    pub cors_origins: Vec<axum::http::HeaderValue>,
    pub db_max_connections: u32,
    pub log_filter: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let mut errors = Vec::new();

        let database_url = std::env::var("DATABASE_URL").ok();
        let authentik_jwks_url = std::env::var("AUTHENTIK_JWKS_URL").ok();
        let authentik_audience = std::env::var("AUTHENTIK_AUDIENCE").ok();
        let livekit_url = std::env::var("LIVEKIT_URL").ok();
        let livekit_api_key = std::env::var("LIVEKIT_API_KEY").ok();
        let livekit_api_secret = std::env::var("LIVEKIT_API_SECRET").ok();

        if database_url.is_none() {
            errors.push("DATABASE_URL");
        }
        if authentik_jwks_url.is_none() {
            errors.push("AUTHENTIK_JWKS_URL");
        }
        if authentik_audience.is_none() {
            errors.push("AUTHENTIK_AUDIENCE");
        }
        if livekit_url.is_none() {
            errors.push("LIVEKIT_URL");
        }
        if livekit_api_key.is_none() {
            errors.push("LIVEKIT_API_KEY");
        }
        if livekit_api_secret.is_none() {
            errors.push("LIVEKIT_API_SECRET");
        }

        if !errors.is_empty() {
            return Err(format!(
                "Missing required environment variables: {}",
                errors.join(", ")
            ));
        }

        let port = std::env::var("PORT")
            .unwrap_or_else(|_| "8084".to_string())
            .parse::<u16>()
            .map_err(|_| "PORT must be a valid u16".to_string())?;

        let cors_origins: Vec<axum::http::HeaderValue> = std::env::var("CORS_ORIGINS")
            .unwrap_or_else(|_| "https://localhost:1346,https://localhost:1347".to_string())
            .split(',')
            .filter_map(|s| s.trim().parse().ok())
            .collect();

        let db_max_connections = std::env::var("DB_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "5".to_string())
            .parse::<u32>()
            .map_err(|_| "DB_MAX_CONNECTIONS must be a valid u32".to_string())?;

        let log_filter =
            std::env::var("LOG_FILTER").unwrap_or_else(|_| "debug,sqlx=warn".to_string());

        Ok(Config {
            database_url: database_url.unwrap(),
            port,
            authentik_jwks_url: authentik_jwks_url.unwrap(),
            authentik_audience: authentik_audience.unwrap(),
            livekit_url: livekit_url.unwrap(),
            livekit_api_key: livekit_api_key.unwrap(),
            livekit_api_secret: livekit_api_secret.unwrap(),
            cors_origins,
            db_max_connections,
            log_filter,
        })
    }
}
