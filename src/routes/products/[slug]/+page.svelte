<script lang="ts">
	import OneToOneBookingForm from '$lib/components/OneToOneBookingForm.svelte';
	import { productSlugToShopSlug } from '$lib/data/shopProducts';
	import { products } from '$lib/data/products';
	import { basket } from '$lib/stores/basket';
	import YouNeedSection from '$lib/components/YouNeedSection.svelte';

	let { data } = $props();
	const product = $derived(data.product);
	const upcomingClasses = $derived(data.upcomingClasses ?? []);
	const shopProducts = $derived(data.shopProducts ?? []);

	/** When set, this product can be added to the shop basket (sellable). */
	const shopProductSlug = $derived(product ? productSlugToShopSlug[product.slug] : null);
	let addedToBasket = $state(false);

	function addToBasket() {
		if (!shopProductSlug) return;
		basket.add(shopProductSlug, 1, shopProducts);
		addedToBasket = true;
		setTimeout(() => (addedToBasket = false), 2000);
	}

	let showInterestModal = $state(false);
	let interestEmail = $state('');
	let interestName = $state('');
	let interestSubmitting = $state(false);
	let interestError = $state('');
	let interestSuccess = $state(false);

	function formatClassDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	/** Lowercase first letter for conversational benefits sentence. */
	function formatBenefit(s: string): string {
		return s[0].toLowerCase() + s.slice(1);
	}

	function openInterestModal() {
		interestEmail = data.user?.email ?? '';
		interestName = '';
		interestError = '';
		interestSuccess = false;
		showInterestModal = true;
	}

	function closeInterestModal() {
		showInterestModal = false;
	}

	async function submitInterest(e: Event) {
		e.preventDefault();
		if (!product) return;
		interestError = '';
		if (!interestEmail.trim() || !interestEmail.includes('@')) {
			interestError = 'Please enter a valid email address.';
			return;
		}
		interestSubmitting = true;
		try {
			const res = await fetch('/api/product-interest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productSlug: product.slug,
					email: interestEmail.trim().toLowerCase(),
					name: interestName.trim() || undefined
				})
			});
			const result = await res.json().catch(() => ({}));
			if (!res.ok) {
				interestError = result.error ?? 'Something went wrong. Please try again.';
				return;
			}
			interestSuccess = true;
		} finally {
			interestSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{product ? product.title : 'Product'} – Skin Assessment</title>
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		if (showInterestModal && e.key === 'Escape') closeInterestModal();
	}}
/>

