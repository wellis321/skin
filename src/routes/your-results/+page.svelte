<script lang="ts">
	import { getThemedImage } from '$lib/data/placeholderImages';
</script>

<svelte:head>
	<title>Your results – Skin Assessment</title>
</svelte:head>

<main>
	<!-- Hero: large background image -->
	<section class="relative overflow-hidden border-b border-stone-200 px-6 py-24 sm:py-32 md:py-40">
		<img
			src={getThemedImage(0, 1200)}
			alt=""
			width="1200"
			height="800"
			class="absolute inset-0 h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-stone-900/70"></div>
		<div class="relative mx-auto max-w-2xl text-center">
			<h1 class="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
				Your results
			</h1>
			<p class="mt-6 text-lg text-stone-300">
				After you upload or capture a photo, we analyse it for texture and evenness and produce scores and recommendations. Here's how to read your assessment and what each section means.
			</p>
			<div class="mt-10">
				<a href="/assess" class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">Get your assessment</a>
			</div>
		</div>
	</section>

	<!-- Content sections: alternating image + text blocks -->
	<section class="border-b border-stone-200 bg-white">
		<div class="mx-auto max-w-5xl px-6 py-16 sm:py-20 md:py-24">
			<!-- Overall score -->
			<div class="grid gap-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:gap-10 sm:p-8 md:grid-cols-2 md:gap-12 md:items-center">
				<div class="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
					<img src={getThemedImage(1, 800)} alt="" width="800" height="600" class="h-full w-full object-cover" />
				</div>
				<div>
					<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Overall score</h2>
					<p class="mt-3 text-lg text-stone-600">
						Your overall score is derived from your photo: we look at texture (smoothness, lines) and evenness
						(tone, spots). A higher score indicates smoother, more even skin in those areas. Use it as a baseline
						to track changes over time. Different photos will produce different scores.
					</p>
				</div>
			</div>

			<!-- What's working -->
			<div class="mt-12 grid gap-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:mt-16 sm:gap-10 sm:p-8 md:grid-cols-2 md:gap-12 md:items-center">
				<div class="order-2 aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 md:order-1">
					<img src={getThemedImage(2, 800)} alt="" width="800" height="600" class="h-full w-full object-cover" />
				</div>
				<div class="order-1 md:order-2">
					<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">What's working</h2>
					<p class="mt-3 text-lg text-stone-600">
						This section highlights the areas where your skin is in good shape. Keep doing what you're doing here—your
						routine and habits are supporting these areas well.
					</p>
				</div>
			</div>

			<!-- What to focus on -->
			<div class="mt-12 grid gap-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:mt-16 sm:gap-10 sm:p-8 md:grid-cols-2 md:gap-12 md:items-center">
				<div class="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
					<img src={getThemedImage(3, 800)} alt="" width="800" height="600" class="h-full w-full object-cover" />
				</div>
				<div>
					<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">What to focus on</h2>
					<p class="mt-3 text-lg text-stone-600">
						These are the areas that could benefit from a little extra attention. They're not problems—just opportunities
						to refine your routine or try targeted techniques.
					</p>
				</div>
			</div>

			<!-- How to improve -->
			<div class="mt-12 grid gap-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:mt-16 sm:gap-10 sm:p-8 md:grid-cols-2 md:gap-12 md:items-center">
				<div class="order-2 aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 md:order-1">
					<img src={getThemedImage(4, 800)} alt="" width="800" height="600" class="h-full w-full object-cover" />
				</div>
				<div class="order-1 md:order-2">
					<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">How to improve</h2>
					<p class="mt-3 text-lg text-stone-600">
						We suggest practical steps you can take, from face yoga and gua sha to skincare and lifestyle. These
						recommendations are based on your photo's texture and evenness scores.
					</p>
				</div>
			</div>

			<!-- Product suggestions -->
			<div class="mt-12 grid gap-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:mt-16 sm:gap-10 sm:p-8 md:grid-cols-2 md:gap-12 md:items-center">
				<div class="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
					<img src={getThemedImage(5, 800)} alt="" width="800" height="600" class="h-full w-full object-cover" />
				</div>
				<div>
					<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Product suggestions</h2>
					<p class="mt-3 text-lg text-stone-600">
						Based on your scores, we may suggest face yoga classes, one-to-one programmes or themed workshops.
						These are designed to support your skin goals with expert-led sessions and community.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Get your results</h2>
			<p class="mt-4 text-lg text-stone-300">
				Upload or capture a photo and see your personalised scores and recommendations.
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
