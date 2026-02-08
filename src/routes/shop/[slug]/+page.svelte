<script lang="ts">
	import { basket } from '$lib/stores/basket';

	let { data } = $props();
	const product = $derived(data.product);
	const shopProducts = $derived(data.shopProducts ?? []);
	const isAdmin = $derived(data.isAdmin ?? false);
	const productSource = $derived(data.productSource ?? null);

	let quantity = $state(1);
	let added = $state(false);

	function addToBasket() {
		if (!product) return;
		basket.add(product.slug, quantity, shopProducts);
		added = true;
		setTimeout(() => (added = false), 2000);
	}
</script>

<svelte:head>
	<title>{product ? product.title : 'Product'} – Shop</title>
</svelte:head>

<main>
	{#if !product}
		<section class="bg-stone-900 px-6 py-24 sm:py-32">
			<div class="mx-auto max-w-2xl text-center text-white">
				<h1 class="text-3xl font-semibold sm:text-4xl">Product not found</h1>
				<p class="mt-4 text-stone-300">This product doesn't exist or has been removed.</p>
				<a
					href="/shop"
					class="mt-8 inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 hover:bg-stone-100"
				>
					Back to shop
				</a>
			</div>
		</section>
		{:else}
		{#if isAdmin}
			<div class="border-b border-amber-200 bg-amber-50 px-6 py-3">
				<div class="mx-auto max-w-5xl flex flex-wrap items-center gap-2 text-sm text-amber-900">
					<span class="font-medium">Admin:</span>
					{#if productSource === 'db'}
						<a href="/admin#shop-products" class="underline hover:no-underline">Edit or delete this product in admin</a>
					{:else}
						<span>This product is defined in code. To edit or delete it, <a href="/admin?createSlug={encodeURIComponent(product.slug)}#shop-products" class="underline hover:no-underline">create an editable copy in admin</a> (use the same slug – it will replace this version).</span>
					{/if}
				</div>
			</div>
		{/if}
		<!-- Breadcrumb -->
		<nav class="border-b border-stone-200 bg-stone-50 px-6 py-3" aria-label="Breadcrumb">
			<div class="mx-auto max-w-5xl">
				<ol class="flex flex-wrap items-center gap-2 text-sm text-stone-600">
					<li><a href="/shop" class="hover:text-stone-900">Shop</a></li>
					<li aria-hidden="true">/</li>
					<li class="font-medium text-stone-900">{product.title}</li>
				</ol>
			</div>
		</nav>

		<section class="px-6 py-12 sm:py-16 md:py-20">
			<div class="mx-auto max-w-5xl">
				<div class="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
					<!-- Images -->
					<div class="space-y-4">
						<div class="aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
							<img
								src={product.imageUrl}
								alt=""
								width="600"
								height="600"
								class="h-full w-full object-cover"
							/>
						</div>
						{#if product.imageUrlSecondary}
							<div class="aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
								<img
									src={product.imageUrlSecondary}
									alt=""
									width="600"
									height="600"
									class="h-full w-full object-cover"
								/>
							</div>
						{/if}
					</div>

					<!-- Details & purchase -->
					<div>
						<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
							{product.title}
						</h1>
						<p class="mt-2 text-xl font-medium text-stone-700">{product.price}</p>
						{#if product.quantityLabel}
							<p class="mt-1 text-sm text-stone-500">{product.quantityLabel}</p>
						{/if}
						<p class="mt-4 text-stone-600">{product.shortDescription}</p>

						{#if product.inStock !== false}
							<div class="mt-8 space-y-4">
								<div>
									<label for="quantity" class="block text-sm font-medium text-stone-700">Quantity</label>
									<select
										id="quantity"
										bind:value={quantity}
										class="mt-1 block w-24 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
									>
										{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as n}
											<option value={n}>{n}</option>
										{/each}
									</select>
								</div>
								<button
									type="button"
									onclick={addToBasket}
									class="inline-flex items-center justify-center rounded-md bg-stone-900 px-8 py-4 text-base font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-70"
								>
									{added ? 'Added to basket' : 'Add to basket'}
								</button>
								<p class="text-sm text-stone-500">
									<a href="/basket" class="font-medium text-stone-700 underline hover:no-underline">View basket</a>
								</p>
							</div>
						{:else}
							<p class="mt-6 text-stone-500">Currently out of stock. <a href="/contact" class="font-medium text-stone-700 underline hover:no-underline">Get in touch</a> to be notified.</p>
						{/if}

						<!-- Full description (placeholder) -->
						<div class="mt-10 border-t border-stone-200 pt-10">
							<h2 class="text-lg font-semibold text-stone-900">Description</h2>
							<div class="mt-3 whitespace-pre-line text-stone-600">
								{product.description}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Back to shop -->
		<section class="border-t border-stone-200 bg-stone-50 px-6 py-10">
			<div class="mx-auto max-w-5xl">
				<a href="/shop" class="text-sm font-medium text-stone-700 underline hover:no-underline">← Back to shop</a>
			</div>
		</section>
	{/if}
</main>
