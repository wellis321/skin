import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
		const password = typeof body?.password === 'string' ? body.password : '';

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const rows = await db.select().from(user).where(eq(user.email, email)).limit(1);
		const existingUser = rows[0];
		if (!existingUser) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const valid = await bcrypt.compare(password, existingUser.passwordHash);
		if (!valid) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});

		return json({ ok: true });
	} catch (err) {
		console.error('login error:', err);
		return json({ error: 'Sign in failed' }, { status: 500 });
	}
};
