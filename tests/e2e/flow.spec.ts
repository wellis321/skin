import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Skin assessment flow', () => {
	test('landing page has CTA and navigates to assess', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: /understand your skin/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /assess my skin/i })).toBeVisible();
		await page.getByRole('link', { name: /assess my skin/i }).click();
		await expect(page).toHaveURL(/\/assess/);
		await expect(page.getByRole('heading', { name: /get ready for your assessment/i })).toBeVisible();
	});

	test('assess instructions then upload photo and see results', async ({ page }) => {
		await page.goto('/assess');
		await expect(page.getByText(/remove glasses/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
		await page.getByRole('button', { name: /continue/i }).click();

		await expect(page.getByRole('heading', { name: /add your photo/i })).toBeVisible();
		const fileInput = page.locator('input[type=file]');
		await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.png'));

		await expect(page.getByRole('button', { name: /use this photo/i })).toBeEnabled();
		await page.getByRole('button', { name: /use this photo/i }).click();

		await expect(page).toHaveURL(/\/results/);
		await expect(page.getByRole('heading', { name: /your skin assessment/i })).toBeVisible();
		await expect(page.getByText(/overall score/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: /what's working/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: /what to focus on/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: /how to improve/i })).toBeVisible();
	});
});
