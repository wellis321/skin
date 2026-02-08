<script lang="ts">
	import { basket } from '$lib/stores/basket';

	let { data } = $props();
	const shopProducts = $derived(data.shopProducts ?? []);

	let items = $state<{ slug: string; title: string; priceAmount: number; quantity: number }[]>([]);
	let total = $state(0);

	$effect(() => {
		const unsub = basket.subscribe((list) => {
			items = list;
			total = list.reduce((sum, i) => sum + i.priceAmount * i.quantity, 0);
		});
		return unsub;
	});

	function getProduct(slug: string) {
		return shopProducts.find((p: { slug: string }) => p.slug === slug);
	}

	function setQuantity(slug: string, qty: number) {
		basket.setQuantity(slug, qty, shopProducts);
	}

	function remove(slug: string) {
		basket.remove(slug);
	}
</script>

<svelte:head>
	<title>Basket – Skin Assessment</title>
</svelte:head>

<main>
	<section class="border-b border-stone-200 bg-stone-50 px-6 py-10">
		<div class="mx-auto max-w-3xl">
			<h1 class="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Basket</h1>
			<p class="mt-2 text-stone-600">
				Review your items. Checkout is placeholder for now—we'll add payment when you're ready to sell.
			</p>
			<p class="mt-4">
				<a href="/shop" class="text-sm font-medium text-stone-700 underline hover:no-underline">← Continue shopping</a>
			</p>
		</div>
	</section>

	<section class="px-6 py-12 sm:py-16">
		<div class="mx-auto max-w-3xl">
			{#if items.length === 0}
				<div class="rounded-2xl border border-stone-200 bg-stone-50 p-10 text-center">
					<p class="text-stone-600">Your basket is empty.</p>
					<a
						href="/shop"
						class="mt-6 inline-flex items-center justify-center rounded-md bg-stone-900 px-6 py-3 text-base font-medium text-white hover:bg-stone-800"
					>
						Browse shop
					</a>
				</div>
			{:else}
				<ul class="space-y-4">
					{#each items as item}
						{@const product = getProduct(item.slug)}
						<li class="flex flex-wrap items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:gap-6 sm:p-5">
							{#if product}
								<a href="/shop/{item.slug}" class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:h-24 sm:w-24">
									<img src={product.imageUrl} alt="" class="h-full w-full object-cover" width="96" height="96" />
								</a>
							{/if}
							<div class="min-w-0 flex-1">
								<a href="/shop/{item.slug}" class="font-medium text-stone-900 hover:underline">{item.title}</a>
								<p class="mt-0.5 text-sm text-stone-600">£{item.priceAmount.toFixed(2)} each</p>
							</div>
							<div class="flex items-center gap-3">
								<label for="qty-{item.slug}" class="sr-only">Quantity</label>
								<select
									id="qty-{item.slug}"
									value={item.quantity}
									onchange={(e) => setQuantity(item.slug, parseInt((e.currentTarget as HTMLSelectElement).value, 10))}
									class="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
								>
									{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as n}
										<option value={n}>{n}</option>
									{/each}
								</select>
								<button
									type="button"
									onclick={() => remove(item.slug)}
									class="text-sm text-stone-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-stone-500"
									aria-label="Remove from basket"
								>
									Remove
								</button>
							</div>
							<div class="w-20 text-right font-medium text-stone-900 sm:w-24">
								£{(item.priceAmount * item.quantity).toFixed(2)}
							</div>
						</li>
					{/each}
				</ul>

				<div class="mt-10 flex flex-col items-end gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:flex-row sm:justify-between sm:items-center">
					<div>
						<p class="text-lg font-semibold text-stone-900">Subtotal: £{total.toFixed(2)}</p>
						<p class="mt-1 text-sm text-stone-500">Shipping and tax calculated at checkout (placeholder).</p>
					</div>
					<button
						type="button"
						disabled
						class="rounded-md border-2 border-stone-300 bg-stone-100 px-8 py-3 text-base font-medium text-stone-500 cursor-not-allowed"
						title="Checkout coming soon"
					>
						Checkout (coming soon)
					</button>
				</div>
				<p class="mt-4 text-sm text-stone-500">
					Checkout and payment will be added when you're ready to sell. For now, basket is for collecting items. <a href="/contact" class="font-medium text-stone-700 underline hover:no-underline">Get in touch</a> to discuss orders.
				</p>
			{/if}
		</div>
	</section>
</main>
