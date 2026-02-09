-- Allow password_hash to be null for users synced from Supabase Auth (email verification flow)
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
