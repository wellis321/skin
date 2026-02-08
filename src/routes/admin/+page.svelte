<script lang="ts">
	import { tick } from 'svelte';
	let { data } = $props();

	const form = $derived((data as {
		form?: {
			success?: boolean;
			message?: string;
			slug?: string;
			title?: string;
			shortDescription?: string;
			description?: string;
			price?: string;
			priceAmount?: string;
			imageUrl?: string;
			imageUrlSecondary?: string;
			quantityLabel?: string;
			inStock?: boolean;
			editProductId?: string | null;
			editSlug?: string;
			editTitle?: string;
			editShortDescription?: string;
			editDescription?: string;
			editPrice?: string;
			editPriceAmount?: string;
			editImageUrl?: string;
			editImageUrlSecondary?: string;
			editQuantityLabel?: string;
			editInStock?: boolean;
			classForm?: { title: string; productSlug: string; startAtStr: string; endAtStr: string; description: string; maxAttendeesStr: string; bookingUrl: string } | null;
			editClassId?: string | null;
		};
	}).form);
	const stats = $derived(data.stats ?? { bookings: 0, assessments: 0, users: 0, productInterest: 0, bookingsToday: 0 });
	const bookings = $derived(data.bookings ?? []);
	const upcomingClasses = $derived(data.upcomingClasses ?? []);
	const groupClasses = $derived(data.groupClasses ?? []);
	const productSlugs = $derived(data.productSlugs ?? []);
	const interests = $derived(data.interests ?? []);
	const usersList = $derived(data.usersList ?? []);
	const assessmentsList = $derived(data.assessmentsList ?? []);
	const shopProductsFromDb = $derived(data.shopProductsFromDb ?? []);
	const createSlug = $derived(data.createSlug ?? null);
	const staticShopSlugs = $derived(data.staticShopSlugs ?? []);
	const bookingsToday = $derived(stats.bookingsToday ?? 0);

	let calendarMonth = $state(new Date());
	calendarMonth.setHours(0, 0, 0, 0);

	const calendarTitle = $derived(
		calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
	);

	const weekDays = $derived(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

	const calendarDays = $derived.by(() => {
		const year = calendarMonth.getFullYear();
		const month = calendarMonth.getMonth();
		const first = new Date(year, month, 1);
		const last = new Date(year, month + 1, 0);
		const startPad = (first.getDay() + 6) % 7;
		const daysInMonth = last.getDate();
		const endPad = 6 - ((startPad + daysInMonth - 1) % 7);
		const total = startPad + daysInMonth + endPad;
		const cells: { date: Date; isCurrentMonth: boolean; dayNum: number }[] = [];
		for (let i = 0; i < total; i++) {
			const dayNum = i - startPad + 1;
			const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
			const date = new Date(year, month, dayNum);
			date.setHours(0, 0, 0, 0);
			cells.push({ date, isCurrentMonth, dayNum: isCurrentMonth ? dayNum : 0 });
		}
		return cells;
	});

	function dateKey(d: Date): string {
		return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
	}

	type BookingItem = (typeof bookings)[number];
	type ClassItem = (typeof upcomingClasses)[number];
	type CalendarEvent = {
		type: 'booking' | 'class';
		time: string;
		label: string;
		id: string;
		email?: string;
		focus?: string;
		booking?: BookingItem;
		class?: ClassItem;
	};

	const eventsByDay = $derived.by(() => {
		const map = new Map<string, CalendarEvent[]>();
		for (const b of bookings) {
			const start = new Date(b.startAt);
			const key = dateKey(start);
			if (!map.has(key)) map.set(key, []);
			const time = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
			map.get(key)!.push({
				type: 'booking',
				time,
				label: `${b.email} – ${b.durationMinutes} min`,
				email: b.email,
				focus: b.sessionFocus || undefined,
				id: b.id,
				booking: b
			});
		}
		for (const c of upcomingClasses) {
			const start = new Date(c.startAt);
			const key = dateKey(start);
			if (!map.has(key)) map.set(key, []);
			const time = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
			map.get(key)!.push({
				type: 'class',
				time,
				label: c.title,
				id: c.id,
				class: c
			});
		}
		for (const arr of map.values()) {
			arr.sort((a, b) => a.time.localeCompare(b.time));
		}
		return map;
	});

	let selectedEvent = $state<CalendarEvent | null>(null);
	function selectEvent(ev: CalendarEvent) {
		selectedEvent = ev;
	}
	function closeEventDetail() {
		selectedEvent = null;
	}
	$effect(() => {
		const ev = selectedEvent;
		if (!ev) return;
		tick().then(() => {
			const el = document.getElementById('event-detail-panel');
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

	let editingId = $state<string | null>(null);
	function startEdit(id: string) {
		editingId = id;
	}
	function cancelEdit() {
		editingId = null;
	}
	function getEditProduct() {
		if (!editingId) return null;
		return shopProductsFromDb.find((p) => p.id === editingId) ?? null;
	}
	const editProduct = $derived(getEditProduct());

	let editingClassId = $state<string | null>(null);
	function startEditClass(id: string) {
		editingClassId = id;
	}
	function cancelEditClass() {
		editingClassId = null;
	}
	function getEditClass() {
		if (!editingClassId) return null;
		return groupClasses.find((c) => c.id === editingClassId) ?? null;
	}
	const editClass = $derived(getEditClass());

	$effect(() => {
		if (form?.success && (form as { editProductId?: string | null }).editProductId === null) {
			editingId = null;
		}
	});
	$effect(() => {
		if (form?.success && (form as { editClassId?: string | null }).editClassId === null) {
			editingClassId = null;
		}
	});

	function prevMonth() {
		calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1);
	}
	function nextMonth() {
		calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1);
	}
	function goToday() {
		calendarMonth = new Date();
		calendarMonth.setHours(0, 0, 0, 0);
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Admin dashboard – Skin Assessment</title>
</svelte:head>

<div class="space-y-8">
	{#if bookingsToday > 0}
		<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
			<p class="font-medium">{bookingsToday} one-to-one session{bookingsToday === 1 ? '' : 's'} scheduled for today. Check your email for new booking notifications.</p>
		</div>
	{/if}
	<div class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
		<p class="font-medium text-stone-900">Numbers and cancellations</p>
		<p class="mt-1">Use the calendar and bookings table below to see headcount. If you need to cancel (e.g. not enough people), notify attendees by email and follow your <a href="/terms#cancellation" class="font-medium text-stone-800 underline hover:no-underline">cancellation and refund policy</a>. (Policy is placeholder for now – develop as you go.)</p>
	</div>
	<section>
		<h2 class="text-xl font-semibold text-stone-900">Site metrics</h2>
		<p class="mt-1 text-sm text-stone-500">Click a metric to jump to the full list and details.</p>
		<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<a href="#bookings" class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2">
				<p class="text-2xl font-semibold text-stone-900">{stats.bookings}</p>
				<p class="mt-1 text-sm text-stone-500">One-to-one bookings</p>
				<p class="mt-1 text-xs text-stone-400">View list →</p>
			</a>
			<a href="#product-interest" class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2">
				<p class="text-2xl font-semibold text-stone-900">{stats.productInterest}</p>
				<p class="mt-1 text-sm text-stone-500">Product interest</p>
				<p class="mt-1 text-xs text-stone-400">View list →</p>
			</a>
			<a href="#assessments" class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2">
				<p class="text-2xl font-semibold text-stone-900">{stats.assessments}</p>
				<p class="mt-1 text-sm text-stone-500">Saved assessments</p>
				<p class="mt-1 text-xs text-stone-400">View list →</p>
			</a>
			<a href="#users" class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2">
				<p class="text-2xl font-semibold text-stone-900">{stats.users}</p>
				<p class="mt-1 text-sm text-stone-500">Registered users</p>
				<p class="mt-1 text-xs text-stone-400">View list →</p>
			</a>
		</div>
	</section>

	<section>
		<h2 class="text-xl font-semibold text-stone-900">Calendar</h2>
		<p class="mt-1 text-sm text-stone-500">One-to-one bookings and scheduled classes. Click an event to view its details.</p>
		<div class="mt-4 flex flex-wrap items-center gap-3">
			<button
				type="button"
				onclick={prevMonth}
				class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
			>
				← Previous
			</button>
			<button
				type="button"
				onclick={nextMonth}
				class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
			>
				Next →
			</button>
			<button
				type="button"
				onclick={goToday}
				class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
			>
				Today
			</button>
			<span class="text-lg font-medium text-stone-800">{calendarTitle}</span>
		</div>
		<div class="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
			<div class="grid grid-cols-7 border-b border-stone-200 bg-stone-50 text-center text-xs font-medium text-stone-600">
				{#each weekDays as day}
					<div class="border-r border-stone-200 py-2 last:border-r-0">{day}</div>
				{/each}
			</div>
			<div class="grid grid-cols-7">
				{#each calendarDays as cell}
					{@const key = dateKey(cell.date)}
					{@const events = eventsByDay.get(key) ?? []}
					<div
						class="min-h-[5.5rem] border-r border-b border-stone-200 p-1.5 text-left last:border-r-0 {cell.isCurrentMonth
							? 'bg-white'
							: 'bg-stone-50/80 text-stone-400'}"
					>
						<div class="text-sm font-medium {cell.isCurrentMonth ? 'text-stone-900' : 'text-stone-400'}">
							{cell.dayNum || ''}
						</div>
						<div class="mt-1 space-y-1">
							{#each events as ev}
								<button
									type="button"
									onclick={() => selectEvent(ev)}
									class="w-full cursor-pointer rounded border px-1.5 py-0.5 text-left text-xs transition hover:opacity-90 {ev.type === 'booking'
										? 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
										: 'border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100'}"
									title={ev.type === 'booking' && ev.focus ? `${ev.label} – ${ev.focus}` : ev.label}
								>
									<span class="font-medium">{ev.time}</span>
									<span class="block truncate" title={ev.label}>{ev.label}</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
		<p class="mt-2 flex gap-4 text-xs text-stone-500">
			<span><span class="inline-block size-2.5 rounded border border-amber-200 bg-amber-50"></span> One-to-one</span>
			<span><span class="inline-block size-2.5 rounded border border-sky-200 bg-sky-50"></span> Class</span>
		</p>

		{#if selectedEvent}
			<div
				id="event-detail-panel"
				class="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
				role="dialog"
				aria-modal="true"
				aria-labelledby="event-detail-title"
			>
				<div class="flex items-start justify-between gap-4">
					<h3 id="event-detail-title" class="text-lg font-semibold text-stone-900">
						{selectedEvent.type === 'booking' ? 'One-to-one booking' : 'Class'}
					</h3>
					<button
						type="button"
						onclick={closeEventDetail}
						class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
					>
						Close
					</button>
				</div>
				{#if selectedEvent.type === 'booking' && selectedEvent.booking}
					{@const b = selectedEvent.booking}
					<dl class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
						<div>
							<dt class="font-medium text-stone-500">Date & time</dt>
							<dd class="mt-0.5 text-stone-900">{formatDate(b.startAt)}</dd>
						</div>
						<div>
							<dt class="font-medium text-stone-500">Email</dt>
							<dd class="mt-0.5"><a href="mailto:{b.email}" class="text-stone-900 underline hover:no-underline">{b.email}</a></dd>
						</div>
						<div>
							<dt class="font-medium text-stone-500">Duration</dt>
							<dd class="mt-0.5 text-stone-900">{b.durationMinutes} min</dd>
						</div>
						<div>
							<dt class="font-medium text-stone-500">Status</dt>
							<dd class="mt-0.5 text-stone-900">{b.status}</dd>
						</div>
						{#if b.sessionFocus}
							<div class="sm:col-span-2">
								<dt class="font-medium text-stone-500">Session focus</dt>
								<dd class="mt-0.5 text-stone-900">{b.sessionFocus}</dd>
							</div>
						{/if}
						{#if b.sessionDetails}
							<div class="sm:col-span-2">
								<dt class="font-medium text-stone-500">Details</dt>
								<dd class="mt-0.5 text-stone-900">{b.sessionDetails}</dd>
							</div>
						{/if}
					</dl>
				{:else if selectedEvent.type === 'class' && selectedEvent.class}
					{@const c = selectedEvent.class}
					<dl class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
						<div>
							<dt class="font-medium text-stone-500">Title</dt>
							<dd class="mt-0.5 text-stone-900">{c.title}</dd>
						</div>
						<div>
							<dt class="font-medium text-stone-500">Date & time</dt>
							<dd class="mt-0.5 text-stone-900">{formatDate(c.startAt)}</dd>
						</div>
						<div>
							<dt class="font-medium text-stone-500">Product</dt>
							<dd class="mt-0.5 text-stone-900">{c.productSlug}</dd>
						</div>
						<div>
							<dt class="font-medium text-stone-500">End</dt>
							<dd class="mt-0.5 text-stone-900">{formatDate(c.endAt)}</dd>
						</div>
					</dl>
					<div class="mt-4 flex flex-wrap gap-2">
						<button
							type="button"
							onclick={() => startEditClass(c.id)}
							class="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
						>
							Edit event
						</button>
						<form method="POST" action="?/deleteClass" class="inline" onsubmit={(e) => { if (!confirm('Delete this event? Existing registrations will keep the class id but the event will no longer appear.')) e.preventDefault(); }}>
							<input type="hidden" name="classId" value={c.id} />
							<button type="submit" class="rounded border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">Delete</button>
						</form>
					</div>
				{/if}
			</div>
		{/if}

		<section id="group-classes" class="mt-10">
			<h2 class="text-xl font-semibold text-stone-900">Group classes / Events</h2>
			<p class="mt-1 text-sm text-stone-500">Create, edit or delete events (e.g. face yoga workshops). They appear on the Book a class page and in the calendar above.</p>
			{#if form?.message && ((form as { classForm?: unknown; editClassId?: string | null }).classForm !== undefined || (form as { editClassId?: string | null }).editClassId !== undefined)}
				<p class="mt-3 text-sm {form?.success ? 'text-green-700' : 'text-red-600'}">{form.message}</p>
			{/if}
			<div class="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
				<h3 class="text-lg font-medium text-stone-900">Create event</h3>
				<form method="POST" action="?/createClass" class="mt-4 grid gap-4 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<label for="create-class-title" class="block text-sm font-medium text-stone-700">Title</label>
						<input id="create-class-title" name="classTitle" type="text" value={form?.classForm?.title ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
					</div>
					<div>
						<label for="create-class-productSlug" class="block text-sm font-medium text-stone-700">Product slug</label>
						<select id="create-class-productSlug" name="classProductSlug" value={form?.classForm?.productSlug ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">
							<option value="">Choose…</option>
							{#each productSlugs as slug}
								<option value={slug}>{slug}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="create-class-maxAttendees" class="block text-sm font-medium text-stone-700">Max attendees (optional)</label>
						<input id="create-class-maxAttendees" name="classMaxAttendees" type="number" min="1" value={form?.classForm?.maxAttendeesStr ?? ''} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
					</div>
					<div>
						<label for="create-class-startAt" class="block text-sm font-medium text-stone-700">Start (date & time)</label>
						<input id="create-class-startAt" name="classStartAt" type="datetime-local" value={form?.classForm?.startAtStr ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
					</div>
					<div>
						<label for="create-class-endAt" class="block text-sm font-medium text-stone-700">End (date & time)</label>
						<input id="create-class-endAt" name="classEndAt" type="datetime-local" value={form?.classForm?.endAtStr ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
					</div>
					<div class="sm:col-span-2">
						<label for="create-class-description" class="block text-sm font-medium text-stone-700">Description (optional)</label>
						<textarea id="create-class-description" name="classDescription" rows="2" class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">{form?.classForm?.description ?? ''}</textarea>
					</div>
					<div class="sm:col-span-2">
						<label for="create-class-bookingUrl" class="block text-sm font-medium text-stone-700">Booking URL (optional; default /book?class=id)</label>
						<input id="create-class-bookingUrl" name="classBookingUrl" type="text" value={form?.classForm?.bookingUrl ?? ''} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" placeholder="/book?class=..." />
					</div>
					<div class="sm:col-span-2">
						<button type="submit" class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">Create event</button>
					</div>
				</form>
			</div>
			{#if groupClasses.length > 0}
				<div class="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-stone-200 text-left text-sm">
							<thead class="bg-stone-50">
								<tr>
									<th scope="col" class="px-4 py-3 font-medium text-stone-700">Title</th>
									<th scope="col" class="px-4 py-3 font-medium text-stone-700">Product</th>
									<th scope="col" class="px-4 py-3 font-medium text-stone-700">Start</th>
									<th scope="col" class="px-4 py-3 font-medium text-stone-700">End</th>
									<th scope="col" class="px-4 py-3 font-medium text-stone-700">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-stone-200">
							{#each groupClasses as c}
								<tr class="hover:bg-stone-50/50">
									<td class="px-4 py-3 font-medium text-stone-900">{c.title}</td>
									<td class="px-4 py-3 text-stone-600">{c.productSlug}</td>
									<td class="whitespace-nowrap px-4 py-3 text-stone-600">{formatDate(c.start)}</td>
									<td class="whitespace-nowrap px-4 py-3 text-stone-600">{formatDate(c.end)}</td>
									<td class="px-4 py-3">
										<div class="flex flex-wrap items-center gap-2">
											<button type="button" onclick={() => startEditClass(c.id)} class="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50">Edit</button>
											<form method="POST" action="?/deleteClass" class="inline" onsubmit={(e) => { if (!confirm('Delete this event? Existing registrations will keep the class id but the event will no longer appear.')) e.preventDefault(); }}>
												<input type="hidden" name="classId" value={c.id} />
												<button type="submit" class="rounded border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
											</form>
										</div>
									</td>
								</tr>
							{/each}
							</tbody>
						</table>
					</div>
				</div>
				{#if editClass}
					{@const isEditClassError = form?.editClassId === editClass.id && form?.message && !form?.success}
					<div class="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
						<h3 class="text-lg font-medium text-stone-900">Edit: {editClass.title}</h3>
						{#if isEditClassError}
							<p class="mt-2 text-sm text-red-600">{form.message}</p>
						{/if}
						<form method="POST" action="?/updateClass" class="mt-4 grid gap-4 sm:grid-cols-2">
							<input type="hidden" name="classId" value={editClass.id} />
							<div class="sm:col-span-2">
								<label for="edit-class-title" class="block text-sm font-medium text-stone-700">Title</label>
								<input id="edit-class-title" name="classTitle" type="text" value={isEditClassError && form?.classForm?.title != null ? form.classForm.title : editClass.title} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
							</div>
							<div>
								<label for="edit-class-productSlug" class="block text-sm font-medium text-stone-700">Product slug</label>
								<select id="edit-class-productSlug" name="classProductSlug" required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">
									{#each productSlugs as slug}
										<option value={slug} selected={(isEditClassError && form?.classForm?.productSlug === slug) || (!isEditClassError && editClass.productSlug === slug)}>{slug}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="edit-class-maxAttendees" class="block text-sm font-medium text-stone-700">Max attendees (optional)</label>
								<input id="edit-class-maxAttendees" name="classMaxAttendees" type="number" min="1" value={isEditClassError && form?.classForm?.maxAttendeesStr != null ? form.classForm.maxAttendeesStr : (editClass.maxAttendees != null ? String(editClass.maxAttendees) : '')} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
							</div>
							<div>
								<label for="edit-class-startAt" class="block text-sm font-medium text-stone-700">Start (date & time)</label>
								<input id="edit-class-startAt" name="classStartAt" type="datetime-local" value={isEditClassError && form?.classForm?.startAtStr != null ? form.classForm.startAtStr : (editClass.start ? editClass.start.slice(0, 16) : '')} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
							</div>
							<div>
								<label for="edit-class-endAt" class="block text-sm font-medium text-stone-700">End (date & time)</label>
								<input id="edit-class-endAt" name="classEndAt" type="datetime-local" value={isEditClassError && form?.classForm?.endAtStr != null ? form.classForm.endAtStr : (editClass.end ? editClass.end.slice(0, 16) : '')} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
							</div>
							<div class="sm:col-span-2">
								<label for="edit-class-description" class="block text-sm font-medium text-stone-700">Description (optional)</label>
								<textarea id="edit-class-description" name="classDescription" rows="2" class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">{isEditClassError && form?.classForm?.description != null ? form.classForm.description : (editClass.description ?? '')}</textarea>
							</div>
							<div class="sm:col-span-2">
								<label for="edit-class-bookingUrl" class="block text-sm font-medium text-stone-700">Booking URL (optional)</label>
								<input id="edit-class-bookingUrl" name="classBookingUrl" type="text" value={isEditClassError && form?.classForm?.bookingUrl != null ? form.classForm.bookingUrl : (editClass.bookingUrl ?? '')} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
							</div>
							<div class="sm:col-span-2 flex gap-2">
								<button type="submit" class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">Save changes</button>
								<button type="button" onclick={cancelEditClass} class="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">Cancel</button>
							</div>
						</form>
					</div>
				{/if}
			{:else}
				<p class="mt-6 rounded-xl border border-stone-200 bg-white p-6 text-stone-500">No events yet. Create one above to show on the Book a class page and in the calendar.</p>
			{/if}
		</section>
	</section>

	<section id="bookings">
		<h2 class="text-xl font-semibold text-stone-900">One-to-one bookings</h2>
		<p class="mt-1 text-sm text-stone-500">Who booked, when, and what they asked for. Use this to prepare sessions and follow up.</p>
		{#if bookings.length === 0}
			<p class="mt-6 rounded-xl border border-stone-200 bg-white p-6 text-stone-500">No bookings yet.</p>
		{:else}
			<div class="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-stone-200 text-left text-sm">
						<thead class="bg-stone-50">
							<tr>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Date & time</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Email</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Duration</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Focus</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Details</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-stone-200">
							{#each bookings as b}
								<tr class="hover:bg-stone-50/50">
									<td class="whitespace-nowrap px-4 py-3 text-stone-900">{formatDate(b.startAt)}</td>
									<td class="px-4 py-3">
										<a href="mailto:{b.email}" class="text-stone-700 underline hover:no-underline">{b.email}</a>
									</td>
									<td class="whitespace-nowrap px-4 py-3 text-stone-600">{b.durationMinutes} min</td>
									<td class="max-w-[12rem] truncate px-4 py-3 text-stone-600" title={b.sessionFocus}>{b.sessionFocus || '—'}</td>
									<td class="max-w-[14rem] truncate px-4 py-3 text-stone-500" title={b.sessionDetails}>{b.sessionDetails || '—'}</td>
									<td class="whitespace-nowrap px-4 py-3">
										<span class="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">{b.status}</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			{#if bookings.length >= 300}
				<p class="mt-2 text-sm text-stone-500">Showing latest 300 bookings.</p>
			{/if}
		{/if}
	</section>

	<section id="product-interest">
		<h2 class="text-xl font-semibold text-stone-900">Product interest</h2>
		<p class="mt-1 text-sm text-stone-500">People who registered interest in a product (e.g. face yoga).</p>
		{#if interests.length === 0}
			<p class="mt-6 rounded-xl border border-stone-200 bg-white p-6 text-stone-500">No registrations yet.</p>
		{:else}
			<div class="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-stone-200 text-left text-sm">
						<thead class="bg-stone-50">
							<tr>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Product</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Email</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Name</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Registered</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-stone-200">
							{#each interests as i}
								<tr class="hover:bg-stone-50/50">
									<td class="px-4 py-3 font-medium text-stone-900">{i.productSlug}</td>
									<td class="px-4 py-3">
										<a href="mailto:{i.email}" class="text-stone-700 underline hover:no-underline">{i.email}</a>
									</td>
									<td class="px-4 py-3 text-stone-600">{i.name || '—'}</td>
									<td class="whitespace-nowrap px-4 py-3 text-stone-500">{formatDate(i.createdAt)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			{#if interests.length >= 200}
				<p class="mt-2 text-sm text-stone-500">Showing latest 200.</p>
			{/if}
		{/if}
	</section>

	<section id="assessments">
		<h2 class="text-xl font-semibold text-stone-900">Saved assessments</h2>
		<p class="mt-1 text-sm text-stone-500">Skin assessments saved by users for progress over time. Each row is one assessment.</p>
		{#if assessmentsList.length === 0}
			<p class="mt-6 rounded-xl border border-stone-200 bg-white p-6 text-stone-500">No assessments yet.</p>
		{:else}
			<div class="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-stone-200 text-left text-sm">
						<thead class="bg-stone-50">
							<tr>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">User email</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Saved</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Overall score</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-stone-200">
							{#each assessmentsList as a}
								<tr class="hover:bg-stone-50/50">
									<td class="px-4 py-3">
										<a href="mailto:{a.email}" class="text-stone-700 underline hover:no-underline">{a.email}</a>
									</td>
									<td class="whitespace-nowrap px-4 py-3 text-stone-600">{formatDate(a.createdAt)}</td>
									<td class="px-4 py-3 font-medium text-stone-900">{a.overallScore}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			{#if assessmentsList.length >= 500}
				<p class="mt-2 text-sm text-stone-500">Showing latest 500 assessments.</p>
			{/if}
		{/if}
	</section>

	<section id="users">
		<h2 class="text-xl font-semibold text-stone-900">Registered users</h2>
		<p class="mt-1 text-sm text-stone-500">Users who have signed up. Use this to see who is on the platform.</p>
		{#if usersList.length === 0}
			<p class="mt-6 rounded-xl border border-stone-200 bg-white p-6 text-stone-500">No users yet.</p>
		{:else}
			<div class="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-stone-200 text-left text-sm">
						<thead class="bg-stone-50">
							<tr>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Email</th>
								<th scope="col" class="px-4 py-3 font-medium text-stone-700">Registered</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-stone-200">
							{#each usersList as u}
								<tr class="hover:bg-stone-50/50">
									<td class="px-4 py-3">
										<a href="mailto:{u.email}" class="text-stone-700 underline hover:no-underline">{u.email}</a>
									</td>
									<td class="whitespace-nowrap px-4 py-3 text-stone-600">{formatDate(u.createdAt)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			{#if usersList.length >= 500}
				<p class="mt-2 text-sm text-stone-500">Showing latest 500 users.</p>
			{/if}
		{/if}
	</section>

	<section id="shop-products">
		<h2 class="text-xl font-semibold text-stone-900">Shop products</h2>
		<p class="mt-1 text-sm text-stone-500">Create, edit or delete products for the shop. They appear on /shop and can be added to basket. Slug is used in the URL (e.g. /shop/my-product). Only products you create here can be edited or deleted; static products (from code) are listed below—create one with the same slug to replace and manage it.</p>
		{#if form?.message}
			<p class="mt-3 text-sm {form?.success ? 'text-green-700' : 'text-red-600'}">{form.message}</p>
		{/if}

		<div class="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
			<h3 class="text-lg font-medium text-stone-900">Create product</h3>
			<form method="POST" action="?/createProduct" class="mt-4 grid gap-4 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<label for="create-slug" class="block text-sm font-medium text-stone-700">Slug (URL path, e.g. my-product)</label>
					<input id="create-slug" name="slug" type="text" value={createSlug ?? form?.slug ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
				</div>
				<div class="sm:col-span-2">
					<label for="create-title" class="block text-sm font-medium text-stone-700">Title</label>
					<input id="create-title" name="title" type="text" value={form?.title ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
				</div>
				<div class="sm:col-span-2">
					<label for="create-shortDescription" class="block text-sm font-medium text-stone-700">Short description</label>
					<textarea id="create-shortDescription" name="shortDescription" rows="2" class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">{form?.shortDescription ?? ''}</textarea>
				</div>
				<div class="sm:col-span-2">
					<label for="create-description" class="block text-sm font-medium text-stone-700">Description (full)</label>
					<textarea id="create-description" name="description" rows="4" class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">{form?.description ?? ''}</textarea>
				</div>
				<div>
					<label for="create-price" class="block text-sm font-medium text-stone-700">Price (display, e.g. £24)</label>
					<input id="create-price" name="price" type="text" value={form?.price ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
				</div>
				<div>
					<label for="create-priceAmount" class="block text-sm font-medium text-stone-700">Price amount (number, e.g. 24)</label>
					<input id="create-priceAmount" name="priceAmount" type="text" inputmode="decimal" value={form?.priceAmount ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
				</div>
				<div class="sm:col-span-2">
					<label for="create-imageUrl" class="block text-sm font-medium text-stone-700">Image URL</label>
					<input id="create-imageUrl" name="imageUrl" type="url" value={form?.imageUrl ?? ''} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
				</div>
				<div class="sm:col-span-2">
					<label for="create-imageUrlSecondary" class="block text-sm font-medium text-stone-700">Image URL (secondary, optional)</label>
					<input id="create-imageUrlSecondary" name="imageUrlSecondary" type="url" value={form?.imageUrlSecondary ?? ''} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
				</div>
				<div>
					<label for="create-quantityLabel" class="block text-sm font-medium text-stone-700">Quantity label (e.g. 30 ml, Digital)</label>
					<input id="create-quantityLabel" name="quantityLabel" type="text" value={form?.quantityLabel ?? ''} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
				</div>
				<div class="flex items-center gap-2">
					<input id="create-inStock" name="inStock" type="checkbox" checked={form?.inStock !== false} class="h-4 w-4 rounded border-stone-300 text-stone-600 focus:ring-stone-500" />
					<label for="create-inStock" class="text-sm font-medium text-stone-700">In stock</label>
				</div>
				<div class="sm:col-span-2">
					<button type="submit" class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">Create product</button>
				</div>
			</form>
		</div>

		{#if staticShopSlugs.length > 0}
			<div class="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
				<h3 class="text-lg font-medium text-stone-900">Static products (from code)</h3>
				<p class="mt-1 text-sm text-stone-600">These appear in the shop but are defined in code (e.g. gua-sha-oil, facial-oil-serum). They don’t have Edit/Delete here. To edit or remove one, create a product above with the <strong>same slug</strong> – it will replace the static version and then you can edit or delete it.</p>
				<ul class="mt-4 flex flex-wrap gap-3">
					{#each staticShopSlugs as s}
						<li>
							<a
								href="/admin?createSlug={encodeURIComponent(s.slug)}#shop-products"
								class="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
							>
								{s.slug}
								<span class="text-stone-500">– Create editable copy</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if shopProductsFromDb.length > 0}
			<div class="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
				<table class="min-w-full divide-y divide-stone-200 text-left text-sm">
					<thead class="bg-stone-50">
						<tr>
							<th scope="col" class="px-4 py-3 font-medium text-stone-700">Slug</th>
							<th scope="col" class="px-4 py-3 font-medium text-stone-700">Title</th>
							<th scope="col" class="px-4 py-3 font-medium text-stone-700">Price</th>
							<th scope="col" class="px-4 py-3 font-medium text-stone-700">Created</th>
							<th scope="col" class="px-4 py-3 font-medium text-stone-700">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-stone-200">
						{#each shopProductsFromDb as p}
							<tr class="hover:bg-stone-50/50">
								<td class="px-4 py-3 font-medium text-stone-900">
									<a href="/shop/{p.slug}" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">{p.slug}</a>
								</td>
								<td class="px-4 py-3 text-stone-700">{p.title}</td>
								<td class="px-4 py-3 text-stone-600">{p.price}</td>
								<td class="whitespace-nowrap px-4 py-3 text-stone-500">{formatDate(p.createdAt)}</td>
								<td class="px-4 py-3">
									<div class="flex flex-wrap items-center gap-2">
										<button
											type="button"
											onclick={() => startEdit(p.id)}
											class="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
										>
											Edit
										</button>
										<form method="POST" action="?/deleteProduct" class="inline" onsubmit={(e) => { if (!confirm('Delete this product? It will no longer appear in the shop.')) e.preventDefault(); }}>
											<input type="hidden" name="productId" value={p.id} />
											<button
												type="submit"
												class="rounded border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
											>
												Delete
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if editProduct}
				{@const isEditFormError = form?.editProductId === editProduct.id && form?.message && !form?.success}
				<div class="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
					<h3 class="text-lg font-medium text-stone-900">Edit: {editProduct.title}</h3>
					{#if isEditFormError}
						<p class="mt-2 text-sm text-red-600">{form.message}</p>
					{/if}
					<form method="POST" action="?/updateProduct" class="mt-4 grid gap-4 sm:grid-cols-2">
						<input type="hidden" name="productId" value={editProduct.id} />
						<div class="sm:col-span-2">
							<label for="edit-slug" class="block text-sm font-medium text-stone-700">Slug (URL path)</label>
							<input id="edit-slug" name="slug" type="text" value={isEditFormError && form?.editSlug != null ? form.editSlug : editProduct.slug} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
						</div>
						<div class="sm:col-span-2">
							<label for="edit-title" class="block text-sm font-medium text-stone-700">Title</label>
							<input id="edit-title" name="title" type="text" value={isEditFormError && form?.editTitle != null ? form.editTitle : editProduct.title} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
						</div>
						<div class="sm:col-span-2">
							<label for="edit-shortDescription" class="block text-sm font-medium text-stone-700">Short description</label>
							<textarea id="edit-shortDescription" name="shortDescription" rows="2" class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">{isEditFormError && form?.editShortDescription != null ? form.editShortDescription : editProduct.shortDescription}</textarea>
						</div>
						<div class="sm:col-span-2">
							<label for="edit-description" class="block text-sm font-medium text-stone-700">Description (full)</label>
							<textarea id="edit-description" name="description" rows="4" class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500">{isEditFormError && form?.editDescription != null ? form.editDescription : editProduct.description}</textarea>
						</div>
						<div>
							<label for="edit-price" class="block text-sm font-medium text-stone-700">Price (display)</label>
							<input id="edit-price" name="price" type="text" value={isEditFormError && form?.editPrice != null ? form.editPrice : editProduct.price} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
						</div>
						<div>
							<label for="edit-priceAmount" class="block text-sm font-medium text-stone-700">Price amount (number)</label>
							<input id="edit-priceAmount" name="priceAmount" type="text" inputmode="decimal" value={isEditFormError && form?.editPriceAmount != null ? form.editPriceAmount : String(editProduct.priceAmount)} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
						</div>
						<div class="sm:col-span-2">
							<label for="edit-imageUrl" class="block text-sm font-medium text-stone-700">Image URL</label>
							<input id="edit-imageUrl" name="imageUrl" type="url" value={isEditFormError && form?.editImageUrl != null ? form.editImageUrl : editProduct.imageUrl} required class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
						</div>
						<div class="sm:col-span-2">
							<label for="edit-imageUrlSecondary" class="block text-sm font-medium text-stone-700">Image URL (secondary, optional)</label>
							<input id="edit-imageUrlSecondary" name="imageUrlSecondary" type="url" value={isEditFormError && form?.editImageUrlSecondary != null ? form.editImageUrlSecondary : (editProduct.imageUrlSecondary ?? '')} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
						</div>
						<div>
							<label for="edit-quantityLabel" class="block text-sm font-medium text-stone-700">Quantity label</label>
							<input id="edit-quantityLabel" name="quantityLabel" type="text" value={isEditFormError && form?.editQuantityLabel != null ? form.editQuantityLabel : (editProduct.quantityLabel ?? '')} class="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500" />
						</div>
						<div class="flex items-center gap-2">
							<input
								id="edit-inStock"
								name="inStock"
								type="checkbox"
								checked={isEditFormError && form?.editInStock !== undefined ? form.editInStock : editProduct.inStock}
								class="h-4 w-4 rounded border-stone-300 text-stone-600 focus:ring-stone-500"
							/>
							<label for="edit-inStock" class="text-sm font-medium text-stone-700">In stock</label>
						</div>
						<div class="sm:col-span-2 flex gap-2">
							<button type="submit" class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">Save changes</button>
							<button type="button" onclick={cancelEdit} class="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">Cancel</button>
						</div>
					</form>
				</div>
			{/if}
		{:else}
			<p class="mt-6 rounded-xl border border-stone-200 bg-white p-6 text-stone-500">No shop products created yet. Use the form above to add one. Static products (e.g. facial-oil-serum) are defined in code and also appear in the shop.</p>
		{/if}
	</section>
</div>
