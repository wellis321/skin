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
		if (password.length < 8) {
			return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
		}

		const supabase = createSupabaseServerClient(event);
		const origin = event.url.origin;
		const redirectTo = `${origin}/auth/callback`;

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: redirectTo }
		});

		if (error) {
			if (error.message.includes('already registered')) {
				return json({ error: 'An account with this email already exists' }, { status: 409 });
			}
			console.error('signup error:', error);
			return json({ error: error.message || 'Sign up failed' }, { status: 400 });
		}

		// Supabase sends confirmation email when email confirmations are enabled
		return json({
			ok: true,
			message: 'Check your email to confirm your account.',
			needsEmailConfirmation: !!data.user && !data.session
		});
	} catch (err) {
		console.error('signup error:', err);
		return json({ error: 'Sign up failed' }, { status: 500 });
	}
};
