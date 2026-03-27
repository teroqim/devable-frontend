import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should show landing page with sign-in button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Welcome to Devable')).toBeVisible();
    await expect(page.getByText('Get Started')).toBeVisible();
  });

  test('should redirect to sign-in when accessing dashboard unauthenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    // Clerk should redirect to sign-in
    await expect(page).not.toHaveURL('/dashboard');
  });
});
