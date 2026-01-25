DROP TABLE assets;

CREATE TABLE
    blobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        hash CHAR(64) UNIQUE NOT NULL,
        size BIGINT NOT NULL,
        path TEXT NOT NULL,
        mime_type TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        blob_id UUID NOT NULL,
        entity_id UUID NOT NULL,
        entity_type TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (blob_id) REFERENCES blobs (id)
    )