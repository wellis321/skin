<script lang="ts">
	// Technical feature list – keep updated as we add/change features
</script>

<svelte:head>
	<title>Features (technical) – Documentation – Skin Assessment</title>
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-stone-900">Features (technical)</h1>

<p class="mt-2 text-lg text-stone-600">
	Implemented features and behaviour. Update this page when you add or change functionality.
</p>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Skin analysis</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li>Server-side analysis of an uploaded/captured image.</li>
		<li>When a face is detected: region-based metrics (forehead, left/right eye for crow's feet) plus global evenness.</li>
		<li>When no face is detected: global texture and evenness only; sub-scores derived from those.</li>
		<li>Output: overall score (0–100), wrinkle score and sub-scores (forehead, crow's feet, fine lines), spot score and sub-scores (blemishes, hyperpigmentation), text summaries, what's working / needs attention / recommendations, product suggestions.</li>
		<li>On failure or invalid input: fallback/sample results so the user always sees a result.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Face detection and regions</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li>Uses face-api on the server: SSD Mobilenet v1, 68-point face landmarks.</li>
		<li>Optional: age, gender and expression models (when loaded). Results exposed as face details on the results page.</li>
		<li>Regions: forehead (polygon from brow line), left/right eye (rectangles with padding for crow's feet). Crops are analysed separately for texture; evenness is global.</li>
		<li>See <a href="/docs/face-detection" class="underline">Face detection and regions</a> for more detail.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Progress (signed-in users)</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li><strong>Progress page</strong> — Lists saved assessments (most recent first). Line chart of overall score over time; optional trend (improving/stable/declining) over the last few assessments.</li>
		<li><strong>Compare</strong> — User selects two assessments; UI shows both images and a Score changes table (overall, wrinkles, spots: earlier to later, delta, trend). Optional detail table (forehead, crow's feet, fine lines, blemishes, hyperpigmentation) when sub-scores exist. Time-between span (e.g. 2 weeks) is shown. Selection state is clearly indicated (highlight, labels Compare 1 / Compare 2).</li>
		<li>Hover on chart points shows a popup with date, score and thumbnail for that assessment.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Auth and data</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li>Sign-up / sign-in via app (email + password). Session cookie; no OAuth in MVP.</li>
		<li>Assessments are stored per user when they choose Save to my progress. Stored: scores, sub-scores, thumbnail path, optional face details (age, gender, probability, expressions JSON), created date. Images served via API when the user owns the assessment.</li>
		<li>See <a href="/docs/data-and-privacy" class="underline">Data and privacy</a> for what we store and how.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Product suggestions and Picks for you</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li>Recommendations and product suggestions are generated from score bands (e.g. wrinkle/spot ranges). Products (face yoga, one-to-one, themed workshops) are defined in app data and linked from results and from the main Products page.</li>
		<li><strong>Picks for you</strong> — When the user has face details (age, gender) from an assessment, we filter products by optional <code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">ageRange</code> and <code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">forGender</code>. Shown on results, on /products/for-you (with optional ?age=&amp;gender=), and linked prominently from nav and progress.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Face details and routines</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li><strong>Face details</strong> — Optional age, gender, expression from face-api. Saved with assessments when the user saves progress; shown in Compare when both assessments have face details. Used for Picks for you and for routine suggestions.</li>
		<li><strong>Routines and wellbeing</strong> — Wind-down, energise, sleep-wellbeing routines keyed by expression (e.g. sad/fearful → wind-down). Suggested on results when expression matches; /routines and /wellbeing pages with placeholder content.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Booking, calendar and notifications</h2>
	<ul class="mt-3 list-disc space-y-1 pl-5 text-stone-700">
		<li><strong>Online classes</strong> — Upcoming classes are defined in app data (product slug, title, start/end, booking URL). Product pages show “Upcoming classes” for that product; /book lists all classes and explains calendar and reminders.</li>
		<li><strong>iCal feed</strong> — GET /api/calendar/ical returns a subscribable calendar (RFC 5545) of upcoming classes. Users can add the URL to Google Calendar, Apple Calendar, Outlook, etc., or download a .ics file.</li>
		<li><strong>Notifications</strong> — We describe optional browser reminders for booked classes in /docs/notifications and in terms. Opt-in only; no marketing notifications.</li>
		<li>See <a href="/docs/notifications" class="underline">Booking, calendar and notifications</a> and <a href="/book" class="underline">Book a class</a>.</li>
	</ul>
</section>
