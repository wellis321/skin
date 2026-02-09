import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { assessment } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import path from 'node:path';
import fs from 'node:fs';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return new Response(null, { status: 401 });
	}
	const id = params.id;
	if (!id) {
		return new Response(null, { status: 404 });
	}
	const rows = await db
		.select({ thumbnailPath: assessment.thumbnailPath })
		.from(assessment)
		.where(and(eq(assessment.id, id), eq(assessment.userId, locals.user.id)))
		.limit(1);
	const row = rows[0];
	if (!row?.thumbnailPath) {
		return new Response(null, { status: 404 });
	}
	// Handle both absolute paths (Vercel /tmp) and relative paths (local dev)
	const filePath = path.isAbsolute(row.thumbnailPath)
		? row.thumbnailPath
		: path.join(process.cwd(), row.thumbnailPath);
	if (!fs.existsSync(filePath)) {
		return new Response(null, { status: 404 });
	}
	const buffer = fs.readFileSync(filePath);
	const ext = path.extname(filePath).toLowerCase();
	const contentType = ext === '.webp' ? 'image/webp' : 'image/jpeg';
	return new Response(buffer, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'private, max-age=86400'
		}
	});
};
