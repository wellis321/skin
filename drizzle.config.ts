import { defineConfig } from 'drizzle-kit';

const dbPath = process.env.DATABASE_URL ?? './data/sqlite.db';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		url: dbPath
	}
});
