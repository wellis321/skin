import type { PageServerLoad } from './$types';
import { getUpcomingGroupClasses } from '$lib/server/groupClasses';

export const load: PageServerLoad = async () => {
	let upcomingClasses;
	try {
		upcomingClasses = await getUpcomingGroupClasses();
	} catch (err) {
		console.error('book load: getUpcomingGroupClasses failed', err);
		upcomingClasses = [];
	}
	return { upcomingClasses };
};