<main>
	{#if !product}
		<section class="bg-stone-900 px-6 py-24 sm:py-32">
			<div class="mx-auto max-w-2xl text-center text-white">
				<h1 class="text-3xl font-semibold sm:text-4xl">Product not found</h1>
				<p class="mt-4 text-stone-300">The product you're looking for doesn't exist or has been moved.</p>
				<a
					href="/products"
					class="mt-8 inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					View all products
				</a>
			</div>
		</section>
	{:else}
		<!-- Hero: full-bleed product image with overlay -->
		<section class="relative min-h-[70vh] overflow-hidden">
			<img
				src={product.imageUrl}
				alt=""
				width="1200"
				height="800"
				class="absolute inset-0 h-full w-full object-cover"
			/>
			<div class="absolute inset-0 bg-stone-900/60"></div>
			<div class="relative flex min-h-[70vh] flex-col justify-center px-6 py-16 sm:py-20 md:py-24">
				<div class="mx-auto w-full max-w-5xl">
					<h1 class="text-4xl font-semibold tracking-tight text-white drop-shadow sm:text-5xl md:text-6xl">{product.title}</h1>
					{#if product.price}
						<p class="mt-2 text-xl font-medium text-stone-200">{product.price}</p>
					{/if}
					<p class="mt-4 max-w-2xl text-lg text-stone-200 line-clamp-2">{product.shortDescription}</p>
					<div class="mt-8 flex flex-wrap items-center gap-4">
						{#if product.slug === 'one-to-one'}
							<a href="#book-one-to-one" class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent">Book a 30 min or 1 hour slot</a>
						{:else if product.productType === 'how-to' && product.tier === 'free'}
							<button
								type="button"
								onclick={openInterestModal}
								class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
							>
								Get free guide
							</button>
						{:else if shopProductSlug}
							<button
								type="button"
								onclick={addToBasket}
								class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
							>
								{addedToBasket ? 'Added to basket' : 'Add to basket'}
							</button>
							<a href="/basket" class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent">View basket</a>
						{:else}
							<button
								type="button"
								onclick={openInterestModal}
								class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
							>
								Register interest
							</button>
						{/if}
						<a href="/assess" class="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-4 text-base font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent">Assess my skin</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Register interest modal -->
		{#if showInterestModal && product}
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="interest-modal-title"
				onclick={(e) => e.target === e.currentTarget && closeInterestModal()}
			>
				<div
					class="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
					onclick={(e) => e.stopPropagation()}
				>
					{#if interestSuccess}
						<h2 id="interest-modal-title" class="text-xl font-semibold text-stone-900">Thank you</h2>
						<p class="mt-2 text-stone-600">
							{#if product.productType === 'how-to' && product.tier === 'free'}
								We'll send you the free guide shortly.
							{:else}
								We'll be in touch when we have news about {product.title}.
							{/if}
						</p>
						<div class="mt-6">
							<button
								type="button"
								onclick={closeInterestModal}
								class="w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
							>
								Close
							</button>
						</div>
					{:else}
						<h2 id="interest-modal-title" class="text-xl font-semibold text-stone-900">
							{#if product.productType === 'how-to' && product.tier === 'free'}
								Get the free guide
							{:else if product.productType === 'how-to' && product.tier === 'paid'}
								Buy {product.title}
							{:else}
								Register interest in {product.title}
							{/if}
						</h2>
						<p class="mt-2 text-sm text-stone-600">
							{#if product.productType === 'how-to' && product.tier === 'free'}
								Leave your email and we'll send you the link to the guide.
							{:else if product.productType === 'how-to' && product.tier === 'paid'}
								Leave your email and we'll send payment details and access.
							{:else}
								Leave your email and we'll notify you when we have dates or more info.
							{/if}
						</p>
						<form class="mt-6 space-y-4" onsubmit={submitInterest}>
							{#if interestError}
								<p class="text-sm text-red-600" role="alert">{interestError}</p>
							{/if}
							<div>
								<label for="interest-email" class="block text-sm font-medium text-stone-700">Email</label>
								<input
									id="interest-email"
									type="email"
									required
									bind:value={interestEmail}
									class="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
									placeholder="you@example.com"
									autocomplete="email"
								/>
							</div>
							<div>
								<label for="interest-name" class="block text-sm font-medium text-stone-700">Name (optional)</label>
								<input
									id="interest-name"
									type="text"
									bind:value={interestName}
									class="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
									placeholder="Your name"
									autocomplete="name"
								/>
							</div>
							<div class="flex gap-3">
								<button
									type="submit"
									disabled={interestSubmitting}
									class="flex-1 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-70"
								>
									{interestSubmitting
									? 'Sending…'
									: product.productType === 'how-to' && product.tier === 'free'
										? 'Get free guide'
										: product.productType === 'how-to' && product.tier === 'paid'
											? 'Buy'
											: 'Register interest'}
								</button>
								<button
									type="button"
									onclick={closeInterestModal}
									class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
								>
									Cancel
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Content -->
		<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
			<div class="mx-auto max-w-3xl">
				<p class="text-lg text-stone-700">{product.description}</p>
				{#if product.themes && product.themes.length > 0}
					<section class="mt-10">
						<h2 class="text-xl font-semibold text-stone-900 sm:text-2xl">Themes</h2>
						<p class="mt-4 text-stone-600">
							Sessions cover {product.themes.length === 1
								? product.themes[0]
								: product.themes.slice(0, -1).join(', ') + ' and ' + product.themes[product.themes.length - 1]}.
						</p>
					</section>
				{/if}
				{#if product.includes && product.includes.length > 0}
					<section class="mt-10">
						<h2 class="text-xl font-semibold text-stone-900 sm:text-2xl">What's included</h2>
						<ul class="mt-4 space-y-2 text-stone-600">
							{#each product.includes as item}
								<li class="flex items-start gap-3">
									<span class="mt-1.5 size-2 shrink-0 rounded-md bg-stone-900" aria-hidden="true"></span>
									{item}
								</li>
							{/each}
						</ul>
					</section>
				{/if}
				<YouNeedSection items={product.youNeed ?? []} />
				{#if product.benefits && product.benefits.length > 0}
					<section class="mt-10">
						<h2 class="text-xl font-semibold text-stone-900 sm:text-2xl">Benefits</h2>
						<p class="mt-4 text-stone-600 leading-relaxed">
							{#if product.benefits.length === 1}
								You'll get {formatBenefit(product.benefits[0])}.
							{:else if product.benefits.length === 2}
								You'll get {formatBenefit(product.benefits[0])} and {formatBenefit(product.benefits[1])}.
							{:else}
								You'll get {product.benefits.slice(0, -1).map(formatBenefit).join(', ')}, and {formatBenefit(product.benefits[product.benefits.length - 1])}.
							{/if}
						</p>
					</section>
				{/if}
				{#if product.slug === 'one-to-one'}
					<section id="book-one-to-one" class="mt-10 scroll-mt-8">
						<h2 class="text-xl font-semibold text-stone-900 sm:text-2xl">Book a bespoke slot</h2>
						<p class="mt-2 text-stone-600">Choose a 30-minute or 1-hour session that suits you. Pick a date and time below.</p>
						<div class="mt-6">
							<OneToOneBookingForm user={data.user ?? undefined} />
						</div>
					</section>
				{/if}
				{#if shopProductSlug && product}
					<section class="mt-10 rounded-2xl border-2 border-stone-200 bg-stone-50 p-6 sm:p-8">
						<h2 class="text-xl font-semibold text-stone-900 sm:text-2xl">Purchase</h2>
						<p class="mt-2 text-stone-600">Add to your basket and complete checkout when you're ready.</p>
						<div class="mt-6 flex flex-wrap items-center gap-4">
							<span class="text-xl font-semibold text-stone-900">{product.price}</span>
							<button
								type="button"
								onclick={addToBasket}
								class="inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-70"
							>
								{addedToBasket ? 'Added to basket' : 'Add to basket'}
							</button>
							<a href="/basket" class="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2">View basket</a>
							<a href="/shop/{shopProductSlug}" class="text-sm font-medium text-stone-600 hover:text-stone-900">View in shop →</a>
						</div>
					</section>
				{/if}
				{#if upcomingClasses.length > 0}
					<section class="mt-10">
						<h2 class="text-xl font-semibold text-stone-900 sm:text-2xl">Upcoming classes</h2>
						<p class="mt-2 text-stone-600">Book a place or add to your calendar.</p>
						<ul class="mt-4 space-y-3">
							{#each upcomingClasses.slice(0, 5) as classItem}
								<li class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
									<div>
										<p class="font-medium text-stone-900">{classItem.title}</p>
										<p class="mt-0.5 text-sm text-stone-600">{formatClassDate(classItem.start)}</p>
										{#if classItem.description}
											<p class="mt-1 text-sm text-stone-500">{classItem.description}</p>
										{/if}
									</div>
									<div class="flex flex-wrap gap-2">
										{#if classItem.bookingUrl}
											<a
												href={classItem.bookingUrl}
												class="inline-flex items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
											>
												Book
											</a>
										{/if}
										<a
											href="/book#calendar"
											class="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
										>
											Add to calendar
										</a>
									</div>
								</li>
							{/each}
						</ul>
						<p class="mt-3">
							<a href="/book" class="text-sm font-medium text-stone-700 underline hover:no-underline">View all upcoming classes and calendar options →</a>
						</p>
					</section>
				{:else}
					<p class="mt-8 text-sm text-stone-500">We'll be in touch when booking is available.</p>
				{/if}
			</div>
		</section>

		<!-- All products in one row -->
		<section class="border-b border-stone-200 bg-stone-50 px-6 py-12 sm:py-16">
			<div class="mx-auto max-w-5xl">
				<h2 class="text-xl font-semibold text-stone-900 sm:text-2xl">All products</h2>
				<div class="mt-6 flex gap-4 overflow-x-auto pb-2 sm:gap-6">
					{#each products as p}
						<a
							href="/products/{p.slug}"
							class="group flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							<div class="aspect-[4/3] overflow-hidden bg-stone-100">
								<img
									src={p.imageUrl}
									alt=""
									width="320"
									height="240"
									class="h-full w-full object-cover transition group-hover:scale-105"
								/>
							</div>
							<div class="p-4">
								<h3 class="font-semibold text-stone-900 group-hover:text-stone-700">{p.title}</h3>
								{#if p.price}
									<p class="mt-0.5 text-sm text-stone-600">{p.price}</p>
								{/if}
								<span class="mt-2 inline-block text-sm font-medium text-stone-900 underline group-hover:no-underline">View details</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>

		<!-- QR: scan to open this product on phone -->
		<section class="border-b border-stone-200 bg-stone-50 px-6 py-10 sm:py-12">
			<div class="mx-auto max-w-2xl">
				<div class="rounded-xl border border-stone-200 bg-white p-4 flex items-center gap-4">
					<img src="/api/qr?path=/products/{product.slug}" alt="QR code for {product.title}" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
					<div>
						<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
						<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open this product page on another device.</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Final CTA -->
		<section class="bg-stone-900 px-6 py-20 sm:py-28">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Start with an assessment</h2>
				<p class="mt-4 text-lg text-stone-300">
					Get your personalised skin scores first—then we'll suggest the right products and programmes for you.
				</p>
				<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
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
						View all products
					</a>
				</div>
			</div>
		</section>
	{/if}
</main>
