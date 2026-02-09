<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createSupabaseBrowserClient } from '$lib/supabase';

	// Supabase redirects here after email confirmation with tokens in the URL hash.
	// We set the session from the hash so the server can read it from cookies on next request.
	onMount(async () => {
		const supabase = createSupabaseBrowserClient();
		const hashParams = new URLSearchParams(window.location.hash.slice(1));
		const accessToken = hashParams.get('access_token');
		const refreshToken = hashParams.get('refresh_token');
		if (accessToken && refreshToken) {
			await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
			goto('/auth/confirmed', { replaceState: true });
		} else {
			goto('/progress', { replaceState: true });
		}
	});
</script>

<p class="p-6 text-stone-600">Confirming your email…</p>
