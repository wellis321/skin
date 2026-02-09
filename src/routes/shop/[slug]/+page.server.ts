import type { PageServerLoad } from './$types';
import { getMergedShopProductBySlug, getShopProductSource } from '$lib/server/shopProducts';
import { getShopProductBySlug as getStaticBySlug } from '$lib/data/shopProducts';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	let product;
	let productSource: 'db' | 'static' | null = null;
	try {
		[product, productSource] = await Promise.all([
			getMergedShopProductBySlug(slug),
			getShopProductSource(slug)
		]);
	} catch (err) {
		console.error('shop [slug] load: DB failed', err);
		product = getStaticBySlug(slug) ?? null;
		productSource = product ? 'static' : null;
	}
	return {
		product,
		productSource: product ? productSource : null
	};
};
