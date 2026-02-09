import type { Actions, PageServerLoad } from './$types';
import { getProductsForProfile } from '$lib/data/products';
import { db } from '$lib/server/db';
import { assessment } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { FaceDetails } from '$lib/types/skin';
import { getUserProfile, setUserProfile } from '$lib/server/userProfile';
import { fail } from '@sveltejs/kit';

function rowToFaceDetails(row: Record<string, unknown>): FaceDetails | undefined {
	const age = row.faceDetailsAge ?? row.face_details_age;
	const gender = row.faceDetailsGender ?? row.face_details_gender;
	if (age == null || (gender !== 'male' && gender !== 'female')) return undefined;
	return {
		age: Number(age),
		gender: gender as 'male' | 'female'
	};
}

/** Derive age and gender from the user's latest saved assessment that has face details. */
async function getProfileFromUserAssessments(userId: string): Promise<{ age: number; gender: 'male' | 'female' } | null> {
	const rows = await db
		.select()
		.from(assessment)
		.where(eq(assessment.userId, userId))
		.orderBy(desc(assessment.createdAt))
		.limit(50);
	for (const row of rows) {
		const fd = rowToFaceDetails(row);
		if (fd) return { age: fd.age, gender: fd.gender };
	}
	return null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	// When logged in: use edited profile first, then fall back to latest assessment face details
	if (locals.user) {
		const editedProfile = await getUserProfile(locals.user.id);
		if (editedProfile) {
			const profileProducts = getProductsForProfile(editedProfile.age, editedProfile.gender);
			return {
				age: editedProfile.age,
				gender: editedProfile.gender,
				hasProfile: true,
				profileProducts,
				profileSource: 'edited' as const,
				user: locals.user
			};
		}
		const assessedProfile = await getProfileFromUserAssessments(locals.user.id);
		if (assessedProfile) {
			const profileProducts = getProductsForProfile(assessedProfile.age, assessedProfile.gender);
			return {
				age: assessedProfile.age,
				gender: assessedProfile.gender,
				hasProfile: true,
				profileProducts,
				profileSource: 'saved' as const,
				user: locals.user
			};
		}
	}

	// Fallback: URL params (e.g. from results page link) or no profile
	const ageParam = url.searchParams.get('age');
	const genderParam = url.searchParams.get('gender');
	const age = ageParam ? parseInt(ageParam, 10) : null;
	const gender = genderParam === 'male' || genderParam === 'female' ? genderParam : null;
	const hasProfile = age != null && !Number.isNaN(age) && gender != null;
	const profileProducts = hasProfile ? getProductsForProfile(age, gender) : [];
	return {
		age: age ?? null,
		gender: gender ?? null,
		hasProfile: !!hasProfile,
		profileProducts,
		profileSource: hasProfile ? ('url' as const) : null,
		user: locals.user ?? null
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Sign in to update your profile' });
		const form = await event.request.formData();
		const ageParam = (form.get('profileAge') as string)?.trim() ?? '';
		const genderParam = (form.get('profileGender') as string)?.trim() ?? '';
		const age = ageParam ? parseInt(ageParam, 10) : NaN;
		const gender = genderParam === 'male' || genderParam === 'female' ? genderParam : null;
		if (Number.isNaN(age) || age < 1 || age > 120) {
			return fail(400, {
				message: 'Please enter an age between 1 and 120.',
				profileAge: ageParam,
				profileGender: genderParam
			});
		}
		if (!gender) {
			return fail(400, {
				message: 'Please choose male or female.',
				profileAge: ageParam,
				profileGender: genderParam
			});
		}
		const result = await setUserProfile(event.locals.user.id, { age, gender });
		if (!result.ok) return fail(400, { message: result.error, profileAge: ageParam, profileGender: genderParam });
		return { success: true, message: 'Profile updated.', profileAge: String(age), profileGender: gender };
	}
};
