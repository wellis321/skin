<script lang="ts">
	// Face detection and regions – technical detail
</script>

<svelte:head>
	<title>Face detection and regions – Documentation – Skin Assessment</title>
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-stone-900">Face detection and regions</h1>

<p class="mt-2 text-lg text-stone-600">
	How we detect a face, extract regions for analysis, and optionally run age, gender and expression models.
</p>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Stack</h2>
	<p class="mt-3 text-stone-700">
		<code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">@vladmandic/face-api</code> with <code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">@tensorflow/tfjs-node</code> on the server. Models loaded from disk (e.g. <code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">node_modules/@vladmandic/face-api/model</code>): SSD Mobilenet v1 (detection), Face Landmark 68, AgeGenderNet, FaceExpressionNet.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Detection pipeline</h2>
	<ol class="mt-3 list-decimal space-y-2 pl-5 text-stone-700">
		<li>Image is resized for detection (max dimension 512px) to keep inference fast.</li>
		<li><code class="rounded bg-stone-200 px-1 py-0.5 text-sm">detectSingleFace</code> with SSD options (min confidence 0.3, max 1 face).</li>
		<li>Chained: <code class="rounded bg-stone-200 px-1 py-0.5 text-sm">withFaceLandmarks()</code>, <code class="rounded bg-stone-200 px-1 py-0.5 text-sm">withAgeAndGender()</code>, <code class="rounded bg-stone-200 px-1 py-0.5 text-sm">withFaceExpressions()</code>.</li>
		<li>If no detection or no landmarks, we return null and skin analysis falls back to global texture/evenness only.</li>
	</ol>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Regions</h2>
	<ul class="mt-3 list-disc space-y-2 pl-5 text-stone-700">
		<li><strong>Forehead</strong> — Polygon from landmark points (brow line and top of face), with a margin to avoid hair/background. Cropped and passed to analysis as a buffer.</li>
		<li><strong>Left / right eye</strong> — Rectangles from eye landmarks, expanded by a padding ratio (e.g. 40%) to include crow’s feet. Cropped and analysed separately; the two texture scores are averaged for crow’s feet and fine lines.</li>
		<li>All coordinates are in original image space; crops are taken from the original buffer (via sharp) for analysis.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Face details (optional)</h2>
	<p class="mt-3 text-stone-700">
		When age/gender/expression models run successfully, we attach <code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">faceDetails</code> to the analysis result: estimated age, gender (male/female), gender probability, and expression probabilities (neutral, happy, sad, angry, fearful, disgusted, surprised). These are shown on the results page for context only and do not affect scores.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Overlays</h2>
	<p class="mt-3 text-stone-700">
		When face regions are returned, the results page can draw overlays (e.g. forehead polygon, eye rectangles) on the photo. Region geometry is in original image dimensions (imageWidth, imageHeight plus region shapes).
	</p>
</section>
