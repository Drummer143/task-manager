ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "fk_rooms_created_by";

DROP INDEX IF EXISTS idx_rooms_created_by;

DROP TABLE IF EXISTS "rooms";

-- ALTER TABLE "call_participants" DROP CONSTRAINT IF EXISTS "fk_call_participants_user";

-- ALTER TABLE "call_participants" DROP CONSTRAINT IF EXISTS "fk_call_participants_session";

-- DROP INDEX IF EXISTS idx_call_participants_user_id;

-- DROP INDEX IF EXISTS idx_call_participants_session_id;

-- DROP TABLE IF EXISTS "call_participants";

-- ALTER TABLE "call_sessions" DROP CONSTRAINT IF EXISTS "fk_call_sessions_room";

-- DROP INDEX IF EXISTS idx_call_sessions_room_id;

-- DROP TABLE IF EXISTS "call_sessions";