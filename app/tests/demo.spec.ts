import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('MEC App Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('view home page with seeded items', async ({ page }) => {
    // Wait for the page to load and items to appear
    await page.waitForSelector('text=/Shop|Gear|Equipment/', { timeout: 5000 });

    // Look for product listings
    const items = await page.locator('[class*="card"], [class*="product"], article').count();
    expect(items).toBeGreaterThan(0);
  });

  test('search for items', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Whistle');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForSelector('text=/search|result/i', { timeout: 5000 });
    expect(page.url()).toContain('/search');
  });

  test('navigate to Purchases via user menu', async ({ page }) => {
    // First, need to sign in to access Purchases
    // Look for sign in button
    const signInBtn = page.locator('button:has-text("Sign in")');
    if (await signInBtn.count() > 0) {
      await signInBtn.click();
      // Fill login form (using test credentials)
      await page.fill('input[type="text"]', 'testuser');
      await page.fill('input[type="password"]', 'testpass');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    }

    // Click on user avatar to open menu
    const avatar = page.locator('[role="button"] img, img[alt]').first();
    if (await avatar.count() > 0) {
      await avatar.click();
      // Click on Purchases menu item
      await page.click('text=Purchases');
      await page.waitForSelector('text=/Purchase|Invoice|Receipt/i', { timeout: 5000 });
      expect(page.url()).toContain('/purchases');
    }
  });

  test('navigate to Settings via user menu', async ({ page }) => {
    // Click on user avatar/menu (similar to previous test but for Settings)
    const avatar = page.locator('[role="button"] img, img[alt]').first();
    if (await avatar.count() > 0) {
      await avatar.click();
      // Click on Settings menu item
      await page.click('text=Settings');
      await page.waitForSelector('text=/Setting|Preference|Configuration/i', { timeout: 5000 });
      expect(page.url()).toContain('/settings');
    }
  });

  test('view cart', async ({ page }) => {
    // Click on shopping cart icon
    const cartIcon = page.locator('[aria-label="shopping cart"], button svg[data-testid*="ShoppingCart"]').first();
    if (await cartIcon.count() > 0) {
      await cartIcon.click();
    } else {
      // Try clicking nearby button
      await page.click('button:has-text("Cart")');
    }

    await page.waitForURL('**/cart', { timeout: 5000 });
    expect(page.url()).toContain('/cart');
  });

  test('navigate home', async ({ page }) => {
    // Click MEC logo to go home
    const logo = page.locator('text=MEC').first();
    await logo.click();

    await page.waitForURL('/', { timeout: 5000 });
    expect(page.url()).toMatch(/\/$|\/search/); // Home or back to home
  });
});
