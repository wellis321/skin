<script lang="ts">
	import { page } from '$app/stores';

	const slug = $derived($page.params.slug);
	const title = $derived(slug === 'sleep' ? 'Sleep & rest' : slug.charAt(0).toUpperCase() + slug.slice(1));
</script>

<svelte:head>
	<title>{title} – Skin Assessment</title>
</svelte:head>

<main class="min-h-screen px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-2xl">
		<nav class="mb-8 text-sm text-stone-500">
			<a href="/wellbeing" class="hover:text-stone-900">Wellbeing</a>
			<span class="mx-2">/</span>
			<span class="text-stone-900">{title}</span>
		</nav>
		<article class="space-y-8">
			<header>
				<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{title}</h1>
				{#if slug === 'sleep'}
					<p class="mt-3 text-lg text-stone-600">
						Why sleep matters for your skin and simple habits for better rest.
					</p>
				{:else}
					<p class="mt-3 text-lg text-stone-600">
						Tips and habits to support your wellbeing and skin.
					</p>
				{/if}
			</header>
			<div class="prose prose-stone max-w-none rounded-2xl border border-stone-200 bg-stone-50 p-6">
				{#if slug === 'sleep'}
					<h2 class="text-lg font-semibold text-stone-900">Why sleep matters for your skin</h2>
					<p class="mt-2 text-stone-700">
						During sleep your skin repairs and regenerates. Poor sleep shows up as dullness, puffiness and faster signs of ageing. Aim for 7–8 hours where possible, keep a consistent bedtime and dim the lights an hour before bed.
					</p>
					<p class="mt-4 text-stone-700">
						Avoid screens close to bedtime and try a short wind-down: a few minutes of gua sha or our Wind-down routine can ease facial tension and help you drift off. See <a href="/routines/wind-down" class="font-medium text-stone-800 underline hover:no-underline">Wind-down routine</a> and <a href="/routines" class="font-medium text-stone-800 underline hover:no-underline">Routines</a> for step-by-step guides.
					</p>
				{:else}
					<p class="text-stone-700">
						Tips and habits to support your wellbeing and skin. Explore our <a href="/routines" class="font-medium text-stone-800 underline hover:no-underline">routines</a> for step-by-step face care and relaxation.
					</p>
				{/if}
			</div>
			<div class="flex flex-wrap gap-4 pt-8">
				<a
					href="/wellbeing"
					class="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Wellbeing
				</a>
				<a
					href="/routines"
					class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Routines
				</a>
			</div>
		</article>
	</div>
</main>
