import type { RequestHandler } from './$types';
import { getUpcomingGroupClasses } from '$lib/server/groupClasses';
import type { OnlineClass } from '$lib/server/groupClasses';

/** Generate iCal (RFC 5545) content for upcoming classes so users can subscribe in calendar apps. */
function toICal(classes: OnlineClass[]): string {
	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Skin Assessment//Online classes//EN',
		'CALSCALE:GREGORIAN',
		'X-WR-CALNAME:Skin Assessment – Online classes'
	];
	for (const c of classes) {
		const start = c.start.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
		const end = c.end.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
		const summary = (c.title || 'Class').replace(/[,;\\]/g, '\\$&');
		const desc = (c.description || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
		lines.push(
			'BEGIN:VEVENT',
			'UID:' + c.id + '@skin-assessment',
			'DTSTAMP:' + start,
			'DTSTART:' + start,
			'DTEND:' + end,
			'SUMMARY:' + summary,
			'DESCRIPTION:' + desc,
			c.bookingUrl ? 'URL:' + c.bookingUrl : '',
			'END:VEVENT'
		);
	}
	lines.push('END:VCALENDAR');
	return lines.filter(Boolean).join('\r\n');
}

export const GET: RequestHandler = async () => {
	let classes: OnlineClass[];
	try {
		classes = await getUpcomingGroupClasses();
	} catch (err) {
		console.error('api/calendar/ical: getUpcomingGroupClasses failed', err);
		classes = [];
	}
	const ical = toICal(classes);
	return new Response(ical, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="skin-assessment-classes.ics"'
		}
	});
};
