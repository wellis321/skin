import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { assessment } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateId } from '$lib/server/id';
import type { SkinAnalysisResult, ProductSuggestion, FaceDetails } from '$lib/types/skin';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import { createSupabaseServerClient } from '$lib/server/supabase';

// On Vercel, use /tmp directory (only writable location)
// Otherwise use data/thumbnails in project root
const THUMBNAILS_DIR = process.env.VERCEL
	? path.join('/tmp', 'thumbnails')
	: path.join(process.cwd(), 'data', 'thumbnails');
const THUMB_MAX = 320;

function parseBody(body: unknown): SkinAnalysisResult | null {
	if (!body || typeof body !== 'object') return null;
	const o = body as Record<string, unknown>;
	const overallScore = typeof o.overallScore === 'number' ? o.overallScore : null;
	const wrinkles = o.wrinkles && typeof o.wrinkles === 'object' ? (o.wrinkles as Record<string, unknown>) : null;
	const spots = o.spots && typeof o.spots === 'object' ? (o.spots as Record<string, unknown>) : null;
	if (
		overallScore == null ||
		!wrinkles ||
		typeof wrinkles.score !== 'number' ||
		typeof wrinkles.forehead !== 'number' ||
		typeof wrinkles.crowFeet !== 'number' ||
		typeof wrinkles.fineLines !== 'number' ||
		!spots ||
		typeof spots.score !== 'number' ||
		typeof spots.blemishes !== 'number' ||
		typeof spots.hyperpigmentation !== 'number'
	) {
		return null;
	}
	return {
		overallScore,
		wrinkles: {
			score: wrinkles.score,
			forehead: wrinkles.forehead,
			crowFeet: wrinkles.crowFeet,
			fineLines: wrinkles.fineLines,
			summary: typeof wrinkles.summary === 'string' ? wrinkles.summary : ''
		},
		spots: {
			score: spots.score,
			blemishes: spots.blemishes,
			hyperpigmentation: spots.hyperpigmentation,
			summary: typeof spots.summary === 'string' ? spots.summary : ''
		},
		whatsWorking: Array.isArray(o.whatsWorking) ? (o.whatsWorking as string[]) : [],
		needsAttention: Array.isArray(o.needsAttention) ? (o.needsAttention as string[]) : [],
		recommendations: Array.isArray(o.recommendations) ? (o.recommendations as string[]) : [],
		productSuggestions: Array.isArray(o.productSuggestions) ? (o.productSuggestions as ProductSuggestion[]) : [],
		...(typeof o.structureScore === 'number' && o.structureScore >= 0 && o.structureScore <= 100 && { structureScore: o.structureScore }),
		faceDetails: parseFaceDetails(o.faceDetails)
	};
}

function parseFaceDetails(raw: unknown): FaceDetails | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const fd = raw as Record<string, unknown>;
	const age = typeof fd.age === 'number' ? fd.age : undefined;
	const gender = fd.gender === 'male' || fd.gender === 'female' ? fd.gender : undefined;
	if (age == null || gender == null) return undefined;
	const genderProbability =
		typeof fd.genderProbability === 'number' && fd.genderProbability >= 0 && fd.genderProbability <= 1
			? fd.genderProbability
			: undefined;
	let expressions: Record<string, number> | undefined;
	if (fd.expressions && typeof fd.expressions === 'object' && !Array.isArray(fd.expressions)) {
		expressions = {};
		for (const [k, v] of Object.entries(fd.expressions)) {
			if (typeof v === 'number') expressions[k] = v;
		}
		if (Object.keys(expressions).length === 0) expressions = undefined;
	}
	return { age, gender, ...(genderProbability != null && { genderProbability }), ...(expressions && { expressions }) };
}

function rowToFaceDetails(row: {
	faceDetailsAge: number | null;
	faceDetailsGender: string | null;
	faceDetailsGenderProbability: number | null;
	faceDetailsExpressions: string | null;
}): FaceDetails | undefined {
	if (row.faceDetailsAge == null || (row.faceDetailsGender !== 'male' && row.faceDetailsGender !== 'female')) return undefined;
	let expressions: Record<string, number> | undefined;
	if (row.faceDetailsExpressions) {
		try {
			const exp = JSON.parse(row.faceDetailsExpressions) as unknown;
			if (exp && typeof exp === 'object' && !Array.isArray(exp)) {
				expressions = {};
				for (const [k, v] of Object.entries(exp)) {
					if (typeof v === 'number') expressions[k] = v;
				}
				if (Object.keys(expressions).length === 0) expressions = undefined;
			}
		} catch {
			// ignore
		}
	}
	return {
		age: row.faceDetailsAge,
		gender: row.faceDetailsGender,
		...(row.faceDetailsGenderProbability != null && { genderProbability: row.faceDetailsGenderProbability }),
		...(expressions && { expressions })
	};
}

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorised' }, { status: 401 });
	}
	const fromParam = url.searchParams.get('from');
	const toParam = url.searchParams.get('to');
	const rows = await db
		.select()
		.from(assessment)
		.where(eq(assessment.userId, locals.user.id))
		.orderBy(desc(assessment.createdAt));
	const list = rows.map((row) => ({
		id: row.id,
		createdAt: row.createdAt,
		overallScore: row.overallScore,
		wrinklesScore: row.wrinklesScore,
		wrinklesForehead: row.wrinklesForehead,
		wrinklesCrowFeet: row.wrinklesCrowFeet,
		wrinklesFineLines: row.wrinklesFineLines,
		spotsScore: row.spotsScore,
		spotsBlemishes: row.spotsBlemishes,
		spotsHyperpigmentation: row.spotsHyperpigmentation,
		...(row.structureScore != null && { structureScore: row.structureScore }),
		faceDetails: rowToFaceDetails(row)
	}));
	let filtered = list;
	if (fromParam || toParam) {
		const from = fromParam ? new Date(fromParam).getTime() : 0;
		const to = toParam ? new Date(toParam).getTime() : Number.MAX_SAFE_INTEGER;
		filtered = list.filter((r) => {
			const t = r.createdAt instanceof Date ? r.createdAt.getTime() : new Date(r.createdAt).getTime();
			return t >= from && t <= to;
		});
	}
	return json(filtered);
};

