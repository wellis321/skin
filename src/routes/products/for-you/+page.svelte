<script lang="ts">
	import { products } from '$lib/data/products';

	let { data } = $props();

	const displayProducts = $derived(data.hasProfile ? data.profileProducts : products);
	// Always show 6 cards for layout harmony (repeat from start if fewer, slice if more)
	const CARDS_COUNT = 6;
	const sixCards = $derived.by(() => {
		const list = displayProducts;
		if (list.length >= CARDS_COUNT) return list.slice(0, CARDS_COUNT);
		const out: typeof list = [];
		for (let i = 0; i < CARDS_COUNT; i++) out.push(list[i % list.length]);
		return out;
	});

	const form = $derived((data as { form?: { success?: boolean; message?: string; profileAge?: string; profileGender?: string } }).form);
	const profileGenderValue = $derived(form?.profileGender ?? data.gender ?? '');
</script>

<svelte:head>
	<title>Picks for you – Skin Assessment</title>
</svelte:head>

<main>
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<!-- Background image with dark overlay for text readability -->
		<div
			class="absolute inset-0 bg-cover bg-center bg-no-repeat"
			style="background-image: url('https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1920&q=80');"
			aria-hidden="true"
		></div>
		<div class="absolute inset-0 bg-stone-900/75" aria-hidden="true"></div>
		<div class="relative z-10 mx-auto max-w-5xl">
			<div class="text-white">
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
					Picks for you
				</h1>
				{#if data.hasProfile}
					{#if data.profileSource === 'edited'}
						<p class="mt-6 text-lg text-stone-300 sm:text-xl">
							Products tailored to your profile. You've set your age and gender so picks match you even if assessed details differ.
						</p>
						<p class="mt-2 text-sm text-stone-400">
							Your profile: age {data.age}, {data.gender}. You can <a href="#profile-form" class="underline hover:no-underline">edit</a> anytime.
						</p>
					{:else if data.profileSource === 'saved'}
						<p class="mt-6 text-lg text-stone-300 sm:text-xl">
							Products tailored to your profile from your latest saved assessment. Your real age or details may differ — you can correct them below.
						</p>
						<p class="mt-2 text-sm text-stone-400">
							Currently using: age {data.age}, {data.gender} (from assessment). <a href="#profile-form" class="underline hover:no-underline">Edit profile</a>.
						</p>
					{:else}
						<p class="mt-6 text-lg text-stone-300 sm:text-xl">
							Products suggested for your age and often chosen by people with similar skin. Based on this assessment.
						</p>
						<p class="mt-2 text-sm text-stone-400">
							Profile: age {data.age}, {data.gender}. <a href="/assess" class="underline hover:no-underline">Re-assess</a> to update.
						</p>
					{/if}
				{:else}
					<p class="mt-6 text-lg text-stone-300 sm:text-xl">
						{#if data.user}
							Save an assessment to your progress (with a photo) to see picks tailored to your profile. Until then, here are all our products.
						{:else}
							Sign in to see picks tailored to your profile from your assessment history. Until then, here are all our products.
						{/if}
					</p>
				{/if}
				<div class="mt-10 flex flex-wrap items-center gap-4">
					<a
						href="/assess"
						class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						Assess my skin
					</a>
					<a
						href="/products"
						class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						All products
					</a>
					{#if !data.user}
						<a
							href="/sign-in?redirect=/products/for-you"
							class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
						>
							Sign in
						</a>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			{#if form?.message}
				<p class="mb-6 text-sm {form?.success ? 'text-green-700' : 'text-red-600'}">{form.message}</p>
			{/if}

			{#if data.user}
				<div id="profile-form" class="mb-8 rounded-xl border border-stone-200 bg-stone-50 p-5">
					<h3 class="text-base font-semibold text-stone-900">
						{data.hasProfile ? 'Your profile (edit if details are wrong)' : 'Set your profile'}
					</h3>
					<p class="mt-1 text-sm text-stone-600">
						{#if data.hasProfile && data.profileSource === 'saved'}
							Assessed age and gender may differ from your real details. Set your actual age and gender so we can tailor picks correctly.
						{:else if data.hasProfile}
							Update your age or gender anytime.
						{:else}
							Set your age and gender to see tailored product picks (or save an assessment to use assessed details).
						{/if}
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
					<p class="mt-3 text-xs text-stone-500">
						<a href="/progress" class="underline hover:no-underline">View your progress</a>
						<span class="mx-1">·</span>
						<a href="/profile" class="underline hover:no-underline">My account</a>
					</p>
				</div>
			{/if}

			<h2 class="text-2xl font-semibold text-stone-900">
				{data.hasProfile ? 'Suggested for your profile' : 'All products'}
			</h2>
			<p class="mt-2 text-stone-600">
				{#if data.hasProfile}
					{#if data.profileSource === 'saved'}
						These match your age and profile from your saved assessments and are often chosen by people with similar skin.
					{:else}
						These match your age and are often chosen by people with similar skin.
					{/if}
				{:else}
					{#if data.user}
						Save an assessment (with a photo) to get personalised picks.
					{:else}
						Sign in and save assessments to get personalised picks.
					{/if}
				{/if}
			</p>
			<ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each sixCards as product}
					<li>
						<a
							href="/products/{product.slug}"
							class="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							<div class="aspect-[4/3] overflow-hidden bg-stone-100">
								<img
									src={product.imageUrl}
									alt=""
									width="800"
									height="500"
									class="h-full w-full object-cover transition group-hover:scale-105"
								/>
							</div>
							<div class="p-5">
								{#if data.hasProfile && (product.ageRange || product.forGender)}
									<div class="flex flex-wrap gap-2 text-xs text-stone-500">
										{#if product.ageRange}
											<span class="rounded bg-stone-200 px-2 py-0.5">For your age</span>
										{/if}
										{#if product.forGender}
											<span class="rounded bg-stone-200 px-2 py-0.5">Often chosen by people with similar skin</span>
										{/if}
									</div>
								{/if}
								<h3 class="mt-2 text-lg font-semibold text-stone-900 group-hover:text-stone-700">{product.title}</h3>
								{#if product.price}
									<p class="mt-1 text-sm font-medium text-stone-600">{product.price}</p>
								{/if}
								<p class="mt-2 text-sm text-stone-600 line-clamp-2">{product.shortDescription}</p>
								<span class="mt-3 inline-block text-sm font-medium text-stone-900 underline group-hover:no-underline">
									View details
								</span>
							</div>
						</a>
					</li>
				{/each}
			</ul>
			<div class="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
				<img src="/api/qr?path=/products/for-you" alt="QR code for Picks for you page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
				<div>
					<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
					<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open Picks for you on another device.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Get personalised picks</h2>
			<p class="mt-4 text-lg text-stone-300">
				{#if data.hasProfile && data.profileSource === 'saved'}
					Your picks update when you save new assessments. Keep tracking in <a href="/progress" class="underline hover:no-underline">My progress</a>.
				{:else}
					Complete an assessment and save it to your progress — we'll suggest products for your age and profile.
				{/if}
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a
					href="/assess"
					class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Assess my skin
				</a>
				{#if data.user && data.hasProfile}
					<a
						href="/progress"
						class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						My progress
					</a>
				{/if}
			</div>
		</div>
	</section>
</main>
