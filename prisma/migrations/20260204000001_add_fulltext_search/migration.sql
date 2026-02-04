-- PostgreSQL Full-Text Search for Resources
-- Uses German dictionary for proper stemming and stopword handling

-- Add tsvector column for full-text search
ALTER TABLE "resources" ADD COLUMN "search_vector" tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX "resources_search_vector_idx" ON "resources" USING GIN("search_vector");

-- Populate search_vector for existing resources
-- Title gets weight 'A' (highest), description gets weight 'B'
UPDATE "resources" SET "search_vector" = (
  setweight(to_tsvector('german', COALESCE("title", '')), 'A') ||
  setweight(to_tsvector('german', COALESCE("description", '')), 'B')
);

-- Create trigger function to automatically update search_vector
CREATE OR REPLACE FUNCTION resources_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := (
    setweight(to_tsvector('german', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(NEW.description, '')), 'B')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires on INSERT or UPDATE of title/description
CREATE TRIGGER resources_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description
  ON "resources"
  FOR EACH ROW
  EXECUTE FUNCTION resources_search_vector_update();
