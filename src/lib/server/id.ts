import { randomBytes } from 'node:crypto';

/** Generate a short random ID (e.g. for assessments, bookings). */
export function generateId(length = 15): string {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	const bytes = randomBytes(length);
	let id = '';
	for (let i = 0; i < length; i++) {
		id += chars[bytes[i]! % chars.length];
	}
	return id;
}
