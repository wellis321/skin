import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

/** Create a Supabase server client that uses SvelteKit cookies for auth. */
export function createSupabaseServerClient(event: RequestEvent) {
	const url = (env.PUBLIC_SUPABASE_URL ?? '').trim();
	const key = (env.PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
	if (!url || !key) {
		throw new Error(
			'Missing Supabase env: set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env (from Supabase Dashboard → Settings → API).'
		);
	}
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
