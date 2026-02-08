import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUpcomingGroupClasses } from '$lib/server/groupClasses';

export const GET: RequestHandler = async ({ url }) => {
	const productSlug = url.searchParams.get('product');
	const classes = getUpcomingGroupClasses();
	const filtered = productSlug ? classes.filter((c) => c.productSlug === productSlug) : classes;
	return json(filtered);
};
