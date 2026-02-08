<script lang="ts">
	import type { YouNeedItem } from '$lib/data/products';

	/** Standard "You'll need" section: list of items (plain text or label + link for products/affiliate). */
	let { items = [], title = "You'll need" }: { items: YouNeedItem[]; title?: string } = $props();

	function normalize(item: YouNeedItem): { label: string; url: string | null; affiliate?: boolean } {
		if (typeof item === 'string') return { label: item, url: null };
		return { label: item.label, url: item.url, affiliate: item.affiliate };
	}
</script>

{#if items.length > 0}
	<section class="mt-10" aria-labelledby="you-need-heading">
		<h2 id="you-need-heading" class="text-xl font-semibold text-stone-900 sm:text-2xl">{title}</h2>
		<div class="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-5">
			<ul class="space-y-2.5 text-stone-600">
				{#each items as item}
					{@const { label, url, affiliate } = normalize(item)}
					<li class="flex items-start gap-3">
						<span class="mt-1.5 size-2 shrink-0 rounded-full bg-stone-400" aria-hidden="true"></span>
						{#if url}
							<a
								href={url}
								class="font-medium text-stone-900 underline decoration-stone-400 underline-offset-2 hover:decoration-stone-600"
								target="_blank"
								rel="noopener noreferrer{affiliate ? ' sponsored' : ''}"
							>
								{label}
								<span class="sr-only">(opens in new tab{affiliate ? ', affiliate link' : ''})</span>
							</a>
						{:else}
							<span>{label}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}
