<script lang="ts">
	/** Pass if signed in (hides email field and uses account email). */
	let { user = null }: { user?: { email?: string } | null } = $props();

	const SESSION_FOCUS_OPTIONS = [
		'Face yoga (general)',
		'Full face rejuvenation',
		'Sculpted chin / neck',
		'Radiant eyes & cheeks',
		'Relaxation & stress release',
		'General consultation / tailored programme',
		'Other'
	] as const;

	let duration = $state<30 | 60>(60);
	let selectedDate = $state<string | null>(null);
	let slots = $state<string[]>([]);
	let loadingSlots = $state(false);
	let selectedSlot = $state<string | null>(null);
	let sessionFocus = $state<string>('');
	let sessionDetails = $state('');
	let email = $state(user && 'email' in user ? (user.email as string) : '');
	let submitting = $state(false);
	let formError = $state('');
	let booking = $state<{ id: string; startAt: string; endAt: string; durationMinutes: number; email?: string } | null>(null);

	const dateOptions = $derived.by(() => {
		const options: string[] = [];
		const d = new Date();
		for (let i = 0; options.length < 14; i++) {
			const next = new Date(d);
			next.setDate(next.getDate() + i);
			const day = next.getDay();
			if (day !== 0 && day !== 6) {
				options.push(next.toISOString().slice(0, 10));
			}
		}
		return options;
	});

	async function loadSlots() {
		if (!selectedDate) return;
		loadingSlots = true;
		formError = '';
		try {
			const res = await fetch(
				`/api/bookings/one-to-one/slots?date=${encodeURIComponent(selectedDate)}&duration=${duration}`
			);
			const data = await res.json();
			if (!res.ok) {
				formError = data.error || 'Could not load slots';
				slots = [];
				return;
			}
			slots = data.slots ?? [];
			selectedSlot = null;
		} finally {
			loadingSlots = false;
		}
	}

	function onDateChange() {
		loadSlots();
	}

	function formatSlot(iso: string): string {
		return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}

	function formatDate(str: string): string {
		return new Date(str + 'T12:00:00Z').toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	async function submitBooking() {
		if (!selectedSlot) return;
		const needsEmail = !user && !email.trim();
		if (needsEmail) {
			formError = 'Please enter your email';
			return;
		}
		if (user === undefined && email.trim() && !email.includes('@')) {
			formError = 'Please enter a valid email';
			return;
		}
		submitting = true;
		formError = '';
		try {
			const res = await fetch('/api/bookings/one-to-one', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					duration,
					startAt: selectedSlot,
					...(sessionFocus.trim() ? { sessionFocus: sessionFocus.trim() } : {}),
					...(sessionDetails.trim() ? { sessionDetails: sessionDetails.trim() } : {}),
					...(user ? {} : { email: email.trim() })
				})
			});
			const result = await res.json();
			if (!res.ok) {
				formError = result.error || 'Booking failed';
				return;
			}
			booking = {
				id: result.id,
				startAt: result.startAt,
				endAt: result.endAt,
				durationMinutes: result.durationMinutes,
				email: result.email
			};
		} finally {
			submitting = false;
		}
	}
</script>

