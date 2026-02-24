import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Arizmi/);
  });

  test('all major sections are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#services')).toBeVisible();
    await expect(page.locator('#work')).toBeVisible();
    await expect(page.locator('#process')).toBeVisible();
    await expect(page.locator('#why')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    await expect(nav.getByText('Services')).toBeVisible();
    await expect(nav.getByText('Work')).toBeVisible();
    await expect(nav.getByText('Process')).toBeVisible();
    await expect(nav.getByText('Why Us')).toBeVisible();
    await expect(nav.getByText('Get Started')).toBeVisible();
  });

  test('contact modal opens and closes', async ({ page }) => {
    await page.goto('/');
    // Click a button that opens the contact modal
    const trigger = page.getByRole('button', { name: /contact|get in touch/i });
    if (await trigger.isVisible()) {
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });
});
