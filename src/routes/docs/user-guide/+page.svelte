<script lang="ts">
	// User guide: what users need to do and what to expect
</script>

<svelte:head>
	<title>User guide – Documentation – Skin Assessment</title>
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-stone-900">User guide</h1>

<p class="mt-2 text-lg text-stone-600">
	What users need to do and what they can expect from the app.
</p>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">What users need to do</h2>
	<ul class="mt-3 list-disc space-y-2 pl-5 text-stone-700">
		<li><strong>Photo</strong> — Upload a photo of their face or take one with the device camera. Best results with good, even lighting; face facing the camera; neutral expression; no glasses (or follow on-screen instructions).</li>
		<li><strong>Assessment flow</strong> — Go to <strong>Assess my skin</strong>, follow any on-screen tips (lighting, position), then capture or upload. No account is required to run a single assessment and see results.</li>
		<li><strong>Account (optional)</strong> — To save assessments and use <strong>My progress</strong> (trends, compare), users must sign up and sign in. Sign-up and sign-in use the app’s own auth (no third-party OAuth in the current MVP).</li>
		<li><strong>Saving</strong> — On the results page, signed-in users can choose “Save to my progress”. Only saved assessments are stored and shown on the progress page.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">What users can expect</h2>
	<ul class="mt-3 list-disc space-y-2 pl-5 text-stone-700">
		<li><strong>Results</strong> — After analysis, they see an overall score (0–100), wrinkle and spot sub-scores, what’s working, what needs attention, and recommendations. Product suggestions (e.g. face yoga, workshops) are shown when applicable.</li>
		<li><strong>Consistency</strong> — Scores depend on the photo (lighting, angle, expression). Same face in different conditions can yield different scores. We do not guarantee medical or diagnostic accuracy; this is for general skin awareness only.</li>
		<li><strong>Progress (signed-in)</strong> — A chart of overall score over time, trend (improving/stable/declining), and a list of saved assessments. They can select two assessments to compare (scores and images) and see score deltas and time between.</li>
		<li><strong>Face details (when available)</strong> — If face detection runs successfully, results may include estimated age, gender and expression. These are for context only and are not used to change scores.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Limitations</h2>
	<p class="mt-3 text-stone-700">
		Analysis is based on image processing (texture, evenness) and optional face-region detection. It is not a substitute for professional advice. Results can vary with photo quality and conditions. If no face is detected or processing fails, fallback/sample results may be shown.
	</p>
</section>
