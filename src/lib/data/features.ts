/**
 * App features presented as products for sign-up. Update as you add features.
 */
export interface FeatureProduct {
	id: string;
	title: string;
	shortDescription: string;
	benefits: string[];
	/** Primary CTA: 'sign-up' | 'assess' */
	cta: 'sign-up' | 'assess';
}

export const features: FeatureProduct[] = [
	{
		id: 'skin-analysis',
		title: 'Skin analysis',
		shortDescription: 'Upload or take a photo and get personalised scores and feedback in seconds.',
		benefits: [
			'Overall score plus wrinkles and spots (0–100)',
			'What’s working and what needs attention',
			'Clear recommendations and product suggestions',
			'No account needed for a one-off assessment'
		],
		cta: 'assess'
	},
	{
		id: 'progress-tracking',
		title: 'Track your progress',
		shortDescription: 'Save assessments and see how your skin scores change over time.',
		benefits: [
			'Line chart of your overall score over time',
			'Trend: improving, stable or declining',
			'All saved assessments in one place',
			'Your data, private to you'
		],
		cta: 'sign-up'
	},
	{
		id: 'compare',
		title: 'Compare two assessments',
		shortDescription: 'Pick any two saved assessments and see score changes side by side.',
		benefits: [
			'Side-by-side images and score tables',
			'Overall, wrinkles and spots: earlier vs later',
			'Time between assessments (e.g. 2 weeks)',
			'Detail breakdown (forehead, crow’s feet, blemishes, etc.) when available'
		],
		cta: 'sign-up'
	},
	{
		id: 'recommendations',
		title: 'Personalised recommendations',
		shortDescription: 'Get tailored advice and product suggestions based on your scores.',
		benefits: [
			'What’s working and what to focus on',
			'Face yoga, workshops and one-to-one programmes',
			'Linked from your results and the Products page'
		],
		cta: 'assess'
	},
	{
		id: 'picks-for-you',
		title: 'Picks for you',
		shortDescription: 'Products suggested for your age and profile, based on your assessment.',
		benefits: [
			'Filtered by age and often chosen by people with similar skin',
			'Labels like "For your age" and "Often chosen by people with similar skin"',
			'Accessible from nav, progress page and results'
		],
		cta: 'assess'
	},
	{
		id: 'face-details',
		title: 'Face details (optional)',
		shortDescription: 'Optional age, gender and expression estimates from your photo.',
		benefits: [
			'Shown only if you choose to reveal them on results',
			'Saved with assessments so you can compare over time',
			'Used to suggest routines (e.g. wind-down) and personalised picks'
		],
		cta: 'assess'
	},
	{
		id: 'routines-wellbeing',
		title: 'Routines and wellbeing',
		shortDescription: 'Wind-down and energise routines, plus sleep and wellbeing tips.',
		benefits: [
			'Routines suggested by your expression (e.g. tired → wind-down)',
			'Routines and wellbeing pages with placeholder content to expand',
			'Links from results and nav'
		],
		cta: 'assess'
	},
	{
		id: 'booking-classes',
		title: 'Online class booking',
		shortDescription: 'See upcoming face yoga and one-to-one sessions; book and add to your calendar.',
		benefits: [
			'Upcoming classes on product pages and the Book a class page',
			'Book a place; add to calendar via iCal feed or .ics download',
			'Optional reminders (browser notifications) for classes you book'
		],
		cta: 'assess'
	}
];
