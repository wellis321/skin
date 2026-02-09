import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/server/supabase';

export const POST: RequestHandler = async (event) => {
	try {
		const body = await event.request.json();
		const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
		const password = typeof body?.password === 'string' ? body.password : '';

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const supabase = createSupabaseServerClient(event);
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			if (error.message.includes('Invalid login') || error.message.includes('Email not confirmed')) {
				return json({ error: 'Invalid email or password' }, { status: 401 });
			}
			console.error('login error:', error);
			return json({ error: error.message || 'Sign in failed' }, { status: 401 });
		}

		// Session is stored in cookies by the Supabase server client
		return json({ ok: true });
	} catch (err) {
		console.error('login error:', err);
		return json({ error: 'Sign in failed' }, { status: 500 });
	}
};
