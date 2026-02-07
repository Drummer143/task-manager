ALTER TABLE task_chat_messages DROP CONSTRAINT IF EXISTS "fk_task_chat_messages_reply_to";

ALTER TABLE task_chat_messages DROP CONSTRAINT IF EXISTS "fk_task_chat_messages_pinned_by";

ALTER TABLE task_chat_messages DROP COLUMN IF EXISTS "reply_to";

ALTER TABLE task_chat_messages DROP COLUMN IF EXISTS "pinned_by";
