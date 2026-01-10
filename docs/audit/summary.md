# Project Audit Summary

## Overview

This document summarizes the comprehensive audit of the Task Manager project.

**Audit Date:** January 2026

**Components Audited:**

- Rust libraries (error-handlers, sql, migrator)
- Rust backend (main service)
- Elixir services (auth_verifier, chat)
- Frontend libraries (10 packages)
- Frontend application (task-manager)
- Infrastructure (Docker, CI/CD)

**Skipped:**

- `storage` service (planned refactoring to chunked uploads)
- `notifications` service (under development in separate branch)

---

## Critical Issues (🔴 High Priority)

### Security

| Issue                        | Location           | Risk                           |
| ---------------------------- | ------------------ | ------------------------------ |
| No webhook authentication    | main-service       | Anyone can trigger user sync   |
| Any user can join any chat   | chat service       | Data leak, unauthorized access |
| `user_id` from client params | chat service       | User impersonation             |
| Docker socket mounted        | docker-compose.yml | Container escape               |
| `debugger` in production     | frontend app       | Debug breakpoint in prod       |

### Configuration

| Issue                         | Location           | Risk                     |
| ----------------------------- | ------------------ | ------------------------ |
| Hardcoded CORS origins        | main-service       | Won't work in production |
| Hardcoded API base URL        | frontend libs      | Won't work in production |
| Hardcoded chat socket URL     | frontend app       | Won't work in production |
| `postgres:latest` tag         | docker-compose.yml | Breaking changes         |
| Invalid Rust version (1.91.1) | Dockerfile         | Build failure            |
| Client ID in .env             | frontend app       | Environment confusion    |

---

## Medium Priority Issues (🟡)

### Code Quality

| Issue                                | Location      |
| ------------------------------------ | ------------- |
| N+1 query in workspace list          | main-service  |
| Fragile path parsing for IDs         | main-service  |
| Chat component too large (525 lines) | frontend libs |
| Global store without cleanup         | frontend libs |
| StrictMode disabled                  | frontend app  |
| Unsafe type assertions               | frontend app  |
| Dead auth endpoints (login/signUp)   | frontend libs |

### Infrastructure

| Issue                         | Location            |
| ----------------------------- | ------------------- |
| `restart: always` disabled    | docker-compose.yml  |
| Ports exposed to host         | docker-compose.yml  |
| No Elixir CI (Credo/Dialyzer) | GitHub Actions      |
| No build/test workflow        | GitHub Actions      |
| `pnpm@latest` in Dockerfile   | Dockerfile.frontend |

### Error Handling

| Issue                            | Location             |
| -------------------------------- | -------------------- |
| Errors exposed to clients        | chat service         |
| No error handling in file upload | tiptap-file-upload   |
| Potential crash on null src      | tiptap-file-renderer |
| Error swallowed in query         | frontend app         |

---

## Low Priority Issues (🟢)

- Typo in filename (`computePostion.ts`)
- Commented out code (mobile layout, notification socket)
- Hardcoded values (password length, portal selector)
- Missing security headers in nginx
- Stale `today` constant
- Unused parameters

---

## Strengths

### Architecture

- Clean microservices separation
- Monorepo with proper tooling (Nx, Cargo workspace, Elixir umbrella)
- FSD-like structure in frontend
- Proper OIDC integration with Authentik

### Code Quality

- Type-safe APIs with generics
- Repository pattern in Rust
- Proper error handling with typed error codes
- Good test coverage setup (Vitest, Playwright)

### Infrastructure

- Multi-stage Docker builds
- Health checks for services
- Resource limits defined
- Dependabot configured

---

## Recommended Action Plan

### Phase 1: Security (Immediate)

1. **Add webhook authentication** in main-service
2. **Add chat access control** - verify user has access to chat before joining
3. **Use socket.assigns.user_id** instead of client params in chat
4. **Remove Docker socket mount** if not required
5. **Remove `debugger` statement** from production code

### Phase 2: Configuration (Before Production)

1. **Move hardcoded URLs to environment variables:**
    - CORS origins
    - API base URL
    - Chat socket URL
2. **Pin Docker image versions:**
    - PostgreSQL
    - pnpm
    - Rust (fix 1.91.1 → current stable)
3. **Create `.env.example`** and add `.env` to `.gitignore`

### Phase 3: Code Quality (Ongoing)

1. **Fix N+1 query** in workspace list (use JOIN or batch loading)
2. **Refactor Chat.tsx** into smaller components
3. **Add proper error handling** in file upload and chat
4. **Remove dead code** (commented out mobile layout, auth endpoints)
5. **Enable StrictMode** in React

### Phase 4: Infrastructure (Before Production)

1. **Add CI workflow** for tests and builds
2. **Add Elixir static analysis** (Credo, Dialyzer)
3. **Enable restart policies** for services
4. **Add security headers** to nginx
5. **Set up monitoring** (Prometheus, Grafana)

---

## Audit Documents

| Document                                   | Description                |
| ------------------------------------------ | -------------------------- |
| [rust-libs.md](./rust-libs.md)             | Rust libraries audit       |
| [main-service.md](./main-service.md)       | Main backend service audit |
| [elixir-services.md](./elixir-services.md) | Elixir services audit      |
| [frontend-libs.md](./frontend-libs.md)     | Frontend libraries audit   |
| [frontend-app.md](./frontend-app.md)       | Frontend application audit |
| [infrastructure.md](./infrastructure.md)   | Docker & CI/CD audit       |

---

## Statistics

| Category       | Critical | Medium | Low     |
| -------------- | -------- | ------ | ------- |
| Security       | 5        | 0      | 0       |
| Configuration  | 6        | 0      | 0       |
| Code Quality   | 0        | 7      | 10+     |
| Infrastructure | 0        | 5      | 3       |
| **Total**      | **11**   | **12** | **13+** |
