ALTER TABLE tasks
DROP COLUMN description,
ADD COLUMN description TEXT;

DROP TABLE IF EXISTS text_page_contents;