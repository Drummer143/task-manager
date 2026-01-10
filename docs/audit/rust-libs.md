# Rust Libraries Audit

## Overview

This document covers the audit of shared Rust libraries in `libs/backend/`.

---

## 1. `error-handlers`

**Purpose:** Unified error handling for Axum API.

### Structure
- `codes.rs` — Typed error codes per HTTP status (400, 401, 403, 404, 409, 422, 500)
- `handlers.rs` — `ErrorResponse` struct with `IntoResponse` for Axum
- `ok_response.rs` — Wrapper for successful responses

### Strengths
- Typed error codes prevent typos
- `IntoResponse` integration with Axum
- `dev_details` for debugging
- `From<sqlx::Error>` — automatic DB error conversion

### Issues

#### 1. `dev_details` is always serialized in production

```rust
// TODO: #[cfg(debug_assertions)]
#[serde(skip_serializing_if = "Option::is_none")]
pub dev_details: Option<String>,
```

**Risk:** Internal error details leak to clients in production.

**Fix:** Control via environment variable:

```rust
#[serde(skip_serializing_if = "should_skip_dev_details")]
pub dev_details: Option<String>,

fn should_skip_dev_details(details: &Option<String>) -> bool {
    details.is_none() || std::env::var("SHOW_DEV_DETAILS").is_err()
}
```

Or use compile-time feature flag.

#### 2. Duplicated `Display` implementations

Each error code enum has a manual `Display` impl with repetitive match arms.

**Fix:** Use `strum` crate:

```rust
use strum_macros::Display;

#[derive(Debug, Serialize, Deserialize, Display)]
#[strum(serialize_all = "snake_case")]
pub enum BadRequestErrorCode {
    InvalidBody,
    InvalidParams,
    InvalidQueryParams,
}
```

#### 3. `InternalServerErrorCode` is unused

`internal_server_error()` hardcodes the string instead of using the enum.

---

## 2. `migrator`

**Purpose:** Custom PostgreSQL migrator with advisory locks.

### Structure
- `cli.rs` — CLI via clap (up/down/create)
- `migrator.rs` — Core logic
- `helpers.rs` — Utilities (file reading, migration comparison)
- `up.rs` / `down.rs` — Apply/rollback migrations
- `types.rs` — Data types

### Strengths
- **Advisory locks** — prevents race conditions during parallel runs
- **Checksum verification** — protects against modifying applied migrations
- **Transactions** — each migration in separate transaction with rollback

### Issues

#### 1. `panic!` instead of `Result` in `create_migration`

```rust
if let Err(e) = result {
    panic!("Failed to create migration directory: {}", e);
}
```

Function returns `Result` but panics inside.

**Fix:**

```rust
fs::create_dir_all(&path_buf)
    .map_err(|e| MigratorError::MigratorError(format!("Failed to create directory: {}", e)))?;
```

#### 2. Unhandled `.unwrap()` calls

```rust
let migrations_dir = migrations_dir.canonicalize().unwrap();
lock_result.left().unwrap().release_now()
```

**Fix:** Propagate errors with `?` operator.

#### 3. Missing `impl std::error::Error` for `MigratorError`

Doesn't integrate with `?` in other contexts.

**Fix:**

```rust
impl std::error::Error for MigratorError {}
```

#### 4. `ToString` instead of `Display` for `MigrationDirection`

```rust
impl ToString for MigrationDirection { ... }
```

**Fix:** Implement `Display` instead — `ToString` is auto-derived from it.

#### 5. Hardcoded Windows path separator in error messages

```rust
format!("Migration {}_{}\\{}.sql is empty", ...)
```

**Fix:** Use `std::path::MAIN_SEPARATOR` or just `/`.

#### 6. No dry-run mode

Cannot preview what will be applied.

**Fix:** Add `--dry-run` flag to CLI.

---

## 3. `sql`

**Purpose:** Repository pattern for PostgreSQL with SQLx.

### Structure
- `entities/` — User, Workspace, Page, Task, Asset, BoardStatuses
- `shared/traits/` — Generic repository traits
- `shared/types.rs` — SortOrder, ShiftAction

### Strengths
- **Trait-based repository pattern** — good abstraction
- **Generic executor** — works with pool and transaction
- **Query builder** — dynamic filters without SQL injection
- **`UpdateDto` trait** — checks `has_changes` before UPDATE

### Issues

#### 1. Missing space before LIMIT

```rust
if limit > 0 {
    builder.push(format!("LIMIT {}", limit)); // missing space before LIMIT
}
```

**Fix:**

```rust
builder.push(format!(" LIMIT {}", limit));
```

#### 2. `#![allow(async_fn_in_trait)]` is obsolete

This was a temporary workaround. In Rust 2024 edition it's no longer needed.

**Fix:** Remove the allow attribute.

#### 3. Mixed responsibilities in `WorkspaceRepository`

Contains both workspace and workspace_access methods. `update_workspace_access` does DELETE if `role.is_none()` — non-obvious behavior.

**Fix:** Consider splitting into `WorkspaceRepository` and `WorkspaceAccessRepository`, or at least rename the method to `update_or_remove_workspace_access`.

#### 4. Scheduled deletion uses `deleted_at` field

Currently `deleted_at` stores the future deletion date (today + 14 days), not the actual deletion timestamp. This is semantically confusing.

**Fix:** Rename to `scheduled_deletion_at` or add a separate field:

```sql
ALTER TABLE workspaces ADD COLUMN scheduled_deletion_at TIMESTAMPTZ;
```

This makes the intent clear and reserves `deleted_at` for actual soft-delete timestamp if needed later.

#### 5. Filter logic is duplicated across repositories

Each repository has its own `apply_filter` function with similar patterns.

**Possible approaches:**
- Extract common filter builder trait
- Use macro for repetitive patterns
- Accept current duplication as trade-off for flexibility (each entity has different filter fields)

Given that filters are entity-specific, some duplication is acceptable. Consider extracting only truly common patterns (like pagination).

---

## Summary

| Priority | Issue | Location | Action |
|----------|-------|----------|--------|
| 🔴 High | `dev_details` exposed in production | error-handlers | Control via env var or feature flag |
| 🟡 Medium | `panic!` in `create_migration` | migrator | Return proper `Result` |
| 🟡 Medium | Unhandled `.unwrap()` calls | migrator | Use `?` operator |
| 🟡 Medium | Missing space before LIMIT | sql | Add space |
| 🟡 Medium | `deleted_at` semantic confusion | sql | Rename to `scheduled_deletion_at` |
| 🟢 Low | Duplicated `Display` impls | error-handlers | Use `strum` |
| 🟢 Low | `ToString` instead of `Display` | migrator | Implement `Display` |
| 🟢 Low | Remove `allow(async_fn_in_trait)` | sql | Remove attribute |
| 🟢 Low | Mixed responsibilities | sql | Consider splitting or renaming |
