<script lang="ts">
	// Notifications and reminders – how we inform users about classes
</script>

<svelte:head>
	<title>Reminders and notifications – Documentation – Skin Assessment</title>
</svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-stone-900">Reminders and notifications</h1>

<p class="lead text-lg text-stone-600 mt-2">
	How we inform users about upcoming online classes: calendar feeds (iCal), browser notifications, and how to opt in or out.
</p>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">What we provide</h2>
	<ul class="mt-3 list-disc space-y-2 pl-5 text-stone-700">
		<li><strong>Online class calendar (iCal)</strong> — Users can subscribe to an iCal feed (<code class="rounded bg-stone-200 px-1.5 py-0.5 text-sm">/api/calendar/ical</code>) so upcoming classes appear in their calendar app (Google Calendar, Apple Calendar, Outlook, etc.). The feed is read-only and includes class title, date/time, and description.</li>
		<li><strong>Browser notifications (optional)</strong> — If we enable reminder notifications, we will use the browser’s Notifications API only after the user has opted in. Notifications would be used to remind users before a class they have booked. We do not send marketing or unrelated notifications.</li>
	</ul>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">How to add classes to your calendar</h2>
	<p class="mt-3 text-stone-700">
		On the <a href="/book#calendar" class="font-medium text-stone-800 underline hover:no-underline">Book a class</a> page we explain how to subscribe to the iCal feed: copy the feed URL into your calendar app’s “Add calendar by URL” or “Subscribe” option. Users can also download a one-off .ics file to import. The feed updates when we add or change classes.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Opting in to reminders</h2>
	<p class="mt-3 text-stone-700">
		If we enable browser notifications for class reminders, we will only request permission after the user has booked a class (or explicitly opted in on the Book or Notifications page). Users can revoke permission at any time via their browser settings. We describe this in our <a href="/terms#notifications" class="font-medium text-stone-800 underline hover:no-underline">terms of use</a>.
	</p>
</section>

<section class="mt-8">
	<h2 class="text-xl font-semibold text-stone-900">Keeping this doc updated</h2>
	<p class="mt-3 text-stone-700">
		When we add or change notification behaviour (e.g. enabling reminders, adding email reminders), update this page and the terms. Keep the Book page and user-facing copy in sync.
	</p>
</section>

<p class="mt-8 text-sm text-stone-500">
	See also: <a href="/book" class="font-medium text-stone-700 underline hover:no-underline">Book a class</a>, <a href="/terms" class="font-medium text-stone-700 underline hover:no-underline">Terms of use</a>.
</p>
