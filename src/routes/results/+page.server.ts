import type { PageServerLoad } from './$types';
import { getExampleResult } from '$lib/data/exampleResult';

export const load: PageServerLoad = async ({ url }) => {
	const isDemo = url.searchParams.get('demo') === '1';
	if (isDemo) {
		return { demoMode: true, exampleResult: getExampleResult() };
	}
	return {};
};
