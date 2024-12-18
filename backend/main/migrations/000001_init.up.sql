CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "page_roles" AS ENUM (
  'owner',
  'admin',
  'member',
  'commentator',
  'guest'
);

CREATE TYPE "page_types" AS ENUM (
  'board',
  'text',
  'group'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "email" varchar(63) UNIQUE NOT NULL,
  "email_verified" bool NOT NULL DEFAULT false,
  "picture" varchar(255),
  "username" varchar(63) NOT NULL,
  "last_password_reset" timestamptz,
  "last_login" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamptz
);

CREATE TABLE "pages" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "type" page_types NOT NULL DEFAULT 'text',
  "name" varchar(255) NOT NULL,
  "owner_id" uuid NOT NULL,
  "parent_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamptz
);

CREATE TABLE "text_page_lines" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "text" text NOT NULL,
  "page_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamptz
);

CREATE TABLE "page_accesses" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "role" page_roles NOT NULL DEFAULT 'member',
  "user_id" uuid NOT NULL,
  "page_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamptz
);

CREATE TABLE "tasks" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "deletable_not_by_owner" boolean NOT NULL DEFAULT true,
  "status" varchar(63) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "due_date" timestamptz,
  "assigned_to" uuid,
  "page_id" uuid NOT NULL,
  "owner_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamptz
);

CREATE TABLE "user_credentials" (
  "id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "password_hash" varchar(255) NOT NULL,
  "password_reset_token" varchar(255),
  "email_verification_token" varchar(255),
  "user_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamptz
);

CREATE UNIQUE INDEX "unique_user_board_accesses" ON "page_accesses" ("user_id", "page_id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("assigned_to") REFERENCES "users" ("id") ON DELETE SET NULL;

ALTER TABLE "user_credentials" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "tasks" ADD FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE;

ALTER TABLE "page_accesses" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "page_accesses" ADD FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE;

ALTER TABLE "text_page_lines" ADD FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE;

ALTER TABLE "pages" ADD FOREIGN KEY ("parent_id") REFERENCES "pages" ("id") ON DELETE SET NULL;
