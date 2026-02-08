import type { PageServerLoad } from './$types';
import { getUpcomingGroupClasses } from '$lib/server/groupClasses';

export const load: PageServerLoad = async () => {
	const upcomingClasses = getUpcomingGroupClasses();
	return { upcomingClasses };
};