{#if booking}
	<div class="rounded-2xl border-2 border-green-200 bg-green-50 p-6 sm:p-8" aria-live="polite">
		<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Booking confirmed</h2>
		<p class="mt-2 text-stone-700">
			Your {booking.durationMinutes}-minute one-to-one session is on <strong>{formatDate(booking.startAt.slice(0, 10))}</strong> at <strong>{formatSlot(booking.startAt)}</strong>.
		</p>
		<p class="mt-4 text-sm text-stone-600">
			A confirmation has been sent to <strong>{booking.email ?? 'your email'}</strong>. We'll send the Zoom link to that address before the session.
		</p>
		<p class="mt-3 text-sm text-stone-500">
			If we need to cancel or reschedule, we'll contact you and our <a href="/terms#cancellation" class="font-medium text-stone-700 underline hover:no-underline">cancellation and refund policy</a> applies.
		</p>
		<div class="mt-6 flex flex-wrap gap-4">
			<a
				href="/api/calendar/booking/{booking.id}"
				download="one-to-one-booking.ics"
				class="inline-flex items-center rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			>
				Add to calendar
			</a>
			<a
				href="/book/one-to-one"
				class="inline-flex items-center rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			>
				Book another
			</a>
		</div>
	</div>
{:else}
	<div class="space-y-10">
		<div>
			<h2 class="text-lg font-semibold text-stone-900">1. Duration</h2>
			<p class="mt-1 text-sm text-stone-600">Choose 30 minutes or 1 hour.</p>
			<div class="mt-4 flex gap-4">
				<button
					type="button"
					onclick={() => {
						duration = 30;
						selectedDate = null;
						slots = [];
						selectedSlot = null;
					}}
					class="rounded-xl border-2 px-6 py-4 text-base font-medium transition {duration === 30
						? 'border-stone-900 bg-stone-900 text-white'
						: 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'}"
				>
					30 minutes
				</button>
				<button
					type="button"
					onclick={() => {
						duration = 60;
						selectedDate = null;
						slots = [];
						selectedSlot = null;
					}}
					class="rounded-xl border-2 px-6 py-4 text-base font-medium transition {duration === 60
						? 'border-stone-900 bg-stone-900 text-white'
						: 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'}"
				>
					1 hour
				</button>
			</div>
		</div>

		<div>
			<h2 class="text-lg font-semibold text-stone-900">2. Date</h2>
			<p class="mt-1 text-sm text-stone-600">Pick a weekday (next 14 days).</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each dateOptions as d}
					<button
						type="button"
						onclick={() => {
							selectedDate = d;
							onDateChange();
						}}
						class="rounded-lg border px-4 py-2 text-sm font-medium transition {selectedDate === d
							? 'border-stone-900 bg-stone-900 text-white'
							: 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'}"
					>
						{formatDate(d)}
					</button>
				{/each}
			</div>
		</div>

		{#if selectedDate}
			<div>
				<h2 class="text-lg font-semibold text-stone-900">3. Time</h2>
				<p class="mt-1 text-sm text-stone-600">Available slots for {formatDate(selectedDate)}.</p>
				{#if loadingSlots}
					<p class="mt-4 text-stone-500">Loading slots…</p>
				{:else if slots.length === 0 && !loadingSlots}
					<p class="mt-4 text-stone-500">No slots available for this date. Try another.</p>
				{:else}
					<div class="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
						{#each slots as slot}
							<button
								type="button"
								onclick={() => (selectedSlot = slot)}
								class="rounded-lg border px-3 py-2 text-sm font-medium transition {selectedSlot === slot
									? 'border-stone-900 bg-stone-900 text-white'
									: 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'}"
							>
								{formatSlot(slot)}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		{#if selectedSlot}
			<div>
				<h2 class="text-lg font-semibold text-stone-900">4. What would you like to focus on?</h2>
				<p class="mt-1 text-sm text-stone-600">
					Let us know what you'd like to do during this session (face yoga, specific areas, consultation, etc.).
				</p>
				<div class="mt-4 space-y-2" role="radiogroup" aria-label="Session focus">
					{#each SESSION_FOCUS_OPTIONS as option}
						<label class="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 px-4 py-3 transition hover:border-stone-300 {sessionFocus === option ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : ''}">
							<input
								type="radio"
								name="sessionFocus"
								value={option}
								checked={sessionFocus === option}
								onchange={() => (sessionFocus = option)}
								class="mt-1 size-4 border-stone-300 text-stone-900 focus:ring-stone-500"
							/>
							<span class="text-sm font-medium text-stone-900">{option}</span>
						</label>
					{/each}
				</div>
				<label class="mt-4 block">
					<span class="block text-sm font-medium text-stone-700">Any other details? (optional)</span>
					<textarea
						bind:value={sessionDetails}
						rows="3"
						placeholder="e.g. specific goals, areas to work on, or questions"
						class="mt-1 block w-full max-w-lg rounded-lg border border-stone-300 px-4 py-2 text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
					></textarea>
				</label>
			</div>
			<div class="mt-10">
				<h2 class="text-lg font-semibold text-stone-900">5. Confirm & book</h2>
				<p class="mt-1 text-sm text-stone-600">
					{formatDate(selectedDate!)} at {formatSlot(selectedSlot)} — {duration} minutes.
					{#if sessionFocus}
						<span class="mt-1 block">Focus: {sessionFocus}</span>
					{/if}
				</p>
				{#if !user}
					<label class="mt-4 block">
						<span class="block text-sm font-medium text-stone-700">Your email</span>
						<input
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							class="mt-1 block w-full max-w-sm rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
						/>
					</label>
				{/if}
				{#if formError}
					<p class="mt-3 text-sm text-red-600">{formError}</p>
				{/if}
				<button
					type="button"
					disabled={submitting}
					onclick={submitBooking}
					class="mt-4 rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					{submitting ? 'Booking…' : 'Book this slot'}
				</button>
			</div>
		{/if}
	</div>
{/if}
