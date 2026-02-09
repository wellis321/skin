import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

/** Create a Supabase client for the browser (e.g. auth callback page). */
export function createSupabaseBrowserClient() {
	const url = (env.PUBLIC_SUPABASE_URL ?? '').trim();
	const key = (env.PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
	if (!url || !key) {
		throw new Error(
			'Missing Supabase env: set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env (from Supabase Dashboard → Settings → API).'
		);
	}
	return createBrowserClient(url, key);
}
