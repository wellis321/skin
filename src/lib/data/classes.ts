/**
 * Upcoming online classes/sessions. In production these would come from a CMS or booking system.
 */
export interface OnlineClass {
	id: string;
	productSlug: string;
	title: string;
	/** ISO date-time (e.g. 2025-03-15T10:00:00Z) */
	start: string;
	/** ISO date-time */
	end: string;
	description?: string;
	/** Max attendees; optional */
	maxAttendees?: number;
	/** Booking URL (e.g. external booking system or /book/[id]) */
	bookingUrl?: string;
}

/** Sample upcoming classes for MVP. Replace with API/CMS later. */
function generateUpcoming(): OnlineClass[] {
	const now = new Date();
	const classes: OnlineClass[] = [];
	const products = ['face-yoga', 'face-yoga', 'one-to-one', 'face-yoga'];
	const titles = [
		'Weekly face yoga – Full face rejuvenation',
		'Weekly face yoga – Relaxation & stress release',
		'One-to-one intro slot',
		'Weekly face yoga – Radiant eyes & cheeks'
	];
	for (let i = 0; i < 8; i++) {
		const d = new Date(now);
		d.setDate(d.getDate() + 7 * (i + 1));
		d.setHours(10, 0, 0, 0);
		const end = new Date(d);
		end.setMinutes(45);
		classes.push({
			id: `class-${i + 1}`,
			productSlug: products[i % products.length],
			title: titles[i % titles.length],
			start: d.toISOString(),
			end: end.toISOString(),
			description: '45-minute live online session. Book to receive the Zoom link.',
			maxAttendees: 12,
			bookingUrl: '/book?class=' + encodeURIComponent(`class-${i + 1}`)
		});
	}
	return classes;
}

let cached: OnlineClass[] | null = null;

export function getUpcomingClasses(): OnlineClass[] {
	if (!cached) cached = generateUpcoming();
	return cached;
}

export function getUpcomingClassesForProduct(productSlug: string): OnlineClass[] {
	return getUpcomingClasses().filter((c) => c.productSlug === productSlug);
}

export function getClassById(id: string): OnlineClass | undefined {
	return getUpcomingClasses().find((c) => c.id === id);
}
