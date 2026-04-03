import { expect, test } from '@playwright/test';
import { ChecksPage } from '../pages/checks.page';
import { CheckDetailsPage } from '../pages/check-details.page';

const POST_TEST_HOLD_MS = 5000;

test.describe('Grafana Synthetic Monitoring demo', () => {
  // Small pause after each test keeps the run easier to observe in headed mode
  // and gives the app a moment to settle before the next scenario starts.
  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(POST_TEST_HOLD_MS);
  });

  test('a) Filtering Checks by Location', async ({ page }) => {
    const checksPage = new ChecksPage(page);

    // Flow: open the Checks page and wait until at least one row is available.
    // This gives us a reliable baseline before applying filters.
    await checksPage.gotoHome();
    await checksPage.openChecks();
    await checksPage.waitForChecksContent();
    await expect.poll(async () => checksPage.getRowCount()).toBeGreaterThan(0);

    // Flow: apply a probe/location filter and compare row counts before vs after.
    // The list may shrink to zero if no checks match the selected location.
    const initialRowCount = await checksPage.getRowCount();
    const selectedLocation = await checksPage.applyLocationFilterViaProbes();
    await checksPage.waitForChecksContent();

    const filteredRowCount = await checksPage.getRowCount();

    // Expected outcome b: checks are constrained to selected location/probe.
    expect(selectedLocation.length).toBeGreaterThan(0);
    expect(filteredRowCount).toBeGreaterThanOrEqual(0);
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);
    await expect(checksPage.additionalFiltersButton).toContainText(/active/i);

    if (filteredRowCount === 0) {
      await expect(checksPage.emptyState).toBeVisible();
    }
  });

  test('b) Viewing Check Details', async ({ page }) => {
    const checksPage = new ChecksPage(page);
    const detailsPage = new CheckDetailsPage(page);

    // Flow: open the list page, select one concrete check, then verify
    // the details view represents that same selected check.
    await checksPage.gotoHome();
    await checksPage.openChecks();
    await checksPage.waitForChecksContent();

    const selectedRowText = await checksPage.openFirstAvailableCheck();

    await detailsPage.waitForLoaded();
    // Expected outcome b: details match the selected check.
    await detailsPage.assertMatchesSelectedCheck(selectedRowText);
  });

  test('c) Handling No Data Scenario', async ({ page }) => {
    const checksPage = new ChecksPage(page);

    // Flow: use an intentionally impossible search term to force the empty state
    // and assert that users get a clear "no data" experience.
    await checksPage.gotoHome();
    await checksPage.openChecks();
    await checksPage.waitForChecksContent();

    await checksPage.searchChecks('zzzz_non_existing_location_qa');
    await expect.poll(async () => checksPage.getRowCount()).toBe(0);
    // Expected outcome b: clear no-data message is shown.
    await expect(checksPage.emptyState).toBeVisible();
  });
});
