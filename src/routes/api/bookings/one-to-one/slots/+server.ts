import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { oneToOneBooking } from '$lib/server/db/schema';
import { and, gte, lt } from 'drizzle-orm';

const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 17;

function generateSlotsForDate(dateStr: string, durationMinutes: number): string[] {
	const date = new Date(dateStr + 'T00:00:00Z');
	const day = date.getUTCDay();
	if (day === 0 || day === 6) return [];
	const slots: string[] = [];
	const step = durationMinutes;
	for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour++) {
		for (let min = 0; min < 60; min += step) {
			if (hour * 60 + min + durationMinutes > SLOT_END_HOUR * 60) break;
			const start = new Date(date);
			start.setUTCHours(hour, min, 0, 0);
			slots.push(start.toISOString());
		}
	}
	return slots;
}

export const GET: RequestHandler = async ({ url }) => {
	const dateParam = url.searchParams.get('date');
	const durationParam = url.searchParams.get('duration');
	if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
		return json({ error: 'Invalid or missing date (use YYYY-MM-DD)' }, { status: 400 });
	}
	const duration = durationParam === '60' ? 60 : durationParam === '30' ? 30 : null;
	if (duration === null) {
		return json({ error: 'Invalid or missing duration (use 30 or 60)' }, { status: 400 });
	}

	const dayStart = new Date(dateParam + 'T00:00:00Z');
	const dayEnd = new Date(dayStart);
	dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

	const booked = await db
		.select({ startAt: oneToOneBooking.startAt, durationMinutes: oneToOneBooking.durationMinutes })
		.from(oneToOneBooking)
		.where(and(gte(oneToOneBooking.startAt, dayStart), lt(oneToOneBooking.startAt, dayEnd)));

	const bookedRanges = booked.map((b) => {
		const start = b.startAt instanceof Date ? b.startAt.getTime() : new Date(b.startAt).getTime();
		const dur = b.durationMinutes ?? 60;
		return { start, end: start + dur * 60 * 1000 };
	});

	const allSlots = generateSlotsForDate(dateParam, duration);
	const now = Date.now();
	const available = allSlots.filter((slotStr) => {
		const slotStart = new Date(slotStr).getTime();
		const slotEnd = slotStart + duration * 60 * 1000;
		const overlaps = bookedRanges.some(
			(r) =>
				(slotStart >= r.start && slotStart < r.end) ||
				(slotEnd > r.start && slotEnd <= r.end) ||
				(slotStart <= r.start && slotEnd >= r.end)
		);
		return !overlaps && slotStart >= now;
	});

	return json({ slots: available });
};
