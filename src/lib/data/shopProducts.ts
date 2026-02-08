/**
 * Sellable shop products (SKUs) – oils, serums, digital guides. Placeholder content for MVP.
 * Link from "Facial oil/serum" on how-to and product pages to /shop and /shop/[slug].
 */
import { FACIAL_SPA, SKINCARE_PRODUCT, BEAUTY_PRODUCTS } from './placeholderImages';

export interface ShopProduct {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	/** Display price e.g. "£24" */
	price: string;
	/** Numeric price for basket total (e.g. 24) */
	priceAmount: number;
	imageUrl: string;
	/** Optional second image for product page gallery */
	imageUrlSecondary?: string;
	/** Placeholder: capacity / size for display */
	quantityLabel?: string;
	/** Placeholder: in stock */
	inStock?: boolean;
}

export const shopProducts: ShopProduct[] = [
	{
		slug: 'facial-oil-serum',
		title: 'Facial oil / serum',
		shortDescription: 'Lightweight blend for face yoga and gua sha. Clean ingredients, no harsh additives.',
		description: `Our facial oil and serum is formulated to work with face yoga and gua sha. Lightweight and easily absorbed, it helps tools glide smoothly while nourishing skin.

**Ingredients (placeholder)**  
Jojoba, rosehip, vitamin E. No parabens, no synthetic fragrances.

**How to use**  
Apply a few drops before your face yoga or gua sha routine. Can also be used morning or evening as part of your skincare routine.

*This is placeholder content. Replace with your actual product details, ingredients and imagery when you launch.*`,
		price: '£24',
		priceAmount: 24,
		imageUrl: SKINCARE_PRODUCT,
		imageUrlSecondary: BEAUTY_PRODUCTS,
		quantityLabel: '30 ml',
		inStock: true
	},
	{
		slug: 'gua-sha-oil',
		title: 'Gua sha oil',
		shortDescription: 'Slippery, nourishing oil designed for gua sha and facial massage.',
		description: `A dedicated oil for gua sha and facial massage. Slippery enough for smooth strokes and rich enough to support skin.

**Ingredients (placeholder)**  
Apricot kernel, sunflower, calendula. Light scent.

**How to use**  
Apply to clean skin before gua sha. Use 4–6 drops for full face.

*Placeholder content. Update with your real product info.*`,
		price: '£18',
		priceAmount: 18,
		imageUrl: BEAUTY_PRODUCTS,
		quantityLabel: '50 ml',
		inStock: true
	},
	{
		slug: 'vitamin-c-serum',
		title: 'Vitamin C serum',
		shortDescription: 'Brightening serum with vitamin C. Works well after face yoga.',
		description: `A gentle vitamin C serum to support even tone and radiance. Designed to layer with your face yoga and gua sha routine.

**Ingredients (placeholder)**  
Vitamin C (ascorbic acid), hyaluronic acid, aloe. Suitable for most skin types.

**How to use**  
Apply after cleansing, before oil or moisturiser. Use in the morning for best results.

*Placeholder content.*`,
		price: '£22',
		priceAmount: 22,
		imageUrl: SKINCARE_PRODUCT,
		quantityLabel: '30 ml',
		inStock: true
	},
	{
		slug: 'face-yoga-guide',
		title: 'How to do your own face yoga',
		shortDescription: 'Full self-guided face yoga programme: exercises, sequences and routines. One-off purchase.',
		description: `A complete guide to doing face yoga on your own: warm-up, core exercises for eyes, cheeks, jaw and neck, and cool-down. Includes printable routines and tips for building a habit. Ideal if you can't make live classes or want to supplement them.

**What's included (placeholder)**  
PDF guide with exercises, short video demos, 3 ready-made routines, lifetime access.

*Placeholder content. Replace with your actual product details when you launch.*`,
		price: '£12',
		priceAmount: 12,
		imageUrl: FACIAL_SPA,
		quantityLabel: 'Digital',
		inStock: true
	}
];

/** Map programme/how-to product slug to shop product slug when the product is sold in the shop. */
export const productSlugToShopSlug: Record<string, string> = {
	'how-to-face-yoga': 'face-yoga-guide'
};

export function getShopProductBySlug(slug: string): ShopProduct | undefined {
	return shopProducts.find((p) => p.slug === slug);
}
