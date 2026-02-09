import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/server/supabase';

/** Handle PKCE: Supabase redirects with ?code=...; exchange it for a session and redirect. */
export const load: PageServerLoad = async (event) => {
	const code = event.url.searchParams.get('code');
	if (!code) return {};

	const supabase = createSupabaseServerClient(event);
	const { error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) {
		console.error('auth/callback exchangeCodeForSession:', error);
		throw redirect(302, '/sign-in?error=confirm_failed');
	}
	throw redirect(302, '/auth/confirmed');
};
