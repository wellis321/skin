import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { oneToOneBooking } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

function toICalEvent(
	id: string,
	start: Date,
	end: Date,
	summary: string,
	description: string
): string {
	const startStr = start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
	const endStr = end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Skin Assessment//One-to-one booking//EN',
		'BEGIN:VEVENT',
		'UID:' + id + '@skin-assessment-booking',
		'DTSTAMP:' + startStr,
		'DTSTART:' + startStr,
		'DTEND:' + endStr,
		'SUMMARY:' + summary.replace(/[,;\\]/g, '\\$&'),
		'DESCRIPTION:' + description.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n'),
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return lines.join('\r\n');
}

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id ?? '';
	const row = await db.select().from(oneToOneBooking).where(eq(oneToOneBooking.id, id)).limit(1);
	const booking = row[0];
	if (!booking) {
		throw error(404, 'Booking not found');
	}
	const start = booking.startAt instanceof Date ? booking.startAt : new Date(booking.startAt);
	const duration = booking.durationMinutes ?? 60;
	const end = new Date(start.getTime() + duration * 60 * 1000);
	const summary = 'One-to-one session – Skin Assessment';
	const description = `${duration}-minute one-to-one session. We'll send the Zoom link by email.`;
	const ical = toICalEvent(booking.id, start, end, summary, description);
	return new Response(ical, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="one-to-one-booking.ics"'
		}
	});
};
