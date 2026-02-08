import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { assessment } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import path from 'node:path';
import fs from 'node:fs';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorised' }, { status: 401 });
	}
	const id = params.id;
	if (!id) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	const rows = db
		.select({ thumbnailPath: assessment.thumbnailPath })
		.from(assessment)
		.where(and(eq(assessment.id, id), eq(assessment.userId, locals.user.id)))
		.limit(1)
		.all();
	const row = rows[0];
	if (!row) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	// Remove thumbnail file if present
	if (row.thumbnailPath) {
		const filePath = path.join(process.cwd(), row.thumbnailPath);
		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (err) {
			console.error('Delete thumbnail error:', err);
			// continue and delete the row anyway
		}
	}
	db.delete(assessment).where(and(eq(assessment.id, id), eq(assessment.userId, locals.user.id))).run();
	return json({ ok: true });
};
