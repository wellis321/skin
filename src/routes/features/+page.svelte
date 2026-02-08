<script lang="ts">
	import { features } from '$lib/data/features';
	import { getThemedImage } from '$lib/data/placeholderImages';
</script>

<svelte:head>
	<title>Features – Skin Assessment</title>
</svelte:head>

<main>
	<!-- Hero: gradient, wide landscape visual -->
	<section class="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<div class="mx-auto max-w-5xl">
			<div class="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
				<div class="text-white">
					<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
						Understand your skin. Track your progress.
					</h1>
					<p class="mt-6 text-lg text-stone-300 sm:text-xl">
						Personalised analysis, scores and recommendations in seconds. Save assessments and compare over time. We also offer face yoga, workshops and one-to-one programmes to support your skin goals.
					</p>
					<div class="mt-10 flex flex-wrap items-center gap-4">
						<a href="/assess" class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">Assess my skin</a>
						<a href="/sign-up" class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">Sign up free</a>
					</div>
				</div>
				<div class="aspect-video w-full max-w-xl overflow-hidden rounded-2xl bg-stone-700/50">
					<img
						src={getThemedImage(0, 800)}
						alt=""
						width="800"
						height="450"
						class="h-full w-full object-cover"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- Feature hero sections -->
	{#each features as feature, i}
		<section class="border-b border-stone-200 bg-white">
			<div class="mx-auto max-w-5xl px-6 py-16 sm:py-20 md:py-24">
				<div class="grid gap-12 md:gap-16 lg:grid-cols-2 lg:gap-20 lg:items-center">
					<div class="{i % 2 === 1 ? 'lg:order-2' : ''}">
						<div class="aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
							<img
								src={getThemedImage(i + 1, 800)}
								alt=""
								width="800"
								height="600"
								class="h-full w-full object-cover"
							/>
						</div>
					</div>
					<div class="{i % 2 === 1 ? 'lg:order-1' : ''}">
						<h2 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
							{feature.title}
						</h2>
						<p class="mt-4 text-lg text-stone-600">
							{feature.shortDescription}
						</p>
						<p class="mt-6 text-stone-700">
							{feature.benefits.length === 1
								? feature.benefits[0]
								: feature.benefits.slice(0, -1).join(', ') + ' and ' + feature.benefits[feature.benefits.length - 1]}.
						</p>
						<div class="mt-8">
							{#if feature.cta === 'sign-up'}
								<a
									href="/sign-up"
									class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3.5 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
								>
									Sign up to get started
								</a>
							{:else}
								<a
									href="/assess"
									class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3.5 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
								>
									Assess my skin
								</a>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</section>
	{/each}

	<!-- Products & programmes: image left, content right -->
	<section class="border-b border-stone-200 bg-stone-50 px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			<div class="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-stretch">
				<div class="min-h-[280px] overflow-hidden rounded-2xl bg-stone-100 sm:min-h-[320px] lg:min-h-0 lg:h-full">
					<img
						src={getThemedImage(4, 800)}
						alt=""
						width="800"
						height="600"
						class="h-full w-full object-cover"
					/>
				</div>
				<div>
					<h2 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Products & programmes</h2>
					<p class="mt-4 text-lg text-stone-600">
						Beyond the app, we offer face yoga classes, one-to-one programmes and themed workshops to support your skin goals—with live coaching, personalised feedback and a supportive community.
					</p>
					<div class="mt-8 space-y-6">
						<div class="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
							<h3 class="text-lg font-semibold text-stone-900">Weekly group workshops</h3>
							<p class="mt-1.5 text-stone-600">Full face rejuvenation, radiant eyes, sculpted chin/neck and more. £20 per 45-min session.</p>
						</div>
						<div class="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
							<h3 class="text-lg font-semibold text-stone-900">One-to-one programme</h3>
							<p class="mt-1.5 text-stone-600">4 x 45 mins over a month. Tailored support, custom exercises and progress reviews.</p>
						</div>
						<div class="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
							<h3 class="text-lg font-semibold text-stone-900">Themed sessions</h3>
							<p class="mt-1.5 text-stone-600">Sculpted chin/neck, radiant eyes & cheeks, full face rejuvenation, and relaxation.</p>
						</div>
					</div>
					<div class="mt-8">
						<a
							href="/products"
							class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3.5 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							View products & programmes
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA hero -->
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-10 flex justify-center">
				<div class="aspect-video w-full max-w-xl overflow-hidden rounded-2xl bg-stone-700/50">
					<img
						src={getThemedImage(5, 800)}
						alt=""
						width="800"
						height="450"
						class="h-full w-full object-cover"
					/>
				</div>
			</div>
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
				Ready to start?
			</h2>
			<p class="mt-4 text-lg text-stone-300">
				Run a free assessment now, or sign up to save results and track your progress over time.
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a
					href="/assess"
					class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Assess my skin
				</a>
				<a
					href="/sign-up"
					class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Sign up free
				</a>
			</div>
		</div>
	</section>
</main>
