<script lang="ts">
	// Data and privacy – what we store and how
</script>

<svelte:head>
	<title>Data and privacy – Documentation – Skin Assessment</title>
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-stone-900">Data and privacy</h1>

<p class="mt-2 text-lg text-stone-600">
	What we store, where, and how long. Align with your Privacy Policy and Terms; update this doc when storage or retention changes.
</p>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Account data</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li>User accounts: email and hashed password (or equivalent). Stored in the app database. Used for sign-in and to associate saved assessments with a user.</li>
		<li>Session: session cookie for authenticated state. Duration and cookie settings (e.g. path, secure) are configured in the app.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Assessment data (saved only)</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li>When a user chooses “Save to my progress”, we store: user id, created timestamp, overall score, wrinkles score and sub-scores (forehead, crow’s feet, fine lines), spots score and sub-scores (blemishes, hyperpigmentation).</li>
		<li>Image: the uploaded/captured photo is stored (e.g. on disk or object storage) and referenced by path. Served only to the owning user via the assessments API (e.g. <code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">/api/assessments/[id]/image</code>).</li>
		<li>Assessments that are not saved are not persisted; the image is processed in memory and discarded after the response.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Processing</h2>
	<p class="mt-3 text-stone-700">
		All analysis runs on the server. Images are not sent to third parties for skin scoring. Face detection and optional age/gender/expression use models loaded from the app (face-api). No third-party analytics or tracking are described here; if you add them, document them and update the Privacy Policy.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Retention and deletion</h2>
	<p class="mt-3 text-stone-700">
		Document your retention policy: how long assessments and images are kept, and how users can delete their account or individual assessments. The app supports per-assessment delete (progress page); account deletion (if implemented) should remove all user data and images. Keep this section in sync with the Privacy Policy.
	</p>
</section>
