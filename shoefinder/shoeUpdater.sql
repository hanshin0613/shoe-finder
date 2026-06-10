ALTER TABLE shoes 
ADD COLUMN traction_review TEXT,
ADD COLUMN cushion_review TEXT,
ADD COLUMN materials_review TEXT,
ADD COLUMN support_review TEXT,
ADD COLUMN outdoor_review TEXT;

DELETE FROM links WHERE link = '/shoe-reviews/nike-a''one/';

SELECT * FROM links;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shoes'
ORDER BY ordinal_position;

SELECT name FROM shoes WHERE traction_review is NULL;
SELECT * FROM links;
SELECT name FROM shoes WHERE name LIKE '%361Ag4%';
SELECT link FROM links WHERE link LIKE '/shoe-reviews/361-ag-4/';
    /shoe-reviews/nikegtcut4/
    /shoe-reviews/nike-gt-cut-4/
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SELECT link FROM links WHERE REGEXP_REPLACE(link, '-(?=[^/]+/?$)', '', 'g') LIKE '/shoe-reviews/361ag4/';

SELECT * FROM shoes;
SELECT * FROM links;

SELECT COUNT(*) FROM shoes;