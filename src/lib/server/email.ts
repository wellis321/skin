import { env } from '$env/dynamic/private';

const RESEND_API_KEY = env.RESEND_API_KEY?.trim();
const RESEND_FROM = env.RESEND_FROM?.trim() || 'Skin Assessment <onboarding@resend.dev>';

/**
 * Send an email via Resend. No-op if RESEND_API_KEY is not set (e.g. local dev without config).
 * Set RESEND_API_KEY and optionally RESEND_FROM in .env to enable.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
	if (!RESEND_API_KEY) {
		// In dev, log instead of failing
		if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
			console.log('[email] (no RESEND_API_KEY) would send to', to, 'subject:', subject);
		}
		return false;
	}
	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: RESEND_FROM,
				to: [to],
				subject,
				html
			})
		});
		if (!res.ok) {
			const err = await res.text();
			console.error('[email] Resend error:', res.status, err);
			return false;
		}
		return true;
	} catch (e) {
		console.error('[email] send failed:', e);
		return false;
	}
}
