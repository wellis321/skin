<script lang="ts">
	import { getThemedImage } from '$lib/data/placeholderImages';

	const links = [
		{ href: '/progress?demo=1', label: 'Progress (example assessments)', description: 'Chart and list of 10–12 example assessments with an improving trend.', imageIndex: 0 },
		{ href: '/results?demo=1', label: 'Results (example analysis)', description: 'Full results page: scores, structure, recommendations, product suggestions, face details.', imageIndex: 1 }
	];
</script>

<svelte:head>
	<title>Demo & screenshots – Skin Assessment</title>
</svelte:head>

<main class="px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-2xl">
		<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Demo data and screenshots</h1>
		<p class="mt-4 text-stone-600">
			Use these links for walkthroughs and marketing screenshots.
		</p>
		<ul class="mt-8 space-y-6">
			{#each links as { href, label, description, imageIndex }}
				<li>
					<a
						href={href}
						class="block overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 transition hover:border-stone-300 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 sm:flex"
					>
						<div class="aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:h-40 sm:w-48">
							<img
								src={getThemedImage(imageIndex, 400)}
								alt=""
								width="400"
								height="300"
								class="h-full w-full object-cover"
							/>
						</div>
						<div class="p-6">
							<span class="font-medium text-stone-900">{label}</span>
							<p class="mt-2 text-sm text-stone-600">{description}</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</main>
