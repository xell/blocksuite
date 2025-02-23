import { getDefaultPlaygroundURL } from '@blocksuite/global/utils';
import { test } from '@playwright/test';

import { collectTestResult } from '../../../__tests__/test-utils-node.js';

// checkout test-entry.ts for actual test cases
const blobExamplePage = new URL(
  '/examples/blob',
  getDefaultPlaygroundURL(!!process.env.CI)
).toString();

test('blob storage basics', async ({ page }) => {
  await page.goto(blobExamplePage);
  await page.locator('#test-basic').click();
  await collectTestResult(page);
});

test('blob state after refresh', async ({ page }) => {
  await page.goto(blobExamplePage);
  await page.locator('#test-refresh-before').click();
  await collectTestResult(page);

  await page.reload();
  await page.locator('#test-refresh-after').click();
  await collectTestResult(page);
});
