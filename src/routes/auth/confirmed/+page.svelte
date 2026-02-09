<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Email confirmed – Skin Assessment</title>
</svelte:head>

<main class="mx-auto max-w-md px-6 py-16 text-center">
	<h1 class="text-2xl font-semibold text-stone-900">Email confirmed</h1>
	<p class="mt-3 text-stone-600">
		You're all set. You're now signed in and can save your assessments and track your progress.
	</p>
	<a
		href="/progress"
		class="mt-8 inline-block rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
		onclick={(e) => {
			e.preventDefault();
			goto('/progress');
		}}
	>
		Continue
	</a>
</main>
