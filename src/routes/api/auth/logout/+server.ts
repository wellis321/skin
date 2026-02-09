import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/server/supabase';

export const POST: RequestHandler = async (event) => {
	const supabase = createSupabaseServerClient(event);
	await supabase.auth.signOut();
	return json({ ok: true });
};
