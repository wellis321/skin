import { pgTable, text, integer, timestamp, real, boolean } from 'drizzle-orm/pg-core';

/** Lucia user table: id required; we add email and password_hash for email/password auth. */
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull()
});

/** User-editable profile for tailoring (age, gender). When set, used for Picks for you; else we fall back to latest assessment face details. */
export const userProfile = pgTable('user_profile', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	profileAge: integer('profile_age').notNull(),
	profileGender: text('profile_gender').notNull(), // 'male' | 'female'
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
});

/** Lucia session table. DrizzlePostgreSQLAdapter expects timestamp (Date), not integer. */
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

/** Saved skin assessments per user for progress-over-time. */
export const assessment = pgTable('assessment', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
	overallScore: integer('overall_score').notNull(),
	wrinklesScore: integer('wrinkles_score').notNull(),
	wrinklesForehead: integer('wrinkles_forehead').notNull(),
	wrinklesCrowFeet: integer('wrinkles_crow_feet').notNull(),
	wrinklesFineLines: integer('wrinkles_fine_lines').notNull(),
	spotsScore: integer('spots_score').notNull(),
	spotsBlemishes: integer('spots_blemishes').notNull(),
	spotsHyperpigmentation: integer('spots_hyperpigmentation').notNull(),
	/** Optional structure/firmness score (0–100) from jaw landmarks; used for structure-aware recommendations. */
	structureScore: integer('structure_score'),
	thumbnailPath: text('thumbnail_path'),
	// Face details from face-api when saved (optional)
	faceDetailsAge: integer('face_details_age'),
	faceDetailsGender: text('face_details_gender'),
	faceDetailsGenderProbability: real('face_details_gender_probability'),
	faceDetailsExpressions: text('face_details_expressions')
});

/** Bespoke one-to-one calendar slots (30 min or 1 hour). */
export const oneToOneBooking = pgTable('one_to_one_booking', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	email: text('email').notNull(),
	durationMinutes: integer('duration_minutes').notNull(),
	startAt: timestamp('start_at', { withTimezone: true }).notNull(),
	/** What they want to do during the session (e.g. face yoga, full face rejuvenation). */
	sessionFocus: text('session_focus'),
	/** Extra details when focus is "Other" or they want to add notes. */
	sessionDetails: text('session_details'),
	status: text('status').notNull().default('confirmed'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull()
});

/** Register interest in a product (e.g. face yoga) – email + product slug for follow-up. */
export const productInterest = pgTable('product_interest', {
	id: text('id').primaryKey(),
	productSlug: text('product_slug').notNull(),
	email: text('email').notNull(),
	name: text('name'),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull()
});

/** Register / book a place on a group class (e.g. face yoga workshop). */
export const classInterest = pgTable('class_interest', {
	id: text('id').primaryKey(),
	classId: text('class_id').notNull(),
	email: text('email').notNull(),
	name: text('name'),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull()
});

/** Group classes / events (e.g. face yoga workshops). Admin-managed; replaces static list from code. */
export const groupClass = pgTable('group_class', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	productSlug: text('product_slug').notNull(),
	startAt: timestamp('start_at', { withTimezone: true }).notNull(),
	endAt: timestamp('end_at', { withTimezone: true }).notNull(),
	description: text('description'),
	maxAttendees: integer('max_attendees'),
	bookingUrl: text('booking_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull()
});

/** Shop products (sellable SKUs) – admin can create; merged with static list for display. */
export const shopProduct = pgTable('shop_product', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	shortDescription: text('short_description').notNull(),
	description: text('description').notNull(),
	price: text('price').notNull(),
	priceAmount: real('price_amount').notNull(),
	imageUrl: text('image_url').notNull(),
	imageUrlSecondary: text('image_url_secondary'),
	quantityLabel: text('quantity_label'),
	inStock: boolean('in_stock').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull()
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Assessment = typeof assessment.$inferSelect;
export type OneToOneBooking = typeof oneToOneBooking.$inferSelect;
export type ProductInterest = typeof productInterest.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type NewSession = typeof session.$inferInsert;
export type NewAssessment = typeof assessment.$inferInsert;
export type NewOneToOneBooking = typeof oneToOneBooking.$inferInsert;
export type NewProductInterest = typeof productInterest.$inferInsert;
export type ClassInterest = typeof classInterest.$inferSelect;
export type NewClassInterest = typeof classInterest.$inferInsert;
export type ShopProduct = typeof shopProduct.$inferSelect;
export type NewShopProduct = typeof shopProduct.$inferInsert;
export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;
export type GroupClass = typeof groupClass.$inferSelect;
export type NewGroupClass = typeof groupClass.$inferInsert;
