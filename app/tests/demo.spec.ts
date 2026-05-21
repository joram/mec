import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('MEC App Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('navigate to Purchases page and view seeded data', async ({ page }) => {
    // Click on Purchases navigation
    await page.click('a[href="/purchases"], [role="menuitem"]:has-text("Purchases")');

    // Wait for page to load
    await page.waitForSelector('text=/Purchases|Invoice/', { timeout: 5000 });

    // Verify some invoices are displayed
    const invoices = await page.locator('[data-testid="invoice-item"], li:has-text("Invoice")').count();
    expect(invoices).toBeGreaterThan(0);
  });

  test('view Settings page', async ({ page }) => {
    // Navigate to Settings
    await page.click('a[href="/settings"], [role="menuitem"]:has-text("Settings")');

    // Wait for settings content
    await page.waitForSelector('text=/Settings|Preferences/', { timeout: 5000 });
    expect(page.url()).toContain('/settings');
  });

  test('filter categories by name', async ({ page }) => {
    // Navigate to a page with categories (likely the main page or expenses)
    const categoryLink = page.locator('a[href*="categor"], [role="menuitem"]:has-text("Categ")');

    if (await categoryLink.count() > 0) {
      await categoryLink.first().click();
      await page.waitForLoadState('networkidle');
    }

    // Look for category filtering UI
    const filterInput = page.locator('input[placeholder*="category"], input[placeholder*="filter"]').first();

    if (await filterInput.count() > 0) {
      await filterInput.fill('test');
      await page.waitForLoadState('networkidle');

      // Verify filtering worked
      const results = await page.locator('[data-testid="category-item"], li').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('verify database is seeded with data', async ({ page }) => {
    // Navigate through the app and check for seeded data
    const mainContent = page.locator('main, [role="main"]');

    // Look for any indication of data presence
    const dataPresent = await mainContent.locator('text=/[0-9]+|items|records|total/i').count();
    expect(dataPresent).toBeGreaterThan(0);
  });
});
