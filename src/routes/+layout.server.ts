import type { LayoutServerLoad } from './$types';
import { isAdmin } from '$lib/server/admin';
import { getMergedShopProducts } from '$lib/server/shopProducts';

export const load: LayoutServerLoad = async ({ locals }) => {
	const shopProducts = await getMergedShopProducts();
	return {
		user: locals.user ?? null,
		isAdmin: isAdmin(locals.user),
		shopProducts
	};
};
