<script lang="ts">
	import { getThemedImage } from '$lib/data/placeholderImages';

	let { data } = $props();
	const shopProducts = $derived(data.shopProducts ?? []);
</script>

<svelte:head>
	<title>Shop – Natural facial products – Skin Assessment</title>
</svelte:head>

<main>
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<div
			class="absolute inset-0 bg-cover bg-center bg-no-repeat"
			style="background-image: url('{getThemedImage(3, 1920)}');"
			aria-hidden="true"
		></div>
		<div class="absolute inset-0 bg-stone-900/75" aria-hidden="true"></div>
		<div class="relative z-10 mx-auto max-w-5xl">
			<div class="text-white">
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
					Natural facial products
				</h1>
				<p class="mt-6 text-lg text-stone-300 sm:text-xl">
					Oils and serums chosen to work with face yoga and gua sha—clean ingredients, no harsh additives. Perfect companions for your routine.
				</p>
				<div class="mt-10 flex flex-wrap items-center gap-4">
					<a
						href="/basket"
						class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						View basket
					</a>
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Products</h2>
			<p class="mt-2 text-stone-600">
				Browse our range. Add to basket and proceed to checkout when you're ready.
			</p>
			<ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each shopProducts as item}
					<li>
						<a
							href="/shop/{item.slug}"
							class="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							<div class="aspect-square overflow-hidden bg-stone-100">
								<img
									src={item.imageUrl}
									alt=""
									width="400"
									height="400"
									class="h-full w-full object-cover transition group-hover:scale-105"
								/>
							</div>
							<div class="flex flex-1 flex-col p-5">
								<h3 class="font-semibold text-stone-900 group-hover:text-stone-700">{item.title}</h3>
								<p class="mt-1 text-sm text-stone-600 line-clamp-2">{item.shortDescription}</p>
								<p class="mt-3 font-medium text-stone-900">{item.price}</p>
								<span class="mt-3 text-sm font-medium text-stone-600 group-hover:text-stone-900">View product →</span>
							</div>
						</a>
					</li>
				{/each}
			</ul>
			<div class="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
				<img src="/api/qr?path=/shop" alt="QR code for shop page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
				<div>
					<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
					<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open the shop page on another device.</p>
				</div>
			</div>
			<p class="mt-6 text-stone-600">
				<a href="/products" class="font-medium text-stone-900 underline decoration-stone-400 underline-offset-2 hover:decoration-stone-600">Back to products & programmes</a>
			</p>
		</div>
	</section>
</main>
