<script lang="ts">
	import OneToOneBookingForm from '$lib/components/OneToOneBookingForm.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Book a one-to-one slot – Skin Assessment</title>
</svelte:head>

<main>
	<section class="relative overflow-hidden bg-stone-900 px-6 py-20 sm:py-28 md:py-32">
		<div class="mx-auto max-w-3xl">
			<div class="text-white">
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
					Book a one-to-one slot
				</h1>
				<p class="mt-6 text-lg text-stone-300 sm:text-xl">
					Choose a 30-minute or 1-hour bespoke session that suits you. Pick a date and time, then we'll confirm and send the Zoom link by email.
				</p>
				<nav class="mt-6">
					<a
						href="/book"
						class="text-stone-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
					>
						← Back to Book a class
					</a>
				</nav>
				<div class="mt-10 flex flex-wrap items-center gap-4 rounded-xl border border-stone-700 bg-stone-800/50 p-6">
					<img src="/api/qr?path=/book/one-to-one" alt="QR code for one-to-one booking" width="96" height="96" class="rounded-lg border border-stone-600" />
					<div>
						<p class="font-medium text-white">Scan to book on your phone</p>
						<p class="mt-1 text-sm text-stone-400">Use your phone camera to open this page on another device.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20">
		<div class="mx-auto max-w-2xl">
			<OneToOneBookingForm user={data?.user ?? undefined} />
		</div>
	</section>

	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">One-to-one programme</h2>
			<p class="mt-4 text-lg text-stone-300">
				Tailored support, custom exercises and progress reviews. See the full programme.
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a
					href="/products/one-to-one"
					class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					One-to-one programme
				</a>
			</div>
		</div>
	</section>
</main>
