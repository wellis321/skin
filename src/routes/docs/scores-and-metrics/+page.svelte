<script lang="ts">
	// How scores and metrics are produced
</script>

<svelte:head>
	<title>Scores and metrics – Documentation – Skin Assessment</title>
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-stone-900">Scores and metrics</h1>

<p class="mt-2 text-lg text-stone-600">
	How we produce overall, wrinkle and spot scores. Update this if formulae or behaviour change.
</p>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Input metrics</h2>
	<ul class="mt-3 list-disc space-y-2 pl-5 text-stone-700">
		<li><strong>Texture</strong> — Variance of luminance in the (global or region) image. Higher variance → more texture/lines; we map this to a wrinkle score (0–100, higher = smoother).</li>
		<li><strong>Evenness</strong> — How much luminance varies across patches of the image. More variation → more uneven tone; we map this to a spot/clarity score (0–100, higher = more even).</li>
		<li>Images are resized for analysis (e.g. 200px) for speed. Grayscale used for these computations.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">When a face is detected</h2>
	<p class="mt-3 text-stone-700">
		We crop three regions: forehead, left eye, right eye (eye boxes padded for crow’s feet). Each region is analysed for texture; evenness is computed on the full image. Forehead texture maps to forehead wrinkle sub-score; average of left/right eye texture maps to crow’s feet and fine lines. Evenness maps to spot score and sub-scores (blemishes, hyperpigmentation). Overall = 0.5 × wrinkle score + 0.5 × spot score.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">When no face is detected</h2>
	<p class="mt-3 text-stone-700">
		Single global texture and evenness value. Wrinkle score and sub-scores (forehead, crow’s feet, fine lines) are derived from the same texture metric with small offsets. Spot score and sub-scores derived from evenness. Same overall formula. So results are consistent but not region-specific.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Outputs</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li><strong>Overall</strong> — 0–100, combination of wrinkle and spot.</li>
		<li><strong>Wrinkles</strong> — score plus forehead, crowFeet, fineLines (0–100 each).</li>
		<li><strong>Spots</strong> — score plus blemishes, hyperpigmentation (0–100 each).</li>
		<li>Summaries and recommendations are generated from score bands (e.g. &gt;75, 50–75, &lt;50) and are for guidance only.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Fallback</h2>
	<p class="mt-3 text-stone-700">
		If analysis throws (e.g. bad image, unsupported format), we return a fixed “sample” result so the user always sees a page. The same fallback can be used when we deliberately skip analysis (e.g. invalid input). Document in changelog if fallback behaviour changes.
	</p>
</section>
