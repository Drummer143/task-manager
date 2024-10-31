CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE task_statuses AS ENUM ('not_done', 'in_progress', 'done');

CREATE TABLE
  "tasks" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
    "owner_id" varchar(63) NOT NULL,
    "deletable_not_by_owner" boolean NOT NULL DEFAULT true,
    "status" task_statuses NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text NOT NULL,
    "due_date" timestamp,
    "assigned_to" varchar(63),
    "created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  );