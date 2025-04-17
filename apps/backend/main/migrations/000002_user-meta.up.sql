CREATE TABLE
    "user_meta" (
        "id" UUID PRIMARY KEY DEFAULT (uuid_generate_v4 ()),
        "user_id" UUID UNIQUE NOT NULL,
        "selected_workspace" UUID,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "deleted_at" TIMESTAMPTZ,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
    );

INSERT INTO
    user_meta (user_id)
SELECT
    id
FROM
    users;