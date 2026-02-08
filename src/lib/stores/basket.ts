/**
 * Basket store for shop products. Persists to localStorage so items survive reload.
 * Use only in browser (store reads/writes localStorage on init and update).
 * Pass merged shopProducts (from layout data) when adding/setting so DB-created products resolve.
 */
import { getShopProductBySlug } from '$lib/data/shopProducts';
import type { ShopProduct } from '$lib/data/shopProducts';
import { writable } from 'svelte/store';

function resolveProduct(slug: string, products?: ShopProduct[] | null): ShopProduct | undefined {
	if (products?.length) {
		const p = products.find((x) => x.slug === slug);
		if (p) return p;
	}
	return getShopProductBySlug(slug);
}

export interface BasketItem {
	slug: string;
	title: string;
	priceAmount: number;
	quantity: number;
}

const STORAGE_KEY = 'skin-shop-basket';

function loadFromStorage(): BasketItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as BasketItem[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveToStorage(items: BasketItem[]) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {}
}

function createBasketStore() {
	const items = loadFromStorage();
	const { subscribe, set, update } = writable<BasketItem[]>(items);

	function persist(list: BasketItem[]) {
		saveToStorage(list);
	}

	return {
		subscribe,
		add(slug: string, quantity: number = 1, products?: ShopProduct[] | null) {
			const product = resolveProduct(slug, products);
			if (!product) return;
			update((list) => {
				const existing = list.find((i) => i.slug === slug);
				const rest = list.filter((i) => i.slug !== slug);
				const newQty = (existing?.quantity ?? 0) + quantity;
				if (newQty < 1) return rest;
				const next: BasketItem[] = [
					...rest,
					{ slug, title: product.title, priceAmount: product.priceAmount, quantity: newQty }
				];
				persist(next);
				return next;
			});
		},
		setQuantity(slug: string, quantity: number, products?: ShopProduct[] | null) {
			if (quantity < 1) {
				this.remove(slug);
				return;
			}
			const product = resolveProduct(slug, products);
			if (!product) return;
			update((list) => {
				const rest = list.filter((i) => i.slug !== slug);
				const next: BasketItem[] = [
					...rest,
					{ slug, title: product.title, priceAmount: product.priceAmount, quantity }
				];
				persist(next);
				return next;
			});
		},
		remove(slug: string) {
			update((list) => {
				const next = list.filter((i) => i.slug !== slug);
				persist(next);
				return next;
			});
		},
		clear() {
			set([]);
			persist([]);
		}
	};
}

export const basket = createBasketStore();
