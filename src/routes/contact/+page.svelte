<script lang="ts">
	import { PLACEHOLDER_MAP } from '$lib/data/placeholderImages';
</script>

<svelte:head>
	<title>Contact us – Skin Assessment</title>
</svelte:head>

<main>
	<!-- Hero: split — left headline, right "form teaser" (decorative inputs) -->
	<section class="relative overflow-hidden bg-stone-800 px-6 py-20 sm:py-28 md:py-32">
		<div class="mx-auto max-w-5xl">
			<div class="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
				<div class="text-white">
					<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
						Get in touch
					</h1>
					<p class="mt-6 text-lg text-stone-300 sm:text-xl">
						Questions, feedback or interest in our programmes. We'll respond as soon as we can.
					</p>
					<div class="mt-10">
						<a href="#contact-form" class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-800">Send a message</a>
					</div>
				</div>
				<div class="rounded-2xl border border-stone-600 bg-stone-900/50 p-6 sm:p-8">
					<p class="text-xs font-medium uppercase tracking-wider text-stone-500">We'll get back to you</p>
					<div class="mt-4 space-y-3">
						<div class="h-12 rounded-lg bg-stone-700/50 border border-stone-600" aria-hidden="true"></div>
						<div class="h-12 rounded-lg bg-stone-700/50 border border-stone-600" aria-hidden="true"></div>
						<div class="h-24 rounded-lg bg-stone-700/50 border border-stone-600" aria-hidden="true"></div>
					</div>
					<p class="mt-4 text-sm text-stone-500">Scroll down to the form below.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Form + info -->
	<section id="contact-form" class="border-b border-stone-200 bg-white px-6 py-16 sm:py-20 md:py-24 scroll-mt-20">
		<div class="mx-auto max-w-4xl">
			<div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
				<div>
					<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Send a message</h2>
					<p class="mt-2 text-stone-600">
						This form is a placeholder—no message is sent yet.
					</p>
					<form class="mt-8 space-y-5" onsubmit={(e) => e.preventDefault()}>
						<div>
							<label for="contact-name" class="block text-sm font-medium text-stone-700">Name</label>
							<input
								id="contact-name"
								type="text"
								name="name"
								class="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
								placeholder="Your name"
							/>
						</div>
						<div>
							<label for="contact-email" class="block text-sm font-medium text-stone-700">Email</label>
							<input
								id="contact-email"
								type="email"
								name="email"
								class="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
								placeholder="you@example.com"
							/>
						</div>
						<div>
							<label for="contact-message" class="block text-sm font-medium text-stone-700">Message</label>
							<textarea
								id="contact-message"
								name="message"
								rows="5"
								class="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
								placeholder="Your message"
							></textarea>
						</div>
						<button
							type="submit"
							class="rounded-md bg-stone-900 px-8 py-3.5 text-base font-medium text-white shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
						>
							Send message
						</button>
					</form>
				</div>
				<div>
					<h2 class="text-2xl font-semibold text-stone-900 sm:text-3xl">Other ways to reach us</h2>
					<ul class="mt-6 space-y-4 text-lg text-stone-600">
						<li><strong class="text-stone-800">Email:</strong> hello@example.com</li>
						<li><strong class="text-stone-800">Address:</strong> [Placeholder address]</li>
					</ul>
					<div class="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
						<img src="/api/qr?path=/contact" alt="QR code for contact page" width="96" height="96" class="rounded-lg border border-stone-200 shrink-0" />
						<div>
							<p class="text-sm font-medium text-stone-900">Scan to open on your phone</p>
							<p class="mt-0.5 text-xs text-stone-600">Use your phone camera to open the contact page on another device.</p>
						</div>
					</div>
					<div class="mt-10 aspect-video w-full max-w-sm overflow-hidden rounded-2xl bg-stone-100">
						<img
							src={PLACEHOLDER_MAP}
							alt=""
							width="400"
							height="225"
							class="h-full w-full object-cover"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="bg-stone-900 px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Try a free assessment</h2>
			<p class="mt-4 text-lg text-stone-300">
				Get your personalised skin scores and recommendations in seconds.
			</p>
			<div class="mt-10">
				<a
					href="/assess"
					class="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-medium text-stone-900 shadow-sm hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
				>
					Assess my skin
				</a>
			</div>
		</div>
	</section>
</main>
