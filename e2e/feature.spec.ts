import { test, expect } from '@playwright/test';
test('featureroom loads and registers feature', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('FeatureRoom: demo');
  await page.locator('.name-input').fill('user_age');
  await page.locator('.type-input').selectOption('numeric');
  await page.locator('.source-input').fill('users_db');
  await page.locator('.add-btn').click();
  await expect(page.locator('.feature-list').locator('div').first()).toBeVisible();
});