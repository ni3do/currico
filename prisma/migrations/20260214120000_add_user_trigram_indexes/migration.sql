-- Add trigram indexes on users.name and users.display_name for fuzzy user search
CREATE INDEX IF NOT EXISTS idx_users_name_trigram ON users USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_display_name_trigram ON users USING GIN (display_name gin_trgm_ops);
