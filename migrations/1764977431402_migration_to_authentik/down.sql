CREATE TABLE
    IF NOT EXISTS user_credentials (
        id UUID NOT NULL DEFAULT uuid_generate_v4 (),
        password_hash VARCHAR(255) NOT NULL,
        password_reset_token VARCHAR(255),
        email_verification_token VARCHAR(255),
        user_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT user_credentials_pkey PRIMARY KEY (id),
        CONSTRAINT user_credentials_user_id_key UNIQUE (user_id),
        CONSTRAINT user_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

ALTER TABLE users
DROP COLUMN IF EXISTS authentik_id;

ALTER TABLE users
DROP COLUMN IF EXISTS is_active;

ALTER TABLE users
ADD COLUMN email_verified BOOLEAN;

ALTER TABLE users ALTER COLUMN email SET NOT NULL