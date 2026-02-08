<script lang="ts">
	// About us – placeholder content
</script>

<svelte:head>
	<title>About us – Skin Assessment</title>
</svelte:head>

<main>
	<!-- Hero: light, warm, centred with decorative line -->
	<section class="relative overflow-hidden border-b border-stone-200 bg-stone-50 px-6 py-24 sm:py-32 md:py-40">
		<div class="mx-auto max-w-2xl text-center">
			<div class="mx-auto mb-8 h-1 w-16 rounded-md bg-stone-300" aria-hidden="true"></div>
			<h1 class="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
				About us
			</h1>
			<p class="mt-6 text-lg text-stone-600">
				We help you understand your skin and take confident steps towards healthier, happier skin.
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a href="/assess" class="inline-flex items-center justify-center rounded-md bg-stone-900 px-8 py-4 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">Assess my skin</a>
				<a href="/contact" class="inline-flex items-center justify-center rounded-md border-2 border-stone-900 px-8 py-4 text-base font-medium text-stone-900 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">Contact us</a>
			</div>
		</div>
	</section>

	<!-- Content -->
	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-3xl space-y-14 sm:space-y-16">
			<div>
				<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Who we are</h2>
				<p class="mt-3 text-lg text-stone-600">
					We're a team focused on making skin assessment simple and informative. Our mission is to give you
					personalised feedback on your skin—what's working, what to focus on and how to improve—so you can care
					for your skin with confidence.
				</p>
			</div>
			<div>
				<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">What we do</h2>
				<p class="mt-3 text-lg text-stone-600">
					We combine clear, easy-to-use assessment with face yoga, gua sha and holistic practices. Face yoga tackles face structure and fights gravity—planning against sagging and aging. From weekly
					group workshops to one-to-one programmes, we offer options that fit your goals and lifestyle.
				</p>
			</div>
			<div>
				<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Our values</h2>
				<p class="mt-3 text-lg text-stone-600">
					We believe in clarity, care and community. We use British English, keep your data private and aim to
					deliver a high-quality, informative experience from your first assessment to your ongoing skin journey.
				</p>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ready to start?</h2>
			<p class="mt-4 text-lg text-stone-300">
				Get your personalised skin assessment or sign up to save results and track your progress.
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
