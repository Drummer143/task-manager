# Infrastructure Audit

## Overview

This document covers the audit of Docker configuration, CI/CD, and deployment infrastructure.

---

## Docker Compose

### Services

| Service               | Image                               | Purpose                     |
| --------------------- | ----------------------------------- | --------------------------- |
| postgres              | postgres:latest                     | Main database               |
| postgres-init         | postgres:16-alpine                  | Authentik DB init           |
| rmq                   | rabbitmq:management-alpine          | Message broker              |
| redis                 | redis:alpine                        | Cache (for Authentik)       |
| authentik_server      | ghcr.io/goauthentik/server:2025.2.4 | OIDC provider               |
| authentik_worker      | ghcr.io/goauthentik/server:2025.2.4 | Authentik background worker |
| main-service          | custom                              | Rust API                    |
| storage-service       | custom                              | Rust file storage           |
| notifications-service | custom                              | Elixir notifications        |
| chat-service          | custom                              | Elixir chat                 |
| task-manager          | custom                              | React frontend              |

### Strengths

- Health checks for all critical services
- Resource limits defined
- Proper dependency ordering with `condition: service_healthy`
- Named volumes for persistence
- Single network for service communication

### Issues

#### 1. 🔴 `postgres:latest` tag

```yaml
postgres:
    image: postgres:latest
```

**Risk:** Breaking changes on image updates.

**Fix:** Pin to specific version:

```yaml
image: postgres:16-alpine
```

---

#### 2. 🔴 Docker socket mounted to authentik_worker

```yaml
volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```

**Risk:** Container escape vulnerability. Worker can control host Docker.

**Fix:** Remove unless absolutely required for Authentik functionality.

---

#### 3. 🟡 Commented out `restart: always`

```yaml
# restart: always
```

All services have restart disabled. In production, services should restart on failure.

**Fix:** Enable for production:

```yaml
restart: unless-stopped
```

---

#### 4. 🟡 Ports exposed to host

```yaml
ports:
    - 5432:5432 # PostgreSQL
    - 5672:5672 # RabbitMQ
    - 15672:15672 # RabbitMQ Management
    - 6379:6379 # Redis
```

**Risk:** Database and message broker accessible from host network.

**Fix:** For production, remove port mappings or bind to localhost:

```yaml
ports:
    - "127.0.0.1:5432:5432"
```

---

#### 5. 🟡 No backup strategy

No volume backup configuration.

**Fix:** Add backup service or document backup procedure.

---

#### 6. 🟢 Authentik version pinned

```yaml
image: ghcr.io/goauthentik/server:2025.2.4
```

Good practice - version is pinned.

---

## Dockerfiles

### Rust Backend (`Dockerfile.backend-rust`)

#### Strengths

- Multi-stage build with cargo-chef for caching
- Slim runtime image (debian:bookworm-slim)
- Build profiles support

#### Issues

##### 1. 🟡 Future Rust version

```dockerfile
FROM rust:1.91.1-slim-bookworm AS chef
```

Rust 1.91.1 doesn't exist yet (current stable is ~1.83). This will fail.

**Fix:** Use current stable version:

```dockerfile
FROM rust:1.83-slim-bookworm AS chef
```

---

### Elixir Backend (`Dockerfile.backend-elixir`)

#### Strengths

- Multi-stage build
- Non-root user for runtime
- Proper locale configuration

#### Issues

##### 1. 🟢 No issues found

Clean Dockerfile following best practices.

---

### Frontend (`Dockerfile.frontend`)

#### Strengths

- Multi-stage build
- Pre-gzipped assets
- Nginx for serving

#### Issues

##### 1. 🟡 `pnpm@latest` in build

```dockerfile
RUN corepack enable && corepack prepare pnpm@latest --activate
```

**Risk:** Build may break with pnpm updates.

**Fix:** Pin pnpm version:

```dockerfile
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
```

---

## Nginx Configuration

### Strengths

- Gzip enabled with static pre-compression
- Proper cache headers for assets
- SPA fallback to index.html

### Issues

#### 1. 🟢 No security headers

Missing headers like:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

**Fix:** Add security headers:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## CI/CD (GitHub Actions)

### CodeQL Workflow

#### Strengths

- Analyzes JS/TS, Rust, and Actions
- Runs on push, PR, and schedule
- Proper permissions scoped

#### Issues

##### 1. 🟡 No Elixir analysis

CodeQL doesn't support Elixir natively. Consider adding:

- Credo for static analysis
- Dialyzer for type checking

**Fix:** Add Elixir workflow:

```yaml
- name: Run Credo
  run: mix credo --strict
```

---

##### 2. 🟡 No build/test workflow

Only security scanning, no CI for:

- Running tests
- Building artifacts
- Linting

**Fix:** Add CI workflow for tests and builds.

---

### Dependabot

#### Strengths

- Covers npm, cargo, mix, docker
- Monthly schedule (not too noisy)

#### Issues

##### 1. 🟢 Docker directory incorrect

```yaml
- package-ecosystem: "docker"
  directory: "/docker"
```

Dockerfiles are in root, not `/docker`.

**Fix:**

```yaml
directory: "/"
```

---

## Missing Infrastructure

### 1. No production deployment config

No Kubernetes, Docker Swarm, or cloud deployment manifests.

### 2. No secrets management

Secrets in `.env` file. Consider:

- Docker secrets
- HashiCorp Vault
- Cloud provider secrets manager

### 3. No monitoring/observability

No configuration for:

- Prometheus metrics
- Grafana dashboards
- Log aggregation (ELK, Loki)
- Distributed tracing (Jaeger, Zipkin)

### 4. No database migrations in CI

Migrations run at app startup, not in CI pipeline.

---

## Summary

| Priority  | Issue                         | Location                | Action                |
| --------- | ----------------------------- | ----------------------- | --------------------- |
| 🔴 High   | postgres:latest tag           | docker-compose.yml      | Pin version           |
| 🔴 High   | Docker socket mounted         | docker-compose.yml      | Remove if not needed  |
| 🔴 High   | Invalid Rust version (1.91.1) | Dockerfile.backend-rust | Use current stable    |
| 🟡 Medium | restart: always disabled      | docker-compose.yml      | Enable for production |
| 🟡 Medium | Ports exposed to host         | docker-compose.yml      | Bind to localhost     |
| 🟡 Medium | pnpm@latest                   | Dockerfile.frontend     | Pin version           |
| 🟡 Medium | No Elixir CI                  | codeql.yml              | Add Credo/Dialyzer    |
| 🟡 Medium | No build/test CI              | .github/workflows       | Add CI workflow       |
| 🟢 Low    | No security headers           | nginx.conf              | Add headers           |
| 🟢 Low    | Wrong docker directory        | dependabot.yml          | Fix path              |
| 🟢 Low    | No monitoring                 | -                       | Add observability     |
