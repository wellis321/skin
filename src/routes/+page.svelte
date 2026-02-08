<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<main class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16">
	<div class="max-w-xl text-center">
		<h1 class="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
			Understand your skin
		</h1>
		<p class="mt-6 text-lg text-stone-600">
			We analyse your photo for skin texture and evenness, then give you clear, personalised scores and
			feedback on wrinkles, lines and blemishes—so you can care for your skin with confidence.
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a
				href="/assess"
				class="inline-flex items-center justify-center rounded-md bg-stone-900 px-8 py-4 text-base font-medium text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			>
				Assess my skin
			</a>
			<a
				href="/products/for-you"
				class="inline-flex items-center justify-center rounded-md border-2 border-stone-900 px-8 py-4 text-base font-medium text-stone-900 transition hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
			>
				See your picks
			</a>
		</div>
		<div class="mt-12 rounded-xl border border-stone-200 bg-stone-50 p-4 inline-flex items-center gap-4">
			<img src="/api/qr?path=/" alt="QR code for home page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
			<div>
				<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
				<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open this site on another device.</p>
			</div>
		</div>
	</div>
</main>
