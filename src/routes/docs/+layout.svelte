<script lang="ts">
	import { page } from '$app/stores';
	import { docsNav } from '$lib/data/docsNav';

	let { children } = $props();
</script>

<svelte:head>
	<title>Documentation – Skin Assessment</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl gap-8 px-6 py-10 sm:py-12">
	<aside class="w-56 shrink-0" aria-label="Documentation">
		<nav class="sticky top-24 space-y-1">
			<p class="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">Documentation</p>
			<ul class="space-y-0.5">
				{#each docsNav as link}
					<li>
						<a
							href={link.href}
							class="block rounded-md py-2 px-3 text-sm font-medium {$page.url.pathname === link.href
								? 'bg-stone-200 text-stone-900'
								: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}"
						>
							{link.title}
						</a>
					</li>
				{/each}
			</ul>
			<p class="mt-6 text-xs text-stone-500">
				Keep this doc updated as features change.
			</p>
		</nav>
	</aside>
	<article class="min-w-0 flex-1 max-w-3xl prose prose-stone prose-headings:font-semibold prose-a:text-stone-700 hover:prose-a:text-stone-900">
		{@render children()}
	</article>
</div>
