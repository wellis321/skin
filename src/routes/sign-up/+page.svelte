<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	let successMessage = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		successMessage = null;
		loading = true;
		try {
			const res = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email.trim().toLowerCase(), password })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				error = data.error ?? 'Sign up failed';
				return;
			}
			if (data.needsEmailConfirmation ?? data.message) {
				successMessage = data.message ?? 'Check your email to confirm your account.';
				return;
			}
			goto('/progress');
		} catch {
			error = 'Sign up failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign up – Skin Assessment</title>
</svelte:head>

<main class="px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-sm">
		<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Sign up</h1>
		<p class="mt-2 text-stone-600">
			Create an account to save your assessments and track your progress over time.
		</p>
		<form class="mt-8 space-y-4" onsubmit={handleSubmit}>
			{#if successMessage}
				<p class="text-sm text-green-700" role="status">{successMessage}</p>
				<p class="text-sm text-stone-600">Click the link in the email to sign in.</p>
			{:else if error}
				<p class="text-sm text-red-600" role="alert">{error}</p>
			{/if}
			<div>
				<label for="signup-email" class="block text-sm font-medium text-stone-700">Email</label>
				<input
					id="signup-email"
					type="email"
					autocomplete="email"
					bind:value={email}
					required
					class="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
					placeholder="you@example.com"
				/>
			</div>
			<div>
				<label for="signup-password" class="block text-sm font-medium text-stone-700">Password</label>
				<input
					id="signup-password"
					type="password"
					autocomplete="new-password"
					bind:value={password}
					required
					minlength="8"
					class="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
					placeholder="At least 8 characters"
				/>
				<p class="mt-1 text-xs text-stone-500">At least 8 characters</p>
			</div>
			<button
				type="submit"
				disabled={loading || !!successMessage}
				class="w-full rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-70"
			>
				{loading ? 'Creating account…' : successMessage ? 'Check your email' : 'Sign up'}
			</button>
		</form>
		<p class="mt-6 text-center text-sm text-stone-600">
			Already have an account? <a href="/sign-in" class="font-medium text-stone-700 underline hover:no-underline">Sign in</a>
		</p>
	</div>
</main>
