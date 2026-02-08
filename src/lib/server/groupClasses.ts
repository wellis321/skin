/**
 * Admin-managed group classes / events. Replaces static list from $lib/data/classes.
 */
import { db } from '$lib/server/db';
import { groupClass } from '$lib/server/db/schema';
import { eq, gte, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export type OnlineClass = {
	id: string;
	productSlug: string;
	title: string;
	start: string;
	end: string;
	description?: string;
	maxAttendees?: number;
	bookingUrl?: string;
};

function toISOString(v: Date | number | null | undefined): string {
	if (v == null) return new Date(0).toISOString();
	if (typeof v === 'number') return new Date(v).toISOString();
	return v.toISOString();
}

function rowToClass(row: {
	id: string;
	title: string;
	productSlug: string;
	startAt: Date | number;
	endAt: Date | number;
	description: string | null;
	maxAttendees: number | null;
	bookingUrl: string | null;
}): OnlineClass {
	return {
		id: row.id,
		title: row.title,
		productSlug: row.productSlug,
		start: toISOString(row.startAt),
		end: toISOString(row.endAt),
		description: row.description ?? undefined,
		maxAttendees: row.maxAttendees ?? undefined,
		bookingUrl: row.bookingUrl ?? `/book?class=${encodeURIComponent(row.id)}`
	};
}

/** All group classes from DB, ordered by start (for admin calendar). */
export function getGroupClasses(): OnlineClass[] {
	const rows = db.select().from(groupClass).orderBy(asc(groupClass.startAt)).all();
	return rows.map(rowToClass);
}

/** Upcoming group classes (end >= now), for book page and public API. */
export function getUpcomingGroupClasses(): OnlineClass[] {
	const now = new Date();
	const rows = db
		.select()
		.from(groupClass)
		.where(gte(groupClass.endAt, now))
		.orderBy(asc(groupClass.startAt))
		.all();
	return rows.map(rowToClass);
}

/** One class by id. */
export function getGroupClassById(id: string): OnlineClass | null {
	const rows = db.select().from(groupClass).where(eq(groupClass.id, id)).limit(1).all();
	if (rows.length === 0) return null;
	return rowToClass(rows[0]);
}

export type CreateGroupClassInput = {
	title: string;
	productSlug: string;
	startAt: Date;
	endAt: Date;
	description?: string;
	maxAttendees?: number;
	bookingUrl?: string;
};

export async function createGroupClassInDb(input: CreateGroupClassInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
	const title = input.title.trim();
	const productSlug = input.productSlug.trim().toLowerCase();
	if (!title) return { ok: false, error: 'Title is required' };
	if (!productSlug) return { ok: false, error: 'Product slug is required' };
	if (input.startAt >= input.endAt) return { ok: false, error: 'End must be after start' };

	const id = randomUUID();
	const now = new Date();
	const description = input.description?.trim() || null;
	const maxAttendees = input.maxAttendees ?? null;
	const bookingUrl = input.bookingUrl?.trim() || null;

	await db.insert(groupClass).values({
		id,
		title,
		productSlug,
		startAt: input.startAt,
		endAt: input.endAt,
		description,
		maxAttendees,
		bookingUrl,
		createdAt: now
	});
	return { ok: true, id };
}

export type UpdateGroupClassInput = {
	title: string;
	productSlug: string;
	startAt: Date;
	endAt: Date;
	description?: string;
	maxAttendees?: number;
	bookingUrl?: string;
};

export function updateGroupClassInDb(
	id: string,
	input: UpdateGroupClassInput
): { ok: true } | { ok: false; error: string } {
	const existing = db.select().from(groupClass).where(eq(groupClass.id, id)).limit(1).all();
	if (existing.length === 0) return { ok: false, error: 'Class not found' };

	const title = input.title.trim();
	const productSlug = input.productSlug.trim().toLowerCase();
	if (!title) return { ok: false, error: 'Title is required' };
	if (!productSlug) return { ok: false, error: 'Product slug is required' };
	if (input.startAt >= input.endAt) return { ok: false, error: 'End must be after start' };

	db.update(groupClass)
		.set({
			title,
			productSlug,
			startAt: input.startAt,
			endAt: input.endAt,
			description: input.description?.trim() || null,
			maxAttendees: input.maxAttendees ?? null,
			bookingUrl: input.bookingUrl?.trim() || null
		})
		.where(eq(groupClass.id, id))
		.run();
	return { ok: true };
}

export function deleteGroupClassInDb(id: string): { ok: true } | { ok: false; error: string } {
	const existing = db.select().from(groupClass).where(eq(groupClass.id, id)).limit(1).all();
	if (existing.length === 0) return { ok: false, error: 'Class not found' };
	db.delete(groupClass).where(eq(groupClass.id, id)).run();
	return { ok: true };
}
