import { test, expect } from '@playwright/test';

test.describe('Users CRUD', () => {
  test('create and delete a user', async ({ page }) => {
    await page.goto('/users');

    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

    const name = `Playwright User ${Date.now()}`;
    const email = `pw-${Date.now()}@example.com`;

    // Create user
    await page.getByPlaceholder('Name').fill(name);
    await page.getByPlaceholder('Email').fill(email);
    await page.getByRole('button', { name: 'Add User' }).click();

    // Verify it shows up in the list
    const item = page.locator('li', { hasText: `${name} (${email})` });
    await expect(item).toBeVisible();

    // Delete that specific user
    await item.getByRole('button', { name: 'Delete' }).click();

    // It should disappear
    await expect(item).toHaveCount(0);
  });
});

