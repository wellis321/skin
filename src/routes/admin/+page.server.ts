import type { Actions, PageServerLoad } from './$types';
import { db, sqlite } from '$lib/server/db';
import { oneToOneBooking, productInterest, user, assessment } from '$lib/server/db/schema';
import { desc, and, gte, lt, eq } from 'drizzle-orm';
import {
	getGroupClasses,
	createGroupClassInDb,
	updateGroupClassInDb,
	deleteGroupClassInDb
} from '$lib/server/groupClasses';
import { getShopProductsFromDb, createShopProductInDb, updateShopProductInDb, deleteShopProductInDb } from '$lib/server/shopProducts';
import { products } from '$lib/data/products';
import { shopProducts as staticShopProducts } from '$lib/data/shopProducts';
import { fail } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async ({ url }) => {
	const bookings = await db
		.select()
		.from(oneToOneBooking)
		.orderBy(desc(oneToOneBooking.startAt))
		.limit(500);

	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const todayEnd = new Date(todayStart);
	todayEnd.setDate(todayEnd.getDate() + 1);
	const bookingsToday = await db
		.select({ id: oneToOneBooking.id })
		.from(oneToOneBooking)
		.where(and(gte(oneToOneBooking.startAt, todayStart), lt(oneToOneBooking.startAt, todayEnd)));
	const countBookingsToday = bookingsToday.length;

	const interests = await db
		.select()
		.from(productInterest)
		.orderBy(desc(productInterest.createdAt))
		.limit(200);

	const countBookings = sqlite.prepare('SELECT count(*) as c FROM one_to_one_booking').get() as {
		c: number;
	};
	const countAssessments = sqlite.prepare('SELECT count(*) as c FROM assessment').get() as {
		c: number;
	};
	const countUsers = sqlite.prepare('SELECT count(*) as c FROM user').get() as { c: number };
	const countInterests = sqlite.prepare('SELECT count(*) as c FROM product_interest').get() as {
		c: number;
	};

	const usersList = await db
		.select({ id: user.id, email: user.email, createdAt: user.createdAt })
		.from(user)
		.orderBy(desc(user.createdAt))
		.limit(500);

	const assessmentsList = await db
		.select({
			id: assessment.id,
			userId: assessment.userId,
			createdAt: assessment.createdAt,
			overallScore: assessment.overallScore,
			email: user.email
		})
		.from(assessment)
		.leftJoin(user, eq(assessment.userId, user.id))
		.orderBy(desc(assessment.createdAt))
		.limit(500);

	let groupClasses: ReturnType<typeof getGroupClasses>;
	// #region agent log
	fetch('http://127.0.0.1:7252/ingest/ee894969-bc03-4158-b6fa-803eb22c2a6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/+page.server.ts:load',message:'before getGroupClasses',data:{},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
	// #endregion
	try {
		groupClasses = getGroupClasses();
		// #region agent log
		fetch('http://127.0.0.1:7252/ingest/ee894969-bc03-4158-b6fa-803eb22c2a6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/+page.server.ts:load',message:'getGroupClasses returned',data:{count:groupClasses.length},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
		// #endregion
	} catch (err) {
		// #region agent log
		fetch('http://127.0.0.1:7252/ingest/ee894969-bc03-4158-b6fa-803eb22c2a6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/+page.server.ts:load',message:'getGroupClasses threw',data:{errMsg:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
		// #endregion
		console.error('getGroupClasses error:', err);
		groupClasses = [];
	}
	const upcomingClasses = groupClasses.map((c) => ({
		id: c.id,
		type: 'class' as const,
		title: c.title,
		startAt: c.start,
		endAt: c.end,
		productSlug: c.productSlug
	}));
	const productSlugs = [...new Set(products.map((p) => p.slug))].sort();

	const shopProductsFromDb = await getShopProductsFromDb();
	const dbSlugs = new Set(shopProductsFromDb.map((p) => p.slug));
	const staticShopSlugs = staticShopProducts
		.filter((p) => !dbSlugs.has(p.slug))
		.map((p) => ({ slug: p.slug, title: p.title }));

	return {
		createSlug: url.searchParams.get('createSlug'),
		staticShopSlugs,
		shopProductsFromDb: shopProductsFromDb.map((p) => ({
			id: p.id,
			slug: p.slug,
			title: p.title,
			shortDescription: p.shortDescription,
			description: p.description,
			price: p.price,
			priceAmount: p.priceAmount,
			imageUrl: p.imageUrl,
			imageUrlSecondary: p.imageUrlSecondary ?? undefined,
			quantityLabel: p.quantityLabel ?? undefined,
			inStock: p.inStock,
			createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt)
		})),
		bookings: bookings.map((b) => ({
			id: b.id,
			email: b.email,
			durationMinutes: b.durationMinutes,
			startAt: b.startAt instanceof Date ? b.startAt.toISOString() : String(b.startAt),
			sessionFocus: b.sessionFocus ?? '',
			sessionDetails: b.sessionDetails ?? '',
			status: b.status,
			createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt)
		})),
		upcomingClasses,
		groupClasses: groupClasses.map((c) => ({
			id: c.id,
			title: c.title,
			productSlug: c.productSlug,
			start: c.start,
			end: c.end,
			description: c.description ?? '',
			maxAttendees: c.maxAttendees ?? null,
			bookingUrl: c.bookingUrl ?? ''
		})),
		productSlugs,
		interests: interests.map((i) => ({
			id: i.id,
			productSlug: i.productSlug,
			email: i.email,
			name: i.name ?? '',
			createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt)
		})),
		usersList: usersList.map((u) => ({
			id: u.id,
			email: u.email,
			createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt)
		})),
		assessmentsList: assessmentsList.map((a) => ({
			id: a.id,
			userId: a.userId,
			email: a.email ?? '—',
			createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
			overallScore: a.overallScore
		})),
		stats: {
			bookings: countBookings.c,
			assessments: countAssessments.c,
			users: countUsers.c,
			productInterest: countInterests.c,
			bookingsToday: countBookingsToday
		}
	};
};

