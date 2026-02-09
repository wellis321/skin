/**
 * Server-only shop product helpers: DB + static merge, create.
 */
import { db } from '$lib/server/db';
import { shopProduct as shopProductTable } from '$lib/server/db/schema';
import {
	shopProducts as staticProducts,
	getShopProductBySlug as getStaticBySlug,
	type ShopProduct as AppShopProduct
} from '$lib/data/shopProducts';
import { desc, eq, and, ne } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/** Normalise DB row (camelCase or snake_case from Postgres) to app ShopProduct shape. */
function rowToApp(row: Record<string, unknown>): AppShopProduct {
	return {
		slug: String(row.slug ?? ''),
		title: String(row.title ?? ''),
		shortDescription: String(row.shortDescription ?? row.short_description ?? ''),
		description: String(row.description ?? ''),
		price: String(row.price ?? ''),
		priceAmount: Number(row.priceAmount ?? row.price_amount ?? 0),
		imageUrl: String(row.imageUrl ?? row.image_url ?? ''),
		imageUrlSecondary: (row.imageUrlSecondary ?? row.image_url_secondary) != null ? String(row.imageUrlSecondary ?? row.image_url_secondary) : undefined,
		quantityLabel: (row.quantityLabel ?? row.quantity_label) != null ? String(row.quantityLabel ?? row.quantity_label) : undefined,
		inStock: Boolean(row.inStock ?? row.in_stock ?? true)
	};
}

/** All shop products: static list with DB rows merged (DB overrides by slug). */
export async function getMergedShopProducts(): Promise<AppShopProduct[]> {
	const rows = await db
		.select()
		.from(shopProductTable)
		.orderBy(desc(shopProductTable.createdAt));

	const bySlug = new Map<string, AppShopProduct>();
	for (const p of staticProducts) {
		bySlug.set(p.slug, p);
	}
	for (const r of rows) {
		bySlug.set(r.slug, rowToApp(r));
	}
	return Array.from(bySlug.values());
}

/** Get one product by slug: DB first, then static. */
export async function getMergedShopProductBySlug(slug: string): Promise<AppShopProduct | null> {
	const rows = await db.select().from(shopProductTable).where(eq(shopProductTable.slug, slug));
	if (rows.length > 0) return rowToApp(rows[0]);
	const staticP = getStaticBySlug(slug);
	return staticP ?? null;
}

/** Whether the product at this slug is stored in the DB (editable in admin) or only in code (static). */
export async function getShopProductSource(slug: string): Promise<'db' | 'static'> {
	const rows = await db.select({ id: shopProductTable.id }).from(shopProductTable).where(eq(shopProductTable.slug, slug));
	return rows.length > 0 ? 'db' : 'static';
}

/** List only DB-created shop products (for admin). */
export async function getShopProductsFromDb() {
	return db.select().from(shopProductTable).orderBy(desc(shopProductTable.createdAt));
}

export type CreateShopProductInput = {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	price: string;
	priceAmount: number;
	imageUrl: string;
	imageUrlSecondary?: string;
	quantityLabel?: string;
	inStock?: boolean;
};

/** Create a shop product in the DB. Slug must be unique. */
export async function createShopProductInDb(input: CreateShopProductInput): Promise<{ ok: true } | { ok: false; error: string }> {
	const slug = input.slug.trim().toLowerCase().replace(/\s+/g, '-');
	if (!slug) return { ok: false, error: 'Slug is required' };
	const existing = await db.select({ id: shopProductTable.id }).from(shopProductTable).where(eq(shopProductTable.slug, slug));
	if (existing.length > 0) return { ok: false, error: 'A product with this slug already exists' };

	await db.insert(shopProductTable).values({
		id: randomUUID(),
		slug,
		title: input.title.trim(),
		shortDescription: input.shortDescription.trim(),
		description: input.description.trim(),
		price: input.price.trim(),
		priceAmount: input.priceAmount,
		imageUrl: input.imageUrl.trim(),
		imageUrlSecondary: input.imageUrlSecondary?.trim() ?? null,
		quantityLabel: input.quantityLabel?.trim() ?? null,
		inStock: input.inStock !== false,
		createdAt: new Date()
	});
	return { ok: true };
}

export type UpdateShopProductInput = {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	price: string;
	priceAmount: number;
	imageUrl: string;
	imageUrlSecondary?: string;
	quantityLabel?: string;
	inStock?: boolean;
};

/** Update a shop product by id. Slug must stay unique (excluding this product). */
export async function updateShopProductInDb(
	id: string,
	input: UpdateShopProductInput
): Promise<{ ok: true } | { ok: false; error: string }> {
	const slug = input.slug.trim().toLowerCase().replace(/\s+/g, '-');
	if (!slug) return { ok: false, error: 'Slug is required' };
	const existing = await db
		.select({ id: shopProductTable.id })
		.from(shopProductTable)
		.where(and(eq(shopProductTable.slug, slug), ne(shopProductTable.id, id)));
	if (existing.length > 0) return { ok: false, error: 'Another product already uses this slug' };

	await db
		.update(shopProductTable)
		.set({
			slug,
			title: input.title.trim(),
			shortDescription: input.shortDescription.trim(),
			description: input.description.trim(),
			price: input.price.trim(),
			priceAmount: input.priceAmount,
			imageUrl: input.imageUrl.trim(),
			imageUrlSecondary: input.imageUrlSecondary?.trim() ?? null,
			quantityLabel: input.quantityLabel?.trim() ?? null,
			inStock: input.inStock !== false
		})
		.where(eq(shopProductTable.id, id));
	return { ok: true };
}

/** Delete a shop product by id. */
export async function deleteShopProductInDb(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
	const rows = await db.select({ id: shopProductTable.id }).from(shopProductTable).where(eq(shopProductTable.id, id));
	if (rows.length === 0) return { ok: false, error: 'Product not found' };
	await db.delete(shopProductTable).where(eq(shopProductTable.id, id));
	return { ok: true };
}
