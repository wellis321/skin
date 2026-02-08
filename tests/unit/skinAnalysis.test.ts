import { describe, it, expect, vi } from 'vitest';
import { analyseSkin } from '$lib/server/skinAnalysis';

// Avoid loading face-api/tfjs-node in unit tests (slow native deps)
vi.mock('$lib/server/faceRegions', () => ({
	getFaceRegionBuffers: () => Promise.resolve(null)
}));

describe('skinAnalysis', () => {
	it('returns a valid SkinAnalysisResult for any image', async () => {
		const buffer = new ArrayBuffer(100);
		const result = await analyseSkin(buffer);

		expect(result).toBeDefined();
		expect(typeof result.overallScore).toBe('number');
		expect(result.overallScore).toBeGreaterThanOrEqual(0);
		expect(result.overallScore).toBeLessThanOrEqual(100);
		expect(result.wrinkles).toBeDefined();
		expect(result.wrinkles.score).toBeGreaterThanOrEqual(0);
		expect(result.wrinkles.forehead).toBeDefined();
		expect(result.wrinkles.crowFeet).toBeDefined();
		expect(result.wrinkles.fineLines).toBeDefined();
		expect(typeof result.wrinkles.summary).toBe('string');
		expect(result.spots).toBeDefined();
		expect(result.spots.score).toBeDefined();
		expect(Array.isArray(result.whatsWorking)).toBe(true);
		expect(Array.isArray(result.needsAttention)).toBe(true);
		expect(Array.isArray(result.recommendations)).toBe(true);
		expect(Array.isArray(result.productSuggestions)).toBe(true);
	});

	it('mock result has British English wording', async () => {
		const result = await analyseSkin(new ArrayBuffer(1));
		const allText = [
			result.wrinkles.summary,
			result.spots.summary,
			...result.whatsWorking,
			...result.needsAttention,
			...result.recommendations,
			...result.productSuggestions.map((p) => p.title + ' ' + p.description)
		].join(' ');
		// Should not contain American spellings
		expect(allText).not.toMatch(/\borganization\b/);
		expect(allText).not.toMatch(/\bcolor\b/);
		expect(allText).not.toMatch(/\bpersonalized\b/);
	});
});
