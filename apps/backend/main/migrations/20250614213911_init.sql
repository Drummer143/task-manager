-- Add migration script here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
    "users" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "username" VARCHAR(50) NOT NULL,
        "email_verified" BOOL NOT NULL DEFAULT false,
        "picture" VARCHAR(255),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ
    );

CREATE TABLE
    "user_credentials" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "password_hash" VARCHAR(255) NOT NULL,
        "password_reset_token" VARCHAR(255),
        "email_verification_token" VARCHAR(255),
        "user_id" UUID UNIQUE NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    );

CREATE TABLE
    "user_meta" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "user_id" UUID UNIQUE NOT NULL,
        "selected_workspace" UUID,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    );

CREATE TABLE
    "workspaces" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "name" VARCHAR(255) NOT NULL,
        "owner_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE
    );

CREATE TABLE
    "workspace_accesses" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "user_id" UUID NOT NULL,
        "workspace_id" UUID NOT NULL,
        "role" VARCHAR(50) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE CASCADE,
        CONSTRAINT "workspace_accesses_user_workspace_idx" UNIQUE ("user_id", "workspace_id")
    );

CREATE TABLE
    "pages" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "type" VARCHAR(50) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "owner_id" UUID NOT NULL,
        "workspace_id" UUID NOT NULL,
        "parent_page_id" UUID,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("parent_page_id") REFERENCES "pages" ("id") ON DELETE SET NULL
    );

CREATE TABLE
    "page_accesses" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "user_id" UUID NOT NULL,
        "page_id" UUID NOT NULL,
        "role" VARCHAR(50) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE,
        CONSTRAINT "page_accesses_user_page_idx" UNIQUE ("user_id", "page_id")
    );

CREATE TABLE
    "tasks" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "title" VARCHAR(255) NOT NULL,
        "status" VARCHAR(50) NOT NULL,
        "description" TEXT,
        "due_date" TIMESTAMPTZ,
        "page_id" UUID NOT NULL,
        "assignee_id" UUID,
        "reporter_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("assignee_id") REFERENCES "users" ("id") ON DELETE SET NULL,
        FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") ON DELETE CASCADE
    );