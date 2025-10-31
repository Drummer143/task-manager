CREATE TABLE
    task_chats (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        task_id UUID NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now (),
        UNIQUE (task_id)
    );

CREATE TABLE
    task_chat_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        chat_id UUID NOT NULL REFERENCES task_chats (id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now (),
        UNIQUE (chat_id, user_id)
    );

CREATE INDEX idx_task_chat_subscriptions_user ON task_chat_subscriptions (user_id);

INSERT INTO
    task_chats (task_id)
SELECT DISTINCT
    task_id
FROM
    task_chat_messages;

ALTER TABLE task_chat_messages
ADD COLUMN chat_id UUID REFERENCES task_chats (id);

CREATE INDEX idx_task_chat_messages_chat ON task_chat_messages (chat_id);

UPDATE task_chat_messages m
SET
    chat_id = c.id
FROM
    task_chats c
WHERE
    m.task_id = c.task_id;

ALTER TABLE task_chat_messages
ALTER COLUMN chat_id
SET
    NOT NULL;

INSERT INTO
    task_chat_subscriptions (chat_id, user_id, created_at)
SELECT DISTINCT
    chat_id,
    user_id,
    now ()
FROM
    task_chat_messages ON CONFLICT (chat_id, user_id) DO NOTHING;

DROP INDEX idx_task_chat_messages_task_id;

ALTER TABLE task_chat_messages
DROP COLUMN task_id;