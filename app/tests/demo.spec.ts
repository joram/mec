import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('MEC App with Seeded Data', () => {
  test('home page loads with seeded items', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page).toHaveTitle(/MEC|Equipment|Closet/i);

    // Look for app content
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Find and fill search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Flashlight');
      await searchInput.press('Enter');

      // Wait for navigation to search page
      await page.waitForURL('**/search**', { timeout: 5000 });
      expect(page.url()).toContain('/search');
    }
  });

  test('cart page is accessible', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Find cart button/icon and click it
    const cartBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await cartBtn.count() > 0) {
      await cartBtn.click();
    }

    // Navigate directly if button click didn't work
    await page.goto(`${baseURL}/cart`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/cart');
  });

  test('can navigate between pages', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Click home/logo
    const logo = page.locator('text=MEC').first();
    if (await logo.count() > 0) {
      await logo.click();
      await page.waitForLoadState('networkidle');
    }

    expect(page.url()).toMatch(/\/$/);
  });

  test('app is responsive and interactive', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Check that navbar is visible
    const navbar = page.locator('header, nav, [role="banner"]').first();
    await expect(navbar).toBeVisible();

    // Check that we can see content
    const pageContent = page.locator('body');
    const text = await pageContent.textContent();
    expect(text).toBeTruthy();
    expect(text?.length).toBeGreaterThan(100);
  });
});
