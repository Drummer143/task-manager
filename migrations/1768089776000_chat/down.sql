ALTER TABLE "task_chat_messages" DROP CONSTRAINT IF EXISTS "fk_task_chat_messages_task";

ALTER TABLE "task_chat_messages" DROP CONSTRAINT IF EXISTS "fk_task_chat_messages_user";

DROP INDEX IF EXISTS idx_task_chat_messages_task_id;

DROP TABLE IF EXISTS "task_chat_messages";
