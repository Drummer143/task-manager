# Task Manager

A full-stack task management application built with a microservices architecture.

## Architecture Overview

This project follows a **microservices architecture** with a monorepo approach:

- **Nx** for JavaScript/TypeScript projects
- **Cargo workspace** for Rust services
- **Elixir umbrella** for Phoenix applications

## Tech Stack

| Layer                | Technologies                                                    |
| -------------------- | --------------------------------------------------------------- |
| **Frontend**         | React 19, Vite 7, Ant Design 6, TanStack Query, Zustand, TipTap |
| **Backend (Rust)**   | Axum, SQLx, Tokio, utoipa (OpenAPI/Swagger)                     |
| **Backend (Elixir)** | Phoenix 1.8, Ecto, Bandit                                       |
| **Authentication**   | Authentik (OIDC)                                                |
| **Database**         | PostgreSQL                                                      |
| **Message Broker**   | RabbitMQ                                                        |
| **Cache**            | Redis                                                           |
| **Infrastructure**   | Docker Compose, Nx, CodeQL                                      |

## Project Structure

```
apps/
├── backend/
│   ├── main/              # Rust - Core API (workspaces, pages, tasks, users)
│   └── storage/           # Rust - File storage service
├── elixir/
│   ├── auth_verifier/     # Shared library for JWT verification
│   ├── chat/              # Phoenix - Real-time chat (WebSocket)
│   └── notifications/     # Phoenix - Notifications via RabbitMQ
└── frontend/
    └── task-manager/      # React SPA

libs/
├── backend/
│   ├── error-handlers/    # Shared error handling utilities
│   ├── migrator/          # Database migrations runner
│   └── sql/               # SQL utilities and helpers
└── frontend/
    ├── api/               # API client
    ├── chat/              # Chat components
    ├── context-menu/      # Context menu library
    ├── react-utils/       # React utilities and hooks
    ├── tiptap-*/          # TipTap editor plugins
    └── ...

migrations/                # SQL migration files
authentik/                 # Authentik configuration and blueprints
```

## Domain Model

- **Users** - User accounts with credentials and metadata
- **Workspaces** - Collaborative spaces with role-based access control
- **Pages** - Content pages (boards, text documents, etc.) with hierarchical structure
- **Tasks** - Task items with status, assignee, reporter, and due dates
- **Board Statuses** - Custom status definitions for kanban boards
- **Assets** - File attachments and media

## Services

| Service                 | Port       | Description                              |
| ----------------------- | ---------- | ---------------------------------------- |
| `main-service`          | 8080       | Core REST API (Rust/Axum)                |
| `storage-service`       | 8082       | File storage API (Rust/Axum)             |
| `notifications-service` | 8079       | Real-time notifications (Elixir/Phoenix) |
| `chat-service`          | 8078       | Real-time chat (Elixir/Phoenix)          |
| `task-manager`          | 1346       | Frontend SPA (React/Vite)                |
| `authentik_server`      | 9000       | Authentication server                    |
| `postgres`              | 5432       | PostgreSQL database                      |
| `rmq`                   | 5672/15672 | RabbitMQ message broker                  |
| `redis`                 | 6379       | Redis cache                              |

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- Rust (stable)
- Elixir 1.14+
- Docker & Docker Compose

### Development

1. Start infrastructure services:

    ```bash
    pnpm start_base
    ```

2. Run all development servers:

    ```bash
    pnpm dev
    ```

    Or run specific services:

    ```bash
    pnpm dev:frontend    # Frontend only
    pnpm dev:backend     # Rust services only
    pnpm dev:all         # All services including Elixir
    ```

### Available Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Start frontend + Rust backend  |
| `pnpm dev:all`   | Start all services             |
| `pnpm build`     | Build all projects             |
| `pnpm lint`      | Run linters                    |
| `pnpm test`      | Run tests                      |
| `pnpm typecheck` | TypeScript type checking       |
| `pnpm swagger`   | Generate Swagger documentation |

## Docker

Build and run all services:

```bash
docker compose up --build
```
