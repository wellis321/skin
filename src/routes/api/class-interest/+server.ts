import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { classInterest } from '$lib/server/db/schema';
import { getGroupClassById } from '$lib/server/groupClasses';
import { generateId } from 'lucia';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') {
		return json({ error: 'Invalid request' }, { status: 400 });
	}
	const o = body as Record<string, unknown>;
	const classIdParam = typeof o.classId === 'string' ? o.classId.trim() : '';
	const emailParam = o.email;
	const nameParam = o.name;

	if (!classIdParam) {
		return json({ error: 'Class is required' }, { status: 400 });
	}
	const classItem = await getGroupClassById(classIdParam);
	if (!classItem) {
		return json({ error: 'Class not found' }, { status: 404 });
	}

	let email: string;
	if (locals.user && 'email' in locals.user && typeof locals.user.email === 'string') {
		email = locals.user.email;
	} else if (typeof emailParam === 'string' && emailParam.includes('@')) {
		email = emailParam.trim().toLowerCase();
	} else {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	const name =
		typeof nameParam === 'string' && nameParam.trim()
			? nameParam.trim().slice(0, 200)
			: null;

	const id = generateId(20);
	const createdAt = new Date();

	await db.insert(classInterest).values({
		id,
		classId: classIdParam,
		email,
		name,
		userId: locals.user?.id ?? null,
		createdAt
	});

	return json({
		ok: true,
		message: "You're booked for " + classItem.title + ". We'll send you the Zoom link and reminder before the class."
	});
};
