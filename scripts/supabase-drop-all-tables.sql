-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) for project qztsitnpzkdhyysmjapg
-- This drops all tables in the public schema so you can repurpose the project for the skin app.
-- After running, set DATABASE_URL to your Supabase connection string and run: npx drizzle-kit migrate

-- Disable triggers temporarily so CASCADE drops work cleanly
SET session_replication_role = 'replica';

-- Drop all tables in public schema (CASCADE removes dependent views, FKs, etc.)
DO $$
DECLARE
  r RECORD; 
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
  END LOOP;
END $$;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Optional: drop and recreate the public schema to clear types/enums (comment out if you prefer to keep schema as-is)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;
