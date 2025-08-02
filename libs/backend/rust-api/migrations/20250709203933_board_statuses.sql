-- Add migration script here
CREATE TYPE board_status_type AS ENUM ('sub_status', 'main_status');

CREATE TABLE
    board_statuses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        page_id UUID NOT NULL,
        code VARCHAR(255) NOT NULL,
        type board_status_type NOT NULL,
        position INT NOT NULL CHECK (position > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        deleted_at TIMESTAMPTZ,
        initial BOOLEAN NOT NULL DEFAULT FALSE,
        parent_id UUID,
        localizations JSONB NOT NULL DEFAULT '{}'::jsonb,

        FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES board_statuses (id) ON DELETE CASCADE,

        CONSTRAINT unique_page_code UNIQUE (page_id, code)
    );

ALTER TABLE tasks DROP COLUMN status;

ALTER TABLE tasks ADD COLUMN status_id UUID NOT NULL;

ALTER TABLE tasks ADD FOREIGN KEY (status_id) REFERENCES board_statuses (id);

ALTER TABLE tasks ADD COLUMN position INT NOT NULL CHECK (position > 0);