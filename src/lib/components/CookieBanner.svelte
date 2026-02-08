<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const STORAGE_KEY = 'cookieConsent';
	let visible = $state(false);

	onMount(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			visible = stored !== 'accepted';
		} catch {
			visible = true;
		}
	});

	function accept() {
		try {
			localStorage.setItem(STORAGE_KEY, 'accepted');
			visible = false;
		} catch {
			visible = false;
		}
	}

	function learnMore() {
		goto('/cookies');
	}
</script>

{#if visible}
	<aside
		aria-label="Cookie consent"
		class="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white p-4 shadow-lg sm:px-6"
	>
		<div class="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-stone-600">
				We use cookies for essential site operation and to improve your experience. By continuing you
				agree to our use of cookies.
				<a href="/cookies" class="font-medium text-stone-900 underline hover:no-underline">Learn more</a>.
			</p>
			<div class="flex shrink-0 gap-3">
				<button
					type="button"
					onclick={learnMore}
					class="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Learn more
				</button>
				<button
					type="button"
					onclick={accept}
					class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Accept
				</button>
			</div>
		</div>
	</aside>
{/if}
