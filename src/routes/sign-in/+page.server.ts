import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const ALLOWED_REDIRECT_PATHS = ['/admin', '/progress', '/book', '/assess', '/'];

function isAllowedRedirect(path: string | null): path is string {
	if (!path || !path.startsWith('/') || path.includes('//')) return false;
	return ALLOWED_REDIRECT_PATHS.some((p) => path === p || (p !== '/' && path.startsWith(p + '/')));
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		const to = isAllowedRedirect(url.searchParams.get('from')) ? url.searchParams.get('from')! : '/progress';
		throw redirect(302, to);
	}
	const redirectTo = isAllowedRedirect(url.searchParams.get('from')) ? url.searchParams.get('from')! : '/progress';
	return { redirectTo };
};
