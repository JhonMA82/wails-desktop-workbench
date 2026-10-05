import { test, expect } from '@playwright/test';
test('Minimal uses shared commands, jobs, persistence and independent preferences', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?preview=1');
  await expect(page.getByTestId('minimal-shell')).toBeVisible();
  await page.keyboard.press('Control+o');
  await expect(page.getByRole('tab', { name: /Scratch/ })).toBeVisible();
  await page.getByRole('button', { name: 'Demo Operation', exact: true }).click();
  await expect(page.getByTestId('document-value')).toHaveText('1');
  await page.keyboard.press('Control+z');
  await expect(page.getByTestId('document-value')).toHaveText('0');
  await page.getByRole('button', { name: 'Toggle Explorer', exact: true }).click();
  await expect(page.getByRole('tree')).toHaveCount(0);
  await page.keyboard.press('Control+Shift+p');
  await page.getByPlaceholder('Type a command…').fill('Run Demo Job');
  await page.getByRole('option', { name: 'Run Demo Job' }).click();
  await expect(page.getByTestId('job-status')).toHaveText(/completed/, { timeout: 10000 });
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Theme').selectOption('light');
  await page.getByLabel('Density').selectOption('comfortable');
  await page.getByRole('link', { name: 'Back to workspace' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
  await expect(page.getByRole('tab', { name: /Scratch/ })).toBeVisible();
  await expect(page.getByRole('tree')).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/minimal-light-comfortable.png', fullPage: true });
});
