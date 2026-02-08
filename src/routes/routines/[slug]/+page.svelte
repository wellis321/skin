<script lang="ts">
	import { page } from '$app/stores';
	import { getRoutineBySlug } from '$lib/data/routines';

	const slug = $derived($page.params.slug);
	const routine = $derived(getRoutineBySlug(slug));
</script>

<svelte:head>
	<title>{routine?.title ?? 'Routine'} – Skin Assessment</title>
</svelte:head>

<main class="min-h-screen px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-2xl">
		{#if routine}
			<nav class="mb-8 text-sm text-stone-500">
				<a href="/routines" class="hover:text-stone-900">Routines</a>
				<span class="mx-2">/</span>
				<span class="text-stone-900">{routine.title}</span>
			</nav>
			<article class="space-y-8">
				<header>
					<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{routine.title}</h1>
					<p class="mt-3 text-lg text-stone-600">{routine.shortDescription}</p>
				</header>
				<div class="prose prose-stone max-w-none">
					<p class="text-stone-700 whitespace-pre-line">{routine.description}</p>
				</div>
				{#if routine.steps && routine.steps.length > 0}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-6">
						<h2 class="text-lg font-semibold text-stone-900">Steps</h2>
						<ol class="mt-4 list-decimal list-inside space-y-3 text-stone-700">
							{#each routine.steps as step}
								<li>{step}</li>
							{/each}
						</ol>
					</div>
				{:else}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-6">
						<p class="text-stone-700">
							Take a few minutes for yourself. For step-by-step routines, try <a href="/routines/wind-down" class="font-medium text-stone-800 underline hover:no-underline">Wind-down</a> or <a href="/routines/energise" class="font-medium text-stone-800 underline hover:no-underline">Morning energise</a>.
						</p>
					</div>
				{/if}
				{#if routine.wellbeingSlug}
					<p class="pt-4">
						<a
							href="/wellbeing/{routine.wellbeingSlug}"
							class="text-base font-medium text-stone-700 underline hover:no-underline"
						>
							Sleep & wellbeing tips →
						</a>
					</p>
				{/if}
				<div class="flex flex-wrap gap-4 pt-8">
					<a
						href="/routines"
						class="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						All routines
					</a>
					<a
						href="/assess"
						class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						Assess my skin
					</a>
				</div>
			</article>
		{:else}
			<h1 class="text-2xl font-semibold text-stone-900">Routine not found</h1>
			<p class="mt-3 text-stone-600">We couldn’t find a routine with that name.</p>
			<a
				href="/routines"
				class="mt-6 inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			>
				View all routines
			</a>
		{/if}
	</div>
</main>
