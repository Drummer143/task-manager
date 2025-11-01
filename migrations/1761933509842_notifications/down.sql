ALTER TABLE task_chat_messages
ADD COLUMN task_id UUID;

UPDATE task_chat_messages m
SET
    task_id = c.task_id
FROM
    task_chats c
WHERE
    m.chat_id = c.id;

ALTER TABLE task_chat_messages
ALTER COLUMN task_id
SET
    NOT NULL;

CREATE INDEX idx_task_chat_messages_task_id ON task_chat_messages (task_id);

ALTER TABLE task_chat_messages
DROP CONSTRAINT task_chat_messages_chat_id_fkey;

ALTER TABLE task_chat_messages
DROP COLUMN chat_id;

DROP INDEX IF EXISTS idx_task_chat_messages_chat;

DROP INDEX IF EXISTS idx_task_chat_subscriptions_user;

DROP TABLE IF EXISTS task_chat_subscriptions;

DROP TABLE IF EXISTS task_chats;