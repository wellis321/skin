import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ?? './data/sqlite.db';
const isPostgres =
	typeof databaseUrl === 'string' &&
	(databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'));

const config = isPostgres
	? defineConfig({
			schema: './src/lib/server/db/schema.pg.ts',
			out: './drizzle-pg',
			dialect: 'postgresql',
			dbCredentials: {
				url: databaseUrl
			}
		})
	: defineConfig({
			schema: './src/lib/server/db/schema.sqlite.ts',
			out: './drizzle',
			dialect: 'sqlite',
			dbCredentials: {
				url: databaseUrl
			}
		});

export default config;
