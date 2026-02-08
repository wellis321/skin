import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { generateId } from 'lucia';
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
		if (password.length < 8) {
			return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
		}

		const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);
		if (existing.length > 0) {
			return json({ error: 'An account with this email already exists' }, { status: 409 });
		}

		const userId = generateId(15);
		const passwordHash = await bcrypt.hash(password, 10);
		const createdAt = new Date();

		await db.insert(user).values({
			id: userId,
			email,
			passwordHash,
			createdAt
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return json({ ok: true });
	} catch (err) {
		console.error('signup error:', err);
		return json({ error: 'Sign up failed' }, { status: 500 });
	}
};
