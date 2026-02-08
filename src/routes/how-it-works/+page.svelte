<script lang="ts">
	import { getThemedImage } from '$lib/data/placeholderImages';
</script>

<svelte:head>
	<title>How it works – Skin Assessment</title>
</svelte:head>

<main>
	<!-- Hero: centred, background image with overlay -->
	<section class="relative overflow-hidden px-6 py-24 sm:py-32 md:py-40">
		<img
			src={getThemedImage(0, 1200)}
			alt=""
			width="1200"
			height="800"
			class="absolute inset-0 h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-stone-900/70"></div>
		<div class="relative mx-auto max-w-2xl text-center">
			<p class="text-sm font-medium uppercase tracking-wider text-stone-400">Three simple steps</p>
			<h1 class="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
				How it works
			</h1>
			<p class="mt-6 text-lg text-stone-300">
				We analyse your photo for texture and evenness and give you personalised scores and feedback.
			</p>
			<div class="mt-10">
				<a href="/assess" class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">Assess my skin</a>
			</div>
		</div>
	</section>

	<!-- Steps -->
	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-3xl">
			<ol class="space-y-12 sm:space-y-16">
				<li class="flex gap-6 sm:gap-8">
					<span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-stone-900 text-lg font-semibold text-white">1</span>
					<div>
						<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Upload or take a photo</h2>
						<p class="mt-3 text-lg text-stone-600">
							Follow the on-screen instructions (good lighting, face the camera, neutral expression). Then either
							upload an image of your face or use your device's camera to take a photo.
						</p>
					</div>
				</li>
				<li class="flex gap-6 sm:gap-8">
					<span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-stone-900 text-lg font-semibold text-white">2</span>
					<div>
						<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">We analyse your photo</h2>
						<p class="mt-3 text-lg text-stone-600">
							We measure texture (smoothness, lines) and evenness (tone, spots) in your image and turn those into
							scores for wrinkles and blemishes. When a face is detected we also measure structure (jawline definition) to give a structure score and tailor recommendations for face yoga and sagging. Results vary by photo.
						</p>
					</div>
				</li>
				<li class="flex gap-6 sm:gap-8">
					<span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-stone-900 text-lg font-semibold text-white">3</span>
					<div>
						<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">You get personalised feedback</h2>
						<p class="mt-3 text-lg text-stone-600">
							Based on your scores, you'll see what's working, what to focus on and how to improve. We'll suggest
							products and programmes that can help you reach your skin goals.
						</p>
					</div>
				</li>
			</ol>
		</div>
	</section>

	<!-- Technical -->
	<section class="border-b border-stone-200 bg-stone-50 px-6 py-16 sm:py-20">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">How the score and results are produced</h2>
			<p class="mt-4 text-lg text-stone-700">
				We analyse your photo using image-processing algorithms. Your image is resized for speed,
				converted to grayscale, and we compute texture and evenness. When a face is detected we also derive a structure score from the jaw outline.
			</p>

			<div class="mt-10 space-y-12">
				<div class="grid gap-6 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_1.5fr] sm:gap-8 sm:p-6">
					<div class="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 sm:min-h-0">
						<img
							src={getThemedImage(1, 600)}
							alt="Skin texture and lines — we measure luminance variance for wrinkle and line scores."
							width="600"
							height="450"
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="flex flex-col justify-center">
						<h3 class="text-lg font-semibold text-stone-900">Texture</h3>
						<p class="mt-2 text-stone-700">
							Variance of luminance (pixel brightness). Higher variance suggests more detail and texture in the skin, which we map to wrinkle/line scores (forehead, crow's feet, fine lines). Smoother skin scores higher.
						</p>
					</div>
				</div>
				<div class="grid gap-6 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_1.5fr] sm:gap-8 sm:p-6">
					<div class="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 sm:min-h-0">
						<img
							src={getThemedImage(2, 600)}
							alt="Skin evenness and tone — we measure luminance variation across patches for spot and blemish scores."
							width="600"
							height="450"
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="flex flex-col justify-center">
						<h3 class="text-lg font-semibold text-stone-900">Evenness</h3>
						<p class="mt-2 text-stone-700">
							How much luminance varies across patches of the image. More variation suggests uneven tone; we map this to spots/blemish scores. More even skin scores higher.
						</p>
					</div>
				</div>
				<div class="grid gap-6 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_1.5fr] sm:gap-8 sm:p-6">
					<div class="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 sm:min-h-0">
						<img
							src={getThemedImage(0, 600)}
							alt="Structure — when a face is detected we use jaw outline landmarks to score jawline definition."
							width="600"
							height="450"
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="flex flex-col justify-center">
						<h3 class="text-lg font-semibold text-stone-900">Structure (when face detected)</h3>
						<p class="mt-2 text-stone-700">
							When we detect a face we use the jaw outline from face landmarks to compute a structure score (0–100). A more defined jawline scores higher. We use this to tailor recommendations for face yoga and programmes that support structure and fight sagging (e.g. jawline and neck).
						</p>
					</div>
				</div>
			</div>

			<p class="mt-10 text-lg text-stone-700">
				Those metrics are turned into scores (0–100) for wrinkles (forehead, crow's feet, fine lines) and spots
				(blemishes, evenness). When a face is detected we also include a structure score. The overall score combines texture and evenness. Summaries and recommendations are generated from score bands and, where available, structure, so results vary by photo.
			</p>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ready to try?</h2>
			<p class="mt-4 text-lg text-stone-300">
				Upload or capture a photo and get your personalised scores and feedback in seconds.
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
