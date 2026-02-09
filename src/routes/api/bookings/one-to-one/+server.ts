import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { oneToOneBooking } from '$lib/server/db/schema';
import { generateId } from '$lib/server/id';
import { sendEmail } from '$lib/server/email';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') {
		return json({ error: 'Invalid body' }, { status: 400 });
	}
	const o = body as Record<string, unknown>;
	const duration = o.duration;
	const startAtParam = o.startAt;
	const emailParam = o.email;
	const sessionFocusParam = o.sessionFocus;
	const sessionDetailsParam = o.sessionDetails;

	const durationMinutes = duration === 60 ? 60 : duration === 30 ? 30 : null;
	if (durationMinutes === null) {
		return json({ error: 'Invalid or missing duration (use 30 or 60)' }, { status: 400 });
	}
	if (typeof startAtParam !== 'string') {
		return json({ error: 'Missing startAt (ISO date-time)' }, { status: 400 });
	}
	const startAt = new Date(startAtParam);
	if (Number.isNaN(startAt.getTime())) {
		return json({ error: 'Invalid startAt' }, { status: 400 });
	}
	if (startAt.getTime() <= Date.now()) {
		return json({ error: 'startAt must be in the future' }, { status: 400 });
	}

	let email: string;
	if (locals.user && 'email' in locals.user && typeof locals.user.email === 'string') {
		email = locals.user.email;
	} else if (typeof emailParam === 'string' && emailParam.includes('@')) {
		email = emailParam.trim();
	} else {
		return json({ error: 'Email required when not signed in' }, { status: 400 });
	}

	const sessionFocus =
		typeof sessionFocusParam === 'string' && sessionFocusParam.trim()
			? sessionFocusParam.trim().slice(0, 200)
			: null;
	const sessionDetails =
		typeof sessionDetailsParam === 'string' && sessionDetailsParam.trim()
			? sessionDetailsParam.trim().slice(0, 1000)
			: null;

	const id = generateId(20);
	const createdAt = new Date();
	await db.insert(oneToOneBooking).values({
		id,
		userId: locals.user?.id ?? null,
		email,
		durationMinutes,
		startAt,
		sessionFocus,
		sessionDetails,
		status: 'confirmed',
		createdAt
	});

	const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);
	const origin = url.origin;
	const calendarLink = `${origin}/api/calendar/booking/${id}`;
	const dateStr = startAt.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	// User confirmation email
	const userHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking confirmed</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1c1917; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.25rem; margin-bottom: 8px;">Booking confirmed</h1>
  <p style="margin: 0 0 16px;">Your one-to-one session is confirmed.</p>
  <p style="margin: 0 0 8px;"><strong>When:</strong> ${dateStr}</p>
  <p style="margin: 0 0 8px;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
  ${sessionFocus ? `<p style="margin: 0 0 16px;"><strong>Focus:</strong> ${escapeHtml(sessionFocus)}</p>` : ''}
  <p style="margin: 0 0 16px;">We'll send the Zoom link to this email before the session.</p>
  <p style="margin: 0 0 16px;"><a href="${calendarLink}" style="color: #1c1917; font-weight: 600;">Add to calendar (.ics)</a></p>
  <p style="margin: 24px 0 0; font-size: 0.875rem; color: #78716c;">Skin Assessment</p>
</body>
</html>`;
	await sendEmail(email, `Booking confirmed – ${dateStr}`, userHtml);

	// Admin notification
	const adminEmail = env.ADMIN_EMAIL?.trim();
	if (adminEmail) {
		const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New booking</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1c1917; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.25rem; margin-bottom: 8px;">New one-to-one booking</h1>
  <p style="margin: 0 0 8px;"><strong>Who:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
  <p style="margin: 0 0 8px;"><strong>When:</strong> ${dateStr}</p>
  <p style="margin: 0 0 8px;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
  ${sessionFocus ? `<p style="margin: 0 0 8px;"><strong>Focus:</strong> ${escapeHtml(sessionFocus)}</p>` : ''}
  ${sessionDetails ? `<p style="margin: 0 0 16px;"><strong>Details:</strong> ${escapeHtml(sessionDetails)}</p>` : ''}
  <p style="margin: 16px 0 0;"><a href="${origin}/admin" style="color: #1c1917; font-weight: 600;">View in Admin →</a></p>
  <p style="margin: 24px 0 0; font-size: 0.875rem; color: #78716c;">Skin Assessment</p>
</body>
</html>`;
		await sendEmail(adminEmail, `New booking: ${email} – ${dateStr}`, adminHtml);
	}

	return json({
		id,
		startAt: startAt.toISOString(),
		endAt: endAt.toISOString(),
		durationMinutes,
		email,
		confirmationSent: true
	});
};

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
