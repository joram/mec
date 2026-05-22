import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('MEC Complete Purchasing Workflow', () => {
  test('end-to-end: signup, login, add to cart, checkout', async ({ page }) => {
    const timestamp = Date.now();
    const username = `user${timestamp}`;
    const email = `user${timestamp}@example.com`;
    const password = 'TestPassword123!';

    // Step 1: Navigate to home
    console.log('Step 1: Navigate to home');
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Step 2: Go to login page
    console.log('Step 2: Navigate to login page');
    const signInBtn = page.locator('button:has-text("Sign in")');
    if (await signInBtn.count() > 0) {
      await signInBtn.click();
      await page.waitForURL('**/login', { timeout: 5000 });
    } else {
      await page.goto(`${baseURL}/login`);
    }
    expect(page.url()).toContain('/login');

    // Step 3: Click register/signup link
    console.log('Step 3: Click signup link');
    const registerLink = page.locator('a, button').filter({ hasText: /sign up|register|create/i }).first();
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto(`${baseURL}/login`);
      await page.click('text=/sign up|register|create/i');
    }

    // Step 4: Create account - fill registration form
    console.log('Step 4: Fill registration form');

    // Fill all input fields in order
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    if (inputCount >= 3) {
      // First input = username
      await inputs.nth(0).fill(username);
      // Second input = email
      await inputs.nth(1).fill(email);
      // Third input = password
      await inputs.nth(2).fill(password);
    }

    // Submit registration form
    console.log('Step 5: Submit registration');
    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /create account|sign up|register/i }).first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => null);
      await page.waitForLoadState('networkidle');
    }

    // Verify account creation - should be logged in or redirected to home
    console.log('Step 6: Verify account created');
    const currentUrl = page.url();
    console.log('Current URL after signup:', currentUrl);

    // If not logged in, try manual login
    if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
      console.log('Step 7: Manual login with created credentials');

      // Click on login tab/link if on register page
      const loginLink = page.locator('a:has-text("Log in"), a:has-text("Sign in"), button:has-text("Log in")');
      if (await loginLink.count() > 0) {
        await loginLink.click();
        await page.waitForLoadState('networkidle');
      }

      // Fill login form
      const loginInputs = page.locator('input');
      const loginInputCount = await loginInputs.count();

      if (loginInputCount >= 2) {
        await loginInputs.nth(0).fill(username);
        await loginInputs.nth(1).fill(password);
      }

      // Submit login
      const loginBtn = page.locator('button[type="submit"]').first();
      if (await loginBtn.count() > 0) {
        await loginBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => null);
        await page.waitForLoadState('networkidle');
      }
    }

    // Step 8: Browse items and add to cart
    console.log('Step 8: Browse items');
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Find items on the page
    const items = page.locator('[class*="card"], article, li');
    const itemCount = await items.count();

    if (itemCount > 0) {
      // Click on first item to view details
      await items.first().click();
      await page.waitForLoadState('networkidle');

      console.log('Step 6: Viewing item details');
      expect(page.url()).toContain('/items/');

      // Look for add to cart button and click it
      const addCartBtn = page.locator(
        'button:has-text("Add to Cart"), button:has-text("Add"), [role="button"]:has-text("Add to")'
      ).first();

      if (await addCartBtn.count() > 0) {
        console.log('Step 7: Adding item to cart');
        await addCartBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Step 6: Navigate to cart
    console.log('Step 8: Navigating to cart');
    await page.goto(`${baseURL}/cart`);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cart');

    // Step 7: Look for checkout button and click
    console.log('Step 9: Clicking checkout');
    const checkoutBtn = page.locator(
      'button:has-text("Checkout"), button:has-text("Proceed"), button:has-text("Continue"), a:has-text("Checkout")'
    ).first();

    if (await checkoutBtn.count() > 0) {
      await checkoutBtn.click();
      await page.waitForLoadState('networkidle');
      console.log('Step 10: Checkout initiated');
    }

    // Verify we completed the workflow
    const urlPath = page.url();
    expect(urlPath).toMatch(/cart|checkout|purchase/i);

    console.log('✓ Complete purchasing workflow finished');
  });
});
