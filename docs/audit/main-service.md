# Main Service Audit

## Overview

The main service is the core REST API built with Axum. It handles workspaces, pages, tasks, users, and board statuses.

**Location:** `apps/backend/main/`

---

## Architecture

```
src/
├── app.rs              # Application builder, router setup
├── main.rs             # Entry point
├── db_connections.rs   # Database pool initialization
├── swagger.rs          # OpenAPI documentation
├── types/              # AppState, pagination
├── middleware/         # Auth, workspace/page access guards
├── shared/             # Extractors, traits, constants
├── entities/           # Domain modules (workspace, page, task, user, etc.)
└── webhooks/           # Authentik user sync webhook
```

### Entity Structure (per entity)
```
entities/{entity}/
├── controller/         # HTTP handlers (one file per endpoint)
├── dto.rs              # Request/Response DTOs
├── router.rs           # Route definitions
├── service.rs          # Business logic
└── mod.rs
```

---

## Strengths

### 1. Good separation of concerns
- Controller → Service → Repository pattern
- Trait-based service abstraction (`ServiceBase`, `ServiceCreateMethod`, etc.)

### 2. Custom extractors with good error messages
- `ValidatedJson` — parses JSON with path-aware error messages via `serde_path_to_error`
- `ValidatedQuery` — similar for query parameters

### 3. JWKS caching with refresh
- Caches JWKS in `RwLock`
- Auto-refreshes when key not found

### 4. Swagger/OpenAPI documentation
- All endpoints documented with `utoipa`
- Separate docs for API and webhooks

### 5. Transaction handling in complex operations
- `TaskService::update` and `change_status` use transactions with proper rollback

### 6. Memory allocator optimization
- Uses `mimalloc` for better performance

---

## Issues

### 1. Hardcoded CORS origins

```rust
.allow_origin(tower_http::cors::AllowOrigin::list([
    "http://0.0.0.0:1346".parse().unwrap(),
    "http://0.0.0.0:80".parse().unwrap(),
    "http://localhost:1346".parse().unwrap(),
    "http://localhost:80".parse().unwrap(),
]))
```

**Risk:** Won't work in production with different domains.

**Fix:** Load from environment variable:

```rust
let origins: Vec<HeaderValue> = std::env::var("CORS_ORIGINS")
    .unwrap_or_else(|_| "http://localhost:1346".to_string())
    .split(',')
    .filter_map(|s| s.trim().parse().ok())
    .collect();

.allow_origin(AllowOrigin::list(origins))
```

### 2. Webhook endpoint has no authentication

```rust
.merge(webhooks::authentik::router::init())  // No auth middleware
```

**Risk:** Anyone can call `/webhooks/authentik/user_sync` and create/delete users.

**Fix:** Add webhook secret verification:

```rust
// In webhook handler
let secret = req.headers().get("X-Webhook-Secret");
if secret != Some(&expected_secret) {
    return Err(ErrorResponse::unauthorized(...));
}
```

Or use Authentik's signature verification.

### 3. N+1 query problem in `get_list`

```rust
for row in rows {
    // ...
    owner: if include_owner {
        Some(sql::user::UserRepository::get_one_by_id(...).await?)  // Query per row
    }
    // ...
}
```

**Fix:** Batch fetch owners:

```rust
let owner_ids: Vec<Uuid> = rows.iter().map(|r| r.owner_id).collect();
let owners = UserRepository::get_by_ids(&pool, &owner_ids).await?;
let owners_map: HashMap<Uuid, User> = owners.into_iter().map(|u| (u.id, u)).collect();
```

### 4. `workspace_access_guard` path parsing is fragile

```rust
let workspace_id = path.split('/').nth(2).unwrap_or_default();
```

**Risk:** Breaks if route structure changes.

**Fix:** Use Axum's `MatchedPath` or extract from `Path` extractor in the handler itself.

### 5. Tracing is commented out

```rust
// use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};
// tracing_subscriber::registry()...
// .layer(tower_http::trace::TraceLayer::new_for_http())
```

**Fix:** Enable tracing for production debugging. Control via env var:

```rust
if std::env::var("ENABLE_TRACING").is_ok() {
    tracing_subscriber::registry()
        .with(EnvFilter::from_default_env())
        .with(tracing_subscriber::fmt::layer())
        .init();
}
```

### 6. RabbitMQ code is commented out but dependencies remain

```rust
// pub rabbitmq: std::sync::Arc<lapin::Channel>,
```

In `Cargo.toml`:
```toml
# lapin = { version = "2.5", default-features = false, features = ["rustls"] }
```

**Fix:** Either remove completely or implement. Dead code adds confusion.

### 7. Duplicate `http::Method::OPTIONS` in CORS

```rust
.allow_methods([
    http::Method::GET,
    http::Method::POST,
    http::Method::OPTIONS,  // First
    http::Method::PUT,
    http::Method::DELETE,
    http::Method::PATCH,
    http::Method::OPTIONS,  // Duplicate
])
```

**Fix:** Remove duplicate.

### 8. `unwrap()` on decoding key creation

```rust
let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
    .map_err(|_| make_error_response("Key error"))
    .unwrap();  // Panics on error
```

**Fix:** Return the error response instead:

```rust
let decoding_key = match DecodingKey::from_rsa_components(&jwk.n, &jwk.e) {
    Ok(key) => key,
    Err(_) => return make_error_response("Key error"),
};
```

### 9. `println!` instead of `tracing` for JWT errors

```rust
println!("JWT Validation Error: {:?}", e.kind());
```

**Fix:** Use `tracing::warn!` or `tracing::error!`.

### 10. Inconsistent response status in `page_access_guard_task_route`

```rust
let body = serde_json::to_string(&ErrorResponse::not_found(...)).unwrap();

return axum::response::Response::builder()
    .status(axum::http::StatusCode::BAD_REQUEST)  // Should be NOT_FOUND
    .body(...)
```

**Fix:** Use `StatusCode::NOT_FOUND`.

### 11. Missing `Content-Type` header in error responses

```rust
return axum::response::Response::builder()
    .status(axum::http::StatusCode::FORBIDDEN)
    .body(axum::body::Body::from(body))  // No Content-Type
    .unwrap();
```

**Fix:** Add `.header(header::CONTENT_TYPE, "application/json")`.

### 12. Pool size is hardcoded

```rust
let db = PgPoolOptions::new()
    .max_connections(5)  // Hardcoded
    .connect(postgres_url)
```

**Fix:** Load from environment:

```rust
let max_connections = std::env::var("DB_MAX_CONNECTIONS")
    .ok()
    .and_then(|s| s.parse().ok())
    .unwrap_or(5);
```

---

## Summary

| Priority | Issue | Action |
|----------|-------|--------|
| 🔴 High | Webhook has no authentication | Add secret verification |
| 🔴 High | Hardcoded CORS origins | Load from env var |
| 🟡 Medium | N+1 queries in get_list | Batch fetch related entities |
| 🟡 Medium | `unwrap()` on decoding key | Return error response |
| 🟡 Medium | Tracing disabled | Enable with env var control |
| 🟡 Medium | Wrong status code in guard | Fix to NOT_FOUND |
| 🟡 Medium | Missing Content-Type in guards | Add header |
| 🟢 Low | Duplicate OPTIONS method | Remove duplicate |
| 🟢 Low | `println!` instead of tracing | Use tracing macros |
| 🟢 Low | Hardcoded pool size | Load from env |
| 🟢 Low | Dead RabbitMQ code | Remove or implement |
| 🟢 Low | Fragile path parsing in guards | Use Axum extractors |
