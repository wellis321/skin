import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

/** Create a Supabase server client that uses SvelteKit cookies for auth. */
export function createSupabaseServerClient(event: RequestEvent) {
	const url = env.PUBLIC_SUPABASE_URL ?? '';
	const key = env.PUBLIC_SUPABASE_ANON_KEY ?? '';
	return createServerClient(url, key, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});
}
