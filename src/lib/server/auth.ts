import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { DrizzleSQLiteAdapter, DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db, isPostgres } from '$lib/server/db';
import { session, user } from '$lib/server/db/schema';

const adapter = isPostgres
	? new DrizzlePostgreSQLAdapter(db, session, user)
	: new DrizzleSQLiteAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes(attributes) {
		return {
			email: attributes.email
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
			passwordHash: string;
			createdAt: Date;
		};
	}
}
