import type { PageServerLoad } from './$types';
import { getMergedShopProductBySlug, getShopProductSource } from '$lib/server/shopProducts';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const [product, productSource] = await Promise.all([
		getMergedShopProductBySlug(slug),
		getShopProductSource(slug)
	]);
	return {
		product,
		productSource: product ? productSource : null
	};
};
