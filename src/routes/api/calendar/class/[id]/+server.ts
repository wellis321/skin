import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGroupClassById } from '$lib/server/groupClasses';

function singleEventICal(
	id: string,
	title: string,
	start: string,
	end: string,
	description: string,
	url: string | undefined
): string {
	const startStr = start.replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
	const endStr = end.replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z';
	const summary = (title || 'Class').replace(/[,;\\]/g, '\\$&');
	const desc = (description || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Skin Assessment//Online class//EN',
		'BEGIN:VEVENT',
		'UID:' + id + '@skin-assessment-class',
		'DTSTAMP:' + startStr,
		'DTSTART:' + startStr,
		'DTEND:' + endStr,
		'SUMMARY:' + summary,
		'DESCRIPTION:' + desc,
		...(url ? ['URL:' + url] : []),
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return lines.join('\r\n');
}

export const GET: RequestHandler = async ({ params, url }) => {
	const id = params.id ?? '';
	const classItem = await getGroupClassById(id);
	if (!classItem) {
		throw error(404, 'Class not found');
	}
	const baseUrl = url.origin;
	const bookingUrl = classItem.bookingUrl
		? (classItem.bookingUrl.startsWith('http') ? classItem.bookingUrl : baseUrl + classItem.bookingUrl)
		: undefined;
	const ical = singleEventICal(
		classItem.id,
		classItem.title,
		classItem.start,
		classItem.end,
		classItem.description ?? '',
		bookingUrl
	);
	return new Response(ical, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="class-' + id + '.ics"'
		}
	});
};
