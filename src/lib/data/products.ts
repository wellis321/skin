import { FACIAL_SPA, FACE_CARE, GUA_SHA_TOOL, SKINCARE_LOTION } from './placeholderImages';

/** Optional age range [min, max] in years for "for your age" targeting. */
export type AgeRange = [number, number];

/** You'll need item: plain label or label + link (internal or affiliate). Use url for profit (own shop, Amazon affiliate, etc.). */
export type YouNeedItem =
	| string
	| { label: string; url: string; /** Set for affiliate links (opens in new tab, rel=sponsored). */ affiliate?: boolean };

/** Programme (class, one-to-one, workshop) or how-to guide. */
export type ProductType = 'programme' | 'how-to';

/** How-to tier: free or paid. */
export type HowToTier = 'free' | 'paid';

export interface Product {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	price?: string;
	imageUrl: string;
	/** Programme (default) or how-to guide. */
	productType?: ProductType;
	/** For how-to only: free or paid. */
	tier?: HowToTier;
	themes?: string[];
	includes?: string[];
	youNeed?: YouNeedItem[];
	benefits?: string[];
	/** Suggested for users in this age range (e.g. [30, 45]). */
	ageRange?: AgeRange;
	/** Often chosen by this gender when set. */
	forGender?: 'male' | 'female';
	/** Structure/gravity concern for Picks and recommendations (jaw/neck, mid-face, full face). */
	structureConcern?: 'jaw' | 'midface' | 'fullface';
}

export const products: Product[] = [
	{
		slug: 'face-yoga',
		title: 'Weekly Online Group Workshops',
		shortDescription: 'Face yoga with live coaching, personalised feedback and a supportive community. £20 per 45-min session.',
		description:
			'Live coaching with corrections and tailored variations. Includes warm-up, cool-down, posture and relaxation. Step-by-step learning, personalised feedback and a supportive community. 6–8 sessions recommended to master techniques.',
		price: '£20 (45 mins)',
		imageUrl: FACIAL_SPA,
		themes: [
			'Full face rejuvenation',
			'Strong eyelids, toned cheeks',
			'Radiant eyes + smooth forehead',
			'Happy smile & rounded cheeks',
			'Sculpted chin/neck',
			'Relaxation & stress release'
		],
		// Add &tag=YOUR_AMAZON_ASSOCIATE_TAG to affiliate URLs to earn from qualifying purchases
		youNeed: [
			{ label: 'Yoga mat', url: 'https://www.amazon.co.uk/s?k=yoga+mat', affiliate: true },
			{ label: 'Facial oil/serum', url: '/shop/facial-oil-serum', affiliate: false },
			{ label: 'Gua sha tool', url: 'https://www.amazon.co.uk/s?k=gua+sha+tool', affiliate: true }
		],
		ageRange: [25, 55],
		forGender: 'female'
	},
	{
		slug: 'one-to-one',
		title: 'One-to-One Zoom Programme',
		shortDescription: '4 x 45 mins over 1 month. Tailored support, custom exercises and progress reviews for noticeable lift, tone and radiance.',
		description:
			'Tailored support with sample products and worksheets. Noticeable lift, tone and radiance. Build routines you can maintain yourself. Each session includes warm-up, cool-down, posture work and holistic lifestyle advice (sleep, stress, nutrition, supplements).',
		price: '4 x 45 mins over 1 month',
		imageUrl: SKINCARE_LOTION,
		includes: [
			'Personal consultation',
			'Weekly live sessions',
			'Custom exercises & tools',
			'Progress reviews',
			'WhatsApp/email support'
		],
		ageRange: [30, 60]
	},
	{
		slug: 'sculpted-chin',
		title: 'Sculpted Chin / Neck – Beyond Gravity',
		shortDescription: 'Focus on jawline, double chin and neck tone. Neck stretches, platysma toning, gua sha sculpting and lymph drainage.',
		description:
			'Method: Neck stretches, platysma toning, gua sha sculpting, lymph drainage. Benefits: Defined jaw, smoother neck, reduced sagging, improved posture.',
		imageUrl: GUA_SHA_TOOL,
		benefits: ['Defined jaw', 'Smoother neck', 'Reduced sagging', 'Improved posture'],
		structureConcern: 'jaw'
	},
	{
		slug: 'radiant-eyes',
		title: 'Radiant Eyes & Cheeks – Beyond Glow',
		shortDescription: 'Mid-face rejuvenation and circulation. Cheek sculpting, lymph drainage, under-eye release and breathwork.',
		description:
			'Method: Cheek sculpting, lymph drainage, under-eye release, breathwork. Benefits: Reduced puffiness, colour return, lifted cheeks, youthful energy.',
		imageUrl: FACE_CARE,
		benefits: ['Reduced puffiness', 'Colour return', 'Lifted cheeks', 'Youthful energy'],
		ageRange: [28, 50],
		forGender: 'female',
		structureConcern: 'midface'
	},
	{
		slug: 'full-face',
		title: 'Full Face Rejuvenation – Beyond Renewal',
		shortDescription: 'Complete shoulders-up workout and relaxation. Face yoga, gua sha, lymphatic sweep, acupressure and posture reset.',
		description:
			'Method: Face yoga, gua sha, lymphatic sweep, acupressure, posture reset. Benefits: Tone, lift, circulation, glow, tension release.',
		imageUrl: FACIAL_SPA,
		benefits: ['Tone', 'Lift', 'Circulation', 'Glow', 'Tension release'],
		ageRange: [25, 65],
		structureConcern: 'fullface'
	},
	// How-to guides (tiered: some free, some paid)
	{
		slug: 'how-to-gua-sha',
		productType: 'how-to',
		tier: 'free',
		title: 'How to do gua sha',
		shortDescription: 'Step-by-step guide to facial gua sha: strokes, pressure, and order for sculpting and lymph drainage. Free.',
		description:
			'Learn the basics of facial gua sha: how to hold the tool, which strokes to use, and in what order. Covers jawline, cheeks, under-eyes and forehead. Includes tips on pressure and frequency. Perfect before joining a live class or to practise at home.',
		price: 'Free',
		imageUrl: GUA_SHA_TOOL,
		youNeed: [
			{ label: 'Gua sha tool', url: 'https://www.amazon.co.uk/s?k=gua+sha+tool', affiliate: true },
			{ label: 'Facial oil/serum', url: '/shop/facial-oil-serum', affiliate: false }
		],
		benefits: ['Clear technique', 'Safe pressure', 'Better results', 'Do it at home']
	},
	{
		slug: 'how-to-face-yoga',
		productType: 'how-to',
		tier: 'paid',
		title: 'How to do your own face yoga',
		shortDescription: 'Full self-guided face yoga programme: exercises, sequences and routines. One-off purchase.',
		description:
			'A complete guide to doing face yoga on your own: warm-up, core exercises for eyes, cheeks, jaw and neck, and cool-down. Includes printable routines and tips for building a habit. Ideal if you can’t make live classes or want to supplement them.',
		price: '£12',
		imageUrl: SKINCARE_LOTION,
		includes: ['PDF guide with exercises', 'Short video demos', '3 ready-made routines', 'Lifetime access'],
		youNeed: [
			'Mirror (optional)',
			{ label: 'Facial oil/serum', url: '/shop/facial-oil-serum', affiliate: false }
		],
		benefits: ['Learn at your pace', 'Replay anytime', 'No schedule needed', 'Works with live classes']
	}
];

