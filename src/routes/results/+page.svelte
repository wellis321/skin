<script lang="ts">
	import { onMount } from 'svelte';
	import type { SkinAnalysisResult } from '$lib/types/skin';
	import { getProductsForProfileSlice } from '$lib/data/products';
	import { getRoutineForExpression } from '$lib/data/routines';
	import { getThemedImage } from '$lib/data/placeholderImages';

	const STORAGE_KEY = 'skinAssessmentResult';

	let { data } = $props();
	let result = $state<SkinAnalysisResult | null>(
		data.demoMode && data.exampleResult ? data.exampleResult : null
	);
	let thumbnailBase64 = $state<string | null>(null);
	let missing = $state(!(data.demoMode && data.exampleResult));
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	// Face details (age, gender, expression) are hidden by default; user must toggle to show
	let showFaceDetails = $state(false);

	onMount(() => {
		if (data.demoMode && data.exampleResult) {
			result = data.exampleResult;
			thumbnailBase64 = null;
			return;
		}
		try {
			const raw = sessionStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed === 'object' && 'result' in parsed) {
					result = parsed.result as SkinAnalysisResult;
					thumbnailBase64 = typeof parsed.thumbnailBase64 === 'string' ? parsed.thumbnailBase64 : null;
				} else {
					result = parsed as SkinAnalysisResult;
					thumbnailBase64 = null;
				}
				sessionStorage.removeItem(STORAGE_KEY);
			} else {
				missing = true;
			}
		} catch {
			missing = true;
		}
	});

	function toggleFaceDetails() {
		showFaceDetails = !showFaceDetails;
	}

	async function saveToProgress() {
		if (!result || !data?.user) return;
		saveStatus = 'saving';
		try {
			const body = thumbnailBase64
				? { ...result, thumbnailBase64 }
				: result;
			const res = await fetch('/api/assessments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body)
			});
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				console.error('Failed to save assessment:', res.status, errorData);
				saveStatus = 'error';
				return;
			}
			saveStatus = 'saved';
		} catch (err) {
			console.error('Error saving assessment:', err);
			saveStatus = 'error';
		}
	}
</script>

