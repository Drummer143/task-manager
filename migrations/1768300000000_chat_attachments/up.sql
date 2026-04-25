CREATE TABLE IF NOT EXISTS "task_chat_message_attachments" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
    "message_id" uuid NOT NULL,
    "asset_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_chat_message_attachments_message_id ON task_chat_message_attachments (message_id);

ALTER TABLE "task_chat_message_attachments"
    ADD CONSTRAINT "fk_chat_message_attachments_message"
    FOREIGN KEY ("message_id") REFERENCES "task_chat_messages" ("id") ON DELETE CASCADE;

ALTER TABLE "task_chat_message_attachments"
    ADD CONSTRAINT "fk_chat_message_attachments_asset"
    FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") ON DELETE CASCADE;
