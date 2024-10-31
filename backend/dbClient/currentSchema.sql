CREATE TYPE "task_statuses" AS ENUM ('not_done', 'in_progress', 'done');

CREATE TABLE
  "users" (
    "email" varchar(63) NOT NULL,
    "email_verified" bool NOT NULL DEFAULT false,
    "name" varchar(63) NOT NULL,
    "nickname" varchar(63) NOT NULL,
    "picture" varchar(255),
    "user_id" varchar(63) PRIMARY KEY NOT NULL,
    "username" varchar(63) NOT NULL,
    "last_password_reset" timestamptz,
    "last_ip" varchar(15),
    "last_login" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    "logins_count" int NOT NULL DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    "updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    "deleted_at" timestamp
  );

CREATE TABLE
  "tasks" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
    "owner_id" varchar(63) NOT NULL,
    "deletable_not_by_owner" boolean NOT NULL DEFAULT true,
    "status" task_statuses NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "due_date" timestamp,
    "assigned_to" varchar(63),
    "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    "deleted_at" timestamp
  );

ALTER TABLE "tasks" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("assigned_to") REFERENCES "users" ("user_id");