export const actions: Actions = {
	createProduct: async (event) => {
		if (!isAdmin(event.locals.user)) {
			return fail(403, { message: 'Forbidden' });
		}
		const form = await event.request.formData();
		const slug = (form.get('slug') as string)?.trim() ?? '';
		const title = (form.get('title') as string)?.trim() ?? '';
		const shortDescription = (form.get('shortDescription') as string)?.trim() ?? '';
		const description = (form.get('description') as string)?.trim() ?? '';
		const price = (form.get('price') as string)?.trim() ?? '';
		const priceAmountStr = (form.get('priceAmount') as string)?.trim() ?? '';
		const imageUrl = (form.get('imageUrl') as string)?.trim() ?? '';
		const imageUrlSecondary = (form.get('imageUrlSecondary') as string)?.trim() ?? '';
		const quantityLabel = (form.get('quantityLabel') as string)?.trim() ?? '';
		const inStock = form.has('inStock') && form.get('inStock') !== 'false';

		const priceAmount = parseFloat(priceAmountStr);
		if (!title || !slug || !price || Number.isNaN(priceAmount) || priceAmount < 0 || !imageUrl) {
			return fail(400, {
				message: 'Please fill in slug, title, short description, description, price, price amount, and image URL.',
				slug,
				title,
				shortDescription,
				description,
				price,
				priceAmount: priceAmountStr,
				imageUrl,
				imageUrlSecondary,
				quantityLabel,
				inStock
			});
		}

		const result = await createShopProductInDb({
			slug,
			title,
			shortDescription: shortDescription || title,
			description: description || shortDescription || title,
			price,
			priceAmount,
			imageUrl,
			imageUrlSecondary: imageUrlSecondary || undefined,
			quantityLabel: quantityLabel || undefined,
			inStock
		});

		if (!result.ok) {
			return fail(400, {
				message: result.error,
				slug,
				title,
				shortDescription,
				description,
				price,
				priceAmount: priceAmountStr,
				imageUrl,
				imageUrlSecondary,
				quantityLabel,
				inStock
			});
		}

		return { success: true, message: 'Shop product created.' };
	},

	updateProduct: async (event) => {
		if (!isAdmin(event.locals.user)) return fail(403, { message: 'Forbidden' });
		const form = await event.request.formData();
		const productId = (form.get('productId') as string)?.trim() ?? '';
		if (!productId) return fail(400, { message: 'Missing product id' });

		const slug = (form.get('slug') as string)?.trim() ?? '';
		const title = (form.get('title') as string)?.trim() ?? '';
		const shortDescription = (form.get('shortDescription') as string)?.trim() ?? '';
		const description = (form.get('description') as string)?.trim() ?? '';
		const price = (form.get('price') as string)?.trim() ?? '';
		const priceAmountStr = (form.get('priceAmount') as string)?.trim() ?? '';
		const imageUrl = (form.get('imageUrl') as string)?.trim() ?? '';
		const imageUrlSecondary = (form.get('imageUrlSecondary') as string)?.trim() ?? '';
		const quantityLabel = (form.get('quantityLabel') as string)?.trim() ?? '';
		const inStock = form.has('inStock') && form.get('inStock') !== 'false';

		const priceAmount = parseFloat(priceAmountStr);
		if (!title || !slug || !price || Number.isNaN(priceAmount) || priceAmount < 0 || !imageUrl) {
			return fail(400, {
				message: 'Please fill in slug, title, price, price amount, and image URL.',
				editProductId: productId,
				editSlug: slug,
				editTitle: title,
				editShortDescription: shortDescription,
				editDescription: description,
				editPrice: price,
				editPriceAmount: priceAmountStr,
				editImageUrl: imageUrl,
				editImageUrlSecondary: imageUrlSecondary,
				editQuantityLabel: quantityLabel,
				editInStock: inStock
			});
		}

		const result = await updateShopProductInDb(productId, {
			slug,
			title,
			shortDescription: shortDescription || title,
			description: description || shortDescription || title,
			price,
			priceAmount,
			imageUrl,
			imageUrlSecondary: imageUrlSecondary || undefined,
			quantityLabel: quantityLabel || undefined,
			inStock
		});

		if (!result.ok) {
			return fail(400, {
				message: result.error,
				editProductId: productId,
				editSlug: slug,
				editTitle: title,
				editShortDescription: shortDescription,
				editDescription: description,
				editPrice: price,
				editPriceAmount: priceAmountStr,
				editImageUrl: imageUrl,
				editImageUrlSecondary: imageUrlSecondary,
				editQuantityLabel: quantityLabel,
				editInStock: inStock
			});
		}
		return { success: true, message: 'Product updated.', editProductId: null };
	},

	deleteProduct: async (event) => {
		if (!isAdmin(event.locals.user)) return fail(403, { message: 'Forbidden' });
		const form = await event.request.formData();
		const productId = (form.get('productId') as string)?.trim() ?? '';
		if (!productId) return fail(400, { message: 'Missing product id' });
		const result = await deleteShopProductInDb(productId);
		if (!result.ok) return fail(400, { message: result.error });
		return { success: true, message: 'Product deleted.' };
	},

	createClass: async (event) => {
		// #region agent log
		try {
			require('fs').appendFileSync('/Users/wellis/Desktop/Cursor/skin/.cursor/debug.log', JSON.stringify({location:'admin:createClass',message:'action entry sync',hypothesisId:'B',timestamp:Date.now()}) + '\n');
		} catch (_) {}
		fetch('http://127.0.0.1:7252/ingest/ee894969-bc03-4158-b6fa-803eb22c2a6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/+page.server.ts:createClass',message:'action entry',data:{},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
		// #endregion
		if (!isAdmin(event.locals.user)) return fail(403, { message: 'Forbidden' });
		const form = await event.request.formData();
		const title = (form.get('classTitle') as string)?.trim() ?? '';
		const productSlug = (form.get('classProductSlug') as string)?.trim().toLowerCase() ?? '';
		const startAtStr = (form.get('classStartAt') as string)?.trim() ?? '';
		const endAtStr = (form.get('classEndAt') as string)?.trim() ?? '';
		const description = (form.get('classDescription') as string)?.trim() ?? '';
		const maxAttendeesStr = (form.get('classMaxAttendees') as string)?.trim() ?? '';
		const bookingUrl = (form.get('classBookingUrl') as string)?.trim() ?? '';

		if (!title || !productSlug) return fail(400, { message: 'Title and product slug are required.', classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		const startAt = startAtStr ? new Date(startAtStr) : null;
		const endAt = endAtStr ? new Date(endAtStr) : null;
		if (!startAt || isNaN(startAt.getTime())) return fail(400, { message: 'Start date and time are required.', classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		if (!endAt || isNaN(endAt.getTime())) return fail(400, { message: 'End date and time are required.', classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		const maxAttendees = maxAttendeesStr ? parseInt(maxAttendeesStr, 10) : undefined;
		if (maxAttendees !== undefined && (Number.isNaN(maxAttendees) || maxAttendees < 1)) return fail(400, { message: 'Max attendees must be a positive number.', classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });

		// #region agent log
		fetch('http://127.0.0.1:7252/ingest/ee894969-bc03-4158-b6fa-803eb22c2a6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/+page.server.ts:createClass',message:'validation ok, before create',data:{titleLen:title.length,productSlug},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
		// #endregion
		try {
			const result = createGroupClassInDb({
				title,
				productSlug,
				startAt,
				endAt,
				description: description || undefined,
				maxAttendees,
				bookingUrl: bookingUrl || undefined
			});
			if (!result.ok) return fail(400, { message: result.error, classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
			// #region agent log
			fetch('http://127.0.0.1:7252/ingest/ee894969-bc03-4158-b6fa-803eb22c2a6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/+page.server.ts:createClass',message:'createGroupClassInDb returned ok',data:{id:result.ok?result.id:undefined},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
			// #endregion
			return { success: true, message: 'Event created.', classForm: null };
		} catch (err) {
			// #region agent log
			try {
				require('fs').appendFileSync('/Users/wellis/Desktop/Cursor/skin/.cursor/debug.log', JSON.stringify({location:'admin:createClass',message:'catch sync',hypothesisId:'E',errMsg:err instanceof Error ? err.message : String(err),timestamp:Date.now()}) + '\n');
			} catch (_) {}
			fetch('http://127.0.0.1:7252/ingest/ee894969-bc03-4158-b6fa-803eb22c2a6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/+page.server.ts:createClass',message:'catch',data:{errMsg:err instanceof Error ? err.message : String(err),name:err instanceof Error ? err.name : ''},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
			// #endregion
			const message = err instanceof Error ? err.message : 'Failed to create event.';
			console.error('createClass error:', err);
			return fail(500, { message, classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		}
	},

	updateClass: async (event) => {
		if (!isAdmin(event.locals.user)) return fail(403, { message: 'Forbidden' });
		const form = await event.request.formData();
		const classId = (form.get('classId') as string)?.trim() ?? '';
		if (!classId) return fail(400, { message: 'Missing class id' });
		const title = (form.get('classTitle') as string)?.trim() ?? '';
		const productSlug = (form.get('classProductSlug') as string)?.trim().toLowerCase() ?? '';
		const startAtStr = (form.get('classStartAt') as string)?.trim() ?? '';
		const endAtStr = (form.get('classEndAt') as string)?.trim() ?? '';
		const description = (form.get('classDescription') as string)?.trim() ?? '';
		const maxAttendeesStr = (form.get('classMaxAttendees') as string)?.trim() ?? '';
		const bookingUrl = (form.get('classBookingUrl') as string)?.trim() ?? '';

		if (!title || !productSlug) return fail(400, { message: 'Title and product slug are required.', editClassId: classId, classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		const startAt = startAtStr ? new Date(startAtStr) : null;
		const endAt = endAtStr ? new Date(endAtStr) : null;
		if (!startAt || isNaN(startAt.getTime())) return fail(400, { message: 'Start date and time are required.', editClassId: classId, classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		if (!endAt || isNaN(endAt.getTime())) return fail(400, { message: 'End date and time are required.', editClassId: classId, classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		const maxAttendees = maxAttendeesStr ? parseInt(maxAttendeesStr, 10) : undefined;
		if (maxAttendees !== undefined && (Number.isNaN(maxAttendees) || maxAttendees < 1)) return fail(400, { message: 'Max attendees must be a positive number.', editClassId: classId, classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });

		const result = updateGroupClassInDb(classId, {
			title,
			productSlug,
			startAt,
			endAt,
			description: description || undefined,
			maxAttendees,
			bookingUrl: bookingUrl || undefined
		});
		if (!result.ok) return fail(400, { message: result.error, editClassId: classId, classForm: { title, productSlug, startAtStr, endAtStr, description, maxAttendeesStr, bookingUrl } });
		return { success: true, message: 'Event updated.', editClassId: null };
	},

	deleteClass: async (event) => {
		if (!isAdmin(event.locals.user)) return fail(403, { message: 'Forbidden' });
		const form = await event.request.formData();
		const classId = (form.get('classId') as string)?.trim() ?? '';
		if (!classId) return fail(400, { message: 'Missing class id' });
		const result = deleteGroupClassInDb(classId);
		if (!result.ok) return fail(400, { message: result.error });
		return { success: true, message: 'Event deleted.', editClassId: null };
	}
};
