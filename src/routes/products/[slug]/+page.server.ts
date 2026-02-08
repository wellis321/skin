import type { PageServerLoad } from './$types';
import { getProductBySlug } from '$lib/data/products';
import { getUpcomingClassesForProduct } from '$lib/data/classes';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const product = getProductBySlug(slug);
	const upcomingClasses = product ? getUpcomingClassesForProduct(slug) : [];
	return {
		product: product ?? null,
		upcomingClasses
	};
};