<style>
	.region-overlay {
		position: absolute;
		border: 2px solid rgba(255, 255, 255, 0.9);
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
		pointer-events: none;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 2px;
		box-sizing: border-box;
	}
	.region-overlay-svg {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.region-label-svg {
		font-size: 5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		fill: white;
		text-shadow: 0 0 2px rgba(0, 0, 0, 0.9);
	}
	.region-left-eye { border-color: rgba(59, 130, 246, 0.85); }
	.region-right-eye { border-color: rgba(168, 85, 247, 0.85); }
	.region-label {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
		white-space: nowrap;
	}
</style>

<main class="min-h-screen bg-stone-100/60 px-6 py-12 sm:py-16">
	<div class="mx-auto max-w-2xl">
		{#if result}
			<div class="space-y-8">
				{#if data.demoMode}
					<p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
						Example results – for demo only. Visit <a href="/assess" class="font-medium underline hover:no-underline">Assess</a> to use your own photo.
					</p>
					<div class="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
						<img
							src={getThemedImage(0, 800)}
							alt=""
							width="800"
							height="533"
							class="w-full object-cover object-center"
							style="aspect-ratio: 3/2; max-height: 320px;"
						/>
						<p class="px-4 py-2 text-xs text-stone-500">Example assessment — skin texture and evenness.</p>
					</div>
				{:else}
					<!-- Generic / reference (subdued) -->
					<p class="text-xs text-stone-500">
						Results from your photo (texture & evenness). For guidance only.
						<a href="/how-it-works" class="font-medium text-stone-600 underline hover:no-underline">How we analyse</a>
					</p>
				{/if}

				{#if result.faceRegions && thumbnailBase64}
					<section class="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
						<span class="text-xs font-semibold uppercase tracking-wide text-emerald-600">Your results</span>
						<h2 class="mt-1 text-lg font-semibold text-stone-900">Regions identified</h2>
						<p class="mt-2 text-sm text-stone-600">
							These are the face areas we used for your assessment: forehead, left eye (crow’s feet), right eye (crow’s feet).
						</p>
						<div class="relative mx-auto mt-4 max-w-md">
							<img
								src={thumbnailBase64}
								alt="Face with regions highlighted"
								class="block w-full rounded-lg"
							/>
							{#if result.faceRegions && result.faceRegions.imageWidth > 0 && result.faceRegions.imageHeight > 0}
								{@const fr = result.faceRegions}
								{@const w = fr.imageWidth}
								{@const h = fr.imageHeight}
								{@const foreheadPoints = 'points' in fr.regions.forehead
									? fr.regions.forehead.points
										.map((p) => `${(p.x / w) * 100},${(p.y / h) * 100}`)
										.join(' ')
									: ''}
								{#if foreheadPoints}
									<svg
										class="region-overlay region-overlay-svg"
										viewBox="0 0 100 100"
										preserveAspectRatio="none"
										aria-hidden="true"
									>
										<polygon
											class="region-forehead-poly"
											points={foreheadPoints}
											stroke="rgba(34, 197, 94, 0.9)"
											stroke-width="0.8"
											fill="rgba(34, 197, 94, 0.15)"
										/>
										<text
											x="50"
											y="32"
											text-anchor="middle"
											class="region-label-svg"
										>Forehead</text>
									</svg>
								{/if}
								<div
									class="region-overlay region-left-eye"
									style="left: {(fr.regions.leftEye.left / w) * 100}%; top: {(fr.regions.leftEye.top / h) * 100}%; width: {(fr.regions.leftEye.width / w) * 100}%; height: {(fr.regions.leftEye.height / h) * 100}%;"
									title="Left eye (crow's feet)"
								>
									<span class="region-label">Left eye</span>
								</div>
								<div
									class="region-overlay region-right-eye"
									style="left: {(fr.regions.rightEye.left / w) * 100}%; top: {(fr.regions.rightEye.top / h) * 100}%; width: {(fr.regions.rightEye.width / w) * 100}%; height: {(fr.regions.rightEye.height / h) * 100}%;"
									title="Right eye (crow's feet)"
								>
									<span class="region-label">Right eye</span>
								</div>
							{/if}
						</div>
					</section>
				{/if}

				<!-- Your results hero (stands out) -->
				<div class="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-8 text-center shadow-sm sm:px-8 sm:py-10">
					<span class="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">From your photo</span>
					<h1 class="mt-4 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
						Your skin assessment
					</h1>
					<div class="mt-5 flex justify-center">
						<span class="inline-flex items-center rounded-xl bg-stone-900 px-6 py-3 text-2xl font-bold text-white shadow-md sm:text-3xl">
							{result.overallScore}<span class="ml-1 text-lg font-medium text-stone-300">/ 100</span>
						</span>
					</div>
					<p class="mt-4 text-sm text-stone-600">Personalised from the analysis of your skin.</p>
				</div>

				{#if result.faceDetails}
					<section class="rounded-2xl border-2 border-stone-300 bg-white p-6 shadow-sm">
						<span class="text-xs font-semibold uppercase tracking-wide text-stone-500">Your results</span>
						<h2 class="mt-1 text-lg font-semibold text-stone-900">Face details</h2>
						{#if showFaceDetails}
							<p class="mt-2 text-sm text-stone-600">
								Optional estimates from your photo (age, gender, expression).
								<a href="/face-details-explained" class="font-medium text-stone-700 underline hover:no-underline">How we arrive at these figures</a>.
							</p>
							<dl class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div>
									<dt class="text-xs font-medium uppercase tracking-wide text-stone-500">Estimated age</dt>
									<dd class="mt-0.5 text-stone-900">{result.faceDetails.age} years</dd>
								</div>
								<div>
									<dt class="text-xs font-medium uppercase tracking-wide text-stone-500">Gender</dt>
									<dd class="mt-0.5 capitalize text-stone-900">
										{result.faceDetails.gender}
										{#if result.faceDetails.genderProbability != null}
											<span class="text-stone-500"> ({Math.round(result.faceDetails.genderProbability * 100)}%)</span>
										{/if}
									</dd>
								</div>
							</dl>
							{#if result.faceDetails.expressions && Object.keys(result.faceDetails.expressions).length > 0}
								{@const sorted = Object.entries(result.faceDetails.expressions)
									.filter(([, p]) => typeof p === 'number' && p > 0)
									.sort((a, b) => (b[1] as number) - (a[1] as number))
									.slice(0, 3)}
								{#if sorted.length > 0}
									<div class="mt-4">
										<dt class="text-xs font-medium uppercase tracking-wide text-stone-500">Expression</dt>
										<dd class="mt-1 flex flex-wrap gap-2">
											{#each sorted as [name, prob]}
												<span class="rounded-md bg-white px-3 py-1 text-sm text-stone-700 shadow-sm">
													{name} ({Math.round((prob as number) * 100)}%)
												</span>
											{/each}
										</dd>
									</div>
								{/if}
							{/if}
							<button
								type="button"
								onclick={toggleFaceDetails}
								class="mt-4 text-sm font-medium text-stone-600 hover:text-stone-900 underline hover:no-underline"
							>
								Hide face details
							</button>
						{:else}
							<p class="mt-2 text-sm text-stone-600">
								Optional estimates (age, gender, expression) are available from your photo. Show them only if you want to.
							</p>
							<button
								type="button"
								onclick={toggleFaceDetails}
								class="mt-4 inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
							>
								Show face details
							</button>
						{/if}
					</section>
				{/if}

				{#if result.faceDetails?.expressions && getRoutineForExpression(result.faceDetails.expressions)}
					{@const suggestedRoutine = getRoutineForExpression(result.faceDetails.expressions)}
					{#if suggestedRoutine}
						<section class="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 shadow-sm">
							<span class="text-xs font-semibold uppercase tracking-wide text-amber-700">For you right now</span>
							<h2 class="mt-1 text-lg font-semibold text-stone-900">A routine for right now</h2>
							<p class="mt-2 text-sm text-stone-600">
								Based on your expression, a gentle wind-down or self-care routine might help you feel better.
							</p>
							<div class="mt-4 rounded-xl border border-amber-200/80 bg-white p-4">
								<h3 class="font-medium text-stone-900">{suggestedRoutine.title}</h3>
								<p class="mt-1 text-sm text-stone-600">{suggestedRoutine.shortDescription}</p>
								<div class="mt-4 flex flex-wrap gap-3">
									<a
										href="/routines/{suggestedRoutine.slug}"
										class="inline-flex items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
									>
										Try {suggestedRoutine.title}
									</a>
									{#if suggestedRoutine.wellbeingSlug}
										<a
											href="/wellbeing/{suggestedRoutine.wellbeingSlug}"
											class="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
										>
											Sleep & wellbeing tips
										</a>
									{/if}
								</div>
							</div>
						</section>
					{/if}
				{/if}

				<section class="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
					<span class="text-xs font-semibold uppercase tracking-wide text-emerald-600">Your results</span>
					<h2 class="mt-1 text-lg font-semibold text-stone-900">What’s working</h2>
					<p class="mt-2 text-sm text-stone-600">
						Keep doing what you’re doing in these areas.
					</p>
					<ul class="mt-4 space-y-2">
						{#each result.whatsWorking as item}
							<li class="flex gap-3 text-stone-800">
								<span class="mt-0.5 size-5 shrink-0 rounded-full bg-emerald-100 text-center text-sm leading-5 text-emerald-600" aria-hidden="true">✓</span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</section>

				<section class="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-6 shadow-sm">
					<span class="text-xs font-semibold uppercase tracking-wide text-amber-700">Your results</span>
					<h2 class="mt-1 text-lg font-semibold text-stone-900">What to focus on</h2>
					<p class="mt-2 text-sm text-stone-600">
						These areas could benefit from a little extra attention.
					</p>
					<ul class="mt-4 space-y-2">
						{#each result.needsAttention as item}
							<li class="flex gap-3 text-stone-800">
								<span class="mt-0.5 size-5 shrink-0 rounded-full bg-amber-200 text-center text-sm leading-5 text-amber-700" aria-hidden="true">•</span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</section>

				<section class="rounded-2xl border-2 border-sky-200 bg-white p-6 shadow-sm">
					<span class="text-xs font-semibold uppercase tracking-wide text-sky-600">Your results</span>
					<h2 class="mt-1 text-lg font-semibold text-stone-900">Wrinkles & lines</h2>
					<p class="mt-2 text-stone-700">{result.wrinkles.summary}</p>
					<div class="mt-4 flex flex-wrap gap-4 text-sm font-medium text-stone-800">
						<span>Forehead: <strong class="text-sky-600">{result.wrinkles.forehead}</strong>/100</span>
						<span>Crow’s feet: <strong class="text-sky-600">{result.wrinkles.crowFeet}</strong>/100</span>
						<span>Fine lines: <strong class="text-sky-600">{result.wrinkles.fineLines}</strong>/100</span>
					</div>
				</section>

				<section class="rounded-2xl border-2 border-violet-200 bg-white p-6 shadow-sm">
					<span class="text-xs font-semibold uppercase tracking-wide text-violet-600">Your results</span>
					<h2 class="mt-1 text-lg font-semibold text-stone-900">Spots & blemishes</h2>
					<p class="mt-2 text-stone-700">{result.spots.summary}</p>
					<div class="mt-4 flex flex-wrap gap-4 text-sm font-medium text-stone-800">
						<span>Blemishes: <strong class="text-violet-600">{result.spots.blemishes}</strong>/100</span>
						<span>Evenness: <strong class="text-violet-600">{result.spots.hyperpigmentation}</strong>/100</span>
					</div>
				</section>

				{#if result.structureScore != null}
					<section class="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-6 shadow-sm">
						<span class="text-xs font-semibold uppercase tracking-wide text-amber-700">Your results</span>
						<h2 class="mt-1 text-lg font-semibold text-stone-900">Structure & firmness</h2>
						<p class="mt-2 text-stone-700">
							Based on your jawline contour in this photo: how defined the angle is from chin to jaw. <strong>Higher</strong> (e.g. 80–100) = sharper, more defined jawline; <strong>lower</strong> (e.g. 20–50) = softer contour, or more sagging. It’s one snapshot—lighting and angle affect it. Face yoga and gua sha help maintain or improve structure over time by fighting gravity.
						</p>
						<div class="mt-4 text-sm font-medium text-stone-800">
							Structure score: <strong class="text-amber-700">{result.structureScore}</strong>/100
						</div>
					</section>
				{/if}

				<section class="rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-6 shadow-sm">
					<span class="text-xs font-semibold uppercase tracking-wide text-teal-700">Your results</span>
					<h2 class="mt-1 text-lg font-semibold text-stone-900">How to improve</h2>
					<ul class="mt-4 space-y-3">
						{#each result.recommendations as rec}
							<li class="flex gap-3 text-stone-800">
								<span class="shrink-0 text-teal-500" aria-hidden="true">→</span>
								<span>{rec}</span>
							</li>
						{/each}
					</ul>
				</section>

				<section class="rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
					<h2 class="text-lg font-semibold text-stone-900">Planning against sagging and aging</h2>
					<p class="mt-2 text-sm text-stone-600">
						Face yoga tackles face structure and fights gravity—lift, tone and posture support your skin over time. Consistency and good posture matter as much as skincare. Our programmes (Sculpted Chin/Neck, Radiant Eyes & Cheeks, Full Face Rejuvenation) target jawline, mid-face and full-face structure.
					</p>
					<p class="mt-2 text-sm text-stone-600">
						Combine face yoga and gua sha with your skincare routine for texture, clarity and structure.
					</p>
				</section>

				<!-- Call-out: move to products (stands out) -->
				<section class="rounded-2xl border-2 border-stone-900 bg-stone-900 px-6 py-8 text-white shadow-lg sm:py-10">
					<span class="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">Recommended next step</span>
					<h2 class="mt-4 text-xl font-semibold sm:text-2xl">Programmes & guides for you</h2>
					<p class="mt-2 text-stone-300">
						Face yoga supports facial structure and fights gravity; skincare supports texture and clarity. Classes, one-to-one sessions and guides—picked for your skin and goals.
					</p>
					<div class="mt-6 flex flex-wrap gap-4">
						{#if result.faceDetails}
							<a
								href="/products/for-you?age={result.faceDetails.age}&gender={result.faceDetails.gender}"
								class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-stone-900 shadow-md hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
							>
								See picks for you →
							</a>
						{/if}
						<a
							href="/products"
							class="inline-flex items-center justify-center rounded-xl border-2 border-white px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
						>
							Browse all products
						</a>
					</div>
				</section>

				{#if result.faceDetails}
					{@const profileProducts = getProductsForProfileSlice(result.faceDetails.age, result.faceDetails.gender, 4)}
					{#if profileProducts.length > 0}
						<section class="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
							<span class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Personalised for you</span>
							<h2 class="mt-1 text-lg font-semibold text-stone-900">Picks for your profile</h2>
							<p class="mt-2 text-sm text-stone-700">
								Suggested for your age and often chosen by people with similar skin. Based on your assessment.
							</p>
							<ul class="mt-6 space-y-4">
								{#each profileProducts as product}
									<li class="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm">
										<div class="flex flex-wrap gap-2 text-xs">
											{#if product.ageRange}
												<span class="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">For your age</span>
											{/if}
											{#if product.forGender}
												<span class="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Often chosen by people with similar skin</span>
											{/if}
										</div>
										<h3 class="mt-2 font-semibold text-stone-900">{product.title}</h3>
										{#if product.price}
											<p class="mt-1 text-sm font-medium text-stone-600">{product.price}</p>
										{/if}
										<p class="mt-2 text-sm text-stone-600">{product.shortDescription}</p>
										<a
											href="/products/{product.slug}"
											class="mt-3 inline-flex items-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
										>
											View details →
										</a>
									</li>
								{/each}
							</ul>
							<p class="mt-5">
								<a
									href="/products/for-you?age={result.faceDetails.age}&gender={result.faceDetails.gender}"
									class="inline-flex items-center text-sm font-semibold text-emerald-700 underline hover:no-underline"
								>
									See all picks for you →
								</a>
							</p>
						</section>
					{/if}
				{/if}

				{#if result.productSuggestions.length > 0}
					<section class="rounded-2xl border-2 border-stone-300 bg-white p-6 shadow-sm">
						<span class="text-xs font-semibold uppercase tracking-wide text-stone-500">You might also like</span>
						<h2 class="mt-1 text-lg font-semibold text-stone-900">More to explore</h2>
						<p class="mt-2 text-sm text-stone-600">
							Face yoga and personalised programmes to support your skin and structure—planning against sagging and aging.
						</p>
						<ul class="mt-6 space-y-4">
							{#each result.productSuggestions as product}
								<li class="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
									<h3 class="font-semibold text-stone-900">{product.title}</h3>
									{#if product.price}
										<p class="mt-1 text-sm font-medium text-stone-600">{product.price}</p>
									{/if}
									<p class="mt-2 text-sm text-stone-600">{product.description}</p>
									<a
										href="/products/{product.slug}"
										class="mt-2 inline-block text-sm font-semibold text-stone-900 underline hover:no-underline"
									>
										View details →
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if data?.user}
					<div class="rounded-2xl border-2 border-stone-300 bg-white p-6 shadow-sm">
						<span class="text-xs font-semibold uppercase tracking-wide text-stone-500">Optional</span>
						<h2 class="mt-1 text-lg font-semibold text-stone-900">Save to your progress</h2>
						<p class="mt-1 text-sm text-stone-600">
							Store this assessment so you can track changes over time on your progress page.
						</p>
						{#if saveStatus === 'saved'}
							<p class="mt-3 text-sm font-medium text-emerald-600">Saved. <a href="/progress" class="underline hover:no-underline">View my progress</a></p>
						{:else if saveStatus === 'error'}
							<p class="mt-3 text-sm text-red-600">Could not save. Please try again.</p>
							<button
								type="button"
								onclick={saveToProgress}
								class="mt-3 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
							>
								Try again
							</button>
						{:else}
							<button
								type="button"
								disabled={saveStatus === 'saving'}
								onclick={saveToProgress}
								class="mt-3 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-70"
							>
								{saveStatus === 'saving' ? 'Saving…' : 'Save to my progress'}
							</button>
						{/if}
					</div>
				{/if}

				<div class="flex flex-wrap justify-center gap-6 pt-4">
					<a
						href="/assess"
						class="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						Assess again
					</a>
					<a
						href="/"
						class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						Back to home
					</a>
					<div class="rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
						<img src="/api/qr?path=/assess" alt="QR code for assessment page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
						<div class="text-left">
							<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
							<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open the assessment on another device.</p>
						</div>
					</div>
				</div>
			</div>
		{:else if missing}
			<div class="text-center">
				<h1 class="text-2xl font-semibold text-stone-900">No results found</h1>
				<p class="mt-3 text-stone-600">
					Your assessment may have expired. Please start again from the beginning.
				</p>
				<a
					href="/assess"
					class="mt-6 inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Start assessment
				</a>
			</div>
		{:else}
			<div class="text-center text-stone-500">Loading your results…</div>
		{/if}
	</div>
</main>
