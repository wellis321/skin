<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		loading = true;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email: email.trim().toLowerCase(), password })
			});
			const result = await res.json().catch(() => ({}));
			if (!res.ok) {
				error = result.error ?? 'Sign in failed';
				return;
			}
			await invalidateAll();
			goto(data.redirectTo ?? '/progress');
		} catch {
			error = 'Sign in failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign in – Skin Assessment</title>
</svelte:head>

<main class="px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-sm">
		<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Sign in</h1>
		<p class="mt-2 text-stone-600">
			Sign in to save your assessments and track your progress over time.
		</p>
		<form class="mt-8 space-y-4" onsubmit={handleSubmit}>
			{#if error}
				<p class="text-sm text-red-600" role="alert">{error}</p>
			{/if}
			<div>
				<label for="signin-email" class="block text-sm font-medium text-stone-700">Email</label>
				<input
					id="signin-email"
					type="email"
					autocomplete="email"
					bind:value={email}
					required
					class="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
					placeholder="you@example.com"
				/>
			</div>
			<div>
				<label for="signin-password" class="block text-sm font-medium text-stone-700">Password</label>
				<input
					id="signin-password"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					required
					class="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
				/>
			</div>
			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-70"
			>
				{loading ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
		<p class="mt-6 text-center text-sm text-stone-600">
			Don’t have an account? <a href="/sign-up" class="font-medium text-stone-700 underline hover:no-underline">Sign up</a>
		</p>
	</div>
</main>
