CREATE TYPE "board_roles" AS ENUM (
	'owner',
	'admin',
	'member',
	'commentator',
	'guest'
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
		"created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
	);

ALTER TABLE "tasks"
ADD COLUMN "board_id" uuid NOT NULL;

ALTER TABLE "tasks" ADD FOREIGN KEY ("board_id") REFERENCES "boards" ("id") ON DELETE CASCADE;

ALTER TABLE "board_accesses" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "board_accesses" ADD FOREIGN KEY ("board_id") REFERENCES "boards" ("id") ON DELETE CASCADE;

ALTER TABLE "board_accesses" ADD CONSTRAINT "unique_user_board_accesses" UNIQUE ("user_id", "board_id");

ALTER TABLE "user_credentials" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
