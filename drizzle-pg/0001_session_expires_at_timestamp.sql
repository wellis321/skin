-- DrizzlePostgreSQLAdapter expects session.expires_at as timestamp (Date), not integer.
-- Convert existing integer (Unix seconds) to timestamptz.
ALTER TABLE "session" ALTER COLUMN "expires_at" TYPE timestamp with time zone USING to_timestamp("expires_at");
