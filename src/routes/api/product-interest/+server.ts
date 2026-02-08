import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { productInterest } from '$lib/server/db/schema';
import { getProductBySlug } from '$lib/data/products';
import { generateId } from 'lucia';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') {
		return json({ error: 'Invalid request' }, { status: 400 });
	}
	const o = body as Record<string, unknown>;
	const productSlug = typeof o.productSlug === 'string' ? o.productSlug.trim() : '';
	const emailParam = o.email;
	const nameParam = o.name;

	if (!productSlug) {
		return json({ error: 'Product is required' }, { status: 400 });
	}
	const product = getProductBySlug(productSlug);
	if (!product) {
		return json({ error: 'Product not found' }, { status: 404 });
	}

	let email: string;
	if (locals.user && 'email' in locals.user && typeof locals.user.email === 'string') {
		email = locals.user.email;
	} else if (typeof emailParam === 'string' && emailParam.includes('@')) {
		email = emailParam.trim().toLowerCase();
	} else {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	const name =
		typeof nameParam === 'string' && nameParam.trim()
			? nameParam.trim().slice(0, 200)
			: null;

	const id = generateId(20);
	const createdAt = new Date();

	await db.insert(productInterest).values({
		id,
		productSlug,
		email,
		name,
		userId: locals.user?.id ?? null,
		createdAt
	});

	return json({
		ok: true,
		message: "Thanks – we'll be in touch when we have news about " + product.title + '.'
	});
};
