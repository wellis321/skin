import { createSupabaseServerClient } from '$lib/server/supabase';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Handle } from '@sveltejs/kit';

/** Sync Supabase Auth user to our app users table (for profile, assessments, etc.). */
async function syncSupabaseUserToDb(supabaseUserId: string, email: string) {
	const existing = await db
		.select()
		.from(userTable)
		.where(eq(userTable.id, supabaseUserId))
		.limit(1);
	if (existing.length > 0) return;
	const now = new Date();
	await db.insert(userTable).values({
		id: supabaseUserId,
		email,
		passwordHash: null,
		createdAt: now
	});
}

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createSupabaseServerClient(event);
	event.locals.supabase = supabase;

	let session: { user?: { id: string; email?: string } } | null = null;
	try {
		const { data } = await supabase.auth.getSession();
		session = data?.session ?? null;
	} catch {
		event.locals.user = null;
		return resolve(event);
	}

	if (!session?.user) {
		event.locals.user = null;
		return resolve(event);
	}

	const { id, email } = session.user;
	const appEmail = typeof email === 'string' ? email : '';
	if (id && appEmail) {
		try {
			await syncSupabaseUserToDb(id, appEmail);
		} catch (err) {
			console.error('syncSupabaseUserToDb:', err);
		}
	}
	event.locals.user = { id, email: appEmail };
	return resolve(event);
};
