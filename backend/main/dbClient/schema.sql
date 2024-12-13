CREATE TYPE "task_statuses" AS ENUM ('not_done', 'in_progress', 'done');

CREATE TYPE "board_roles" AS ENUM (
	'owner',
	'admin',
	'member',
	'commentator',
	'guest'
);

CREATE TABLE
	"users" (
		"id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
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

CREATE TABLE
	"boards" (
		"id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
		"name" varchar(255) NOT NULL,
		"owner_id" uuid NOT NULL,
		"created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"deleted_at" timestamptz
	);

CREATE TABLE
	"board_accesses" (
		"id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
		"user_id" uuid NOT NULL,
		"board_id" uuid NOT NULL,
		"role" board_roles NOT NULL DEFAULT 'member',
		"created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	);

CREATE TABLE
	"tasks" (
		"id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
		"deletable_not_by_owner" boolean NOT NULL DEFAULT true,
		"status" task_statuses NOT NULL,
		"title" varchar(255) NOT NULL,
		"description" text,
		"due_date" timestamp,
		"assigned_to" uuid,
		"board_id" uuid NOT NULL,
		"owner_id" uuid NOT NULL,
		"created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"deleted_at" timestamptz
	);

CREATE TABLE
	"user_credentials" (
		"id" uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
		"password_hash" varchar(255) NOT NULL,
		"password_reset_token" varchar(255),
		"email_verification_token" varchar(255),
		"user_id" uuid NOT NULL,
		"created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"deleted_at" timestamptz
	);

ALTER TABLE "tasks" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("assigned_to") REFERENCES "users" ("id");

ALTER TABLE "user_credentials" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "boards" ADD FOREIGN KEY ("board_id") REFERENCES "tasks" ("id") ON DELETE CASCADE;

ALTER TABLE "board_accesses" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "board_accesses" ADD FOREIGN KEY ("board_id") REFERENCES "boards" ("id") ON DELETE CASCADE;

ALTER TABLE "board_accesses" ADD CONSTRAINT "unique_user_board_accesses" UNIQUE ("user_id", "board_id");