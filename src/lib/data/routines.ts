/** A wellbeing or face-care routine (wind-down, energise, sleep, etc.). */
export interface Routine {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	/** Optional step-by-step instructions (3–5 steps) for the routine page. */
	steps?: string[];
	/** Expression keys that suggest this routine (e.g. sad, fearful → wind-down). */
	suggestedByExpressions?: string[];
	/** Optional link to a wellbeing sub-page (e.g. sleep). */
	wellbeingSlug?: string;
}

export const routines: Routine[] = [
	{
		slug: 'wind-down',
		title: 'Wind-down routine',
		shortDescription: 'Gentle face massage, breathwork and relaxation to ease tension and support better sleep.',
		description:
			'A short evening routine to release facial tension, calm the nervous system and prepare for rest. Includes gua sha along jaw and temples, under-eye release and slow breathwork. Ideal when you feel tired or stressed.',
		steps: [
			'Sit comfortably. Take three slow breaths in through the nose and out through the mouth.',
			'Using a gua sha or clean fingers, sweep from the centre of the forehead out towards the temples (5–10 passes).',
			'Gently press along the jawline from chin to ear on each side. Then sweep under the cheekbones.',
			'Light under-eye taps or a cool spoon under the eyes for 30 seconds.',
			'Finish with 2 minutes of slow breathing: 4 counts in, 6 counts out.'
		],
		suggestedByExpressions: ['sad', 'fearful', 'angry', 'disgusted'],
		wellbeingSlug: 'sleep'
	},
	{
		slug: 'energise',
		title: 'Morning energise',
		shortDescription: 'Lymphatic drainage, cheek lift and circulation to wake up the face and boost radiance.',
		description:
			'Quick morning sequence: lymphatic sweep, cheek sculpting and under-eye drainage. Helps reduce puffiness and bring colour back. Great when you want to look and feel more awake.',
		steps: [
			'Start with clean hands. Apply a light serum or face oil if you use one.',
			'Lymphatic sweep: from the centre of the face out towards the ears and down the neck (10 passes).',
			'Cheek lift: press and lift along the cheekbones from nose to ear. Repeat 5 times each side.',
			'Under-eye drainage: gentle taps or light strokes from inner to outer corner.',
			'Finish with a few neck rolls and a splash of cool water if you like.'
		],
		suggestedByExpressions: ['neutral']
	},
	{
		slug: 'sleep-wellbeing',
		title: 'Sleep & wellbeing',
		shortDescription: 'Tips for better sleep and how it supports your skin and face.',
		description:
			'Sleep is when your skin repairs and regenerates. Poor sleep shows up as dullness, puffiness and faster signs of ageing. A consistent wind-down helps both your mind and your skin.\n\nSimple habits that help: dim the lights an hour before bed, avoid screens, keep the room cool and dark, and try a short face massage or gua sha as part of your evening routine. Face yoga and gua sha can ease tension so you fall asleep more easily—see our Wind-down routine and Sleep tips for more.',
		wellbeingSlug: 'sleep'
	},
	{
		slug: 'quick-refresh',
		title: 'Quick refresh',
		shortDescription: 'A 3–5 minute reset: circulation, breath and a quick face wake-up.',
		description:
			'When you need a quick pick-me-up without a full routine. Gentle tapping, a few stretches and breathwork to boost circulation and clarity. Fits into a work break or before an important call.',
		steps: [
			'Tap lightly across the forehead, cheeks and jaw for 1–2 minutes (like a light drumming).',
			'Roll the shoulders back 5 times, then drop them. Take 3 deep breaths.',
			'Press the acupressure point between the eyebrows (third eye) for 10 seconds, then release.',
			'Sweep from the centre of the face out towards the ears once or twice with light pressure.',
			'Finish with a smile and a stretch. You’re ready to go.'
		]
	},
	{
		slug: 'neck-release',
		title: 'Neck release',
		shortDescription: 'Release tension in the neck and jaw to support posture and a relaxed face.',
		description:
			'Tension in the neck and jaw often shows in the face as a tight jaw, headaches or a tired look. This short sequence eases the neck, stretches the platysma and supports a more open, relaxed expression. Pair with gua sha along the jaw for best results.',
		steps: [
			'Sit tall. Slowly tilt the head to the right, ear towards shoulder. Hold 15–20 seconds. Repeat left.',
			'Gently turn the head to look over each shoulder (hold 10 seconds each side).',
			'Chin tucks: draw the chin slightly back without tilting the head. Hold 5 seconds, release. Repeat 5 times.',
			'Using fingers or a gua sha, stroke down the sides of the neck from ear to collarbone (5–10 passes).',
			'Finish with a slow neck roll: drop chin to chest, then slowly circle once in each direction.'
		]
	}
];

export function getRoutineBySlug(slug: string): Routine | undefined {
	return routines.find((r) => r.slug === slug);
}

/** Dominant expression name from expressions object (e.g. "sad"). */
export function getDominantExpression(expressions: Record<string, number> | undefined): string | undefined {
	if (!expressions || Object.keys(expressions).length === 0) return undefined;
	const [name] = Object.entries(expressions).reduce((a, b) => (a[1] >= b[1] ? a : b));
	return name;
}

/**
 * Suggested routine based on dominant expression (e.g. tired/sad → wind-down).
 */
export function getRoutineForExpression(expressions: Record<string, number> | undefined): Routine | undefined {
	const dominant = getDominantExpression(expressions);
	if (!dominant) return undefined;
	return routines.find((r) => r.suggestedByExpressions?.includes(dominant));
}
