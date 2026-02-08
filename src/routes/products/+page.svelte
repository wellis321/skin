<script lang="ts">
	import { getProgrammes, getHowToGuides } from '$lib/data/products';

	const programmes = $derived(getProgrammes());
	const howToGuides = $derived(getHowToGuides());
	// Programme grid: show up to 6 (repeat from start if fewer)
	const CARDS_COUNT = 6;
	const programmeCards = $derived(
		programmes.length >= CARDS_COUNT
			? programmes.slice(0, CARDS_COUNT)
			: Array.from({ length: CARDS_COUNT }, (_, i) => programmes[i % programmes.length])
	);
</script>

<svelte:head>
	<title>Products – Skin Assessment</title>
</svelte:head>

<main>
	<!-- Hero: left copy, right = product thumbnails strip -->
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<div class="mx-auto max-w-5xl">
			<div class="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
				<div class="text-white">
					<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
						Products & programmes
					</h1>
					<p class="mt-6 text-lg text-stone-300 sm:text-xl">
						Face yoga supports structure and fights gravity; skincare supports texture and clarity. Classes, one-to-one programmes and themed workshops—with live coaching, personalised feedback and a supportive community.
					</p>
					<div class="mt-10 flex flex-wrap items-center gap-4">
						<a href="/assess" class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">Assess my skin</a>
						<a href="/products/for-you" class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">Picks for you</a>
					</div>
				</div>
				<div class="flex gap-3 overflow-hidden rounded-2xl">
					{#each programmes.slice(0, 3) as product}
						<a href="/products/{product.slug}" class="block w-1/3 shrink-0 overflow-hidden rounded-xl border-2 border-stone-600 aspect-[3/4] focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">
							<img src={product.imageUrl} alt="" class="h-full w-full object-cover" width="300" height="400" />
						</a>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Programmes grid -->
	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Programmes & workshops</h2>
			<p class="mt-2 text-stone-600">Live classes, one-to-one sessions and themed workshops.</p>
			<ul class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each programmeCards as product}
					<li>
						<a
							href="/products/{product.slug}"
							class="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							<div class="aspect-[4/3] overflow-hidden bg-stone-100">
								<img
									src={product.imageUrl}
									alt=""
									width="800"
									height="500"
									class="h-full w-full object-cover transition group-hover:scale-105"
								/>
							</div>
							<div class="p-5">
								<h2 class="text-lg font-semibold text-stone-900 group-hover:text-stone-700">{product.title}</h2>
								{#if product.price}
									<p class="mt-1 text-sm font-medium text-stone-600">{product.price}</p>
								{/if}
								<p class="mt-2 text-sm text-stone-600 line-clamp-2">{product.shortDescription}</p>
								<span class="mt-3 inline-block text-sm font-medium text-stone-900 underline group-hover:no-underline">
									View details
								</span>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- How-to guides (tiered: free and paid) -->
	{#if howToGuides.length > 0}
		<section class="border-b border-stone-200 bg-stone-50 px-6 py-16 sm:py-20 md:py-24">
			<div class="mx-auto max-w-5xl">
				<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">How-to guides</h2>
				<p class="mt-2 text-stone-600">Learn techniques at home. Some free, some paid—all step-by-step.</p>
				<ul class="mt-8 grid gap-8 sm:grid-cols-2">
					{#each howToGuides as product}
						<li>
							<a
								href="/products/{product.slug}"
								class="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
							>
								<div class="relative aspect-[4/3] overflow-hidden bg-stone-100">
									<img
										src={product.imageUrl}
										alt=""
										width="800"
										height="500"
										class="h-full w-full object-cover transition group-hover:scale-105"
									/>
									{#if product.tier}
										<span
											class="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium {product.tier === 'free'
												? 'bg-green-600 text-white'
												: 'bg-stone-800 text-white'}"
										>
											{product.tier === 'free' ? 'Free' : 'Paid'}
										</span>
									{/if}
								</div>
								<div class="relative p-5">
									<h2 class="text-lg font-semibold text-stone-900 group-hover:text-stone-700">{product.title}</h2>
									{#if product.price}
										<p class="mt-1 text-sm font-medium text-stone-600">{product.price}</p>
									{/if}
									<p class="mt-2 text-sm text-stone-600 line-clamp-2">{product.shortDescription}</p>
									<span class="mt-3 inline-block text-sm font-medium text-stone-900 underline group-hover:no-underline">
										View details
									</span>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<!-- Sign up: compact strip -->
	<section class="border-b border-stone-200 bg-stone-50 px-6 py-10 sm:py-12">
		<div class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
			<p class="text-stone-700">
				Create a free account to save your assessments and track your progress.
			</p>
			<a
				href="/sign-up"
				class="shrink-0 rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			>
				Sign up free
			</a>
		</div>
	</section>

	<!-- QR: scan to open products on phone -->
	<section class="border-b border-stone-200 bg-white px-6 py-10 sm:py-12">
		<div class="mx-auto max-w-3xl">
			<div class="rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
				<img src="/api/qr?path=/products" alt="QR code for products page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
				<div>
					<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
					<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open the products page on another device.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Start with an assessment</h2>
			<p class="mt-4 text-lg text-stone-300">
				Get your personalised scores first—then we'll suggest the right products and programmes for you.
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a
					href="/assess"
					class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Assess my skin
				</a>
				<a
					href="/products/for-you"
					class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Picks for you
				</a>
			</div>
		</div>
	</section>
</main>
