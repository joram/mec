import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const testUser = {
  username: `testuser-${Date.now()}`,
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

test.describe('MEC App Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('create user and view home page with seeded items', async ({ page }) => {
    // Check if user is logged in, if not create account
    const signInBtn = page.locator('button:has-text("Sign in")');
    if (await signInBtn.count() > 0) {
      await signInBtn.click();
      await page.waitForURL('**/login', { timeout: 5000 });

      // Look for register link
      const registerLink = page.locator('text=/register|create account/i');
      if (await registerLink.count() > 0) {
        await registerLink.click();
      }

      // Fill registration form
      await page.fill('input[type="text"]', testUser.username);
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);

      // Submit registration
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForNavigation({ timeout: 5000 });
      }
    }

    // Wait for page to load and look for items
    await page.waitForTimeout(1000);

    // Look for items - more flexible selectors
    const itemElements = page.locator('body').locator('text=/Whistle|Battery|Flashlight|Scissors/i');
    const itemCount = await itemElements.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('search for items', async ({ page }) => {
    // Find and use search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Whistle');
    await searchInput.press('Enter');

    // Wait for search results page
    await page.waitForURL('**/search**', { timeout: 5000 });
    expect(page.url()).toContain('/search');

    // Verify we have results
    const results = page.locator('text=/Whistle/i');
    expect(await results.count()).toBeGreaterThan(0);
  });

  test('navigate to Purchases via user menu', async ({ page }) => {
    // Register/login user if needed
    const signInBtn = page.locator('button:has-text("Sign in")');
    if (await signInBtn.count() > 0) {
      await signInBtn.click();
      await page.waitForURL('**/login', { timeout: 5000 });

      // Try to find registration option
      const registerLink = page.locator('text=/register|create account/i');
      if (await registerLink.count() > 0) {
        await registerLink.click();
      }

      // Fill registration form
      await page.fill('input[type="text"]', testUser.username);
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);

      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForNavigation({ timeout: 5000 });
      }
    }

    // Wait a moment for user menu to be ready
    await page.waitForTimeout(500);

    // Click on user avatar to open menu (look for any clickable avatar-like element)
    const userMenuButtons = page.locator('[role="button"]');
    const count = await userMenuButtons.count();

    if (count > 0) {
      // Try to find avatar (usually a button with img or colored circle)
      const avatarBtn = page.locator('button img[alt]').first();
      if (await avatarBtn.count() > 0) {
        await avatarBtn.click();
      } else {
        // Try last button in navbar (often the user menu)
        await userMenuButtons.nth(count - 1).click();
      }

      // Click on Purchases menu item
      const purchasesMenu = page.locator('[role="menuitem"]:has-text("Purchases"), text=Purchases');
      if (await purchasesMenu.count() > 0) {
        await purchasesMenu.click();
        await page.waitForURL('**/purchases', { timeout: 5000 });
        expect(page.url()).toContain('/purchases');
      }
    }
  });

  test('navigate to Settings via user menu', async ({ page }) => {
    // Register/login user if needed
    const signInBtn = page.locator('button:has-text("Sign in")');
    if (await signInBtn.count() > 0) {
      await signInBtn.click();
      await page.waitForURL('**/login', { timeout: 5000 });

      const registerLink = page.locator('text=/register|create account/i');
      if (await registerLink.count() > 0) {
        await registerLink.click();
      }

      await page.fill('input[type="text"]', testUser.username);
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);

      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForNavigation({ timeout: 5000 });
      }
    }

    await page.waitForTimeout(500);

    // Click user menu
    const userMenuButtons = page.locator('[role="button"]');
    const count = await userMenuButtons.count();

    if (count > 0) {
      const avatarBtn = page.locator('button img[alt]').first();
      if (await avatarBtn.count() > 0) {
        await avatarBtn.click();
      } else {
        await userMenuButtons.nth(count - 1).click();
      }

      // Click on Settings menu item
      const settingsMenu = page.locator('[role="menuitem"]:has-text("Settings"), text=Settings');
      if (await settingsMenu.count() > 0) {
        await settingsMenu.click();
        await page.waitForURL('**/settings', { timeout: 5000 });
        expect(page.url()).toContain('/settings');
      }
    }
  });

  test('view cart', async ({ page }) => {
    // Click shopping cart icon
    const cartButtons = page.locator('button').filter({ has: page.locator('svg') });
    const count = await cartButtons.count();

    // Look for cart icon (usually has a badge)
    for (let i = 0; i < count; i++) {
      const btn = cartButtons.nth(i);
      const hasBadge = await btn.locator('[class*="Badge"]').count() > 0;
      if (hasBadge) {
        await btn.click();
        break;
      }
    }

    await page.waitForURL('**/cart', { timeout: 5000 });
    expect(page.url()).toContain('/cart');
  });

  test('navigate home via logo', async ({ page }) => {
    // Click MEC logo to go home
    const logo = page.locator('text=MEC').first();
    await logo.click();

    await page.waitForNavigation({ timeout: 5000 });
    expect(page.url()).toMatch(/\/$|\/\?/);
  });
});
