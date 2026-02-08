<script lang="ts">
	import { routines } from '$lib/data/routines';
</script>

<svelte:head>
	<title>Routines – Skin Assessment</title>
</svelte:head>

<main>
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<div class="mx-auto max-w-5xl">
			<div class="text-white">
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
					Routines & wellbeing
				</h1>
				<p class="mt-6 text-lg text-stone-300 sm:text-xl">
					Short face-care and wind-down routines to support your skin and how you feel—from morning energise to evening wind-down and sleep tips.
				</p>
				<div class="mt-10 flex flex-wrap items-center gap-4">
					<a
						href="/assess"
						class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						Assess my skin
					</a>
					<a
						href="/wellbeing"
						class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						Wellbeing & sleep
					</a>
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-2xl font-semibold text-stone-900">Routines</h2>
			<p class="mt-2 text-stone-600">
				Pick a routine that fits your mood or the time of day. After an assessment we may suggest one based on your expression.
			</p>
			<ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each routines as routine}
					<li>
						<a
							href="/routines/{routine.slug}"
							class="group block overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							<h3 class="text-lg font-semibold text-stone-900 group-hover:text-stone-700">{routine.title}</h3>
							<p class="mt-2 text-sm text-stone-600 line-clamp-2">{routine.shortDescription}</p>
							<span class="mt-4 inline-block text-sm font-medium text-stone-900 underline group-hover:no-underline">
								View routine
							</span>
						</a>
					</li>
				{/each}
			</ul>
			<div class="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
				<img src="/api/qr?path=/routines" alt="QR code for routines page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
				<div>
					<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
					<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open the routines page on another device.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Get a routine suggested for you</h2>
			<p class="mt-4 text-lg text-stone-300">
				Complete an assessment and we'll suggest a wind-down or energise routine based on your expression.
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
