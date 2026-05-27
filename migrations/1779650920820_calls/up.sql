CREATE TABLE
    IF NOT EXISTS "rooms" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
        "name" text,
        "visibility" text NOT NULL DEFAULT 'private',
        "created_by" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" timestamp
    );

CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms (created_by);

ALTER TABLE "rooms" ADD CONSTRAINT "fk_rooms_created_by" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE;

-- CREATE TABLE
--     IF NOT EXISTS "call_sessions" (
--         "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
--         "room_id" uuid NOT NULL,
--         "livekit_room_sid" text,
--         "started_at" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
--         "ended_at" timestamp
--     );

-- CREATE INDEX IF NOT EXISTS idx_call_sessions_room_id ON call_sessions (room_id);

-- ALTER TABLE "call_sessions" ADD CONSTRAINT "fk_call_sessions_room" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE CASCADE;

-- CREATE TABLE
--     IF NOT EXISTS "call_participants" (
--         "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4 ()),
--         "session_id" uuid NOT NULL,
--         "user_id" uuid NOT NULL,
--         "joined_at" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
--         "left_at" timestamp
--     );

-- CREATE INDEX IF NOT EXISTS idx_call_participants_session_id ON call_participants (session_id);

-- CREATE INDEX IF NOT EXISTS idx_call_participants_user_id ON call_participants (user_id);

-- ALTER TABLE "call_participants" ADD CONSTRAINT "fk_call_participants_session" FOREIGN KEY ("session_id") REFERENCES "call_sessions" ("id") ON DELETE CASCADE;

-- ALTER TABLE "call_participants" ADD CONSTRAINT "fk_call_participants_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
