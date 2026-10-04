import { test, expect } from '@playwright/test';
test('workspace → document → panel → command → Go-equivalent fixture job → restart recovery', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?preview=1');
  await expect(page.getByRole('heading', { name: /Your next technical/ })).toBeVisible();
  await page.screenshot({ path: 'build/workbench-initial.png', fullPage: true });
  await page.keyboard.press('Control+o');
  await expect(page.getByRole('treeitem', { name: /Scratch/ })).toBeVisible();
  await page.getByRole('button', { name: 'Toggle Explorer', exact: true }).click();
  await expect(page.getByRole('tree', { name: 'Workspace resources' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Demo Operation', exact: true }).last().click();
  await expect(page.getByTestId('document-value').last()).toHaveText('1');
  await page.keyboard.press('Control+z');
  await expect(page.getByTestId('document-value').last()).toHaveText('0');
  await page.keyboard.press('Control+Shift+p');
  await page.getByPlaceholder('Type a command…').fill('Run Demo Job');
  await page.getByRole('option', { name: 'Run Demo Job' }).click();
  await expect(page.getByTestId('job-status')).toHaveText(/completed/, { timeout: 10000 });
  await page.getByRole('button', { name: 'Cycle Ribbon Mode', exact: true }).click();
  await expect(page.locator('.ribbon-wrap')).toHaveClass(/slim/);
  await page.reload();
  await expect(page.locator('.ribbon-wrap')).toHaveClass(/slim/);
  await expect(page.getByRole('tree', { name: 'Workspace resources' })).toHaveCount(0);
  await expect(
    page.locator('.flexlayout__tab_button_content', { hasText: 'Scratch' }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'build/workbench-preview.png', fullPage: true });
});
test('cancel, fail, trust, small window and palette keyboard navigation', async ({ page }) => {
  await page.goto('/?preview=1');
  const command = async (title: string) => {
    await page.keyboard.press('Control+Shift+p');
    await page.getByPlaceholder('Type a command…').fill(title);
    await page.getByRole('option', { name: title }).click();
  };
  await command('Run Demo Job');
  await expect(page.getByTestId('job-status')).toHaveText(/running/);
  await command('Cancel Job');
  await expect(page.getByTestId('job-status')).toHaveText(/cancelled/);
  await command('Run Failing Demo Job');
  await expect(page.getByTestId('job-status')).toHaveText(/failed/);
  await command('Toggle Workspace Trust');
  await page.keyboard.press('Control+Shift+p');
  await page.getByPlaceholder('Type a command…').fill('Run Demo Job');
  await expect(page.getByRole('option', { name: 'Run Demo Job' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 760, height: 540 });
  await expect(page.locator('.ribbon-wrap')).toHaveClass(/slim/);
  await command('Reset Layout');
  await expect(page.getByRole('tree', { name: 'Workspace resources' })).toBeVisible();
});
test('collapsed overlay borders, floating, native browser popout and layout restore', async ({
  page,
}) => {
  await page.goto('/?preview=1');
  await expect(page.getByRole('heading', { name: /Your next technical/ })).toBeVisible();
  const command = async (title: string) => {
    await page.keyboard.press('Control+Shift+p');
    await page.getByPlaceholder('Type a command…').fill(title);
    await page.getByRole('option', { name: title }).click();
  };
  await command('Collapse Explorer');
  await expect(
    page.locator('.flexlayout__border_button').filter({ hasText: 'Explorer' }),
  ).toBeVisible();
  await page.locator('.flexlayout__border_button').filter({ hasText: 'Explorer' }).click();
  await expect(page.getByRole('tree', { name: 'Workspace resources' })).toBeVisible();
  await command('Reset Layout');
  await command('Float Inspector');
  await expect(page.locator('.flexlayout__float_window')).toBeVisible();
  await page.reload();
  await expect(page.locator('.flexlayout__float_window')).toBeVisible();
  await command('Reset Layout');
  const inspector = page
    .locator('.flexlayout__tabset')
    .filter({ has: page.getByRole('tab', { name: 'Inspector', exact: true }) });
  const popupPromise = page.waitForEvent('popup');
  await inspector.getByRole('button', { name: 'Popout selected tab', exact: true }).click();
  const popup = await popupPromise;
  await expect(popup.getByRole('region', { name: 'Document properties' })).toBeVisible();
  await popup.close();
});
