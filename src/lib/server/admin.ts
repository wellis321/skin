import { env } from '$env/dynamic/private';

/**
 * Site owner / super admin check. Set ADMIN_EMAIL in .env to the email that can access /admin.
 */
export function isAdmin(user: { email?: string } | null): boolean {
	if (!user || typeof user.email !== 'string') return false;
	const adminEmail = env.ADMIN_EMAIL?.trim();
	return !!adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase();
}
