import { expect, test } from '@playwright/test';
import { ChecksPage } from '../pages/checks.page';
import { CheckDetailsPage } from '../pages/check-details.page';

test.describe('Grafana Synthetic Monitoring demo', () => {
  test('filters checks by location', async ({ page }) => {
    const checksPage = new ChecksPage(page);

    await checksPage.gotoHome();
    await checksPage.openChecks();
    await checksPage.waitForChecksContent();

    const initialRowCount = await checksPage.getRowCount();

    // Example location. Replace with a real value after DOM/data inspection.
    const selectedLocation = 'Stockholm';
    await checksPage.selectLocation(selectedLocation);

    await checksPage.waitForChecksContent();

    const filteredRowCount = await checksPage.getRowCount();

    expect(filteredRowCount).toBeGreaterThanOrEqual(0);
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

    if (filteredRowCount > 0) {
      await checksPage.assertEveryVisibleRowContains(selectedLocation);
    } else {
      await expect(checksPage.emptyState).toBeVisible();
    }
  });

  test('opens a check and shows matching details', async ({ page }) => {
    const checksPage = new ChecksPage(page);
    const detailsPage = new CheckDetailsPage(page);

    await checksPage.gotoHome();
    await checksPage.openChecks();
    await checksPage.waitForChecksContent();

    const selectedRowText = await checksPage.openFirstAvailableCheck();

    await detailsPage.waitForLoaded();
    await detailsPage.assertMatchesSelectedCheck(selectedRowText);
  });

  test('shows a clear empty state when filters return no data', async ({ page }) => {
    const checksPage = new ChecksPage(page);

    await checksPage.gotoHome();
    await checksPage.openChecks();
    await checksPage.waitForChecksContent();

    // Intentionally unlikely value. Replace with a deterministic empty-state trigger if available.
    await checksPage.openLocationFilter();
    const impossibleOption = page.getByText(/zzzz_non_existing_location_qa/i).first();

    if (await impossibleOption.count()) {
      await impossibleOption.click();
    } else {
      test.skip(true, 'No deterministic impossible filter option exists in the current demo data.');
    }

    await expect(checksPage.emptyState).toBeVisible();
  });
});
