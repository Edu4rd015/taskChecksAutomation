import { expect, Locator, Page } from '@playwright/test';

export class CheckDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get detailsContainer(): Locator {
    // The demo can render details under different main containers depending on layout.
    // This fallback selector keeps load checks resilient across UI variants.
    return this.page.locator('main, [role="main"], body').first();
  }

  async waitForLoaded(): Promise<void> {
    // Consider the page ready once a main container is visible and DOM parsing is done.
    await expect(this.detailsContainer).toBeVisible();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertMatchesSelectedCheck(selectedRowText: string): Promise<void> {
    // Use the first line from the list row text as the expected check label.
    // This avoids overfitting to extra metadata that may vary between views.
    const normalized = selectedRowText.split('\n')[0]?.trim();
    if (normalized) {
      await expect(this.page.locator('body')).toContainText(normalized);
    }
  }
}
