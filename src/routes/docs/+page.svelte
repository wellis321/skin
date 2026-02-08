<script lang="ts">
	// Documentation wiki – overview
</script>

<svelte:head>
	<title>Documentation overview – Skin Assessment</title>
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-stone-900">Documentation overview</h1>

<p class="lead text-lg text-stone-600 mt-2">
	Technical documentation for the Skin Assessment app: what we do, what users can expect, and how to keep this information up to date.
</p>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">What this documentation covers</h2>
	<ul class="mt-3 list-disc space-y-2 pl-5 text-stone-700">
		<li><strong>User guide</strong> — What users need to do (photo requirements, account, flows) and what they can expect from the app.</li>
		<li><strong>Features (technical)</strong> — List of implemented features: skin analysis, progress tracking, compare, face details, personalised picks (Picks for you), routines and wellbeing, booking and online classes, calendar (iCal), notifications.</li>
		<li><strong>Scores and metrics</strong> — How we produce overall, wrinkle and spot scores; texture and evenness; fallbacks.</li>
		<li><strong>Face detection and regions</strong> — Face detection (SSD + 68 landmarks), region cropping (forehead, eyes), optional age/gender/expressions.</li>
		<li><strong>Booking, calendar and notifications</strong> — Online classes, iCal feed, and optional browser reminders; how to subscribe and opt in.</li>
		<li><strong>Data and privacy</strong> — What we store (assessments, images, account), where, and how long.</li>
		<li><strong>Changelog</strong> — Notable changes to features and behaviour; update this as you ship.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Quick summary</h2>
	<p class="mt-3 text-stone-700">
		The app lets users upload or capture a photo of their face, runs server-side skin analysis (texture and evenness, with optional face-region detection), and returns personalised scores (overall, wrinkles, spots), feedback and product suggestions. Signed-in users can save assessments and use the progress page to view trends and compare two assessments side by side (including optional face details). We offer <strong>Picks for you</strong> (products filtered by age/profile), <strong>routines and wellbeing</strong> (suggested by expression), and <strong>online class booking</strong> with an iCal calendar feed and optional reminders. All processing is server-side; images are stored only when the user saves an assessment.
	</p>
</section>

<p class="mt-8 text-sm text-stone-500">
	Use the sidebar to open each section. Keep content accurate and update it whenever you change behaviour or add features.
</p>
