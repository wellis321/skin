<script lang="ts">
	import { routines } from '$lib/data/routines';

	const wellbeingRoutines = $derived(routines.filter((r) => r.wellbeingSlug));
</script>

<svelte:head>
	<title>Wellbeing – Skin Assessment</title>
</svelte:head>

<main>
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<div class="mx-auto max-w-5xl">
			<div class="text-white">
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
					Wellbeing & sleep
				</h1>
				<p class="mt-6 text-lg text-stone-300 sm:text-xl">
					How rest, sleep and stress affect your skin—and simple habits to support both. Wind-down routines and tips for better sleep.
				</p>
				<div class="mt-10 flex flex-wrap items-center gap-4">
					<a
						href="/wellbeing/sleep"
						class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						Sleep tips
					</a>
					<a
						href="/routines"
						class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						Routines
					</a>
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-2xl font-semibold text-stone-900">Topics</h2>
			<p class="mt-2 text-stone-600">
				Sleep, stress and wind-down routines that support your skin and how you feel.
			</p>
			<ul class="mt-10 space-y-6">
				<li>
					<a
						href="/wellbeing/sleep"
						class="block rounded-2xl border border-stone-200 bg-stone-50 p-6 transition hover:border-stone-300 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						<h3 class="text-lg font-semibold text-stone-900">Sleep & rest</h3>
						<p class="mt-2 text-sm text-stone-600">
							Sleep is when your skin repairs and regenerates. Simple habits—consistent bedtime, dimming lights, avoiding screens—support better rest and a refreshed look. See our full sleep tips and wind-down routines for more.
						</p>
						<span class="mt-4 inline-block text-sm font-medium text-stone-900 underline hover:no-underline">
							Read more
						</span>
					</a>
				</li>
				{#each wellbeingRoutines as routine}
					<li>
						<a
							href="/routines/{routine.slug}"
							class="block rounded-2xl border border-stone-200 bg-stone-50 p-6 transition hover:border-stone-300 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							<h3 class="text-lg font-semibold text-stone-900">{routine.title}</h3>
							<p class="mt-2 text-sm text-stone-600">{routine.shortDescription}</p>
							<span class="mt-4 inline-block text-sm font-medium text-stone-900 underline hover:no-underline">
								View routine
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Looking tired?</h2>
			<p class="mt-4 text-lg text-stone-300">
				After an assessment we may suggest a wind-down routine or sleep tips based on your expression.
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a
					href="/assess"
					class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Assess my skin
				</a>
			</div>
		</div>
	</section>
</main>
