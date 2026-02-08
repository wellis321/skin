/**
 * Themed placeholder image URLs (Unsplash) for skin assessment, face yoga, gua sha, and wellness.
 * All free to use under the Unsplash License. Format: auto=format&fit=crop&q=80.
 */
const UNSPLASH_BASE = 'https://images.unsplash.com';

function unsplash(photoId: string, w: number = 800): string {
	return `${UNSPLASH_BASE}/photo-${photoId}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Woman applying lotion to face – skincare, wellness, self-care */
export const SKINCARE_LOTION = unsplash('1693004927824-f2623bbedc8b');
/** Steam facial massage at spa – beauty, facial treatment */
export const FACIAL_SPA = unsplash('1717160675158-fdd75b8595cf');
/** Woman holding gua sha / green tool – gua sha, facial tool */
export const GUA_SHA_TOOL = unsplash('1643379855889-850035817d24');
/** Skincare product (lotion tube) – skincare, beauty */
export const SKINCARE_PRODUCT = unsplash('1688380353667-a6d3ddb85600');
/** Bottle and ornament – beauty, cosmetics */
export const BEAUTY_PRODUCTS = unsplash('1600428877878-1a0fd85beda8');
/** Woman with object near face – facial, skincare context */
export const FACE_CARE = unsplash('1643379855122-3d3162b56a99');

/** Hero/wide images (existing themed hero URLs in the app) */
export const HERO_SHOP = unsplash('1612817159949-195b6eb9e31a', 1920);
export const HERO_FOR_YOU = unsplash('1598440947619-2c35fc9aa908', 1920);
export const HERO_BOOK = unsplash('1544367567-0f2fcb009e0b', 1920);

/** Get a themed image by key for variety (e.g. for feature sections). */
const THEMED_POOL: string[] = [
	SKINCARE_LOTION,
	FACIAL_SPA,
	GUA_SHA_TOOL,
	SKINCARE_PRODUCT,
	BEAUTY_PRODUCTS,
	FACE_CARE
];

export function getThemedImage(index: number, width: number = 800): string {
	const id = THEMED_POOL[index % THEMED_POOL.length];
	// Reconstruct with desired width (pool uses 800 by default)
	const match = id.match(/photo-(\d+-\w+)\?/);
	if (match) return unsplash(match[1], width);
	return id;
}

/** Themed image for "map" or location (calm wellness vibe – reuse spa). */
export const PLACEHOLDER_MAP = unsplash('1544367567-0f2fcb009e0b', 400);
