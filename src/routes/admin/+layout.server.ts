import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isAdmin } from '$lib/server/admin';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/sign-in?from=/admin');
	}
	if (!isAdmin(locals.user)) {
		throw redirect(302, '/');
	}
	return { user: locals.user };
};
