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

/** Normalise DB row (camelCase or snake_case from Postgres) to OnlineClass. */
function rowToClass(row: Record<string, unknown>): OnlineClass {
	const id = String(row.id ?? '');
	const title = String(row.title ?? '');
	const productSlug = String(row.productSlug ?? row.product_slug ?? '');
	const startAt = row.startAt ?? row.start_at;
	const endAt = row.endAt ?? row.end_at;
	const description = row.description;
	const maxAttendees = row.maxAttendees ?? row.max_attendees;
	const bookingUrl = row.bookingUrl ?? row.booking_url;
	return {
		id,
		title,
		productSlug,
		start: toISOString(startAt as Date | number | null),
		end: toISOString(endAt as Date | number | null),
		description: description != null ? String(description) : undefined,
		maxAttendees: typeof maxAttendees === 'number' ? maxAttendees : undefined,
		bookingUrl: typeof bookingUrl === 'string' && bookingUrl ? bookingUrl : `/book?class=${encodeURIComponent(id)}`
	};
}

/** All group classes from DB, ordered by start (for admin calendar). */
export async function getGroupClasses(): Promise<OnlineClass[]> {
	const rows = await db.select().from(groupClass).orderBy(asc(groupClass.startAt));
	return rows.map(rowToClass);
}

/** Upcoming group classes (end >= now), for book page and public API. */
export async function getUpcomingGroupClasses(): Promise<OnlineClass[]> {
	const now = new Date();
	const rows = await db
		.select()
		.from(groupClass)
		.where(gte(groupClass.endAt, now))
		.orderBy(asc(groupClass.startAt));
	return rows.map(rowToClass);
}

/** One class by id. */
export async function getGroupClassById(id: string): Promise<OnlineClass | null> {
	const rows = await db.select().from(groupClass).where(eq(groupClass.id, id)).limit(1);
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

export async function updateGroupClassInDb(
	id: string,
	input: UpdateGroupClassInput
): Promise<{ ok: true } | { ok: false; error: string }> {
	const existing = await db.select().from(groupClass).where(eq(groupClass.id, id)).limit(1);
	if (existing.length === 0) return { ok: false, error: 'Class not found' };

	const title = input.title.trim();
	const productSlug = input.productSlug.trim().toLowerCase();
	if (!title) return { ok: false, error: 'Title is required' };
	if (!productSlug) return { ok: false, error: 'Product slug is required' };
	if (input.startAt >= input.endAt) return { ok: false, error: 'End must be after start' };

	await db
		.update(groupClass)
		.set({
			title,
			productSlug,
			startAt: input.startAt,
			endAt: input.endAt,
			description: input.description?.trim() || null,
			maxAttendees: input.maxAttendees ?? null,
			bookingUrl: input.bookingUrl?.trim() || null
		})
		.where(eq(groupClass.id, id));
	return { ok: true };
}

export async function deleteGroupClassInDb(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
	const existing = await db.select().from(groupClass).where(eq(groupClass.id, id)).limit(1);
	if (existing.length === 0) return { ok: false, error: 'Class not found' };
	await db.delete(groupClass).where(eq(groupClass.id, id));
	return { ok: true };
}
