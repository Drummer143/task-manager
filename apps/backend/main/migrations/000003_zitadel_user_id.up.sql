ALTER TABLE "users"
ADD COLUMN "zitadel_user_id" VARCHAR(255);

ALTER TABLE "users"
DROP COLUMN "last_password_reset",
DROP COLUMN "last_login";