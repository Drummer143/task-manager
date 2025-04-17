CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
  "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email_verified" BOOL NOT NULL DEFAULT false,
    "picture" VARCHAR(255),
    "last_password_reset" TIMESTAMPTZ,
    "last_login" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
  );

CREATE TABLE
  "user_credentials" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    "password_hash" VARCHAR(255) NOT NULL,
    "password_reset_token" VARCHAR(255),
    "email_verification_token" VARCHAR(255),
    "user_id" UUID UNIQUE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT fk_user_credentials_user FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
  );

CREATE TABLE
  "workspaces" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "role" VARCHAR(50),
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT fk_workspace_owner FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE
  );

CREATE TABLE
  "workspace_accesses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    "user_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT fk_workspace_access_user FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT fk_workspace_access_workspace FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE CASCADE
  );

CREATE UNIQUE INDEX "workspace_accesses_user_workspace_idx" ON "workspace_accesses" ("user_id", "workspace_id");

CREATE TABLE
  "pages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    "parent_page_id" UUID,
    "workspace_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "text" TEXT,
    "role" VARCHAR(50),
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT fk_page_workspace FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE CASCADE,
    CONSTRAINT fk_page_owner FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT fk_page_parent FOREIGN KEY ("parent_page_id") REFERENCES "pages" ("id") ON DELETE SET NULL
  );

CREATE TABLE
  "page_accesses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    "user_id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT fk_page_access_user FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT fk_page_access_page FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE
  );

CREATE UNIQUE INDEX "page_accesses_user_page_idx" ON "page_accesses" ("user_id", "page_id");

CREATE TABLE
  "tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    "page_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL,
    "assignee_id" UUID,
    "reporter_id" UUID NOT NULL,
    "due_date" TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT fk_task_page FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE,
    CONSTRAINT fk_task_assignee FOREIGN KEY ("assignee_id") REFERENCES "users" ("id") ON DELETE SET NULL,
    CONSTRAINT fk_task_reporter FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") ON DELETE CASCADE
  );