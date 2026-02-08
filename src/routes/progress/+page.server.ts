import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assessment } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { FaceDetails } from '$lib/types/skin';

function rowToFaceDetails(row: Record<string, unknown>): FaceDetails | undefined {
	const age = row.faceDetailsAge ?? row.face_details_age;
	const gender = row.faceDetailsGender ?? row.face_details_gender;
	if (age == null || (gender !== 'male' && gender !== 'female')) return undefined;
	const genderProbability = row.faceDetailsGenderProbability ?? row.face_details_gender_probability;
	const expressionsRaw = row.faceDetailsExpressions ?? row.face_details_expressions;
	let expressions: Record<string, number> | undefined;
	if (typeof expressionsRaw === 'string') {
		try {
			const exp = JSON.parse(expressionsRaw) as unknown;
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
		age: Number(age),
		gender: gender as 'male' | 'female',
		...(genderProbability != null && { genderProbability: Number(genderProbability) }),
		...(expressions && { expressions })
	};
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const isDemo = url.searchParams.get('demo') === '1';
	if (isDemo) {
		const { getExampleAssessments } = await import('$lib/data/exampleAssessments');
		const assessments = getExampleAssessments();
		return { assessments, demoMode: true };
	}
	if (!locals.user) {
		throw redirect(302, '/sign-in?redirect=/progress');
	}
	const rows = db
		.select()
		.from(assessment)
		.where(eq(assessment.userId, locals.user.id))
		.orderBy(desc(assessment.createdAt))
		.all();
	const assessments = rows.map((row) => ({
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
		structureScore: row.structureScore ?? undefined,
		hasImage: !!row.thumbnailPath,
		faceDetails: rowToFaceDetails(row)
	}));
	return { assessments, demoMode: false };
};
