import { test, expect } from '@playwright/test';

test('home page renders and has welcome content', async ({ page }) => {
  await page.goto('/');

  // Title from app/routes/home.tsx meta
  await expect(page).toHaveTitle('New React Router App');

  // Visible welcome UI
  await expect(page.getByText("What's next?", { exact: false })).toBeVisible();
  await expect(page.getByRole('img', { name: /react router/i })).toBeVisible();
});