/** Whether age falls within product's age range (inclusive). */
function ageInRange(age: number, range: AgeRange): boolean {
	return age >= range[0] && age <= range[1];
}

/**
 * Products that match the user's profile (age and/or gender).
 * When age >= 35, structure/gravity products (structureConcern) are prioritised for "planning against sagging and aging".
 */
export function getProductsForProfile(age: number, gender: 'male' | 'female'): Product[] {
	const filtered = products.filter((p) => {
		const ageMatch = !p.ageRange || ageInRange(age, p.ageRange);
		const genderMatch = !p.forGender || p.forGender === gender;
		return ageMatch && genderMatch;
	});
	if (age >= 35) {
		return [...filtered].sort((a, b) => {
			const aStruct = a.structureConcern ? 1 : 0;
			const bStruct = b.structureConcern ? 1 : 0;
			return bStruct - aStruct;
		});
	}
	return filtered;
}

/** First N products for profile, for "picks for you" sections. */
export function getProductsForProfileSlice(age: number, gender: 'male' | 'female', limit: number): Product[] {
	return getProductsForProfile(age, gender).slice(0, limit);
}

export function getProductBySlug(slug: string): Product | undefined {
	return products.find((p) => p.slug === slug);
}

/** Programmes only (classes, one-to-one, workshops). Excludes how-to guides. */
export function getProgrammes(): Product[] {
	return products.filter((p) => (p.productType ?? 'programme') === 'programme');
}

/** How-to guides only. Can be filtered by tier. */
export function getHowToGuides(tier?: HowToTier): Product[] {
	const list = products.filter((p) => p.productType === 'how-to');
	if (tier) return list.filter((p) => p.tier === tier);
	return list;
}
