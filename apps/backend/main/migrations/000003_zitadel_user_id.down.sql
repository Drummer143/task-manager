ALTER TABLE "users"
DROP COLUMN "zitadel_user_id";

ALTER TABLE "users"
ADD COLUMN "last_password_reset" TIMESTAMPTZ,
ADD COLUMN "last_login" TIMESTAMPTZ NOT NULL;