export const POST: RequestHandler = async ({ request, locals, event }) => {
	if (!locals.user) {
		// Log session info for debugging
		try {
			const supabase = createSupabaseServerClient(event);
			const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
			console.error('[assessments POST] No user in locals:', {
				hasSession: !!sessionData?.session,
				sessionError: sessionError?.message,
				userId: sessionData?.session?.user?.id
			});
		} catch (err) {
			console.error('[assessments POST] Error checking session:', err);
		}
		return json({ error: 'Unauthorised' }, { status: 401 });
	}
	const body = await request.json().catch(() => null);
	const result = parseBody(body);
	if (!result) {
		return json({ error: 'Invalid body: expected skin analysis result with scores' }, { status: 400 });
	}
	const id = generateId(20);
	const createdAt = new Date();
	const thumbnailBase64 =
		body && typeof body === 'object' && typeof (body as Record<string, unknown>).thumbnailBase64 === 'string'
			? (body as Record<string, unknown>).thumbnailBase64 as string
			: null;

	let thumbnailPath: string | null = null;
	// Skip thumbnail saving on Vercel since /tmp is ephemeral and files won't persist
	// TODO: Consider using Supabase Storage for thumbnails on Vercel
	if (thumbnailBase64 && !process.env.VERCEL) {
		try {
			const isWebP = thumbnailBase64.startsWith('data:image/webp;base64,');
			const base64Data = thumbnailBase64.replace(/^data:image\/\w+;base64,/, '');
			const buffer = Buffer.from(base64Data, 'base64');
			fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
			let thumbBuffer: Buffer;
			let filename: string;
			if (isWebP) {
				thumbBuffer = await sharp(buffer)
					.resize(THUMB_MAX, THUMB_MAX, { fit: 'inside' })
					.webp({ quality: 90 })
					.toBuffer();
				filename = `${id}.webp`;
			} else {
				thumbBuffer = await sharp(buffer)
					.resize(THUMB_MAX, THUMB_MAX, { fit: 'inside' })
					.jpeg({ quality: 90 })
					.toBuffer();
				filename = `${id}.jpg`;
			}
			const filePath = path.join(THUMBNAILS_DIR, filename);
			fs.writeFileSync(filePath, thumbBuffer);
			thumbnailPath = path.join('data', 'thumbnails', filename);
		} catch (err) {
			console.error('[assessments POST] Thumbnail save error:', err);
			// continue without thumbnail
		}
	}

	const fd = result.faceDetails;
	try {
		await db.insert(assessment).values({
			id,
			userId: locals.user.id,
			createdAt,
			overallScore: result.overallScore,
			wrinklesScore: result.wrinkles.score,
			wrinklesForehead: result.wrinkles.forehead,
			wrinklesCrowFeet: result.wrinkles.crowFeet,
			wrinklesFineLines: result.wrinkles.fineLines,
			spotsScore: result.spots.score,
			spotsBlemishes: result.spots.blemishes,
			spotsHyperpigmentation: result.spots.hyperpigmentation,
			structureScore: result.structureScore ?? null,
			thumbnailPath,
			faceDetailsAge: fd?.age ?? null,
			faceDetailsGender: fd?.gender ?? null,
			faceDetailsGenderProbability: fd?.genderProbability ?? null,
			faceDetailsExpressions: fd?.expressions ? JSON.stringify(fd.expressions) : null
		});
	} catch (dbError) {
		console.error('[assessments POST] Database insert error:', dbError);
		return json({ error: 'Failed to save assessment', message: 'Internal Error' }, { status: 500 });
	}

	return json({
		id,
		createdAt,
		overallScore: result.overallScore,
		wrinklesScore: result.wrinkles.score,
		spotsScore: result.spots.score
	});
};
