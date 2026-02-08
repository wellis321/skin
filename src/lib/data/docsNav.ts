/**
 * Documentation wiki navigation. Update this as you add or rename doc pages.
 */
export interface DocLink {
	title: string;
	href: string;
}

export const docsNav: DocLink[] = [
	{ title: 'Overview', href: '/docs' },
	{ title: 'User guide', href: '/docs/user-guide' },
	{ title: 'Features (technical)', href: '/docs/features' },
	{ title: 'Scores and metrics', href: '/docs/scores-and-metrics' },
	{ title: 'Face detection and regions', href: '/docs/face-detection' },
	{ title: 'Booking, calendar and notifications', href: '/docs/notifications' },
	{ title: 'Data and privacy', href: '/docs/data-and-privacy' },
	{ title: 'Changelog', href: '/docs/changelog' }
];
