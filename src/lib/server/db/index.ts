import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import * as schemaSqlite from './schema.sqlite';
import * as schemaPg from './schema.pg';

const databaseUrl = process.env.DATABASE_URL ?? './data/sqlite.db';
const isPostgres =
	typeof databaseUrl === 'string' &&
	(databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'));

let _db: ReturnType<typeof drizzleSqlite> | ReturnType<typeof drizzlePg>;
let _sqlite: Database.Database | null = null;

if (isPostgres) {
	_db = drizzlePg(databaseUrl, { schema: schemaPg });
} else {
	_sqlite = new Database(databaseUrl);
	_db = drizzleSqlite(_sqlite, { schema: schemaSqlite });
}

export const db = _db;

/** Only set when using SQLite (local dev). Do not use when deploying to Vercel with Postgres. */
export const sqlite: Database.Database | null = _sqlite;
