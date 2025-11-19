CREATE TABLE
    board_statuses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        page_id UUID NOT NULL,
        position INT NOT NULL CHECK (position > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        deleted_at TIMESTAMPTZ,
        initial BOOLEAN NOT NULL DEFAULT FALSE,
        localizations JSONB NOT NULL DEFAULT '{}'::jsonb,

        FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
    );

ALTER TABLE tasks DROP COLUMN status;

ALTER TABLE tasks ADD COLUMN status_id UUID NOT NULL;

ALTER TABLE tasks ADD FOREIGN KEY (status_id) REFERENCES board_statuses (id);

ALTER TABLE tasks ADD COLUMN position INT NOT NULL CHECK (position > 0);