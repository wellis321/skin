import { describe, it, expect, vi } from 'vitest';
import { analyseSkin } from '$lib/server/skinAnalysis';

vi.mock('$lib/server/faceRegions', () => ({
	getFaceRegionBuffers: () => Promise.resolve(null)
}));

describe('API /api/analyse dependency', () => {
	it('analyseSkin supports the contract used by the API (ArrayBuffer)', async () => {
		const buffer = new ArrayBuffer(256);
		const result = await analyseSkin(buffer);
		expect(result.overallScore).toBeDefined();
		expect(result.whatsWorking.length).toBeGreaterThan(0);
	});
});
