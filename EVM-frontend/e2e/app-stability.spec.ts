import { test, expect } from '@playwright/test';

const CREDENTIALS = {
  email: 'lider.demo@evm.local',
  password: 'Admin123*',
};

test.describe('EVM Application - WebSocket Stability', () => {

  test('1. Login page loads without blank screen', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/login', { waitUntil: 'networkidle' });

    // Page should not be blank
    const body = await page.locator('body').innerHTML();
    expect(body.trim().length).toBeGreaterThan(100);

    // Login form elements should be visible
    await expect(page.locator('input[formControlName="correo"], input[type="email"], input[id="correo"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[formControlName="contrasena"], input[type="password"], input[id="contrasena"]')).toBeVisible({ timeout: 5000 });

    // No critical runtime errors
    const criticalErrors = errors.filter(e =>
      e.includes('Cannot read properties of undefined') ||
      e.includes('Cannot read properties of null') ||
      e.includes('global is not defined') ||
      e.includes('process is not defined') ||
      e.includes('SockJS is not a constructor') ||
      e.includes('is not a function')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('2. No critical console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/login', { waitUntil: 'networkidle' });
    // Wait a few seconds to catch delayed errors
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(e =>
      e.includes('Cannot read properties of undefined') ||
      e.includes('Cannot read properties of null') ||
      e.includes('global is not defined') ||
      e.includes('process is not defined') ||
      e.includes('SockJS is not a constructor') ||
      e.includes('WebSocket is not defined') ||
      e.includes('stompClient is undefined') ||
      e.includes('subscribe is not a function')
    );

    if (criticalErrors.length > 0) {
      console.error('Critical errors found:', criticalErrors);
    }
    expect(criticalErrors).toEqual([]);
  });

  test('3. Login works successfully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/login', { waitUntil: 'networkidle' });

    // Fill login form
    const emailInput = page.locator('input[formControlName="correo"], input[id="correo"]');
    const passwordInput = page.locator('input[formControlName="contrasena"], input[id="contrasena"]');

    await emailInput.fill(CREDENTIALS.email);
    await passwordInput.fill(CREDENTIALS.password);

    // Click login button
    const loginButton = page.locator('button[type="submit"], p-button[type="submit"] button, button:has-text("Ingresar"), button:has-text("Iniciar")');
    await loginButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Dashboard should be visible
    await expect(page.locator('app-sidebar, app-topbar, [class*="layout"], [class*="sidebar"]').first()).toBeVisible({ timeout: 5000 });

    // No critical errors during login flow
    const criticalErrors = errors.filter(e =>
      e.includes('Cannot read properties of undefined') ||
      e.includes('Cannot read properties of null') ||
      e.includes('global is not defined') ||
      e.includes('process is not defined')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('4. Projects page works after login', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Login first
    await page.goto('/login', { waitUntil: 'networkidle' });
    const emailInput = page.locator('input[formControlName="correo"], input[id="correo"]');
    const passwordInput = page.locator('input[formControlName="contrasena"], input[id="contrasena"]');
    await emailInput.fill(CREDENTIALS.email);
    await passwordInput.fill(CREDENTIALS.password);
    const loginButton = page.locator('button[type="submit"], p-button[type="submit"] button, button:has-text("Ingresar"), button:has-text("Iniciar")');
    await loginButton.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to projects
    await page.goto('/projects', { waitUntil: 'networkidle' });

    // Wait for page content
    await page.waitForTimeout(2000);

    // Page should not be blank
    const body = await page.locator('body').innerHTML();
    expect(body.trim().length).toBeGreaterThan(100);

    // Should show table or content area
    const hasContent = await page.locator('p-table, table, [class*="project"], [class*="empty"], .p-datatable').first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);

    // No critical errors
    const criticalErrors = errors.filter(e =>
      e.includes('Cannot read properties of undefined') ||
      e.includes('Cannot read properties of null') ||
      e.includes('global is not defined') ||
      e.includes('process is not defined')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('5. Page stays rendered (no delayed blank screen)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/login', { waitUntil: 'networkidle' });

    // Wait 5 seconds to detect delayed blank screen
    await page.waitForTimeout(5000);

    // Check page is still rendered
    const body = await page.locator('body').innerHTML();
    expect(body.trim().length).toBeGreaterThan(100);

    // app-root should have content
    const appRoot = await page.locator('app-root').innerHTML();
    expect(appRoot.trim().length).toBeGreaterThan(50);

    const criticalErrors = errors.filter(e =>
      e.includes('Cannot read properties of undefined') ||
      e.includes('Cannot read properties of null') ||
      e.includes('global is not defined') ||
      e.includes('process is not defined')
    );
    expect(criticalErrors).toEqual([]);
  });
});
