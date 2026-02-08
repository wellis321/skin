/**
 * Seed demo data for admin screenshots: one-to-one bookings, group classes,
 * product interest, optional demo users and assessments.
 * Run only when DB is empty or with --force. Run migrations first.
 *
 * Usage: npx tsx scripts/seed-demo-data.ts [--force]
 */
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db, sqlite } from '../src/lib/server/db';
import {
	oneToOneBooking,
	groupClass,
	productInterest,
	user,
	assessment
} from '../src/lib/server/db/schema';

const DEMO_PASSWORD = 'demo1234';

function isForce(): boolean {
	return process.argv.includes('--force');
}

function count(table: string): number {
	return (sqlite.prepare(`SELECT count(*) as c FROM ${table}`).get() as { c: number }).c;
}

function isEmpty(): boolean {
	return count('one_to_one_booking') === 0 && count('group_class') === 0 && count('product_interest') === 0;
}

async function main(): Promise<void> {
	if (!isEmpty() && !isForce()) {
		console.log('Database already has bookings, group classes or product interest. Run with --force to seed anyway.');
		process.exit(1);
	}

	const dbPath = process.env.DATABASE_URL ?? './data/sqlite.db';
	console.log('Seeding demo data into', dbPath);
	console.log('Run migrations first if you have not: npm run db:push or drizzle-kit push');

	const now = new Date();
	const inserted = { users: 0, bookings: 0, groupClasses: 0, productInterest: 0, assessments: 0 };

	// 1. Demo users (2–3) – only if no users exist
	if (count('user') === 0) {
		const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
		const demoUsers = [
			{ id: randomUUID(), email: 'demo@example.com', passwordHash, createdAt: now },
			{ id: randomUUID(), email: 'sarah@example.com', passwordHash, createdAt: now },
			{ id: randomUUID(), email: 'alex@example.com', passwordHash, createdAt: now }
		];
		for (const u of demoUsers) {
			await db.insert(user).values(u);
			inserted.users++;
		}
		console.log('Demo users created (password: ' + DEMO_PASSWORD + '). Emails: demo@example.com, sarah@example.com, alex@example.com');
	}

	const firstUser = db.select({ id: user.id }).from(user).limit(1).all() as { id: string }[];
	const firstUserId = firstUser[0]?.id;

	// 2. One-to-one bookings (8–12): only if table empty
	if (count('one_to_one_booking') === 0) {
		const focusOptions = ['Face yoga', 'Full face rejuvenation', 'Sculpted chin/neck', 'Radiant eyes', 'Other'];
		const emails = ['demo@example.com', 'sarah@example.com', 'alex@example.com', 'guest@example.com', 'jane@example.com'];
		for (let i = 0; i < 10; i++) {
			const start = new Date(now);
			start.setDate(start.getDate() - 14 + i * 3);
			start.setHours(10 + (i % 4), 0, 0, 0);
			await db.insert(oneToOneBooking).values({
				id: randomUUID(),
				userId: firstUserId ?? null,
				email: emails[i % emails.length],
				durationMinutes: i % 2 === 0 ? 30 : 60,
				startAt: start,
				sessionFocus: focusOptions[i % focusOptions.length],
				sessionDetails: i % 3 === 0 ? 'Would like to focus on jawline.' : null,
				status: 'confirmed',
				createdAt: new Date(start.getTime() - 86400000)
			});
			inserted.bookings++;
		}
	}

	// 3. Group classes (4–6) – only if table empty
	if (count('group_class') === 0) {
		const productSlugs = ['face-yoga', 'one-to-one', 'sculpted-chin', 'radiant-eyes', 'full-face'];
		const titles = ['Full Face Rejuvenation', 'Radiant Eyes & Cheeks', 'Sculpted Chin/Neck', 'Face Yoga Basics', 'Beyond Gravity Workshop'];
		for (let i = 0; i < 5; i++) {
			const start = new Date(now);
			start.setDate(start.getDate() + 7 + i * 7);
			start.setHours(18, 0, 0, 0);
			const end = new Date(start);
			end.setMinutes(45);
			await db.insert(groupClass).values({
				id: randomUUID(),
				title: titles[i],
				productSlug: productSlugs[i % productSlugs.length],
				startAt: start,
				endAt: end,
				description: 'Live online session. Bring a mat and gua sha if you have one.',
				maxAttendees: 12,
				bookingUrl: null,
				createdAt: now
			});
			inserted.groupClasses++;
		}
	}

	// 4. Product interest (15–25) – only if table empty
	if (count('product_interest') === 0) {
		const slugs = ['face-yoga', 'one-to-one', 'sculpted-chin', 'radiant-eyes', 'full-face'];
		const names = ['Sarah M.', 'Alex K.', 'Jane D.', 'Demo User', 'Guest', 'Emma L.', 'Chris P.', null];
		for (let i = 0; i < 20; i++) {
			const created = new Date(now);
			created.setDate(created.getDate() - 30 + i);
			await db.insert(productInterest).values({
				id: randomUUID(),
				productSlug: slugs[i % slugs.length],
				email: `interest-${i}@example.com`,
				name: names[i % names.length],
				userId: null,
				createdAt: created
			});
			inserted.productInterest++;
		}
	}

	// 5. Assessments (5–8) linked to first user – only if no assessments yet
	if (firstUserId && count('assessment') === 0) {
		const scores = [
			{ overall: 54, wrinkles: 50, spots: 58, structure: 52 },
			{ overall: 58, wrinkles: 54, spots: 62, structure: 56 },
			{ overall: 62, wrinkles: 58, spots: 66, structure: 60 },
			{ overall: 66, wrinkles: 62, spots: 70, structure: 64 },
			{ overall: 70, wrinkles: 66, spots: 74, structure: 68 },
			{ overall: 74, wrinkles: 70, spots: 78, structure: 72 }
		];
		for (let i = 0; i < 6; i++) {
			const created = new Date(now);
			created.setDate(created.getDate() - 90 + i * 14);
			const s = scores[i];
			await db.insert(assessment).values({
				id: randomUUID(),
				userId: firstUserId,
				createdAt: created,
				overallScore: s.overall,
				wrinklesScore: s.wrinkles,
				wrinklesForehead: s.wrinkles - 2,
				wrinklesCrowFeet: s.wrinkles + 2,
				wrinklesFineLines: s.wrinkles,
				spotsScore: s.spots,
				spotsBlemishes: s.spots - 2,
				spotsHyperpigmentation: s.spots + 2,
				structureScore: s.structure,
				thumbnailPath: null,
				faceDetailsAge: 36 + i,
				faceDetailsGender: 'female',
				faceDetailsGenderProbability: 0.92,
				faceDetailsExpressions: JSON.stringify({ neutral: 0.9 })
			});
			inserted.assessments++;
		}
	}

	console.log('Inserted:', inserted);
	console.log('Done. Admin dashboard and book page will show demo data.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
