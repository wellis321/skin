<script lang="ts">
	import { disableScrollHandling, onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import { getProductBySlug } from '$lib/data/products';

	// When navigating to /book?class=..., prevent SvelteKit scroll-to-top so our scroll to #upcoming sticks
	onNavigate(({ to }) => {
		const classParam = to?.url.searchParams.get('class');
		if (!classParam || to?.url.pathname !== '/book') return;
		disableScrollHandling();
		return () => {
			document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		};
	});

	let { data } = $props();

	const upcomingClasses = $derived(data.upcomingClasses ?? []);
	const classId = $derived($page.url.searchParams.get('class'));
	const selectedClass = $derived(classId ? (upcomingClasses.find((c) => c.id === classId) ?? null) : null);

	let bookEmail = $state(data.user && 'email' in data.user ? (data.user.email as string) : '');
	let bookName = $state('');
	let bookSubmitting = $state(false);
	let bookError = $state('');
	let bookSuccess = $state(false);
	let bookSuccessMessage = $state('');
	let bookSuccessForClassId = $state<string | null>(null);

	// When ?class=id is set (initial load or same-page link), scroll so the intro ("Book a place...") and form are in view
	$effect(() => {
		const id = $page.url.searchParams.get('class');
		if (!id) return;
		tick().then(() => {
			document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

	function formatClassDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function getProductTitle(slug: string) {
		return getProductBySlug(slug)?.title ?? slug;
	}

	async function submitClassBooking(e: Event) {
		e.preventDefault();
		if (!classId || !selectedClass) return;
		bookError = '';
		if (!bookEmail.trim() || !bookEmail.includes('@')) {
			bookError = 'Please enter a valid email address.';
			return;
		}
		bookSubmitting = true;
		try {
			const res = await fetch('/api/class-interest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					classId,
					email: bookEmail.trim().toLowerCase(),
					name: bookName.trim() || undefined
				})
			});
			const result = await res.json().catch(() => ({}));
			if (!res.ok) {
				bookError = (result as { error?: string }).error ?? 'Something went wrong. Please try again.';
				return;
			}
			bookSuccessMessage = (result as { message?: string }).message ?? "You're booked. We'll be in touch.";
			bookSuccess = true;
			bookSuccessForClassId = classId;
		} finally {
			bookSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Book a class – Skin Assessment</title>
</svelte:head>

<main>
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<!-- Background image with dark overlay for text readability -->
		<div
			class="absolute inset-0 bg-cover bg-center bg-no-repeat"
			style="background-image: url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80');"
			aria-hidden="true"
		></div>
		<div class="absolute inset-0 bg-stone-900/75" aria-hidden="true"></div>
		<div class="relative z-10 mx-auto max-w-5xl">
			<div class="text-white">
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
					Book an online class
				</h1>
				<p class="mt-6 text-lg text-stone-300 sm:text-xl">
					See upcoming face yoga workshops and one-to-one slots. Book a place, then add that event to your calendar and opt in to reminders.
				</p>
				<div class="mt-10 flex flex-wrap items-center gap-4">
					<a href="/book/one-to-one" class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">
						Book a one-to-one slot (30 min or 1 hour)
					</a>
					<a href="#upcoming" class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">
						Upcoming classes
					</a>
					<a href="/docs/notifications" class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900">
						Reminders & notifications
					</a>
				</div>
			</div>
		</div>
	</section>

	<section id="one-to-one" class="border-b border-stone-200 bg-stone-50 px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Bespoke one-to-one slots</h2>
			<p class="mt-2 text-stone-600">Choose a 30-minute or 1-hour session that suits you. Pick a date and time from our calendar.</p>
			<div class="mt-6">
				<a
					href="/book/one-to-one"
					class="inline-flex items-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					Book a 30 min or 1 hour slot
				</a>
			</div>
		</div>
	</section>

	<section id="upcoming" class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Upcoming classes</h2>
			<p class="mt-2 text-stone-600">Book a place for a class below. After booking you can add that event to your calendar from the link on each class.</p>

			{#if classId && selectedClass}
				<div id="book-this-class" class="mt-6 rounded-2xl border-2 border-stone-900 bg-stone-50 p-6 shadow-sm">
					<h3 class="text-xl font-semibold text-stone-900">Book this class</h3>
					<p class="mt-1 text-sm text-stone-600">
						{selectedClass.title} · {formatClassDate(selectedClass.start)}
					</p>
					{#if bookSuccess && bookSuccessForClassId === classId}
						<div class="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
							<p class="font-medium text-green-800">{bookSuccessMessage}</p>
							<p class="mt-1 text-sm text-green-700">Add this event to your calendar using the link on the class below.</p>
						</div>
					{:else}
						<form class="mt-4 space-y-4" onsubmit={submitClassBooking}>
							{#if bookError}
								<p class="text-sm text-red-600" role="alert">{bookError}</p>
							{/if}
							<div>
								<label for="book-class-email" class="block text-sm font-medium text-stone-700">Email</label>
								<input
									id="book-class-email"
									type="email"
									required
									bind:value={bookEmail}
									class="mt-1 block w-full max-w-sm rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
									placeholder="you@example.com"
									autocomplete="email"
								/>
							</div>
							<div>
								<label for="book-class-name" class="block text-sm font-medium text-stone-700">Name (optional)</label>
								<input
									id="book-class-name"
									type="text"
									bind:value={bookName}
									class="mt-1 block w-full max-w-sm rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
									placeholder="Your name"
									autocomplete="name"
								/>
							</div>
							<button
								type="submit"
								disabled={bookSubmitting}
								class="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
							>
								{bookSubmitting ? 'Booking…' : 'Confirm booking'}
							</button>
						</form>
					{/if}
				</div>
			{/if}

			{#if upcomingClasses.length === 0}
				<p class="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-6 text-stone-600">No upcoming classes at the moment. Check back soon or <a href="/contact" class="font-medium text-stone-700 underline hover:no-underline">get in touch</a> to register interest.</p>
			{:else}
				<ul class="mt-8 space-y-4">
					{#each upcomingClasses as classItem (classItem.id)}
						<li
							id={classId === classItem.id ? 'selected-class' : undefined}
							class="rounded-xl border border-stone-200 bg-stone-50 p-5 transition {classId === classItem.id
								? 'ring-2 ring-stone-900 ring-offset-2'
								: ''}"
						>
							<div class="flex flex-wrap items-start justify-between gap-4">
								<div>
									<p class="font-semibold text-stone-900">{classItem.title}</p>
									<p class="mt-1 text-sm text-stone-600">{getProductTitle(classItem.productSlug)}</p>
									<p class="mt-2 text-sm font-medium text-stone-700">{formatClassDate(classItem.start)}</p>
									{#if classItem.description}
										<p class="mt-2 text-sm text-stone-500">{classItem.description}</p>
									{/if}
								</div>
								<div class="flex flex-wrap gap-2">
									{#if classItem.bookingUrl}
										<a
											href={classItem.bookingUrl}
											class="inline-flex items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
										>
											Book this class
										</a>
									{/if}
									<a
										href="/api/calendar/class/{classItem.id}"
										download="class-{classItem.id}.ics"
										class="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
									>
										Add this event to calendar
									</a>
									<a
										href="/products/{classItem.productSlug}"
										class="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
									>
										Product details
									</a>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
			<p class="mt-6 text-xs text-stone-500">
				Events may be cancelled (e.g. if minimum numbers aren't met); we'll notify you by email. <a href="/terms#cancellation" class="text-stone-600 underline hover:no-underline">Cancellation and refund policy</a>.
			</p>
		</div>
	</section>

	<section id="calendar" class="border-b border-stone-200 bg-stone-50 px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Add to your calendar</h2>
			<p class="mt-2 text-stone-600">
				After you book a class, use <strong>Add this event to calendar</strong> on that class above to add it to your calendar app (Google Calendar, Apple Calendar, Outlook, etc.).
			</p>
			<p class="mt-4 text-sm text-stone-500">
				We describe how we use calendar data and reminders in our <a href="/terms#booking" class="font-medium text-stone-700 underline hover:no-underline">terms</a> and <a href="/docs/notifications" class="font-medium text-stone-700 underline hover:no-underline">notifications guide</a>.
			</p>
			<div class="mt-8 rounded-xl border border-stone-200 bg-white p-6">
				<h3 class="font-semibold text-stone-900">Scan to open on your phone</h3>
				<p class="mt-2 text-sm text-stone-600">
					Use your phone camera to scan this QR code and open the booking page on your device.
				</p>
				<div class="mt-4 flex items-center gap-4">
					<img src="/api/qr?path=/book" alt="QR code for booking page" width="128" height="128" class="rounded-lg border border-stone-200" />
					<div class="text-sm text-stone-500">
						<p>Opens this page on your phone so you can book on the go.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Reminders</h2>
			<p class="mt-2 text-stone-600">
				You can opt in to browser notifications so we can remind you before a class you’ve booked. We only send reminders for classes you’ve signed up for.
			</p>
			<div class="mt-6">
				<a
					href="/docs/notifications"
					class="inline-flex items-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					About reminders & notifications
				</a>
			</div>
		</div>
	</section>

	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Get personalised picks</h2>
			<p class="mt-4 text-lg text-stone-300">
				Complete an assessment and we’ll suggest products and classes for your skin goals.
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a
					href="/assess"
					class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Assess my skin
				</a>
				<a
					href="/products/for-you"
					class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Picks for you
				</a>
			</div>
		</div>
	</section>
</main>
