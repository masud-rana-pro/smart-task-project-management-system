import { expect, test } from '@playwright/test';

test('browser can reach the API through the frontend proxy', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Smart Task',
  );
  await page.getByRole('button', { name: 'Check API connection' }).click();
  await expect(page.getByRole('status')).toContainText('API is reachable');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('foundation.png'),
    fullPage: true,
  });
});
