ALTER TABLE "tasks" 
  DROP CONSTRAINT IF EXISTS "tasks_board_fkey";

ALTER TABLE "tasks" 
  DROP CONSTRAINT IF EXISTS "tasks_owner_fkey";

ALTER TABLE "tasks" 
  DROP COLUMN IF EXISTS "board";

ALTER TABLE "board_accesses" 
  DROP CONSTRAINT IF EXISTS "board_accesses_user_fkey";

ALTER TABLE "board_accesses" 
  DROP CONSTRAINT IF EXISTS "board_accesses_board_fkey";

DROP TABLE IF EXISTS "board_accesses" CASCADE;

DROP TABLE IF EXISTS "boards" CASCADE;

DROP TYPE IF EXISTS "board_roles";
