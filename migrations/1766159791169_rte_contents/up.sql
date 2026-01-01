CREATE TABLE
    text_page_contents (
        page_id UUID PRIMARY KEY,
        content JSONB,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_pages_content FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
    );

INSERT INTO
    text_page_contents (page_id)
SELECT
    id
FROM
    pages
WHERE
    type = 'text' ON CONFLICT (page_id) DO NOTHING;

ALTER TABLE tasks
DROP COLUMN description,
ADD COLUMN description JSONB;