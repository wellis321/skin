/**
 * App schema: re-exports Postgres schema so all app code uses the same types.
 * db/index.ts uses Postgres when DATABASE_URL is a postgres URL, else SQLite (schema.sqlite).
 */
export * from './schema.pg';
