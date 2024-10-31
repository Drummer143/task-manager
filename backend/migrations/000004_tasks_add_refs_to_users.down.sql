ALTER TABLE "user"
DROP COLUMN "deleted_at";

ALTER TABLE "task"
DROP COLUMN "deleted_at";

ALTER TABLE "tasks"
DROP CONSTRAINT "tasks_assigned_to_fkey";

ALTER TABLE "tasks"
DROP CONSTRAINT "tasks_owner_id_fkey";