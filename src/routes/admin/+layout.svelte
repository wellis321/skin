<script lang="ts">
	let { children, data } = $props();
</script>

<svelte:head>
	<title>Admin – Skin Assessment</title>
</svelte:head>

<div class="min-h-screen bg-stone-50">
	<header class="border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
		<div class="mx-auto flex max-w-5xl items-center justify-between">
			<h1 class="text-lg font-semibold text-stone-900">Admin</h1>
			<nav class="flex items-center gap-3 text-sm">
				<a href="/" class="text-stone-600 hover:text-stone-900">Back to site</a>
				<span class="text-stone-400">|</span>
				<span class="text-stone-500">{data.user?.email ?? ''}</span>
			</nav>
		</div>
	</header>
	<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
		{@render children()}
	</main>
</div>
