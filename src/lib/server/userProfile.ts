/**
 * User-editable profile (age, gender) for tailoring Picks for you.
 */
import { db } from '$lib/server/db';
import { userProfile } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export type Profile = { age: number; gender: 'male' | 'female' };

/** Get the user's edited profile if set. */
export function getUserProfile(userId: string): Profile | null {
	const rows = db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1).all();
	if (rows.length === 0) return null;
	const r = rows[0];
	if (r.profileGender !== 'male' && r.profileGender !== 'female') return null;
	return {
		age: r.profileAge,
		gender: r.profileGender as 'male' | 'female'
	};
}

/** Set or update the user's profile. Age 1–120, gender male/female. */
export function setUserProfile(
	userId: string,
	input: { age: number; gender: 'male' | 'female' }
): { ok: true } | { ok: false; error: string } {
	const age = Math.round(input.age);
	if (age < 1 || age > 120) return { ok: false, error: 'Age must be between 1 and 120' };
	if (input.gender !== 'male' && input.gender !== 'female') return { ok: false, error: 'Please choose male or female' };

	const existing = db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1).all();
	const now = new Date();
	if (existing.length > 0) {
		db.update(userProfile)
			.set({
				profileAge: age,
				profileGender: input.gender,
				updatedAt: now
			})
			.where(eq(userProfile.userId, userId))
			.run();
	} else {
		db.insert(userProfile)
			.values({
				userId,
				profileAge: age,
				profileGender: input.gender,
				updatedAt: now
			})
			.run();
	}
	return { ok: true };
}
