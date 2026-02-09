import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	user,
	assessment,
	oneToOneBooking,
	productInterest,
	classInterest
} from '$lib/server/db/schema';
import { eq, desc, and, count, gte } from 'drizzle-orm';
import { getUserProfile, setUserProfile } from '$lib/server/userProfile';
import { fail } from '@sveltejs/kit';
import type { FaceDetails } from '$lib/types/skin';

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

export const load: PageServerLoad = async ({ parent, locals }) => {
	await parent(); // ensure layout ran (user is set)
	const userId = locals.user!.id;

	const [editedProfile, assessedProfile] = await Promise.all([
		getUserProfile(userId),
		getProfileFromUserAssessments(userId)
	]);
	const age = editedProfile?.age ?? assessedProfile?.age ?? null;
	const gender = editedProfile?.gender ?? assessedProfile?.gender ?? null;
	const hasProfile = age != null && gender != null;

	// Activity counts (for overview)
	const now = new Date();
	const [assessmentsRows, bookingsRows, productInterestRows, classInterestRows] = await Promise.all([
		db.select({ count: count() }).from(assessment).where(eq(assessment.userId, userId)),
		db
			.select({ count: count() })
			.from(oneToOneBooking)
			.where(
				and(eq(oneToOneBooking.userId, userId), gte(oneToOneBooking.startAt, now))
			),
		db.select({ count: count() }).from(productInterest).where(eq(productInterest.userId, userId)),
		db.select({ count: count() }).from(classInterest).where(eq(classInterest.userId, userId))
	]);
	const assessmentsResult = assessmentsRows[0];
	const bookingsResult = bookingsRows[0];
	const productInterestResult = productInterestRows[0];
	const classInterestResult = classInterestRows[0];

	return {
		user: locals.user,
		email: locals.user!.email,
		age,
		gender,
		hasProfile,
		profileSource: editedProfile ? ('edited' as const) : assessedProfile ? ('saved' as const) : null,
		assessmentsCount: assessmentsResult?.count ?? 0,
		upcomingBookingsCount: bookingsResult?.count ?? 0,
		productInterestsCount: productInterestResult?.count ?? 0,
		classInterestsCount: classInterestResult?.count ?? 0
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
	},

	updatePassword: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Sign in to change your password' });
		const form = await event.request.formData();
		const currentPassword = (form.get('currentPassword') as string) ?? '';
		const newPassword = (form.get('newPassword') as string) ?? '';
		const confirmPassword = (form.get('confirmPassword') as string) ?? '';

		if (!currentPassword) return fail(400, { message: 'Enter your current password.' });
		if (newPassword.length < 8) return fail(400, { message: 'New password must be at least 8 characters.' });
		if (newPassword !== confirmPassword) return fail(400, { message: 'New password and confirmation do not match.' });

		const supabase = event.locals.supabase;
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: event.locals.user.email,
			password: currentPassword
		});
		if (signInError) return fail(400, { message: 'Current password is incorrect.' });

		const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
		if (updateError) return fail(400, { message: updateError.message || 'Failed to update password.' });
		return { success: true, message: 'Password updated. Use your new password next time you sign in.' };
	},

	updateEmail: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Sign in to change your email' });
		const form = await event.request.formData();
		const newEmail = (form.get('newEmail') as string)?.trim().toLowerCase() ?? '';
		const password = (form.get('password') as string) ?? '';

		if (!newEmail) return fail(400, { message: 'Enter a new email address.', newEmail: '' });
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return fail(400, { message: 'Please enter a valid email address.', newEmail });
		if (newEmail === event.locals.user.email) return fail(400, { message: 'New email is the same as your current one.', newEmail });
		if (!password) return fail(400, { message: 'Enter your current password to confirm.', newEmail });

		const supabase = event.locals.supabase;
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: event.locals.user.email,
			password
		});
		if (signInError) return fail(400, { message: 'Password is incorrect.', newEmail });

		const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });
		if (updateError) {
			if (updateError.message.includes('already')) return fail(409, { message: 'An account with this email already exists.', newEmail });
			return fail(400, { message: updateError.message || 'Failed to update email.', newEmail });
		}
		await db.update(user).set({ email: newEmail }).where(eq(user.id, event.locals.user!.id));
		return { success: true, message: 'Check your new email to confirm the change. You may need to sign in again.', newEmail };
	}
};
