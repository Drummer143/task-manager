ALTER TABLE "pages"
DROP CONSTRAINT IF EXISTS "pages_parent_id_fkey";

ALTER TABLE "text_page_lines"
DROP CONSTRAINT IF EXISTS "text_page_lines_page_id_fkey";

ALTER TABLE "page_accesses"
DROP CONSTRAINT IF EXISTS "page_accesses_page_id_fkey";

ALTER TABLE "page_accesses"
DROP CONSTRAINT IF EXISTS "page_accesses_user_id_fkey";

ALTER TABLE "tasks"
DROP CONSTRAINT IF EXISTS "tasks_page_id_fkey";

ALTER TABLE "tasks"
DROP CONSTRAINT IF EXISTS "tasks_assigned_to_fkey";

ALTER TABLE "tasks"
DROP CONSTRAINT IF EXISTS "tasks_owner_id_fkey";

ALTER TABLE "user_credentials"
DROP CONSTRAINT IF EXISTS "user_credentials_user_id_fkey";

DROP INDEX IF EXISTS "unique_user_board_accesses";

DROP TABLE IF EXISTS "user_credentials";

DROP TABLE IF EXISTS "tasks";

DROP TABLE IF EXISTS "page_accesses";

DROP TABLE IF EXISTS "text_page_lines";

DROP TABLE IF EXISTS "pages";

DROP TABLE IF EXISTS "users";

DROP TYPE IF EXISTS "page_types";

DROP TYPE IF EXISTS "roles";