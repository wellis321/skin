<script lang="ts">
	let { data } = $props();

	type FormResult = {
		success?: boolean;
		message?: string;
		profileAge?: string;
		profileGender?: string;
		newEmail?: string;
	};
	const form = $derived((data as { form?: FormResult }).form);
	const profileGenderValue = $derived(form?.profileGender ?? data.gender ?? '');
</script>

<svelte:head>
	<title>My account – Skin Assessment</title>
</svelte:head>

<main class="min-h-screen bg-stone-50">
	<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
		<h1 class="text-2xl font-semibold text-stone-900 sm:text-3xl">My account</h1>
		<p class="mt-1 text-stone-600">Your profile, activity and preferences in one place.</p>

		{#if form?.message}
			<p
				class="mt-6 rounded-lg border p-3 text-sm {form?.success
					? 'border-green-200 bg-green-50 text-green-800'
					: 'border-red-200 bg-red-50 text-red-700'}"
			>
				{form.message}
			</p>
		{/if}

		<!-- Account (email, password) -->
		<section class="mt-10 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold text-stone-900">Account</h2>
			<p class="mt-2 text-stone-600">Email: <strong class="text-stone-900">{data.email}</strong></p>

			<div class="mt-6 border-t border-stone-200 pt-6">
				<h3 class="text-base font-medium text-stone-800">Change email</h3>
				<p class="mt-1 text-sm text-stone-500">Enter your new email and current password to confirm.</p>
				<form method="POST" action="?/updateEmail" class="mt-3 flex flex-wrap items-end gap-4">
					<div>
						<label for="new-email" class="block text-sm font-medium text-stone-700">New email</label>
						<input
							id="new-email"
							name="newEmail"
							type="email"
							autocomplete="email"
							value={form?.newEmail ?? ''}
							required
							class="mt-1 min-w-[16rem] rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
						/>
					</div>
					<div>
						<label for="email-password" class="block text-sm font-medium text-stone-700">Current password</label>
						<input
							id="email-password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							class="mt-1 w-48 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
						/>
					</div>
					<button
						type="submit"
						class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						Update email
					</button>
				</form>
			</div>

			<div class="mt-8 border-t border-stone-200 pt-6">
				<h3 class="text-base font-medium text-stone-800">Change password</h3>
				<p class="mt-1 text-sm text-stone-500">Enter your current password and choose a new one (at least 8 characters).</p>
				<form method="POST" action="?/updatePassword" class="mt-3 flex flex-wrap items-end gap-4">
					<div>
						<label for="current-password" class="block text-sm font-medium text-stone-700">Current password</label>
						<input
							id="current-password"
							name="currentPassword"
							type="password"
							autocomplete="current-password"
							required
							class="mt-1 w-48 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
						/>
					</div>
					<div>
						<label for="new-password" class="block text-sm font-medium text-stone-700">New password</label>
						<input
							id="new-password"
							name="newPassword"
							type="password"
							autocomplete="new-password"
							minlength="8"
							required
							class="mt-1 w-48 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
						/>
					</div>
					<div>
						<label for="confirm-password" class="block text-sm font-medium text-stone-700">Confirm new password</label>
						<input
							id="confirm-password"
							name="confirmPassword"
							type="password"
							autocomplete="new-password"
							minlength="8"
							required
							class="mt-1 w-48 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
						/>
					</div>
					<button
						type="submit"
						class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
					>
						Update password
					</button>
				</form>
			</div>
		</section>

		<!-- Profile (age, gender) -->
		<section class="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold text-stone-900">Profile</h2>
			<p class="mt-1 text-sm text-stone-600">
				Used to tailor product picks (e.g. Picks for you). Your real age and gender may differ from assessed values — you can set them here.
			</p>
			<form method="POST" action="?/updateProfile" class="mt-4 flex flex-wrap items-end gap-4">
				<div>
					<label for="profile-age" class="block text-sm font-medium text-stone-700">Age</label>
					<input
						id="profile-age"
						name="profileAge"
						type="number"
						min="1"
						max="120"
						value={form?.profileAge ?? (data.age != null ? String(data.age) : '')}
						required
						class="mt-1 w-24 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
					/>
				</div>
				<div>
					<label for="profile-gender" class="block text-sm font-medium text-stone-700">Gender</label>
					<select
						id="profile-gender"
						name="profileGender"
						value={profileGenderValue}
						required
						class="mt-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
					>
						<option value="">Choose…</option>
						<option value="female">Female</option>
						<option value="male">Male</option>
					</select>
				</div>
				<button
					type="submit"
					class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					{data.hasProfile ? 'Update profile' : 'Save profile'}
				</button>
			</form>
			{#if data.hasProfile && data.profileSource === 'saved'}
				<p class="mt-3 text-xs text-stone-500">Currently using values from your latest saved assessment until you save above.</p>
			{/if}
		</section>

		<!-- Activity (assessments, bookings, interests) -->
		<section class="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold text-stone-900">Activity</h2>
			<p class="mt-1 text-sm text-stone-600">Your assessments, bookings and expressions of interest on the site.</p>
			<ul class="mt-4 space-y-3">
				<li>
					<a href="/progress" class="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-stone-900">
						<span>Skin assessments</span>
						<span class="text-sm text-stone-500">{data.assessmentsCount} saved</span>
					</a>
				</li>
				<li>
					<a href="/book/one-to-one" class="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-stone-900">
						<span>One-to-one sessions</span>
						<span class="text-sm text-stone-500">{data.upcomingBookingsCount} upcoming</span>
					</a>
				</li>
				<li>
					<span class="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-stone-600">
						<span>Product interest</span>
						<span class="text-sm text-stone-500">{data.productInterestsCount} registered</span>
					</span>
				</li>
				<li>
					<span class="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-stone-600">
						<span>Class interest</span>
						<span class="text-sm text-stone-500">{data.classInterestsCount} registered</span>
					</span>
				</li>
			</ul>
		</section>

		<!-- Purchases (placeholder) -->
		<section class="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold text-stone-900">Purchases</h2>
			<p class="mt-2 text-sm text-stone-500">Order history will appear here once you make a purchase. <a href="/shop" class="text-stone-700 underline hover:no-underline">Browse the shop</a>.</p>
		</section>

		<!-- Subscriptions (placeholder) -->
		<section class="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold text-stone-900">Subscriptions</h2>
			<p class="mt-2 text-sm text-stone-500">Any subscriptions you have will be listed here. Coming soon.</p>
		</section>
	</div>
</main>
