<script lang="ts">
	import { disableScrollHandling, onNavigate } from '$app/navigation';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import { basket } from '$lib/stores/basket';

	// When navigating TO /book?class=... (e.g. from /products/one-to-one), scroll to booking form. Layout is always mounted so this runs for cross-page nav.
	onNavigate(({ to }) => {
		const classParam = to?.url.searchParams.get('class');
		if (!classParam || to?.url.pathname !== '/book') return;
		disableScrollHandling();
		return () => {
			document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		};
	});

	let { children, data } = $props();

	let basketCount = $state(0);
	$effect(() => {
		const unsub = basket.subscribe((list) => {
			basketCount = list.reduce((s, i) => s + i.quantity, 0);
		});
		return unsub;
	});

	let openMenu = $state<string | null>(null);
	let discoverRef: HTMLElement | undefined;
	let programmesRef: HTMLElement | undefined;
	let moreRef: HTMLElement | undefined;
	let progressRef: HTMLElement | undefined;

	function toggleMenu(id: string) {
		openMenu = openMenu === id ? null : id;
	}
	function closeAll() {
		openMenu = null;
	}
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		const refs = [discoverRef, programmesRef, moreRef, progressRef];
		const clickedInside = refs.some((ref) => ref && ref.contains(target));
		if (!clickedInside) closeAll();
	}

	const discoverLinks = [
		{ href: '/features', label: 'Features' },
		{ href: '/how-it-works', label: 'How it works' },
		{ href: '/your-results', label: 'Your results' }
	];
	const programmesLinks = [
		{ href: '/products', label: 'Products' },
		{ href: '/book', label: 'Book a class' },
		{ href: '/book/one-to-one', label: 'Book one-to-one' },
		{ href: '/shop', label: 'Shop' },
		{ href: '/routines', label: 'Routines' },
		{ href: '/wellbeing', label: 'Wellbeing' }
	];
	const moreLinks = [
		{ href: '/docs', label: 'Docs' },
		{ href: '/demo', label: 'Demo & screenshots' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onclick={handleClickOutside} />

<div class="flex min-h-screen flex-col">
<header class="shrink-0 sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
	<nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4" aria-label="Main">
		<a href="/" class="shrink-0 text-lg font-semibold text-stone-900 hover:text-stone-700">Skin Assessment</a>
		<ul class="flex flex-nowrap items-center gap-2 text-sm font-medium text-stone-600 sm:gap-3">
			<li class="relative shrink-0" bind:this={discoverRef}>
				<button
					type="button"
					class="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900 sm:px-3"
					onclick={() => toggleMenu('discover')}
					aria-expanded={openMenu === 'discover'}
					aria-haspopup="true"
					aria-controls="discover-menu"
				>
					Discover
					<svg class="size-4 transition-transform {openMenu === 'discover' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
				</button>
				{#if openMenu === 'discover'}
					<div id="discover-menu" role="menu" class="absolute left-0 top-full z-50 mt-1 min-w-[11rem] rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
						{#each discoverLinks as link}<a href={link.href} role="menuitem" class="block px-4 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900" onclick={closeAll}>{link.label}</a>{/each}
					</div>
				{/if}
			</li>
			<li class="relative shrink-0" bind:this={programmesRef}>
				<button
					type="button"
					class="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900 sm:px-3"
					onclick={() => toggleMenu('programmes')}
					aria-expanded={openMenu === 'programmes'}
					aria-haspopup="true"
					aria-controls="programmes-menu"
				>
					Programmes
					<svg class="size-4 transition-transform {openMenu === 'programmes' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
				</button>
				{#if openMenu === 'programmes'}
					<div id="programmes-menu" role="menu" class="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
						{#each programmesLinks as link}<a href={link.href} role="menuitem" class="block px-4 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900 {link.label === 'Shop' ? 'font-medium text-stone-900' : ''}" onclick={closeAll}>{link.label}</a>{/each}
					</div>
				{/if}
			</li>
			<li class="shrink-0">
				<a href="/basket" class="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900 text-stone-600">
					Basket
					{#if basketCount > 0}
						<span class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs font-medium text-white">{basketCount}</span>
					{/if}
				</a>
			</li>
			<li class="relative shrink-0" bind:this={moreRef}>
				<button
					type="button"
					class="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900 sm:px-3"
					onclick={() => toggleMenu('more')}
					aria-expanded={openMenu === 'more'}
					aria-haspopup="true"
					aria-controls="more-menu"
				>
					More
					<svg class="size-4 transition-transform {openMenu === 'more' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
				</button>
				{#if openMenu === 'more'}
					<div id="more-menu" role="menu" class="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
						{#each moreLinks as link}<a href={link.href} role="menuitem" class="block px-4 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900" onclick={closeAll}>{link.label}</a>{/each}
						{#if data.isAdmin}
							<div class="my-1 border-t border-stone-200"></div>
							<a href="/admin" role="menuitem" class="block px-4 py-2 font-medium text-stone-900 hover:bg-stone-100" onclick={closeAll}>Admin</a>
						{/if}
					</div>
				{/if}
			</li>
			{#if data.user}
				<li class="relative shrink-0" bind:this={progressRef}>
					<button
						type="button"
						class="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900 sm:px-3"
						onclick={() => toggleMenu('progress')}
						aria-expanded={openMenu === 'progress'}
						aria-haspopup="true"
						aria-controls="progress-menu"
					>
						My progress
						<svg class="size-4 transition-transform {openMenu === 'progress' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
					</button>
					{#if openMenu === 'progress'}
						<div id="progress-menu" role="menu" class="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
							<a href="/progress" role="menuitem" class="block px-4 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900" onclick={closeAll}>Progress</a>
							<a href="/products/for-you" role="menuitem" class="block px-4 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900" onclick={closeAll}>Picks for you</a>
							<a href="/profile" role="menuitem" class="block px-4 py-2 font-medium text-stone-900 hover:bg-stone-100" onclick={closeAll}>My account</a>
						</div>
					{/if}
				</li>
				<li class="shrink-0">
					<button
						type="button"
						class="whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900"
						onclick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}
					>
						Sign out
					</button>
				</li>
			{:else}
				<li class="shrink-0"><a href="/sign-in" class="whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900">Log in</a></li>
				<li class="shrink-0"><a href="/sign-up" class="whitespace-nowrap rounded-md px-3 py-2 hover:bg-stone-100 hover:text-stone-900">Register</a></li>
			{/if}
			<li><a href="/assess" class="shrink-0 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 whitespace-nowrap">Assess my skin</a></li>
		</ul>
	</nav>
</header>

<div class="flex min-h-0 flex-1 flex-col">
	{@render children()}
</div>

<footer class="shrink-0 border-t border-stone-200 bg-stone-100 px-6 py-12">
	<div class="mx-auto max-w-5xl">
		<div class="grid grid-cols-2 gap-8 sm:grid-cols-4 md:gap-10">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Legal</p>
				<ul class="mt-3 space-y-2 text-sm text-stone-600">
					<li><a href="/terms" class="hover:text-stone-900">Terms</a></li>
					<li><a href="/terms#cancellation" class="hover:text-stone-900">Cancellation & refunds</a></li>
					<li><a href="/privacy" class="hover:text-stone-900">Privacy</a></li>
					<li><a href="/cookies" class="hover:text-stone-900">Cookies</a></li>
				</ul>
			</div>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Discover</p>
				<ul class="mt-3 space-y-2 text-sm text-stone-600">
					<li><a href="/features" class="hover:text-stone-900">Features</a></li>
					<li><a href="/how-it-works" class="hover:text-stone-900">How it works</a></li>
					<li><a href="/your-results" class="hover:text-stone-900">Your results</a></li>
					<li><a href="/routines" class="hover:text-stone-900">Routines</a></li>
					<li><a href="/wellbeing" class="hover:text-stone-900">Wellbeing</a></li>
				</ul>
			</div>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Products & book</p>
				<ul class="mt-3 space-y-2 text-sm text-stone-600">
					<li><a href="/products" class="hover:text-stone-900">Products</a></li>
					<li><a href="/products/for-you" class="hover:text-stone-900">Picks for you</a></li>
					<li><a href="/shop" class="hover:text-stone-900">Shop</a></li>
					<li><a href="/book" class="hover:text-stone-900">Book a class</a></li>
					<li><a href="/book/one-to-one" class="hover:text-stone-900">Book one-to-one</a></li>
				</ul>
			</div>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-stone-500">Support</p>
				<ul class="mt-3 space-y-2 text-sm text-stone-600">
					<li><a href="/docs" class="hover:text-stone-900">Docs</a></li>
					<li><a href="/demo" class="hover:text-stone-900">Demo & screenshots</a></li>
					<li><a href="/about" class="hover:text-stone-900">About</a></li>
					<li><a href="/contact" class="hover:text-stone-900">Contact</a></li>
					{#if data.isAdmin}
						<li><a href="/admin" class="font-medium text-stone-700 hover:text-stone-900">Admin</a></li>
					{/if}
				</ul>
			</div>
		</div>
		<div class="mt-10 border-t border-stone-200 pt-8">
			<p class="text-sm text-stone-500">Skin Assessment. Understand your skin.</p>
		</div>
	</div>
</footer>
</div>

<CookieBanner />
