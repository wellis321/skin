import { mkdirSync } from 'fs';
import { dirname } from 'path';
import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import * as schemaSqlite from './schema.sqlite';
import * as schemaPg from './schema.pg';

const databaseUrl = process.env.DATABASE_URL ?? './data/sqlite.db';
/** True when DATABASE_URL is a Postgres URL (e.g. on Vercel with Supabase). */
export const isPostgres =
	typeof databaseUrl === 'string' &&
	(databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'));

type DbInstance = ReturnType<typeof drizzleSqlite> | ReturnType<typeof drizzlePg>;

let _db: DbInstance | null = null;
let _sqlite: Database.Database | null = null;

function getDb(): DbInstance {
	if (_db) return _db;
	if (isPostgres) {
		// postgres.js with prepare: false for Supabase transaction pooler (port 6543)
		const client = postgres(databaseUrl, { prepare: false });
		_db = drizzlePg(client, { schema: schemaPg });
	} else {
		const dir = dirname(databaseUrl);
		if (dir !== '.') {
			try {
				mkdirSync(dir, { recursive: true });
			} catch {
				// ignore
			}
		}
		_sqlite = new Database(databaseUrl);
		_db = drizzleSqlite(_sqlite, { schema: schemaSqlite });
	}
	return _db;
}

/** Lazy-initialized so the DB is not opened during Vercel build (only at runtime when DATABASE_URL is set). */
export const db = new Proxy({} as DbInstance, {
	get(_, prop) {
		return (getDb() as Record<string | symbol, unknown>)[prop];
	}
});

/** Only set when using SQLite (local dev). Lazy so build never opens SQLite. */
export const sqlite = new Proxy({} as Database.Database | null, {
	get(_, prop) {
		getDb();
		if (_sqlite == null) return undefined;
		return (_sqlite as Record<string | symbol, unknown>)[prop];
	}
});
