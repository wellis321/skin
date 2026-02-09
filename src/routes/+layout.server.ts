import type { LayoutServerLoad } from './$types';
import { isAdmin } from '$lib/server/admin';
import { getMergedShopProducts } from '$lib/server/shopProducts';
import { shopProducts as staticShopProducts } from '$lib/data/shopProducts';

export const load: LayoutServerLoad = async ({ locals }) => {
	let shopProducts = staticShopProducts;
	try {
		shopProducts = await getMergedShopProducts();
	} catch {
		// DB not configured or connection failed (e.g. missing DATABASE_URL on Vercel); use static list
	}
	return {
		user: locals.user ?? null,
		isAdmin: isAdmin(locals.user),
		shopProducts
	};
};
