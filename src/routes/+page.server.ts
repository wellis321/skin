import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** If Supabase sent ?code=... to the root (e.g. email confirm), send to callback to exchange. */
export const load: PageServerLoad = async (event) => {
	const code = event.url.searchParams.get('code');
	if (code) {
		throw redirect(302, `/auth/callback?code=${encodeURIComponent(code)}`);
	}
	return {};
};
