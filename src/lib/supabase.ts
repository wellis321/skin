import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

/** Create a Supabase client for the browser (e.g. auth callback page). */
export function createSupabaseBrowserClient() {
	const url = env.PUBLIC_SUPABASE_URL ?? '';
	const key = env.PUBLIC_SUPABASE_ANON_KEY ?? '';
	return createBrowserClient(url, key);
}
